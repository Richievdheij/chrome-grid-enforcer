import { Scene, Timer, Vector, Keys, Actor, Rectangle, Color } from "excalibur"
import { SceneTransition } from '../ui/scene-transition.js'
import { DifficultyManager } from '../ui/difficulty-manager.js'
import { HudScore } from '../ui/hud-score.js'
import { HudHealthBar } from '../ui/hud-health.js'
import { HudLevel } from '../ui/hud-level.js'
import { WaveAnnouncement } from '../ui/wave-announcement.js'
import { GameOverOverlay } from '../ui/game-over-overlay.js'
import { IngameBackground } from '../actors/ingame-background.js'
import { Background } from '../actors/background.js'
import { Player } from '../actors/player.js'
import { Drone } from '../actors/drone.js'
import { EnemyLaser } from '../actors/enemy-laser.js'
import { ShootingDrone } from '../actors/shooting-drone.js'
import { HeavyDrone } from '../actors/heavy-drone.js'
import { FastDrone } from '../actors/fast-drone.js'
import { BurstDrone } from '../actors/burst-drone.js'
import { HealthPack } from '../actors/healthpack.js'
import { EmpBomb } from '../actors/emp-bomb.js'
import { Explosion } from '../actors/explosion.js'
import { Leaderboard } from '../ui/leaderboard.js'

export class SceneGame extends Scene {

    #player
    #score = 0
    #scoreTimer
    #gameActive = false
    #difficulty = new DifficultyManager()

    // HUD components
    #hudScore
    #hudHealth
    #hudLevel

    // frame-based spawn
    #spawnAccumulator = 0
    #gameOverShown = false

    // backgrounds
    #bgFar1
    #bgFar2
    #bgNear1
    #bgNear2
    #bgScroll1
    #bgScroll2
    #bgScrollSpeed = 100

    // bound event handlers
    #handleGameOver
    #handleScorePoints
    #handlePlayerHit
    #handleEMP

    onInitialize(engine) {
        // infinite scrolling background
        this.#bgScroll1 = new IngameBackground(0)
        this.#bgScroll2 = new IngameBackground(1672)
        this.add(this.#bgScroll1)
        this.add(this.#bgScroll2)

        // parallax building layers
        this.#bgFar1 = new Background(0, "far")
        this.#bgFar2 = new Background(engine.drawWidth, "far")
        this.#bgNear1 = new Background(0, "near")
        this.#bgNear2 = new Background(engine.drawWidth, "near")
        this.add(this.#bgFar1)
        this.add(this.#bgFar2)
        this.add(this.#bgNear1)
        this.add(this.#bgNear2)

        // dark overlay on top of backgrounds for contrast
        const darkOverlay = new Actor({
            x: engine.halfDrawWidth,
            y: engine.halfDrawHeight,
            z: -0.5
        })
        darkOverlay.graphics.use(new Rectangle({
            width: engine.drawWidth + 100,
            height: engine.drawHeight + 100,
            color: Color.fromHex("#000000")
        }))
        darkOverlay.graphics.opacity = 0.50
        this.add(darkOverlay)

        // HUD — modular actors
        this.#hudScore = new HudScore()
        this.#hudHealth = new HudHealthBar()
        this.#hudLevel = new HudLevel()
        this.add(this.#hudScore)
        this.add(this.#hudHealth)
        this.add(this.#hudLevel)

        // score timer — 1 point per second survived
        this.#scoreTimer = new Timer({
            interval: 1000,
            repeats: true,
            fcn: () => {
                if (this.#gameActive) {
                    this.#score++
                    this.#updateGame()
                }
            }
        })
        this.add(this.#scoreTimer)

        // event handlers
        this.#handleGameOver = () => this.gameOver()
        this.#handleScorePoints = (points) => {
            this.#score += points
            this.#updateGame()
        }
        this.#handlePlayerHit = (health) => this.#hudHealth.updateHealth(health, 3)
        this.#handleEMP = (pos) => this.activateEMP(pos)
    }

    onActivate() {
        this.#score = 0
        this.#spawnAccumulator = 0
        this.#gameActive = false
        this.#gameOverShown = false
        this.#difficulty.reset()

        this.#hudScore.updateScore(0)
        this.#hudHealth.updateHealth(3, 3)
        this.#hudLevel.updateLevel(1)

        const engine = this.engine

        this.#player = new Player()
        this.#player.pos = new Vector(200, engine.halfDrawHeight)
        this.add(this.#player)

        engine.on("gameover", this.#handleGameOver)
        engine.on("scorepoints", this.#handleScorePoints)
        engine.on("playerhit", this.#handlePlayerHit)
        engine.on("empactivated", this.#handleEMP)

        this.#gameActive = true
        this.#scoreTimer.start()

        SceneTransition.irisOpen(this)
    }

    onPreUpdate(engine, delta) {
        const dt = engine.clock.elapsed() / 1000

        // difficulty manager update
        this.#difficulty.update(delta)

        // wave announcement
        const announcement = this.#difficulty.getWaveAnnouncement()
        if (announcement) {
            WaveAnnouncement.show(this, this.#difficulty.getWave())
        }

        // player speed scaling
        if (this.#player) {
            this.#player.speed = 300 + this.#difficulty.getPlayerSpeedBoost()
        }

        // spawn logic — skip during intermission
        if (this.#gameActive && !this.#difficulty.isIntermission()) {
            this.#spawnAccumulator += delta
            const interval = this.#difficulty.getSpawnInterval()
            if (this.#spawnAccumulator >= interval) {
                this.#spawnAccumulator -= interval
                this.spawnDrone()
            }
        }

        // scrolling backgrounds
        const scrollSpeed = this.#difficulty.isIntermission()
            ? this.#bgScrollSpeed * 2
            : this.#bgScrollSpeed
        this.#bgScroll1.pos.x -= scrollSpeed * dt
        this.#bgScroll2.pos.x -= scrollSpeed * dt
        if (this.#bgScroll1.pos.x <= -1672) this.#bgScroll1.pos.x = this.#bgScroll2.pos.x + 1672
        if (this.#bgScroll2.pos.x <= -1672) this.#bgScroll2.pos.x = this.#bgScroll1.pos.x + 1672

        const w = engine.drawWidth
        this.#bgFar1.pos.x -= this.#bgFar1.scrollSpeed * dt
        this.#bgFar2.pos.x -= this.#bgFar2.scrollSpeed * dt
        if (this.#bgFar1.pos.x <= -w) this.#bgFar1.pos.x = this.#bgFar2.pos.x + w
        if (this.#bgFar2.pos.x <= -w) this.#bgFar2.pos.x = this.#bgFar1.pos.x + w

        this.#bgNear1.pos.x -= this.#bgNear1.scrollSpeed * dt
        this.#bgNear2.pos.x -= this.#bgNear2.scrollSpeed * dt
        if (this.#bgNear1.pos.x <= -w) this.#bgNear1.pos.x = this.#bgNear2.pos.x + w
        if (this.#bgNear2.pos.x <= -w) this.#bgNear2.pos.x = this.#bgNear1.pos.x + w

        // Escape goes to menu directly (not game over)
        if (engine.input.keyboard.wasPressed(Keys.Escape) && !this.#gameOverShown) {
            this.pauseGame()
        }

        // after game over screen, press enter to go to leaderboard
        if (this.#gameOverShown && engine.input.keyboard.wasPressed(Keys.Enter)) {
            SceneTransition.irisClose(this, () => {
                this.engine.goToScene("leaderboard")
            })
        }
    }

    onDeactivate() {
        this.#scoreTimer.stop()
        SceneTransition.cleanup()

        const engine = this.engine
        engine.off("gameover", this.#handleGameOver)
        engine.off("scorepoints", this.#handleScorePoints)
        engine.off("playerhit", this.#handlePlayerHit)
        engine.off("empactivated", this.#handleEMP)

        // kill everything that isn't a permanent HUD/background element
        this.actors.forEach(actor => {
            if (actor instanceof Player || actor instanceof Drone || actor instanceof EnemyLaser
                || actor instanceof HealthPack || actor instanceof EmpBomb
                || actor instanceof GameOverOverlay) {
                actor.kill()
            }
        })

        this.#player = null
        this.#gameActive = false
        this.#gameOverShown = false
    }

    #updateGame() {
        this.#hudScore.updateScore(this.#score)
        this.#hudLevel.updateLevel(this.#difficulty.getWave())
        this.#difficulty.updateScore(this.#score)
    }

    spawnDrone() {
        if (!this.#gameActive) return

        const engine = this.engine
        const margin = 60
        const y = Math.random() * (engine.drawHeight - margin * 2) + margin
        const config = this.#difficulty.getSpawnConfig()
        const wave = this.#difficulty.getWave()

        let drone
        switch (config.droneType) {
            case "burst":
                drone = new BurstDrone(engine.drawWidth - 10, y, config.speed, config.shootInterval)
                break
            case "fast":
                drone = new FastDrone(engine.drawWidth - 10, y, config.speed)
                break
            case "heavy":
                drone = new HeavyDrone(engine.drawWidth - 10, y, config.speed)
                break
            case "shooting":
                drone = new ShootingDrone(engine.drawWidth - 10, y, config.speed, config.shootInterval)
                break
            default:
                drone = new Drone(engine.drawWidth - 10, y, config.speed)
        }

        // configure all drones for current wave
        if (drone.configureForWave) {
            drone.configureForWave(wave)
        }

        this.add(drone)

        // guaranteed pickups
        if (this.#difficulty.shouldSpawnPickup("health")) {
            const packY = Math.random() * (engine.drawHeight - margin * 2) + margin
            this.add(new HealthPack(engine.drawWidth - 10, packY))
        }

        if (this.#difficulty.shouldSpawnPickup("emp")) {
            const bombY = Math.random() * (engine.drawHeight - margin * 2) + margin
            this.add(new EmpBomb(engine.drawWidth - 10, bombY))
        }
    }

    activateEMP(pos) {
        const radius = EmpBomb.blastRadius
        const points = EmpBomb.pointValue

        this.actors.forEach(actor => {
            if (actor instanceof Drone) {
                const dx = actor.pos.x - pos.x
                const dy = actor.pos.y - pos.y
                const dist = Math.sqrt(dx * dx + dy * dy)
                if (dist <= radius) {
                    Explosion.show(this, actor.pos.x, actor.pos.y)
                    this.#score += points
                    actor.kill()
                }
            }
        })

        // blast ring at pickup location
        Explosion.show(this, pos.x, pos.y)

        this.#hudScore.updateScore(this.#score)
        this.#updateGame()
    }

    /** Player died — show game over screen, then leaderboard on enter. */
    gameOver() {
        if (!this.#gameActive) return

        this.#gameActive = false
        this.#scoreTimer.stop()

        // save score
        const name = localStorage.getItem("currentPlayer") || "UNKNOWN"
        Leaderboard.save(name, this.#score)

        // show game over overlay
        this.add(new GameOverOverlay())
        this.#gameOverShown = true
    }

    /** Player pressed Escape — go to menu, no score saved. */
    pauseGame() {
        if (!this.#gameActive) return

        this.#gameActive = false
        this.#scoreTimer.stop()

        SceneTransition.irisClose(this, () => {
            this.engine.goToScene("menu")
        })
    }
}

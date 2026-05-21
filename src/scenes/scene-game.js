import { Scene, Timer, Vector, Keys, Actor, Rectangle, Color } from "excalibur"
import { Resources } from '../resources.js'
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

/**
 * SceneGame — the gameplay scene.
 * Owns the Player, all Drone instances, backgrounds, HUD and difficulty manager.
 * Inherits from Excalibur's Scene class via `extends`.
 *
 * @extends Scene
 * @property {Player}            #player          - the active Player Object (private)
 * @property {number}            #score           - current score (private)
 * @property {Timer}             #scoreTimer      - 1pt/second survival ticker (private)
 * @property {boolean}           #gameActive      - true while gameplay is running (private)
 * @property {DifficultyManager} #difficulty      - wave/spawn logic Object (private)
 * @property {HudScore}          #hudScore        - score HUD (private)
 * @property {HudHealthBar}      #hudHealth       - health HUD (private)
 * @property {HudLevel}          #hudLevel        - wave HUD (private)
 * @property {number}            #spawnAccumulator - ms accumulator that drives spawning (private)
 * @property {boolean}           #gameOverShown   - true once the GameOverOverlay is on screen (private)
 * @property {Background}        #bgFar1          - far parallax tile A (private)
 * @property {Background}        #bgFar2          - far parallax tile B (private)
 * @property {Background}        #bgNear1         - near parallax tile A (private)
 * @property {Background}        #bgNear2         - near parallax tile B (private)
 * @property {IngameBackground}  #bgScroll1       - scrolling background tile A (private)
 * @property {IngameBackground}  #bgScroll2       - scrolling background tile B (private)
 * @property {number}            #bgScrollSpeed   - base background scroll speed in px/s (private)
 * @property {Function}          #handleGameOver  - bound listener for "gameover" engine event (private)
 * @property {Function}          #handleScorePoints - bound listener for "scorepoints" engine event (private)
 * @property {Function}          #handlePlayerHit - bound listener for "playerhit" engine event (private)
 * @property {Function}          #handleEMP       - bound listener for "empactivated" engine event (private)
 */
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

    /**
     * Lifecycle method — runs once when the scene is created.
     * Sets up backgrounds, HUD, score timer and event-handler references.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
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

        // event handlers — stored as fields so onDeactivate can detach the exact same references
        this.#handleGameOver = () => this.gameOver()
        this.#handleScorePoints = (points) => {
            this.#score += points
            this.#updateGame()
        }
        this.#handlePlayerHit = (health) => this.#hudHealth.updateHealth(health, 3)
        this.#handleEMP = (pos) => this.activateEMP(pos)
    }

    /**
     * Lifecycle method — runs every time the scene becomes active.
     * Resets state, spawns a fresh Player and starts music + transition.
     * @returns {void}
     */
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

        Resources.GameMusic.volume = 0.2
        Resources.GameMusic.loop = true
        Resources.GameMusic.play()

        SceneTransition.irisOpen(this)
    }

    /**
     * Lifecycle method — runs every frame before physics.
     * Drives difficulty updates, wave announcements, spawning,
     * background scrolling and Escape/Enter input.
     * @param {import('excalibur').Engine} engine
     * @param {number} delta - milliseconds since previous frame
     * @returns {void}
     */
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

        // scrolling backgrounds — double speed during intermission for a "warp" feel
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

    /**
     * Lifecycle method — runs when the scene becomes inactive.
     * Stops music/timers, detaches engine listeners and clears gameplay actors.
     * @returns {void}
     */
    onDeactivate() {
        Resources.GameMusic.stop()
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

    /**
     * Pushes the latest score + wave to the HUD and updates the difficulty manager.
     * @returns {void}
     * @private
     */
    #updateGame() {
        this.#hudScore.updateScore(this.#score)
        this.#hudLevel.updateLevel(this.#difficulty.getWave())
        this.#difficulty.updateScore(this.#score)
    }

    /**
     * Picks the right Drone subclass for the current wave and spawns it.
     * Also rolls for guaranteed pickups (HealthPack / EmpBomb).
     * Uses `new <DroneClass>(...)` and `instanceof`-style polymorphism through Inheritance.
     * @returns {void}
     */
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

        // configure all drones for current wave (defined on the Drone parent class)
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

    /**
     * Destroys every Drone within EmpBomb.blastRadius of the given position
     * and awards EmpBomb.pointValue for each kill.
     * @param {{x: number, y: number}} pos - blast origin
     * @returns {void}
     */
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

    /**
     * Slowly ramps the game-music volume down to 0 then stops it.
     * Used when transitioning out on game over.
     * @returns {void}
     * @private
     */
    #startMusicFadeOut() {
        let steps = 0
        const fadeTimer = new Timer({
            interval: 60,
            repeats: true,
            fcn: () => {
                steps++
                Resources.GameMusic.volume = Math.max(0, 0.4 - steps * 0.02)
                if (steps >= 20) {
                    fadeTimer.stop()
                    Resources.GameMusic.stop()
                }
            }
        })
        this.add(fadeTimer)
        fadeTimer.start()
    }

    /**
     * Player died — saves the score, shows the game-over overlay and arms the
     * Enter-to-leaderboard flow in onPreUpdate.
     * @returns {void}
     */
    gameOver() {
        if (!this.#gameActive) return

        this.#gameActive = false
        this.#scoreTimer.stop()
        this.#startMusicFadeOut()

        // save score
        const name = localStorage.getItem("currentPlayer") || "UNKNOWN"
        Leaderboard.save(name, this.#score)

        // show game over overlay
        this.add(new GameOverOverlay())
        this.#gameOverShown = true
    }

    /**
     * Player pressed Escape — go back to the menu, no score saved.
     * @returns {void}
     */
    pauseGame() {
        if (!this.#gameActive) return

        this.#gameActive = false
        this.#scoreTimer.stop()

        SceneTransition.irisClose(this, () => {
            this.engine.goToScene("menu")
        })
    }
}

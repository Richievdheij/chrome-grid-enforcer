import { Vector } from "excalibur"
import { Drone } from "./drone.js"
import { EnemyLaser } from "./enemy-laser.js"
import { Player } from "./player.js"
import { Explosion } from "./explosion.js"
import { Resources } from '../resources.js'

export class ShootingDrone extends Drone {

    #shootInterval = 1500
    #shootTimer = 0
    #burstCount = 1
    #burstDelay = 100
    #burstFired = 0
    #bursting = false
    #burstTimer = 0
    #bulletSpeed = 400
    #wave = 1

    // aim latency — snapshot player pos, fire after delay
    #aimCooldown = 0
    #aimDelay = 200
    #aimAngle = Math.PI
    #aimReady = false

    constructor(x, y, speed = 180, shootInterval = 1500) {
        super(x, y, speed)
        this.#shootInterval = shootInterval
    }

    configureForWave(wave) {
        super.configureForWave(wave)
        this.#wave = wave

        if (wave >= 14) {
            this.#burstCount = 3
        } else if (wave >= 10) {
            this.#burstCount = 2
        } else if (wave >= 6) {
            this.#burstCount = 2
        }

        this.#bulletSpeed = 350 + Math.min(50, wave * 5)

        this.#shootInterval = Math.max(1200, this.#shootInterval - (wave * 30))
    }

    onInitialize(engine) {
        this.graphics.use(Resources.ShootingDrone.toSprite())
        this.scale = new Vector(1.0, 1.0)

        this.on("exitviewport", () => this.onExitScreen(engine))
        this.on("collisionstart", (event) => this.hitSomething(event))
    }

    onPreUpdate(engine, delta) {
        super.onPreUpdate(engine, delta)

        // handle aim latency — fire after delay
        if (this.#aimReady) {
            this.#aimCooldown += delta
            if (this.#aimCooldown >= this.#aimDelay) {
                this.#aimReady = false
                this.#aimCooldown = 0
                this.releaseShot(engine)
            }
            return
        }

        this.updateShooting(engine, delta)
    }

    updateShooting(engine, delta) {
        if (this.#bursting) {
            this.#burstTimer += delta
            if (this.#burstTimer >= this.#burstDelay && this.#burstFired < this.#burstCount) {
                this.queueShot(engine)
                this.#burstFired++
                this.#burstTimer = 0
                if (this.#burstFired >= this.#burstCount) {
                    this.#bursting = false
                }
            }
            return
        }

        this.#shootTimer += delta
        if (this.#shootTimer >= this.#shootInterval) {
            this.#shootTimer = 0
            this.#bursting = true
            this.#burstFired = 0
            this.#burstTimer = this.#burstDelay
        }
    }

    /** Snapshot the aim angle — actual shot fires after delay. */
    queueShot(engine) {
        this.#aimAngle = this.calculateAim(engine)
        this.#aimReady = true
        this.#aimCooldown = 0
    }

    /** Fire the laser using the previously snapshot aim angle. */
    releaseShot(engine) {
        const laser = new EnemyLaser(this.pos.x - 20, this.pos.y, this.#bulletSpeed, this.#aimAngle)
        engine.add(laser)
    }

    calculateAim(engine) {
        const player = engine.currentScene.actors.find(a => a instanceof Player)
        if (!player) return Math.PI

        const dx = player.pos.x - this.pos.x
        const dy = player.pos.y - this.pos.y
        const baseAngle = Math.atan2(dy, dx)

        // fair spread — always some randomness so it never feels like aimbot
        const spread = 0.15 + Math.random() * 0.25
        return baseAngle + (Math.random() - 0.5) * spread
    }
}

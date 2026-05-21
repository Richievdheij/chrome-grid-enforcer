import { Vector } from "excalibur"
import { Drone } from "./drone.js"
import { EnemyLaser } from "./enemy-laser.js"
import { Player } from "./player.js"
import { Resources } from '../resources.js'

/**
 * ShootingDrone — a Drone that aims at the player and fires bursts of lasers.
 * Inherits all base movement and damage behaviour from Drone via `extends`,
 * and adds its own targeted shooting logic.
 *
 * @extends Drone
 * @property {number}  #shootInterval - ms between shots/bursts (private)
 * @property {number}  #shootTimer    - elapsed time toward next burst (private)
 * @property {number}  #burstCount    - shots fired per burst (private)
 * @property {number}  #burstDelay    - ms between consecutive shots in a burst (private)
 * @property {number}  #burstFired    - shots already fired in the active burst (private)
 * @property {boolean} #bursting      - true while a burst is in progress (private)
 * @property {number}  #burstTimer    - elapsed time toward next shot in burst (private)
 * @property {number}  #bulletSpeed   - laser speed in px/s (private)
 * @property {number}  #wave          - current wave number (private)
 * @property {number}  #aimCooldown   - elapsed time toward releasing the queued shot (private)
 * @property {number}  #aimDelay      - delay between aim snapshot and shot release (private)
 * @property {number}  #aimAngle      - cached firing angle in radians (private)
 * @property {boolean} #aimReady      - true once an aim is queued and waiting to fire (private)
 */
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

    /**
     * Constructor — passes movement params to Drone and stores the shoot interval.
     * @param {number} x - spawn x in pixels
     * @param {number} y - spawn y in pixels
     * @param {number} [speed=180]          - horizontal speed
     * @param {number} [shootInterval=1500] - ms between bursts
     */
    constructor(x, y, speed = 180, shootInterval = 1500) {
        super(x, y, speed)
        this.#shootInterval = shootInterval
    }

    /**
     * Scales shooting behaviour with the current wave.
     * Calls super to keep base-drone behaviour scaling intact (Inheritance).
     * @param {number} wave
     * @returns {void}
     */
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

    /**
     * Lifecycle method — swaps in the shooting-drone sprite and re-registers listeners.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onInitialize(engine) {
        this.graphics.use(Resources.ShootingDrone.toSprite())
        this.scale = new Vector(1.0, 1.0)

        this.on("exitviewport", () => this.onExitScreen(engine))
        this.on("collisionstart", (event) => this.hitSomething(event))
    }

    /**
     * Lifecycle method — runs Drone's movement first (super), then either
     * waits out the aim delay or runs the burst-shooting state machine.
     * @param {import('excalibur').Engine} engine
     * @param {number} delta - milliseconds since previous frame
     * @returns {void}
     */
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

    /**
     * Burst state machine — schedules the next burst and queues each shot inside it.
     * @param {import('excalibur').Engine} engine
     * @param {number} delta
     * @returns {void}
     */
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

    /**
     * Snapshots the aim angle — the actual shot fires after #aimDelay.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    queueShot(engine) {
        this.#aimAngle = this.calculateAim(engine)
        this.#aimReady = true
        this.#aimCooldown = 0
    }

    /**
     * Fires the laser using the previously snapshot aim angle.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    releaseShot(engine) {
        const laser = new EnemyLaser(this.pos.x - 20, this.pos.y, this.#bulletSpeed, this.#aimAngle)
        engine.add(laser)
    }

    /**
     * Calculates the angle from this drone to the Player Object, with a small
     * random spread so the shot never feels like a perfect aimbot.
     * @param {import('excalibur').Engine} engine
     * @returns {number} angle in radians
     */
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

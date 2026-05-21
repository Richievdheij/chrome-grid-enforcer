import { Vector } from "excalibur"
import { ShootingDrone } from "./shooting-drone.js"
import { EnemyLaser } from "./enemy-laser.js"
import { Resources } from '../resources.js'

/**
 * BurstDrone — a ShootingDrone variant that fires a horizontal spread fan
 * instead of single burst shots.
 * Inherits from ShootingDrone (which itself extends Drone) — three levels of Inheritance.
 *
 * @extends ShootingDrone
 * @property {number} #spreadAngle   - half-spread of the fan in degrees (private)
 * @property {number} #shotCount     - number of lasers per fan (private)
 * @property {number} _shootTimer    - elapsed time toward next fan (protected by convention)
 * @property {number} _shootInterval - ms between fans (protected by convention)
 */
export class BurstDrone extends ShootingDrone {

    #spreadAngle = 15
    #shotCount = 3

    _shootTimer = 0
    _shootInterval = 1400

    /**
     * Constructor — passes movement and timing to ShootingDrone and seeds its own interval.
     * @param {number} x - spawn x in pixels
     * @param {number} y - spawn y in pixels
     * @param {number} [speed=160]          - horizontal speed
     * @param {number} [shootInterval=1400] - ms between spread fans
     */
    constructor(x, y, speed = 160, shootInterval = 1400) {
        super(x, y, speed, shootInterval)
        this._shootInterval = shootInterval
    }

    /**
     * Scales fan size and cadence with the current wave.
     * Calls super to keep parent shooting/movement scaling applied (Inheritance).
     * @param {number} wave
     * @returns {void}
     */
    configureForWave(wave) {
        super.configureForWave(wave)
        if (wave >= 18) {
            this.#shotCount = 5
            this.#spreadAngle = 20
        } else if (wave >= 12) {
            this.#shotCount = 4
            this.#spreadAngle = 18
        } else {
            this.#shotCount = 3
            this.#spreadAngle = 12
        }
        this._shootInterval = Math.max(1500, this._shootInterval - (wave * 30))
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
     * Override of ShootingDrone.updateShooting — fires spread fans instead of bursts.
     * @param {import('excalibur').Engine} engine
     * @param {number} delta
     * @returns {void}
     */
    updateShooting(engine, delta) {
        this._shootTimer += delta
        if (this._shootTimer >= this._shootInterval) {
            this._shootTimer = 0
            this.fireSpread(engine)
        }
    }

    /**
     * Spawns #shotCount EnemyLaser Objects spread evenly across #spreadAngle.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    fireSpread(engine) {
        // convert the half-spread to radians, then step evenly across the full fan
        const startAngle = -(this.#spreadAngle * (Math.PI / 180))
        const step = this.#shotCount > 1
            ? (2 * this.#spreadAngle * (Math.PI / 180)) / (this.#shotCount - 1)
            : 0

        for (let i = 0; i < this.#shotCount; i++) {
            const angle = Math.PI + startAngle + step * i
            const laser = new EnemyLaser(this.pos.x - 20, this.pos.y, 400, angle)
            engine.add(laser)
        }
    }
}

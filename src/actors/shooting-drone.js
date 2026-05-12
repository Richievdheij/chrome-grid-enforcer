import { Vector } from "excalibur"
import { Drone } from "./drone.js"
import { EnemyLaser } from "./enemy-laser.js"

/**
 * Drone variant that fires EnemyLasers at a configurable interval.
 * Inherits sine-wave drift from Drone.
 */
export class ShootingDrone extends Drone {

    #shootInterval = 3000
    #shootTimer = 0

    /**
     * @param {number} x - spawn x position
     * @param {number} y - spawn y position
     * @param {number} speed - horizontal movement speed
     * @param {number} shootInterval - milliseconds between shots
     */
    constructor(x, y, speed = 180, shootInterval = 3000) {
        super(x, y, speed)
        this.#shootInterval = shootInterval
    }

    onPreUpdate(engine, delta) {
        super.onPreUpdate(engine, delta)

        this.#shootTimer += delta
        if (this.#shootTimer >= this.#shootInterval) {
            this.#shootTimer = 0
            this.shoot(engine)
        }
    }

    /** Spawns an EnemyLaser at the drone's current position. */
    shoot(engine) {
        const laser = new EnemyLaser(this.pos.x - 20, this.pos.y)
        engine.add(laser)
    }
}

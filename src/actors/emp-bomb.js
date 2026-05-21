import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from '../resources.js'

/**
 * EmpBomb — a pickup that triggers an EMP blast when the Player collides with it.
 * Inherits from Excalibur's Actor class via `extends`.
 *
 * @extends Actor
 * @property {number} blastRadius - radius (px) within which drones are destroyed (static)
 * @property {number} pointValue  - score awarded per drone destroyed by the blast (static)
 */
export class EmpBomb extends Actor {

    /** @type {number} */
    static blastRadius = 350
    /** @type {number} */
    static pointValue = 100

    /**
     * Constructor — creates the pickup Object at the given spawn position.
     * @param {number} x - spawn x in pixels
     * @param {number} y - spawn y in pixels
     */
    constructor(x, y) {
        super({
            x,
            y,
            width: 24,
            height: 24,
            collisionType: CollisionType.Passive
        })
    }

    /**
     * Lifecycle method — sets sprite, scrolls left and dies off-screen.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onInitialize(engine) {
        this.graphics.use(Resources.EmpBomb.toSprite())
        this.scale = new Vector(0.7, 0.7)

        this.vel = new Vector(-120, 0)

        this.on("exitviewport", () => this.kill())
    }
}

import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from '../resources.js'

/**
 * HealthPack — a pickup that restores 1 HP when the Player collides with it.
 * Inherits from Excalibur's Actor class via `extends`.
 * @extends Actor
 */
export class HealthPack extends Actor {

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
        this.graphics.use(Resources.HealthPack.toSprite())
        this.scale = new Vector(0.7, 0.7)

        this.vel = new Vector(-120, 0)

        this.on("exitviewport", () => this.kill())
    }
}

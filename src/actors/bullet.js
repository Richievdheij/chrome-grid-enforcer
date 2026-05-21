import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from '../resources.js'
import { EnemyLaser } from "./enemy-laser.js"

/**
 * Bullet — the player's projectile.
 * Moves fast to the right and destroys enemy lasers on contact.
 * Inherits from Excalibur's Actor class via `extends`.
 * @extends Actor
 */
export class Bullet extends Actor {

    /**
     * Constructor — creates a Bullet Object at the given screen position.
     * @param {number} x - spawn x in pixels
     * @param {number} y - spawn y in pixels
     */
    constructor(x, y) {
        super({
            x,
            y,
            width: 16,
            height: 16,
            collisionType: CollisionType.Active
        })
    }

    /**
     * Lifecycle method — set up the bullet's graphics, velocity and listeners.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onInitialize(engine) {
        this.graphics.use(Resources.Bullet.toSprite())
        this.scale = new Vector(0.5, 0.5)
        this.rotation = Math.PI / 2

        // move right fast
        this.vel = new Vector(600, 0)

        this.on("exitviewport", () => this.kill())
        this.on("collisionstart", (event) => this.hitSomething(event))
    }

    /**
     * Collision handler — destroys enemy lasers (and itself) on contact.
     * @param {import('excalibur').CollisionStartEvent} event
     * @returns {void}
     */
    hitSomething(event) {
        const other = event.other.owner
        if (!other) return

        if (other instanceof EnemyLaser) {
            other.kill()
            this.kill()
        }
    }
}

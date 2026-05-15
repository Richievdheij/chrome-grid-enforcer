import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from '../resources.js'
import { EnemyLaser } from "./enemy-laser.js"

export class Bullet extends Actor {

    constructor(x, y) {
        super({
            x,
            y,
            width: 16,
            height: 16,
            collisionType: CollisionType.Active
        })
    }

    onInitialize(engine) {
        this.graphics.use(Resources.Bullet.toSprite())
        this.scale = new Vector(0.5, 0.5)
        this.rotation = Math.PI / 2

        // move right fast
        this.vel = new Vector(600, 0)

        this.on("exitviewport", () => this.kill())
        this.on("collisionstart", (event) => this.hitSomething(event))
    }

    hitSomething(event) {
        const other = event.other.owner
        if (!other) return

        // bullet destroys enemy lasers on contact
        if (other instanceof EnemyLaser) {
            other.kill()
            this.kill()
        }
    }
}

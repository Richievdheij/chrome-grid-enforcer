import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from '../resources.js'

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
        this.scale = new Vector(0.2, 0.2)

        // move right fast
        this.vel = new Vector(600, 0)

        this.on("exitviewport", () => this.kill())
    }
}

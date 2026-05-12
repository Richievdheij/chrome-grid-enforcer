import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from '../resources.js'

export class EnemyLaser extends Actor {

    constructor(x, y) {
        super({
            x,
            y,
            width: 16,
            height: 16,
            collisionType: CollisionType.Passive
        })
    }

    onInitialize(engine) {
        this.graphics.use(Resources.EnemyLaser.toSprite())
        this.scale = new Vector(0.15, 0.15)

        // move left
        this.vel = new Vector(-400, 0)

        this.on("exitviewport", () => this.kill())
    }
}

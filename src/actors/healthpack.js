import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from '../resources.js'

export class HealthPack extends Actor {

    constructor(x, y) {
        super({
            x,
            y,
            width: 24,
            height: 24,
            collisionType: CollisionType.Passive
        })
    }

    onInitialize(engine) {
        this.graphics.use(Resources.HealthPack.toSprite())
        this.scale = new Vector(0.3, 0.3)

        // move left slowly
        this.vel = new Vector(-120, 0)

        this.on("exitviewport", () => this.kill())
    }
}

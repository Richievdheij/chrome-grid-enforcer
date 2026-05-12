import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from '../resources.js'

export class EmpBomb extends Actor {

    constructor(x, y) {
        super({
            x,
            y,
            width: 28,
            height: 28,
            collisionType: CollisionType.Passive
        })
    }

    onInitialize(engine) {
        this.graphics.use(Resources.EmpBomb.toSprite())
        this.scale = new Vector(0.2, 0.2)

        // move left
        this.vel = new Vector(-100, 0)

        this.on("exitviewport", () => this.kill())
    }
}

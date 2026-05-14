import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from '../resources.js'

export class EmpBomb extends Actor {

    static blastRadius = 350
    static pointValue = 100

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
        this.graphics.use(Resources.EmpBomb.toSprite())
        this.scale = new Vector(0.7, 0.7)

        // move left
        this.vel = new Vector(-120, 0)

        this.on("exitviewport", () => this.kill())
    }
}

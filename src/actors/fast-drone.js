import { Vector } from "excalibur"
import { Drone } from "./drone.js"
import { Resources } from '../resources.js'

export class FastDrone extends Drone {

    constructor(x, y, speed = 500) {
        super(x, y, speed, 1, 15)
    }

    onInitialize(engine) {
        this.graphics.use(Resources.FastDrone.toSprite())
        this.scale = new Vector(0.8, 0.8)

        this.on("exitviewport", () => this.onExitScreen(engine))
        this.on("collisionstart", (event) => this.hitSomething(event))
    }
}

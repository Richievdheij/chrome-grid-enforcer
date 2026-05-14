import { Vector } from "excalibur"
import { Drone } from "./drone.js"
import { Resources } from '../resources.js'

export class HeavyDrone extends Drone {

    constructor(x, y, speed = 150) {
        super(x, y, speed, 2, 20)
    }

    onInitialize(engine) {
        this.graphics.use(Resources.HeavyDrone.toSprite())
        this.scale = new Vector(1.2, 1.2)

        this.on("exitviewport", () => this.onExitScreen(engine))
        this.on("collisionstart", (event) => this.hitSomething(event))
    }
}

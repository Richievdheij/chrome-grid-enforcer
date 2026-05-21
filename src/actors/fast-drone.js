import { Vector } from "excalibur"
import { Drone } from "./drone.js"
import { Resources } from '../resources.js'

/**
 * FastDrone — a faster, slimmer variant of Drone.
 * Inherits all behaviour (drift, zigzag, collision, scoring) from Drone via `extends`;
 * only changes its sprite, scale and default speed.
 * @extends Drone
 */
export class FastDrone extends Drone {

    /**
     * Constructor — passes a faster speed and a higher point value up to the Drone parent.
     * @param {number} x - spawn x in pixels
     * @param {number} y - spawn y in pixels
     * @param {number} [speed=500] - horizontal speed
     */
    constructor(x, y, speed = 500) {
        super(x, y, speed, 1, 15)
    }

    /**
     * Lifecycle method — swaps in the fast-drone sprite and re-registers listeners.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onInitialize(engine) {
        this.graphics.use(Resources.FastDrone.toSprite())
        this.scale = new Vector(0.8, 0.8)

        this.on("exitviewport", () => this.onExitScreen(engine))
        this.on("collisionstart", (event) => this.hitSomething(event))
    }
}

import { Vector } from "excalibur"
import { Drone } from "./drone.js"
import { Resources } from '../resources.js'

/**
 * HeavyDrone — a tougher, slower variant of Drone.
 * Inherits all behaviour from Drone via `extends`; only changes sprite,
 * scale, default speed and hit-point/score values passed up to the parent constructor.
 * @extends Drone
 */
export class HeavyDrone extends Drone {

    /**
     * Constructor — passes a slow speed, 2 hit points and a higher score value up to Drone.
     * @param {number} x - spawn x in pixels
     * @param {number} y - spawn y in pixels
     * @param {number} [speed=150] - horizontal speed
     */
    constructor(x, y, speed = 150) {
        super(x, y, speed, 2, 20)
    }

    /**
     * Lifecycle method — swaps in the heavy-drone sprite and re-registers listeners.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onInitialize(engine) {
        this.graphics.use(Resources.HeavyDrone.toSprite())
        this.scale = new Vector(1.2, 1.2)

        this.on("exitviewport", () => this.onExitScreen(engine))
        this.on("collisionstart", (event) => this.hitSomething(event))
    }
}

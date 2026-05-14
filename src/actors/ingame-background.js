import { Actor, Vector } from "excalibur"
import { Resources } from '../resources.js'

/**
 * Infinitely scrolling background image.
 * Two copies placed side by side, when one leaves the screen it wraps behind the other.
 * Sits at z: -3, behind all buildings and actors.
 */
export class IngameBackground extends Actor {

    #scrollSpeed = 100

    constructor(startX = 0) {
        super({ x: startX, y: 0, z: -3 })
    }

    onInitialize(engine) {
        this.graphics.use(Resources.IngameBackground.toSprite())
        this.anchor = new Vector(0, 0)
    }
}

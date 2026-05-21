import { Actor, Vector } from "excalibur"
import { Resources } from '../resources.js'

/**
 * IngameBackground — infinitely scrolling background image.
 * The scene places two of these side by side and wraps them when one leaves the screen.
 * Sits at z: -3, behind all buildings and gameplay actors.
 * Inherits from Excalibur's Actor class via `extends`.
 *
 * @extends Actor
 * @property {number} #scrollSpeed - default scroll speed in px/s (private)
 */
export class IngameBackground extends Actor {

    #scrollSpeed = 100

    /**
     * Constructor — places the background tile at the given x with top-left anchor.
     * @param {number} [startX=0] - horizontal start position in pixels
     */
    constructor(startX = 0) {
        super({ x: startX, y: 0, z: -3 })
    }

    /**
     * Lifecycle method — sets the sprite and anchors it to the top-left corner.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onInitialize(engine) {
        this.graphics.use(Resources.IngameBackground.toSprite())
        this.anchor = new Vector(0, 0)
    }
}

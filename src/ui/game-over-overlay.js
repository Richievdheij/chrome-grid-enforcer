import { Actor, Vector, Label, Font, FontUnit, Color } from "excalibur"

/**
 * GameOverOverlay — full-screen "GAME OVER" Actor shown after the player dies.
 * Fades in over 400ms and waits for input handled by the scene.
 * Inherits from Excalibur's Actor class via `extends`.
 *
 * @extends Actor
 * @property {number} #timer - elapsed time since spawn in ms (private)
 */
export class GameOverOverlay extends Actor {

    #timer = 0

    /**
     * Constructor — sets a very high z-index so the overlay sits above everything.
     */
    constructor() {
        super({ z: 300 })
    }

    /**
     * Lifecycle method — centers the overlay and attaches the two title Labels.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onInitialize(engine) {
        this.pos = new Vector(engine.halfDrawWidth, engine.halfDrawHeight)
        this.graphics.opacity = 0

        this.addChild(new Label({
            text: 'GAME OVER',
            pos: new Vector(-140, -50),
            font: new Font({ size: 52, unit: FontUnit.Px, color: Color.fromHex("#ff0055"), bold: true, family: 'Courier New, monospace' })
        }))

        this.addChild(new Label({
            text: 'PRESS ENTER TO CONTINUE',
            pos: new Vector(-115, 50),
            font: new Font({ size: 16, unit: FontUnit.Px, color: Color.fromHex("#ffffff"), family: 'Courier New, monospace' })
        }))
    }

    /**
     * Lifecycle method — fades the overlay in over the first 400ms.
     * @param {import('excalibur').Engine} engine
     * @param {number} delta - milliseconds since previous frame
     * @returns {void}
     */
    onPreUpdate(engine, delta) {
        this.#timer += delta
        this.graphics.opacity = Math.min(1, this.#timer / 400)
    }
}

import { Actor, Vector, Label, Font, FontUnit, Color } from "excalibur"

/**
 * HudScore — top-left HUD Actor that shows the current score.
 * Inherits from Excalibur's Actor class via `extends`.
 *
 * @extends Actor
 * @property {Label} #scoreLabel - the child Label that renders the score text (private)
 */
export class HudScore extends Actor {

    #scoreLabel

    /**
     * Constructor — positions the HUD anchor in the top-left.
     */
    constructor() {
        super({ x: 20, y: 28, z: 100 })
    }

    /**
     * Lifecycle method — creates and attaches the score Label.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onInitialize(engine) {
        this.#scoreLabel = new Label({
            text: 'SCORE: 0',
            pos: new Vector(0, 0),
            font: new Font({
                size: 24,
                unit: FontUnit.Px,
                color: Color.fromHex("#00f2ff"),
                bold: true,
                family: 'Courier New, monospace'
            })
        })
        this.addChild(this.#scoreLabel)
    }

    /**
     * Updates the displayed score.
     * @param {number} score
     * @returns {void}
     */
    updateScore(score) {
        if (this.#scoreLabel) {
            this.#scoreLabel.text = `SCORE: ${score}`
        }
    }
}

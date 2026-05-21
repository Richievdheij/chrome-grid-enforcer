import { Actor, Vector, Label, Font, FontUnit, Color } from "excalibur"

/**
 * HudLevel — top-right HUD Actor that shows the current wave number.
 * Inherits from Excalibur's Actor class via `extends`.
 *
 * @extends Actor
 * @property {Label} #levelLabel - the child Label that renders the wave text (private)
 */
export class HudLevel extends Actor {

    #levelLabel

    /**
     * Constructor — sets the z-index for the HUD; final position is set in onInitialize.
     */
    constructor() {
        super({ z: 100 })
    }

    /**
     * Lifecycle method — anchors the HUD in the top-right and attaches the Label.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onInitialize(engine) {
        this.pos = new Vector(engine.drawWidth - 110, 28)

        this.#levelLabel = new Label({
            text: 'WAVE 1',
            pos: new Vector(0, 0),
            font: new Font({
                size: 18,
                unit: FontUnit.Px,
                color: Color.fromHex("#ffcc00"),
                bold: true,
                family: 'Courier New, monospace'
            })
        })
        this.addChild(this.#levelLabel)
    }

    /**
     * Updates the displayed wave number.
     * @param {number} wave
     * @returns {void}
     */
    updateLevel(wave) {
        if (this.#levelLabel) {
            this.#levelLabel.text = `WAVE ${wave}`
        }
    }
}

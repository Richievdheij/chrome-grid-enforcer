import { Actor, Vector, Label, Font, FontUnit, Color } from "excalibur"

export class HudScore extends Actor {

    #scoreLabel

    constructor() {
        super({ x: 20, y: 28, z: 100 })
    }

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

    updateScore(score) {
        if (this.#scoreLabel) {
            this.#scoreLabel.text = `SCORE: ${score}`
        }
    }
}

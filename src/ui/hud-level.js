import { Actor, Vector, Label, Font, FontUnit, Color } from "excalibur"

export class HudLevel extends Actor {

    #levelLabel

    constructor() {
        super({ z: 100 })
    }

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

    updateLevel(wave) {
        if (this.#levelLabel) {
            this.#levelLabel.text = `WAVE ${wave}`
        }
    }
}

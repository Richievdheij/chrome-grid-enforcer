import { Actor, Vector, Label, Font, FontUnit, Color } from "excalibur"

export class GameOverOverlay extends Actor {

    #timer = 0

    constructor() {
        super({ z: 300 })
    }

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

    onPreUpdate(engine, delta) {
        this.#timer += delta
        this.graphics.opacity = Math.min(1, this.#timer / 400)
    }
}

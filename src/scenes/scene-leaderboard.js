import { Scene, Vector, Label, Font, FontUnit, Color, Keys } from "excalibur"
import { ArcadeButton } from '../ui/button.js'

export class SceneLeaderboard extends Scene {
    #backBtn
    #labels = []

    onInitialize(engine) {
        // Title label
        const title = new Label({
            text: 'ALL-TIME TOP 10',
            pos: new Vector(engine.halfDrawWidth, 100),
            font: new Font({
                size: 40,
                unit: FontUnit.Px,
                color: Color.fromHex("#00FFFF"),
                bold: true,
                family: 'monospace',
                textAlign: 'center'
            })
        })
        this.add(title)
        
        // Simple WIP text for empty states
        const emptyText = new Label({
            text: 'NO ENFORCERS FOUND... YET',
            pos: new Vector(engine.halfDrawWidth, 230),
            font: new Font({
                size: 20,
                unit: FontUnit.Px,
                color: Color.fromHex("#FF0055"),
                family: 'monospace',
                textAlign: 'center'
            })
        })
        this.add(emptyText)
    }

    onActivate(engine) {
        document.body.style.cursor = "default"
        
        this.#backBtn = new ArcadeButton("<- BACK TO MENU", () => {
            engine.goToScene("menu")
        })
        this.#backBtn.mount('ui-layer')
        this.#backBtn.element.classList.add('btn-leaderboard') 

        // For now load placeholder entries.
        // In the future this will load from localstorage/api etc.
    }

    onPreUpdate(engine) {
        if (engine.input.keyboard.wasPressed(Keys.Escape) || engine.input.keyboard.wasPressed(Keys.Backspace)) {
            engine.goToScene("menu")
        }
    }

    onDeactivate(engine) {
        if (this.#backBtn) {
            this.#backBtn.unmount()
        }
    }
}

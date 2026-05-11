import { Scene, Vector, Label, Font, FontUnit, Color } from "excalibur"
import { Button } from '../ui/button.js'

export class SceneLeaderboard extends Scene {
    onInitialize(engine) {
        // Tijdelijke Terug-knop
        const backBtn = new Button(150, 50, "<- BACK", () => {
            document.body.style.cursor = "default"
            engine.goToScene("menu")
        })
        backBtn.scale = new Vector(0.7, 0.7)
        this.add(backBtn)

        // Simpel Tekst label
        const title = new Label({
            text: 'LEADERBOARD',
            pos: new Vector(engine.halfDrawWidth, 150),
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
        
        // Simpel WIP Text
        const wip = new Label({
            text: 'WORK IN PROGRESS...',
            pos: new Vector(engine.halfDrawWidth, 300),
            font: new Font({
                size: 20,
                unit: FontUnit.Px,
                color: Color.White,
                family: 'monospace',
                textAlign: 'center'
            })
        })
        this.add(wip)
    }
}
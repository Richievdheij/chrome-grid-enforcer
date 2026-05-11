import { Scene, Vector, Actor } from "excalibur"
import { Resources } from '../resources.js'
import { Button } from '../ui/button.js'

export class SceneMenu extends Scene {
    onInitialize(engine) {
        const bgSprite = Resources.MainMenu.toSprite()
        const bgScale = Math.max(
            engine.drawWidth / bgSprite.width,
            engine.drawHeight / bgSprite.height
        )

        const bg = new Actor({
            x: engine.halfDrawWidth,
            y: engine.halfDrawHeight,
        })
        bg.graphics.use(bgSprite)
        bg.scale = new Vector(bgScale, bgScale)
        bg.z = -10
        this.add(bg)

        const buttonX = engine.halfDrawWidth
        const buttonStartY = engine.halfDrawHeight + 40
        const buttonSpacing = 82

        const startBtn = new Button(buttonX, buttonStartY, "PLAY NOW", () => {
            document.body.style.cursor = "default"
            engine.goToScene("game")
        })
        this.add(startBtn)

        const leadBtn = new Button(buttonX, buttonStartY + buttonSpacing, "LEADERBOARD", () => {
            document.body.style.cursor = "default"
            engine.goToScene("leaderboard")
        })
        this.add(leadBtn)

        const quitBtn = new Button(buttonX, buttonStartY + buttonSpacing * 2, "DISCONNECT", () => {
            document.body.style.cursor = "default"
            if(confirm("Weet je zeker dat je wilt stoppen?")) {
                window.close()
            }
        })
        this.add(quitBtn)
    }

    onActivate(engine) {
        document.body.style.cursor = "default"
    }
}
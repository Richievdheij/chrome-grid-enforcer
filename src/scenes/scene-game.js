import { Scene, Vector, Actor } from "excalibur"
import { Resources } from '../resources.js'
import { Button } from '../ui/button.js'

export class SceneGame extends Scene {
    onInitialize(engine) {
        // Voeg hier straks de Game Logica (Player, grid, etc) toe
        const fish = new Actor({
            x: 500,
            y: 300,
            vel: new Vector(-10, 0)
        })
        fish.graphics.use(Resources.Fish.toSprite())
        fish.events.on("exitviewport", (e) => {
            e.target.pos = new Vector(1350, 300)
        })
        this.add(fish)
    }
}
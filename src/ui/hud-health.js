import { Actor, Vector, Label, Font, FontUnit, Color } from "excalibur"
import { Resources } from '../resources.js'

export class HudHealthBar extends Actor {

    #hearts = []
    #maxHealth = 3

    constructor() {
        // same x as score (20), y just below score label
        super({ x: 20, y: 60, z: 100 })
    }

    onInitialize(engine) {
        this.rebuildHearts(this.#maxHealth, this.#maxHealth)
    }

    rebuildHearts(current, max) {
        this.#maxHealth = max

        this.#hearts.forEach(h => h.kill())
        this.#hearts = []

        for (let i = 0; i < max; i++) {
            const filled = i < current
            const heart = new Actor({
                pos: new Vector(i * 30 + 10, 8),
                z: 101
            })
            heart.graphics.use(Resources.HpIcon.toSprite())
            heart.scale = new Vector(0.55, 0.55)
            heart.graphics.opacity = filled ? 1 : 0.2
            this.addChild(heart)
            this.#hearts.push(heart)
        }
    }

    updateHealth(current, max) {
        this.rebuildHearts(current, max)
    }
}

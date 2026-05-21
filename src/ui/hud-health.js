import { Actor, Vector } from "excalibur"
import { Resources } from '../resources.js'

/**
 * HudHealthBar — HUD Actor that displays heart icons for current and max HP.
 * Inherits from Excalibur's Actor class via `extends`.
 *
 * @extends Actor
 * @property {Actor[]} #hearts    - child Actor instances that render each heart (private)
 * @property {number}  #maxHealth - maximum hearts to draw (private)
 */
export class HudHealthBar extends Actor {

    #hearts = []
    #maxHealth = 3

    /**
     * Constructor — positions the bar under the score HUD.
     */
    constructor() {
        // same x as score (20), y just below score label
        super({ x: 20, y: 60, z: 100 })
    }

    /**
     * Lifecycle method — builds an initial full row of hearts.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onInitialize(engine) {
        this.rebuildHearts(this.#maxHealth, this.#maxHealth)
    }

    /**
     * Removes the existing hearts and creates a fresh row reflecting the current HP.
     * @param {number} current - number of filled hearts
     * @param {number} max     - total hearts to draw
     * @returns {void}
     */
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

    /**
     * Public update entry point — delegates to rebuildHearts.
     * @param {number} current - current HP
     * @param {number} max     - maximum HP
     * @returns {void}
     */
    updateHealth(current, max) {
        this.rebuildHearts(current, max)
    }
}

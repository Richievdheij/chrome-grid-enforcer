import { Actor, Vector, Circle, Color } from "excalibur"

/**
 * Explosion — short-lived visual ring that expands and fades, then removes itself.
 * Inherits from Excalibur's Actor class via `extends`.
 *
 * @extends Actor
 * @property {number} #timer    - elapsed time since spawn in ms (private)
 * @property {number} #duration - total lifetime in ms (private)
 */
export class Explosion extends Actor {

    #timer = 0
    #duration = 300

    /**
     * Constructor — places the explosion at the given position on a high z-index.
     * @param {number} x - x in pixels
     * @param {number} y - y in pixels
     */
    constructor(x, y) {
        super({ x, y, z: 50 })
    }

    /**
     * Lifecycle method — builds the visual ring shape and sets initial scale.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onInitialize(engine) {
        const ring = new Circle({
            radius: 30,
            color: Color.fromHex("#ff4400")
        })
        this.graphics.use(ring)
        this.scale = new Vector(0.5, 0.5)
    }

    /**
     * Lifecycle method — expands the ring and fades it out, then kills itself.
     * @param {import('excalibur').Engine} engine
     * @param {number} delta - milliseconds since previous frame
     * @returns {void}
     */
    onPreUpdate(engine, delta) {
        this.#timer += delta
        const progress = this.#timer / this.#duration

        const s = 0.5 + progress * 2
        this.scale = new Vector(s, s)
        this.graphics.opacity = Math.max(0, 1 - progress)

        if (this.#timer >= this.#duration) {
            this.kill()
        }
    }

    /**
     * Static helper — spawns an Explosion Object at a position in the given scene.
     * @param {import('excalibur').Scene} scene
     * @param {number} x
     * @param {number} y
     * @returns {void}
     */
    static show(scene, x, y) {
        scene.add(new Explosion(x, y))
    }
}

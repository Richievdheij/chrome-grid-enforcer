import { Actor, Vector, Circle, Color } from "excalibur"

export class Explosion extends Actor {

    #timer = 0
    #duration = 300

    constructor(x, y) {
        super({ x, y, z: 50 })
    }

    onInitialize(engine) {
        const ring = new Circle({
            radius: 30,
            color: Color.fromHex("#ff4400")
        })
        this.graphics.use(ring)
        this.scale = new Vector(0.5, 0.5)
    }

    onPreUpdate(engine, delta) {
        this.#timer += delta
        const progress = this.#timer / this.#duration

        // expand and fade
        const s = 0.5 + progress * 2
        this.scale = new Vector(s, s)
        this.graphics.opacity = Math.max(0, 1 - progress)

        if (this.#timer >= this.#duration) {
            this.kill()
        }
    }

    /** Spawn an explosion at a position in a scene. */
    static show(scene, x, y) {
        scene.add(new Explosion(x, y))
    }
}

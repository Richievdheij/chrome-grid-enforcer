import { Actor, Vector, Label, Font, FontUnit, Color } from "excalibur"

export class WaveAnnouncement extends Actor {

    #label
    #duration = 2000
    #timer = 0

    constructor() {
        super({ z: 200 })
    }

    onInitialize(engine) {
        this.pos = new Vector(engine.halfDrawWidth, engine.halfDrawHeight)

        this.#label = new Label({
            text: `WAVE ${this.wave}`,
            pos: new Vector(-60, -20),
            font: new Font({
                size: 48,
                unit: FontUnit.Px,
                color: Color.fromHex("#00f2ff"),
                bold: true,
                family: 'Courier New, monospace'
            })
        })
        this.addChild(this.#label)
        this.graphics.opacity = 1
    }

    onPreUpdate(engine, delta) {
        this.#timer += delta
        // fade out in last 800ms
        if (this.#timer >= this.#duration - 800) {
            const fadeProgress = (this.#timer - (this.#duration - 800)) / 800
            this.graphics.opacity = Math.max(0, 1 - fadeProgress)
        }
        if (this.#timer >= this.#duration) {
            this.kill()
        }
    }

    /** Static helper to show a wave announcement in a scene. */
    static show(scene, wave) {
        const announcement = new WaveAnnouncement()
        announcement.wave = wave
        scene.add(announcement)
    }
}
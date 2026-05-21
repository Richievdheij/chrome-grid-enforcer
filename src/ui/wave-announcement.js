import { Actor, Vector, Label, Font, FontUnit, Color } from "excalibur"

/**
 * WaveAnnouncement — short-lived centered "WAVE N" Label that fades out and dies.
 * Inherits from Excalibur's Actor class via `extends`.
 *
 * @extends Actor
 * @property {Label}  #label    - child Label that renders the wave text (private)
 * @property {number} #duration - total lifetime in ms (private)
 * @property {number} #timer    - elapsed time since spawn in ms (private)
 * @property {number} wave      - wave number assigned by show()
 */
export class WaveAnnouncement extends Actor {

    #label
    #duration = 2000
    #timer = 0

    /**
     * Constructor — sets a very high z-index so the announcement sits on top of everything.
     */
    constructor() {
        super({ z: 200 })
    }

    /**
     * Lifecycle method — centers the announcement and attaches the Label.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
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

    /**
     * Lifecycle method — fades the announcement out in its last 800ms, then kills it.
     * @param {import('excalibur').Engine} engine
     * @param {number} delta - milliseconds since previous frame
     * @returns {void}
     */
    onPreUpdate(engine, delta) {
        this.#timer += delta
        if (this.#timer >= this.#duration - 800) {
            const fadeProgress = (this.#timer - (this.#duration - 800)) / 800
            this.graphics.opacity = Math.max(0, 1 - fadeProgress)
        }
        if (this.#timer >= this.#duration) {
            this.kill()
        }
    }

    /**
     * Static helper — spawns a WaveAnnouncement Object for the given wave in the scene.
     * @param {import('excalibur').Scene} scene
     * @param {number} wave
     * @returns {void}
     */
    static show(scene, wave) {
        const announcement = new WaveAnnouncement()
        announcement.wave = wave
        scene.add(announcement)
    }
}

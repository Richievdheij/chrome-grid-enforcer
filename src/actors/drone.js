import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from '../resources.js'
import { Bullet } from "./bullet.js"

/**
 * Basic enemy drone that drifts left with sine-wave vertical movement.
 * Each instance gets unique drift amplitude and frequency for varied movement.
 */
export class Drone extends Actor {

    #moveSpeed
    #pointValue = 10
    #health = 1
    #driftAmplitude
    #driftFrequency
    #driftOffset

    constructor(x, y, speed = 200, health = 1, pointValue = 10) {
        super({
            x,
            y,
            width: 50,
            height: 35,
            collisionType: CollisionType.Passive
        })
        this.#moveSpeed = speed
        this.#health = health
        this.#pointValue = pointValue
        this.#driftAmplitude = 60 + Math.random() * 60
        this.#driftFrequency = 0.001 + Math.random() * 0.002
        this.#driftOffset = Math.random() * Math.PI * 2
    }

    onInitialize(engine) {
        this.graphics.use(Resources.Drone.toSprite())
        this.scale = new Vector(0.3, 0.3)

        this.on("exitviewport", () => this.kill())
        this.on("collisionstart", (event) => this.hitSomething(event))
    }

    onPreUpdate(engine, delta) {
        this.#driftOffset += delta
        const driftY = Math.sin(this.#driftOffset * this.#driftFrequency) * this.#driftAmplitude
        this.vel = new Vector(-this.#moveSpeed, driftY)
    }

    /** Handles collision with player bullets — decrements HP, awards points on kill. */
    hitSomething(event) {
        const other = event.other.owner
        if (!other) return

        if (other instanceof Bullet) {
            other.kill()
            this.#health--

            if (this.#health <= 0) {
                this.scene.engine.emit("scorepoints", this.#pointValue)
                this.kill()
            }
        }
    }

    get pointValue() {
        return this.#pointValue
    }
}

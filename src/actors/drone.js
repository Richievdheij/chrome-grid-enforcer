import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from '../resources.js'
import { Bullet } from "./bullet.js"
import { Player } from "./player.js"
import { EnemyLaser } from "./enemy-laser.js"
import { Explosion } from "./explosion.js"

export class Drone extends Actor {

    #moveSpeed
    #pointValue = 10
    #health = 1
    #driftOffset = 0
    #driftAmplitude
    #driftFrequency

    #wave = 1
    #loopChance = 0
    #canShoot = false
    #shootInterval = 2500
    #shootTimer = 0
    #bulletSpeed = 350

    // random zigzag movement
    #zigzagTimer = 0
    #zigzagInterval = 800 + Math.random() * 1200
    #zigzagDirection = Math.random() < 0.5 ? -1 : 1

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
        this.#driftAmplitude = 20 + Math.random() * 30
        this.#driftFrequency = 0.003 + Math.random() * 0.003
    }

    configureForWave(wave) {
        this.#wave = wave
        this.#loopChance = Math.min(0.4, wave * 0.03)

        // base drones shoot from wave 8 onward
        if (wave >= 8) {
            this.#canShoot = true
            this.#shootInterval = Math.max(1500, 2600 - wave * 100)
            this.#bulletSpeed = Math.min(400, 300 + wave * 8)
        }
    }

    onInitialize(engine) {
        this.graphics.use(Resources.Drone.toSprite())
        this.scale = new Vector(1.0, 1.0)

        this.on("exitviewport", () => this.onExitScreen(engine))
        this.on("collisionstart", (event) => this.hitSomething(event))
    }

    onPreUpdate(engine, delta) {
        this.#driftOffset += delta
        const driftY = Math.sin(this.#driftOffset * this.#driftFrequency) * this.#driftAmplitude

        // random zigzag — periodically change direction
        this.#zigzagTimer += delta
        if (this.#zigzagTimer >= this.#zigzagInterval) {
            this.#zigzagTimer = 0
            this.#zigzagInterval = 600 + Math.random() * 1000
            this.#zigzagDirection = Math.random() < 0.5 ? -1 : 1
        }

        let velY = driftY + this.#zigzagDirection * 60

        this.vel = new Vector(-this.#moveSpeed, velY)

        // base drones shoot too if configured
        if (this.#canShoot) {
            this.#shootTimer += delta
            if (this.#shootTimer >= this.#shootInterval) {
                this.#shootTimer = 0
                this.fireBaseShot(engine)
            }
        }
    }

    fireBaseShot(engine) {
        const laser = new EnemyLaser(this.pos.x - 20, this.pos.y, this.#bulletSpeed, Math.PI)
        engine.add(laser)
    }

    onExitScreen(engine) {
        if (Math.random() < this.#loopChance) {
            this.pos.x = engine.drawWidth + 50
            this.pos.y = Math.random() * (engine.drawHeight - 120) + 60
            return
        }
        this.kill()
    }

    hitSomething(event) {
        const other = event.other.owner
        if (!other) return

        if (other instanceof Bullet) {
            other.kill()
            this.#health--

            if (this.#health <= 0) {
                this.scene.engine.emit("scorepoints", this.#pointValue)
                Explosion.show(this.scene, this.pos.x, this.pos.y)
                this.kill()
            }
        }
    }

    get pointValue() {
        return this.#pointValue
    }
}

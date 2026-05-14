import { Vector } from "excalibur"
import { ShootingDrone } from "./shooting-drone.js"
import { EnemyLaser } from "./enemy-laser.js"
import { Resources } from '../resources.js'

export class BurstDrone extends ShootingDrone {

    #spreadAngle = 15
    #shotCount = 3

    _shootTimer = 0
    _shootInterval = 1400

    constructor(x, y, speed = 160, shootInterval = 1400) {
        super(x, y, speed, shootInterval)
        this._shootInterval = shootInterval
    }

    configureForWave(wave) {
        super.configureForWave(wave)
        if (wave >= 18) {
            this.#shotCount = 5
            this.#spreadAngle = 20
        } else if (wave >= 12) {
            this.#shotCount = 4
            this.#spreadAngle = 18
        } else {
            this.#shotCount = 3
            this.#spreadAngle = 12
        }
        this._shootInterval = Math.max(1500, this._shootInterval - (wave * 30))
    }

    onInitialize(engine) {
        this.graphics.use(Resources.ShootingDrone.toSprite())
        this.scale = new Vector(1.0, 1.0)

        this.on("exitviewport", () => this.onExitScreen(engine))
        this.on("collisionstart", (event) => this.hitSomething(event))
    }

    // BurstDrone fires spread fans instead of bursts
    updateShooting(engine, delta) {
        this._shootTimer += delta
        if (this._shootTimer >= this._shootInterval) {
            this._shootTimer = 0
            this.fireSpread(engine)
        }
    }

    fireSpread(engine) {
        const startAngle = -(this.#spreadAngle * (Math.PI / 180))
        const step = this.#shotCount > 1
            ? (2 * this.#spreadAngle * (Math.PI / 180)) / (this.#shotCount - 1)
            : 0

        for (let i = 0; i < this.#shotCount; i++) {
            const angle = Math.PI + startAngle + step * i
            const laser = new EnemyLaser(this.pos.x - 20, this.pos.y, 400, angle)
            engine.add(laser)
        }
    }
}

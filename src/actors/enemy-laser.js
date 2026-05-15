import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from '../resources.js'

export class EnemyLaser extends Actor {

    constructor(x, y, speed = 400, angle = Math.PI) {
        super({
            x,
            y,
            width: 16,
            height: 16,
            collisionType: CollisionType.Passive
        })
        this.laserSpeed = speed
        this.laserAngle = angle
    }

    onInitialize(engine) {
        this.graphics.use(Resources.EnemyLaser.toSprite())
        // always large and clearly visible
        this.scale = new Vector(0.8, 0.8)

        this.rotation = this.laserAngle + Math.PI / 2

        const velX = Math.cos(this.laserAngle) * this.laserSpeed
        const velY = Math.sin(this.laserAngle) * this.laserSpeed
        this.vel = new Vector(velX, velY)

        this.on("exitviewport", () => this.kill())
    }
}

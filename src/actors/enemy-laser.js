import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from '../resources.js'

/**
 * EnemyLaser — a projectile fired by Drone subclasses.
 * Travels at a given speed in a given direction until it leaves the viewport.
 * Inherits from Excalibur's Actor class via `extends`.
 *
 * @extends Actor
 * @property {number} laserSpeed - travel speed in px/s
 * @property {number} laserAngle - travel angle in radians
 */
export class EnemyLaser extends Actor {

    /**
     * Constructor — creates the laser Object and stores its trajectory.
     * @param {number} x - spawn x in pixels
     * @param {number} y - spawn y in pixels
     * @param {number} [speed=400] - travel speed in px/s
     * @param {number} [angle=Math.PI] - travel angle in radians (Math.PI = straight left)
     */
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

    /**
     * Lifecycle method — plays the shot sfx, sets sprite and computes velocity from angle.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onInitialize(engine) {
        Resources.EnemyShot.volume = 0.07
        Resources.EnemyShot.play()
        this.graphics.use(Resources.EnemyLaser.toSprite())
        this.scale = new Vector(0.8, 0.8)

        // sprite is drawn pointing up, so rotate by +90° on top of the travel angle
        this.rotation = this.laserAngle + Math.PI / 2

        const velX = Math.cos(this.laserAngle) * this.laserSpeed
        const velY = Math.sin(this.laserAngle) * this.laserSpeed
        this.vel = new Vector(velX, velY)

        this.on("exitviewport", () => this.kill())
    }
}

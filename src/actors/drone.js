import { Actor, Vector, CollisionType } from "excalibur"
import { Resources } from '../resources.js'
import { Bullet } from "./bullet.js"
import { EnemyLaser } from "./enemy-laser.js"
import { Explosion } from "./explosion.js"

/**
 * Drone — the base enemy class.
 * Moves left across the screen with a drifting/zigzag pattern and dies when shot.
 * Acts as the parent class for FastDrone, HeavyDrone, ShootingDrone and BurstDrone via Inheritance.
 *
 * @extends Actor
 * @property {number}  #moveSpeed       - horizontal movement speed in px/s (private)
 * @property {number}  #pointValue      - points awarded on destruction (private)
 * @property {number}  #health          - hit points required to destroy (private)
 * @property {number}  #driftOffset     - accumulated time used to drive the sine drift (private)
 * @property {number}  #driftAmplitude  - vertical sine amplitude in pixels (private)
 * @property {number}  #driftFrequency  - vertical sine frequency (private)
 * @property {number}  #wave            - current wave used to scale behaviour (private)
 * @property {number}  #loopChance      - chance the drone wraps back instead of dying off-screen (private)
 * @property {boolean} #canShoot        - whether this base drone can fire (enabled from wave 8) (private)
 * @property {number}  #shootInterval   - ms between shots when canShoot is true (private)
 * @property {number}  #shootTimer      - elapsed time toward next shot (private)
 * @property {number}  #bulletSpeed     - laser speed in px/s for base-drone shots (private)
 * @property {number}  #zigzagTimer     - elapsed time toward next zigzag flip (private)
 * @property {number}  #zigzagInterval  - ms until direction flips (private)
 * @property {number}  #zigzagDirection - 1 or -1, current vertical zigzag direction (private)
 */
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

    /**
     * Constructor — creates the Drone Object.
     * Subclasses pass their own speed/health/points.
     * @param {number} x - spawn x in pixels
     * @param {number} y - spawn y in pixels
     * @param {number} [speed=200]      - horizontal movement speed
     * @param {number} [health=1]       - hit points
     * @param {number} [pointValue=10]  - score awarded on destruction
     */
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

    /**
     * Configures wave-scaled behaviour (loop chance, base shooting from wave 8).
     * Subclasses can override and call super.configureForWave().
     * @param {number} wave - current wave number
     * @returns {void}
     */
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

    /**
     * Lifecycle method — runs once when added to the scene.
     * Sets sprite, scale and registers viewport/collision listeners.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onInitialize(engine) {
        this.graphics.use(Resources.Drone.toSprite())
        this.scale = new Vector(1.0, 1.0)

        this.on("exitviewport", () => this.onExitScreen(engine))
        this.on("collisionstart", (event) => this.hitSomething(event))
    }

    /**
     * Lifecycle method — runs every frame before physics.
     * Drives drift, zigzag movement and optional base-drone shooting.
     * @param {import('excalibur').Engine} engine
     * @param {number} delta - milliseconds since previous frame
     * @returns {void}
     */
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

    /**
     * Fires a straight enemy laser to the left at the current bullet speed.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    fireBaseShot(engine) {
        const laser = new EnemyLaser(this.pos.x - 20, this.pos.y, this.#bulletSpeed, Math.PI)
        engine.add(laser)
    }

    /**
     * Handler for exitviewport — either wraps the drone back in or kills it.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onExitScreen(engine) {
        if (Math.random() < this.#loopChance) {
            this.pos.x = engine.drawWidth + 50
            this.pos.y = Math.random() * (engine.drawHeight - 120) + 60
            return
        }
        this.kill()
    }

    /**
     * Collision handler — damages this drone when hit by a Bullet, awards points and explodes on death.
     * @param {import('excalibur').CollisionStartEvent} event
     * @returns {void}
     */
    hitSomething(event) {
        const other = event.other.owner
        if (!other) return

        if (other instanceof Bullet) {
            other.kill()
            this.#health--

            if (this.#health <= 0) {
                this.scene.engine.emit("scorepoints", this.#pointValue)
                Resources.ExplosionSound.volume = 0.15
                Resources.ExplosionSound.play()
                Explosion.show(this.scene, this.pos.x, this.pos.y)
                this.kill()
            }
        }
    }

    /**
     * Public read-only accessor for the score value of this drone.
     * @returns {number}
     */
    get pointValue() {
        return this.#pointValue
    }
}

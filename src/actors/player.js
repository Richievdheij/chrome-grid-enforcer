import { Actor, Vector, Keys, CollisionType, Color, Animation, AnimationStrategy, Timer } from "excalibur"
import { Resources } from '../resources.js'
import { Bullet } from "./bullet.js"
import { Drone } from "./drone.js"
import { EnemyLaser } from "./enemy-laser.js"
import { HealthPack } from "./healthpack.js"
import { EmpBomb } from "./emp-bomb.js"

export class Player extends Actor {

    speed = 300
    #gameOver = false

    // health system (Encapsulation: private field)
    #health = 3
    #maxHealth = 3

    // shooting cooldown
    #shootCooldown = 250
    #shootTimer = 0
    #canShoot = true

    // invincibility after taking damage
    #invincible = false
    #invincibleTimer = 0
    #invincibleDuration = 1000
    #blinkTimer = 0
    #blinkInterval = 80

    constructor() {
        super({
            width: 60,
            height: 40,
            collisionType: CollisionType.Active
        })
    }

    onInitialize(engine) {
        const sprite = Resources.Player.toSprite()
        sprite.flipHorizontal = true
        this.graphics.use(sprite)
        this.scale = new Vector(0.5, 0.5)

        this.on("collisionstart", (event) => this.hitSomething(event))
    }

    onPreUpdate(engine, delta) {
        if (this.#gameOver) return

        // movement input
        let velX = 0
        let velY = 0

        if (engine.input.keyboard.isHeld(Keys.ArrowLeft) || engine.input.keyboard.isHeld(Keys.A)) {
            velX -= this.speed
        }
        if (engine.input.keyboard.isHeld(Keys.ArrowRight) || engine.input.keyboard.isHeld(Keys.D)) {
            velX += this.speed
        }
        if (engine.input.keyboard.isHeld(Keys.ArrowUp) || engine.input.keyboard.isHeld(Keys.W)) {
            velY -= this.speed
        }
        if (engine.input.keyboard.isHeld(Keys.ArrowDown) || engine.input.keyboard.isHeld(Keys.S)) {
            velY += this.speed
        }

        this.vel = new Vector(velX, velY)

        // shooting cooldown
        if (!this.#canShoot) {
            this.#shootTimer += delta
            if (this.#shootTimer >= this.#shootCooldown) {
                this.#canShoot = true
                this.#shootTimer = 0
            }
        }

        // auto-fire while spacebar held
        if (engine.input.keyboard.isHeld(Keys.Space) && this.#canShoot) {
            this.shoot(engine)
        }

        // keep player within screen bounds
        const halfW = this.width / 2
        const halfH = this.height / 2

        if (this.pos.x < halfW) this.pos.x = halfW
        if (this.pos.x > engine.drawWidth - halfW) this.pos.x = engine.drawWidth - halfW
        if (this.pos.y < halfH) this.pos.y = halfH
        if (this.pos.y > engine.drawHeight - halfH) this.pos.y = engine.drawHeight - halfH

        // invincibility blink — flash red to show damage
        if (this.#invincible) {
            this.#invincibleTimer += delta
            this.#blinkTimer += delta

            if (this.#blinkTimer >= this.#blinkInterval) {
                this.#blinkTimer = 0
                // alternate between normal and red tint
                if (this.graphics.opacity === 1) {
                    this.graphics.opacity = 0.3
                    this.color = Color.fromHex("#ff0000")
                } else {
                    this.graphics.opacity = 1
                    this.color = Color.White
                }
            }

            if (this.#invincibleTimer >= this.#invincibleDuration) {
                this.#invincible = false
                this.graphics.opacity = 1
                this.color = Color.White
            }
        }
    }

    /** Fires a Bullet to the right, respects shoot cooldown. */
    shoot(engine) {
        this.#canShoot = false
        Resources.BulletShot.volume = 0.08
        Resources.BulletShot.play()
        const bullet = new Bullet(this.pos.x + 30, this.pos.y)
        engine.add(bullet)
    }

    /**
     * Reduces health by 1 and starts invincibility window.
     * @returns {boolean} true if the player died
     */
    takeDamage() {
        if (this.#invincible) return false

        this.#health--
        this.scene.engine.emit("playerhit", this.#health)

        this.#invincible = true
        this.#invincibleTimer = 0
        this.#blinkTimer = 0

        if (this.#health <= 0) {
            this.#die()
            return true
        }

        Resources.PlayerHit.volume = 0.5
        Resources.PlayerHit.play()
        return false
    }

    /** Restores 1 HP, up to max health. */
    heal() {
        if (this.#health < this.#maxHealth) {
            this.#health++
            this.scene.engine.emit("playerhit", this.#health)
        }
    }

    get health() {
        return this.#health
    }

    /** Routes collision events to the correct handler based on the other actor's type. */
    hitSomething(event) {
        if (this.#gameOver) return

        const other = event.other.owner
        if (!other) return

        if (other instanceof Drone) {
            other.kill()
            this.takeDamage()
        }

        if (other instanceof EnemyLaser) {
            other.kill()
            this.takeDamage()
        }

        if (other instanceof HealthPack) {
            other.kill()
            Resources.HealthPickup.volume = 0.65
            Resources.HealthPickup.play()
            this.heal()
        }

        if (other instanceof EmpBomb) {
            other.kill()
            Resources.EmpPickup.volume = 0.65
            Resources.EmpPickup.play()
            this.scene.engine.emit("empactivated", { x: other.pos.x, y: other.pos.y })
        }
    }

    #die() {
        this.#gameOver = true
        this.vel = Vector.Zero
        this.#playDeathAnimation()
        Resources.ExplosionSound.volume = 0.6
        Resources.ExplosionSound.play()
        this.scene.engine.emit("gameover")
        const killTimer = new Timer({ interval: 480, fcn: () => this.kill() })
        this.scene.add(killTimer)
        killTimer.start()
    }

    #playDeathAnimation() {
        const frames = [
            Resources.Explosion1, Resources.Explosion2, Resources.Explosion3,
            Resources.Explosion4, Resources.Explosion5, Resources.Explosion6
        ].map(img => ({ graphic: img.toSprite(), duration: 80 }))
        const anim = new Animation({ frames, strategy: AnimationStrategy.End })
        this.graphics.use(anim)
        this.scale = new Vector(1.5, 1.5)
    }
}

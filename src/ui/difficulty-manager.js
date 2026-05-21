/**
 * DifficultyManager — pure-logic Class that tracks the current wave, intermissions,
 * pickup cooldowns and produces spawn configurations for the game scene.
 * Not an Excalibur Actor; instantiated once per game with `new DifficultyManager()`.
 *
 * @property {number}  #score                 - latest known score (private)
 * @property {number}  #wave                  - current wave derived from score (private)
 * @property {number}  #waveThreshold         - score points required per wave (private)
 * @property {number}  #lastAnnouncedWave     - last wave for which an announcement was returned (private)
 * @property {number}  #intermissionTimer     - elapsed time in the current intermission (private)
 * @property {number}  #intermissionDuration  - intermission length in ms (private)
 * @property {boolean} #inIntermission        - true while between waves (private)
 * @property {boolean} #newWaveStarted        - true on the first frame of a new wave (private)
 * @property {number}  #healthkitCooldown     - ms left before another health pickup may spawn (private)
 */
export class DifficultyManager {

    #score = 0
    #wave = 1
    #waveThreshold = 150
    #lastAnnouncedWave = 0
    #intermissionTimer = 0
    #intermissionDuration = 1500
    #inIntermission = false
    #newWaveStarted = false
    #healthkitCooldown = 0

    /**
     * Updates the score and, if the wave threshold is crossed, starts an intermission.
     * @param {number} score
     * @returns {boolean} true if a new wave just started
     */
    updateScore(score) {
        const prevWave = this.#wave
        this.#score = score
        this.#wave = Math.floor(score / this.#waveThreshold) + 1

        if (this.#wave > prevWave) {
            this.#inIntermission = true
            this.#intermissionTimer = 0
            this.#newWaveStarted = true
            return true
        }
        return false
    }

    /**
     * Per-frame tick — counts down the intermission and the health-pickup cooldown.
     * @param {number} delta - milliseconds since previous frame
     * @returns {void}
     */
    update(delta) {
        if (this.#inIntermission) {
            this.#intermissionTimer += delta
            if (this.#intermissionTimer >= this.#intermissionDuration) {
                this.#inIntermission = false
            }
        }
        if (this.#healthkitCooldown > 0) {
            this.#healthkitCooldown -= delta
        }
    }

    /**
     * @returns {number} current wave
     */
    getWave() {
        return this.#wave
    }

    /**
     * @returns {boolean} true while the game is paused between waves
     */
    isIntermission() {
        return this.#inIntermission
    }

    /**
     * Returns the announcement string the first frame a new wave begins (after intermission),
     * and null otherwise.
     * @returns {string|null}
     */
    getWaveAnnouncement() {
        if (this.#newWaveStarted && !this.#inIntermission) {
            this.#newWaveStarted = false
            this.#lastAnnouncedWave = this.#wave
            return `WAVE ${this.#wave}`
        }
        return null
    }

    /**
     * Extra speed (px/s) the player gains based on the current wave.
     * @returns {number}
     */
    getPlayerSpeedBoost() {
        return (this.#wave - 1) * 15
    }

    /**
     * Builds the drone type, speed and shoot interval the scene should use for the next spawn.
     * @returns {{droneType: "drone"|"shooting"|"fast"|"heavy"|"burst", speed: number, shootInterval: number}}
     */
    getSpawnConfig() {
        const wave = this.#wave
        const isBulletHell = wave >= 12
        const speedBoost = isBulletHell ? wave * 10 : wave * 5
        const baseSpeed = 150 + Math.random() * 50

        const roll = Math.random()
        let droneType = "drone"
        let speed = baseSpeed + speedBoost
        let shootInterval = 2500

        if (isBulletHell) {
            shootInterval = Math.max(1200, 1800 - (wave - 12) * 30)
            if (roll < 0.10) {
                droneType = "burst"
                speed = speed * 0.8
            } else if (roll < 0.25) {
                droneType = "fast"
                speed = speed * 1.2
            } else if (roll < 0.40) {
                droneType = "heavy"
                speed = speed * 0.5
            } else {
                droneType = "shooting"
            }
        } else if (wave >= 8 && roll < 0.08) {
            droneType = "burst"
            speed = speed * 0.8
            shootInterval = Math.max(1400, 2200 - wave * 60)
        } else if (wave >= 6 && roll < 0.15) {
            droneType = "fast"
            speed = speed * 1.2
        } else if (wave >= 4 && roll < 0.25) {
            droneType = "heavy"
            speed = speed * 0.5
        } else if (wave >= 2) {
            droneType = "shooting"
            shootInterval = Math.max(1400, 2800 - wave * 100)
        }

        return { droneType, speed, shootInterval }
    }

    /**
     * Rolls whether a pickup of the given type should spawn this tick.
     * For "health" also enforces a cooldown so kits don't stack.
     * @param {"health"|"emp"} type
     * @returns {boolean}
     */
    shouldSpawnPickup(type) {
        if (type === "health") {
            if (this.#healthkitCooldown > 0) return false
            // more healthkits at higher waves to stay survivable
            const baseChance = this.#wave >= 10 ? 0.08 : 0.06
            const chance = Math.max(0.03, baseChance - this.#wave * 0.002)
            if (Math.random() < chance) {
                this.#healthkitCooldown = this.#wave >= 10 ? 12000 : 20000
                return true
            }
            return false
        }
        if (type === "emp") {
            return this.#wave >= 4 && Math.random() < 0.04
        }
        return false
    }

    /**
     * Ms between spawns at the current wave — shorter in bullet-hell mode (wave >= 12).
     * @returns {number}
     */
    getSpawnInterval() {
        const isBulletHell = this.#wave >= 12
        if (isBulletHell) {
            const decrease = (this.#wave - 12) * 30
            return Math.max(600, 1200 - decrease)
        }
        const base = 1800
        const decrease = (this.#wave - 1) * 70
        return Math.max(800, base - decrease)
    }

    /**
     * Resets all internal state back to wave 1.
     * Called by the game scene on activate.
     * @returns {void}
     */
    reset() {
        this.#score = 0
        this.#wave = 1
        this.#lastAnnouncedWave = 0
        this.#intermissionTimer = 0
        this.#inIntermission = false
        this.#newWaveStarted = false
        this.#healthkitCooldown = 0
    }
}

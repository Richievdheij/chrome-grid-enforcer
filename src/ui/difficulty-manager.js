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

    getWave() {
        return this.#wave
    }

    isIntermission() {
        return this.#inIntermission
    }

    getWaveAnnouncement() {
        if (this.#newWaveStarted && !this.#inIntermission) {
            this.#newWaveStarted = false
            this.#lastAnnouncedWave = this.#wave
            return `WAVE ${this.#wave}`
        }
        return null
    }

    getPlayerSpeedBoost() {
        return (this.#wave - 1) * 15
    }

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

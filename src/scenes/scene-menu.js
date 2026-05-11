import { Scene, Vector, Actor, Keys } from "excalibur"
import { Resources } from '../resources.js'
import { ArcadeButton } from '../ui/button.js'

export class SceneMenu extends Scene {
    #startButton
    #leaderboardButton
    #nameInput
    #playerName = ""

    onInitialize(engine) {
        // background sprite scaled to fill viewport
        const bgSprite = Resources.MainMenu.toSprite()
        const bgScale = Math.max(
            engine.drawWidth / bgSprite.width,
            engine.drawHeight / bgSprite.height
        )

        const bg = new Actor({
            x: engine.halfDrawWidth,
            y: engine.halfDrawHeight,
        })
        bg.graphics.use(bgSprite)
        bg.scale = new Vector(bgScale, bgScale)
        bg.z = -10
        this.add(bg)

        // Add logo actor
        const logo = new Actor({
            pos: new Vector(engine.drawWidth / 2, 220)
        })
        logo.graphics.use(Resources.Logo.toSprite())
        logo.scale = new Vector(0.4, 0.4) // smaller logo size for title
        this.add(logo)
    }

    onActivate(engine) {
        document.body.style.cursor = "default"
        const ui = document.getElementById('ui-layer')

        // 1. Create Name Input
        this.#nameInput = document.createElement('input')
        this.#nameInput.type = 'text'
        this.#nameInput.placeholder = 'IDENTIFY YOURSELF'
        this.#nameInput.className = 'input-name ui-element'
        this.#nameInput.maxLength = 12
        ui.appendChild(this.#nameInput)
        
        this.#nameInput.addEventListener('input', () => {
            this.#nameInput.style.borderColor = ''
            this.#nameInput.placeholder = 'IDENTIFY YOURSELF'
        })
        
        // Auto-focus the input for the arcade feel
        setTimeout(() => this.#nameInput.focus(), 100)

        // 2. Create Play Button (Solid Background)
        this.#startButton = new ArcadeButton('START ENFORCEMENT', () => {
            this.#validateAndStart(engine)
        })
        this.#startButton.mount('ui-layer')
        this.#startButton.element.classList.add('btn-play')

        // 3. Create Leaderboard Button (Below Play)
        this.#leaderboardButton = new ArcadeButton('LEADERBOARD', () => {
            engine.goToScene('leaderboard')
        })
        this.#leaderboardButton.mount('ui-layer')
        this.#leaderboardButton.element.classList.add('btn-leaderboard')
    }

    #validateAndStart(engine) {
        this.#playerName = this.#nameInput.value.trim()

        // Simple validation: check if name is empty or too short
        if (this.#playerName.length < 2) {
            this.#nameInput.style.borderColor = "#ff0000"
            this.#nameInput.placeholder = "NAME TOO SHORT!"
            this.#nameInput.value = ""
            this.#nameInput.focus()
            return
        }

        console.log(`Enforcer identified: ${this.#playerName}`)
        
        // Save to localStorage so other scenes can access it
        localStorage.setItem("currentPlayer", this.#playerName)
        
        engine.goToScene('game')
    }

    onPreUpdate(engine) {
        // Arcade support via keyboard input
        if (engine.input.keyboard.wasPressed(Keys.Enter)) {
            this.#validateAndStart(engine)
        }
    }

    onDeactivate(engine) {
        // Clean up UI elements to prevent duplicates
        if (this.#nameInput) this.#nameInput.remove()
        if (this.#startButton) this.#startButton.unmount()
        if (this.#leaderboardButton) this.#leaderboardButton.unmount()
    }
}
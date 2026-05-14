import { Scene, Vector, Actor, Keys, Timer } from "excalibur"
import { Resources } from '../resources.js'
import { ArcadeButton } from '../ui/button.js'
import { SceneTransition } from '../ui/scene-transition.js'

export class SceneMenu extends Scene {
    #startButton
    #leaderboardButton
    #nameInput
    #playerName = ""
    #logo

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

        // logo stored as private field so we can animate it later
        this.#logo = new Actor({
            pos: new Vector(engine.drawWidth / 2, 220)
        })
        this.#logo.graphics.use(Resources.Logo.toSprite())
        this.#logo.scale = new Vector(0.4, 0.4)
        this.add(this.#logo)
    }

    onActivate() {
        document.body.style.cursor = "default"

        // restore logo visibility when returning to menu
        if (this.#logo) {
            this.#logo.graphics.opacity = 1
        }

        const ui = document.getElementById('ui-layer')

        // name input
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

        // auto-focus
        const focusTimer = new Timer({
            interval: 100,
            fcn: () => this.#nameInput.focus()
        })
        this.add(focusTimer)
        focusTimer.start()

        // play button
        this.#startButton = new ArcadeButton('START ENFORCEMENT', () => {
            this.#validateAndStart()
        })
        this.#startButton.mount('ui-layer')
        this.#startButton.element.classList.add('btn-play')

        // leaderboard button
        this.#leaderboardButton = new ArcadeButton('LEADERBOARD', () => {
            this.engine.goToScene('leaderboard')
        })
        this.#leaderboardButton.mount('ui-layer')
        this.#leaderboardButton.element.classList.add('btn-leaderboard')
    }

    #validateAndStart() {
        if (this.#nameInput.disabled) return

        this.#playerName = this.#nameInput.value.trim()

        if (this.#playerName.length < 2) {
            this.#nameInput.style.borderColor = "#ff0000"
            this.#nameInput.placeholder = "NAME TOO SHORT!"
            this.#nameInput.value = ""
            this.#nameInput.focus()
            return
        }

        this.#nameInput.disabled = true
        localStorage.setItem("currentPlayer", this.#playerName)

        this.#startTransition()
    }

    #startTransition() {
        const uiLayer = document.getElementById('ui-layer')

        // fade out UI layer
        if (uiLayer) {
            uiLayer.style.transition = 'opacity 600ms ease-out'
            uiLayer.style.opacity = '0'
        }

        // fade out logo
        if (this.#logo) {
            this.#logo.graphics.opacity = 0
        }

        // after fade, iris close then switch scene
        const fadeTimer = new Timer({
            interval: 700,
            fcn: () => {
                SceneTransition.irisClose(this, () => {
                    this.engine.goToScene('game')
                })
            }
        })
        this.add(fadeTimer)
        fadeTimer.start()
    }

    onPreUpdate(engine) {
        if (engine.input.keyboard.wasPressed(Keys.Enter)) {
            this.#validateAndStart()
        }
    }

    onDeactivate() {
        const uiLayer = document.getElementById('ui-layer')
        if (uiLayer) {
            uiLayer.style.transition = ''
            uiLayer.style.opacity = '1'
        }

        if (this.#nameInput) this.#nameInput.remove()
        if (this.#startButton) this.#startButton.unmount()
        if (this.#leaderboardButton) this.#leaderboardButton.unmount()
    }
}

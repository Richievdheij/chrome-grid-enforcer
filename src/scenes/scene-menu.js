import { Scene, Vector, Actor, Keys, Timer } from "excalibur"
import { Resources } from '../resources.js'
import { ArcadeButton } from '../ui/button.js'
import { SceneTransition } from '../ui/scene-transition.js'

/**
 * SceneMenu — main menu scene.
 * Shows the logo, a name input field and Start/Leaderboard buttons.
 * Inherits from Excalibur's Scene class via `extends`.
 *
 * @extends Scene
 * @property {ArcadeButton}    #startButton       - "Start" button Object (private)
 * @property {ArcadeButton}    #leaderboardButton - "Leaderboard" button Object (private)
 * @property {HTMLInputElement} #nameInput        - DOM input where the player enters their name (private)
 * @property {string}          #playerName        - last validated player name (private)
 * @property {Actor}           #logo              - Actor that shows the title logo (private)
 */
export class SceneMenu extends Scene {
    #startButton
    #leaderboardButton
    #nameInput
    #playerName = ""
    #logo

    /**
     * Lifecycle method — runs once when the Scene is created.
     * Adds the static background and logo actors.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
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

    /**
     * Lifecycle method — runs every time the menu becomes active.
     * Sets up music, the DOM name input and the two buttons.
     * @returns {void}
     */
    onActivate() {
        document.body.style.cursor = "default"

        Resources.MenuMusic.volume = 0.3
        Resources.MenuMusic.loop = true
        Resources.MenuMusic.play()

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

        // auto-focus the input shortly after activation so it works across browsers
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

    /**
     * Validates the name input and, if valid, starts the transition into the game scene.
     * @returns {void}
     * @private
     */
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

    /**
     * Fades the HTML overlay and logo out, then plays the iris-close transition.
     * @returns {void}
     * @private
     */
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

    /**
     * Lifecycle method — runs every frame before physics.
     * Allows pressing Enter to start the game from the keyboard.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onPreUpdate(engine) {
        if (engine.input.keyboard.wasPressed(Keys.Enter)) {
            this.#validateAndStart()
        }
    }

    /**
     * Lifecycle method — runs when the menu becomes inactive.
     * Tears down music, restores the overlay opacity and removes DOM elements.
     * @returns {void}
     */
    onDeactivate() {
        Resources.MenuMusic.stop()

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

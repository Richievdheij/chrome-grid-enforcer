import { Scene, Vector, Label, Font, FontUnit, Color, Keys, Actor, Rectangle } from "excalibur"
import { ArcadeButton } from '../ui/button.js'
import { Leaderboard } from '../ui/leaderboard.js'

/**
 * SceneLeaderboard — shows the all-time top 10 scores.
 * Inherits from Excalibur's Scene class via `extends`.
 *
 * @extends Scene
 * @property {ArcadeButton} #backBtn      - back-to-menu DOM button Object (private)
 * @property {Actor[]}      #entryLabels  - actors created per activation, killed on deactivate (private)
 */
export class SceneLeaderboard extends Scene {

    #backBtn
    #entryLabels = []

    /**
     * Lifecycle method — runs once when the scene is created.
     * Adds the static title Label.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onInitialize(engine) {
        const title = new Label({
            text: 'ALL-TIME LEADERBOARD TOP 10',
            pos: new Vector(engine.halfDrawWidth, 60),
            font: new Font({
                size: 40,
                unit: FontUnit.Px,
                color: Color.fromHex("#00FFFF"),
                bold: true,
                family: 'Courier New, monospace',
                textAlign: 'center'
            })
        })
        this.add(title)
    }

    /**
     * Lifecycle method — runs every time the scene becomes active.
     * Rebuilds the leaderboard rows from localStorage.
     * @returns {void}
     */
    onActivate() {
        document.body.style.cursor = "default"

        const engine = this.engine

        // back button
        this.#backBtn = new ArcadeButton("<- BACK TO MENU", () => {
            engine.goToScene("menu")
        })
        this.#backBtn.mount('ui-layer')
        this.#backBtn.element.classList.add('btn-leaderboard')

        this.#clearLabels()

        const entries = Leaderboard.load()

        if (entries.length === 0) {
            const emptyText = new Label({
                text: 'NO ENFORCERS FOUND... YET',
                pos: new Vector(engine.halfDrawWidth, 250),
                font: new Font({
                    size: 22,
                    unit: FontUnit.Px,
                    color: Color.fromHex("#FF0055"),
                    family: 'Courier New, monospace',
                    textAlign: 'center'
                })
            })
            this.add(emptyText)
            this.#entryLabels.push(emptyText)
            return
        }

        // column headers
        const headerY = 120
        const headerFont = new Font({
            size: 18,
            unit: FontUnit.Px,
            color: Color.fromHex("#b0c4de"),
            bold: true,
            family: 'Courier New, monospace'
        })

        const rankHeader = new Label({ text: '#', pos: new Vector(250, headerY), font: headerFont })
        const nameHeader = new Label({ text: 'ENFORCER', pos: new Vector(340, headerY), font: headerFont })
        const scoreHeader = new Label({ text: 'SCORE', pos: new Vector(680, headerY), font: headerFont })
        const dateHeader = new Label({ text: 'DATE', pos: new Vector(800, headerY), font: headerFont })

        this.add(rankHeader)
        this.add(nameHeader)
        this.add(scoreHeader)
        this.add(dateHeader)
        this.#entryLabels.push(rankHeader, nameHeader, scoreHeader, dateHeader)

        // separator line
        const separator = new Actor({
            pos: new Vector(engine.halfDrawWidth, headerY + 25),
            width: 700,
            height: 2
        })
        separator.graphics.use(new Rectangle({
            width: 700,
            height: 2,
            color: Color.fromHex("#00f2ff")
        }))
        this.add(separator)
        this.#entryLabels.push(separator)

        // entry rows
        entries.forEach((entry, index) => {
            const y = 170 + index * 40
            const rank = index + 1

            // gold / silver / bronze tint for the top three
            let color = Color.White
            if (rank === 1) color = Color.fromHex("#FFD700")
            if (rank === 2) color = Color.fromHex("#C0C0C0")
            if (rank === 3) color = Color.fromHex("#CD7F32")

            const entryFont = new Font({
                size: 20,
                unit: FontUnit.Px,
                color: color,
                bold: rank <= 3,
                family: 'Courier New, monospace'
            })

            const rankLabel = new Label({ text: `${rank}.`, pos: new Vector(260, y), font: entryFont })
            const nameLabel = new Label({ text: entry.name, pos: new Vector(340, y), font: entryFont })
            const scoreLabel = new Label({ text: `${entry.score}`, pos: new Vector(680, y), font: entryFont })
            const dateLabel = new Label({
                text: entry.date,
                pos: new Vector(800, y),
                font: new Font({
                    size: 14,
                    unit: FontUnit.Px,
                    color: Color.fromHex("#666666"),
                    family: 'Courier New, monospace'
                })
            })

            this.add(rankLabel)
            this.add(nameLabel)
            this.add(scoreLabel)
            this.add(dateLabel)
            this.#entryLabels.push(rankLabel, nameLabel, scoreLabel, dateLabel)
        })
    }

    /**
     * Lifecycle method — Escape or Backspace returns the player to the menu.
     * @param {import('excalibur').Engine} engine
     * @returns {void}
     */
    onPreUpdate(engine) {
        if (engine.input.keyboard.wasPressed(Keys.Escape) || engine.input.keyboard.wasPressed(Keys.Backspace)) {
            engine.goToScene("menu")
        }
    }

    /**
     * Lifecycle method — runs when the scene becomes inactive.
     * Removes the back button and clears all per-activation entry actors.
     * @returns {void}
     */
    onDeactivate() {
        if (this.#backBtn) {
            this.#backBtn.unmount()
        }
        this.#clearLabels()
    }

    /**
     * Kills every per-activation entry actor and resets the collection.
     * @returns {void}
     * @private
     */
    #clearLabels() {
        this.#entryLabels.forEach(label => {
            if (label.kill) label.kill()
        })
        this.#entryLabels = []
    }
}

import './scss/main.scss'
import { Engine, DisplayMode, Color, SolverStrategy, Vector, WebAudio } from "excalibur"
import { Resources, ResourceLoader } from './resources.js'
import { SceneMenu } from './scenes/scene-menu.js'
import { SceneGame } from './scenes/scene-game.js'
import { SceneLeaderboard } from './scenes/scene-leaderboard.js'

/**
 * Main game class — the top-level Object that owns the Engine, the Scenes and the loop.
 * Inherits from Excalibur's Engine class via `extends`.
 *
 * @extends Engine
 * @property {boolean} #audioUnlocked - true once the WebAudio context has been resumed (private)
 */
export class Game extends Engine {

    #audioUnlocked = false

    /**
     * Constructor — configures the engine and starts loading resources.
     * Runs automatically when `new Game()` is called from main.js.
     */
    constructor() {
        super({
            canvasElementId: 'game',
            width: 1280,
            height: 720,
            maxFps: 60,
            displayMode: DisplayMode.FitScreen,
            backgroundColor: Color.Black,
            suppressPlayButton: true,
            physics: {
                solver: SolverStrategy.Arcade,
                gravity: new Vector(0, 0)
            }
        })

        ResourceLoader.backgroundColor = "#000000"
        ResourceLoader.suppressPlayButton = true

        // browsers block audio until the user interacts — install a one-shot unlock
        this.#installAudioUnlock()

        // start the engine once all resources are loaded, then hand off to startGame()
        this.start(ResourceLoader).then(() => this.startGame())
    }

    /**
     * Registers the scenes and switches to the menu scene.
     * Called once after the resource loader finishes.
     * @returns {void}
     */
    startGame() {
        this.addScene("menu", new SceneMenu())
        this.addScene("game", new SceneGame())
        this.addScene("leaderboard", new SceneLeaderboard())

        this.goToScene("menu")
    }

    /**
     * Unlocks the browser's WebAudio context on the first user gesture.
     * The loader's play button (which normally handles this) is suppressed,
     * so we listen for the first pointerdown / keydown / touchstart ourselves
     * and retrigger the menu music that the browser blocked.
     * @returns {void}
     * @private
     */
    #installAudioUnlock() {
        const unlock = async () => {
            if (this.#audioUnlocked) return
            this.#audioUnlocked = true

            await WebAudio.unlock()

            // initial MenuMusic.play() was silently blocked — retrigger it now
            if (!Resources.MenuMusic.isPlaying()) {
                Resources.MenuMusic.volume = 0.3
                Resources.MenuMusic.loop = true
                Resources.MenuMusic.play()
            }
        }

        const events = ['pointerdown', 'keydown', 'touchstart']
        events.forEach(evt => document.addEventListener(evt, unlock, { once: true }))
    }
}

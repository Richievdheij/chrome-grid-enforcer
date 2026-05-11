import './scss/main.scss'
import { Engine, DisplayMode, Color } from "excalibur"
import { ResourceLoader } from './resources.js'
import { SceneMenu } from './scenes/scene-menu.js'
import { SceneGame } from './scenes/scene-game.js'
import { SceneLeaderboard } from './scenes/scene-leaderboard.js'

export class Game extends Engine {

    constructor() {
        super({ 
            canvasElementId: 'game',
            width: 1280,
            height: 720,
            maxFps: 60,
            displayMode: DisplayMode.FitScreen,
            backgroundColor: Color.Black,
            suppressPlayButton: true
         })

        ResourceLoader.backgroundColor = "#000000"
        ResourceLoader.suppressPlayButton = true
        
        this.start(ResourceLoader).then(() => this.startGame())
    }

    startGame() {
        this.addScene("menu", new SceneMenu())
        this.addScene("game", new SceneGame())
        this.addScene("leaderboard", new SceneLeaderboard())

        this.goToScene("menu")
    }
}
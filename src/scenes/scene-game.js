import { Scene } from "excalibur"

export class SceneGame extends Scene {
    
    onInitialize(engine) {
        // Init level geometry, background, and UI here
    }

    onActivate(engine) {
        // Spawn player and reset level variables here
        console.log("Game started. Ready to spawn Player.")
    }

    onDeactivate(engine) {
        // Cleanup level resources
    }
}
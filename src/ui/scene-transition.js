export class SceneTransition {

    static #overlayDiv = null

    // creates the full-screen black overlay div
    static #createOverlay() {
        const div = document.createElement('div')
        div.id = 'iris-overlay'
        div.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #000000;
            z-index: 50;
            pointer-events: none;
        `
        document.getElementById('game-container').appendChild(div)
        SceneTransition.#overlayDiv = div
        return div
    }

    // iris closes: black circle grows from center to cover the screen
    static irisClose(scene, callback) {
        // remove any existing overlay first
        SceneTransition.#cleanup()

        const div = SceneTransition.#createOverlay()

        // use Web Animations API — more reliable than CSS transitions
        const animation = div.animate([
            { clipPath: 'circle(0% at 50% 50%)' },
            { clipPath: 'circle(150% at 50% 50%)' }
        ], {
            duration: 800,
            easing: 'ease-in-out',
            fill: 'forwards'
        })

        animation.onfinish = () => {
            if (callback) callback()
        }
    }

    // iris opens: black circle shrinks to reveal the scene
    static irisOpen(scene, callback) {
        // if no overlay exists, just run the callback
        if (!SceneTransition.#overlayDiv) {
            const div = SceneTransition.#createOverlay()
            // start fully black
            div.style.clipPath = 'circle(150% at 50% 50%)'
        }

        const div = SceneTransition.#overlayDiv

        const animation = div.animate([
            { clipPath: 'circle(150% at 50% 50%)' },
            { clipPath: 'circle(0% at 50% 50%)' }
        ], {
            duration: 800,
            easing: 'ease-in-out',
            fill: 'forwards'
        })

        animation.onfinish = () => {
            SceneTransition.#cleanup()
            if (callback) callback()
        }
    }

    // remove the overlay div completely
    static #cleanup() {
        if (SceneTransition.#overlayDiv) {
            SceneTransition.#overlayDiv.remove()
            SceneTransition.#overlayDiv = null
        }
    }
}

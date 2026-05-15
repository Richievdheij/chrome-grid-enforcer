export class SceneTransition {

    static #overlayDiv = null
    static #safetyTimeoutId = null

    static #createOverlay() {
        // always clean up any existing overlay first
        SceneTransition.cleanup()

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
        const container = document.getElementById('game-container')
        if (container) {
            container.appendChild(div)
        }
        SceneTransition.#overlayDiv = div
        return div
    }

    static irisClose(scene, callback) {
        // make sure we start clean
        SceneTransition.cleanup()

        const div = SceneTransition.#createOverlay()

        const animation = div.animate([
            { clipPath: 'circle(0% at 50% 50%)' },
            { clipPath: 'circle(150% at 50% 50%)' }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards'
        })

        SceneTransition.#safetyTimeoutId = setTimeout(() => {
            SceneTransition.cleanup()
            if (callback) callback()
        }, 1500)

        animation.onfinish = () => {
            if (SceneTransition.#safetyTimeoutId) {
                clearTimeout(SceneTransition.#safetyTimeoutId)
                SceneTransition.#safetyTimeoutId = null
            }
            if (callback) callback()
        }
    }

    static irisOpen(scene, callback) {
        const div = SceneTransition.#overlayDiv || SceneTransition.#createOverlay()
        div.style.clipPath = 'circle(150% at 50% 50%)'

        const animation = div.animate([
            { clipPath: 'circle(150% at 50% 50%)' },
            { clipPath: 'circle(0% at 50% 50%)' }
        ], {
            duration: 600,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards'
        })

        animation.onfinish = () => {
            SceneTransition.cleanup()
            if (callback) callback()
        }
    }

    static cleanup() {
        if (SceneTransition.#safetyTimeoutId) {
            clearTimeout(SceneTransition.#safetyTimeoutId)
            SceneTransition.#safetyTimeoutId = null
        }
        if (SceneTransition.#overlayDiv) {
            SceneTransition.#overlayDiv.remove()
            SceneTransition.#overlayDiv = null
        }
    }
}

/**
 * SceneTransition — utility Class for iris-open/iris-close fades between scenes.
 * All members are static — the class is used as a namespace, not instantiated with `new`.
 *
 * @property {HTMLDivElement|null} #overlayDiv      - the DOM overlay used for the fade (static, private)
 * @property {number|null}         #safetyTimeoutId - fallback timeout id in case animation events never fire (static, private)
 */
export class SceneTransition {

    static #overlayDiv = null
    static #safetyTimeoutId = null

    /**
     * Creates the black overlay div, removing any leftover from a previous transition.
     * @returns {HTMLDivElement}
     * @private
     */
    static #createOverlay() {
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

    /**
     * Plays an iris-close animation, then runs the callback (typically a scene switch).
     * @param {import('excalibur').Scene} scene
     * @param {() => void} [callback]
     * @returns {void}
     */
    static irisClose(scene, callback) {
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

        // fallback in case onfinish never fires (window blurred mid-transition, etc.)
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

    /**
     * Plays an iris-open animation that reveals the new scene.
     * @param {import('excalibur').Scene} scene
     * @param {() => void} [callback]
     * @returns {void}
     */
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

    /**
     * Removes the overlay div and clears any safety timeout.
     * Safe to call multiple times.
     * @returns {void}
     */
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

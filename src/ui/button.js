/**
 * ArcadeButton — wrapper around a DOM <button> element used for menu UI.
 * Not an Excalibur Actor; it lives in the HTML overlay layer.
 *
 * @property {HTMLButtonElement} #element - the underlying DOM button (private)
 */
export class ArcadeButton {

    #element

    /**
     * Constructor — creates the DOM button Object and binds a click handler.
     * @param {string} text - label shown on the button
     * @param {(event: MouseEvent) => void} onClickCallback - click handler
     */
    constructor(text, onClickCallback) {
        this.#element = document.createElement('button')
        this.#element.className = 'btn-start'
        this.#element.innerText = text
        this.#element.onclick = onClickCallback
    }

    /**
     * Public read-only accessor for the underlying DOM element.
     * Lets external code add extra CSS classes or attributes.
     * @returns {HTMLButtonElement}
     */
    get element() {
        return this.#element
    }

    /**
     * Appends the button into the given container element.
     * @param {string} containerId - id of the DOM container element
     * @returns {void}
     */
    mount(containerId) {
        const container = document.getElementById(containerId)
        if (container) {
            container.appendChild(this.#element)
        }
    }

    /**
     * Removes the button from the DOM, if it is currently mounted.
     * @returns {void}
     */
    unmount() {
        if (this.#element && this.#element.parentElement) {
            this.#element.parentElement.removeChild(this.#element)
        }
    }
}

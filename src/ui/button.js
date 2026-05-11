export class ArcadeButton {
    #element

    constructor(text, onClickCallback) {
        this.#element = document.createElement('button')
        this.#element.className = 'btn-start'
        this.#element.innerText = text
        this.#element.onclick = onClickCallback
    }

    // Getter to allow external class modification
    get element() {
        return this.#element
    }

    mount(containerId) {
        const container = document.getElementById(containerId)
        if (container) {
            container.appendChild(this.#element)
        }
    }

    unmount() {
        if (this.#element && this.#element.parentElement) {
            this.#element.parentElement.removeChild(this.#element)
        }
    }
}
/**
 * Leaderboard — utility Class for reading and writing the top-10 scores in localStorage.
 * All members are static — the class is used as a namespace, not instantiated with `new`.
 *
 * @property {string} #storageKey - localStorage key used for the scores array (static, private)
 */
export class Leaderboard {

    static #storageKey = "leaderboard"

    /**
     * Saves a new score entry and keeps only the top 10.
     * @param {string} name  - player name (uppercased before saving)
     * @param {number} score - final score
     * @returns {void}
     */
    static save(name, score) {
        const entries = Leaderboard.load()

        entries.push({
            name: name.toUpperCase(),
            score,
            date: new Date().toLocaleString('en-GB')
        })

        // sort highest score first
        entries.sort((a, b) => b.score - a.score)

        // keep only top 10
        const top10 = entries.slice(0, 10)

        localStorage.setItem(Leaderboard.#storageKey, JSON.stringify(top10))
    }

    /**
     * Loads all leaderboard entries from localStorage.
     * @returns {{name: string, score: number, date: string}[]}
     */
    static load() {
        const data = localStorage.getItem(Leaderboard.#storageKey)
        if (!data) return []
        try {
            return JSON.parse(data)
        } catch {
            return []
        }
    }

    /**
     * Returns the highest-scoring entry, or null if the leaderboard is empty.
     * @returns {{name: string, score: number, date: string}|null}
     */
    static getLatest() {
        const entries = Leaderboard.load()
        return entries.length > 0 ? entries[0] : null
    }
}

export class Leaderboard {

    // localStorage key for the scores array
    static #storageKey = "leaderboard"

    /**
     * Saves a score entry and keeps only the top 10.
     * @param {string} name - player name
     * @param {number} score - final score
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

    /** Loads all leaderboard entries from localStorage, sorted by score. */
    static load() {
        const data = localStorage.getItem(Leaderboard.#storageKey)
        if (!data) return []
        try {
            return JSON.parse(data)
        } catch {
            return []
        }
    }

    /** Returns the highest-scoring entry, or null if empty. */
    static getLatest() {
        const entries = Leaderboard.load()
        return entries.length > 0 ? entries[0] : null
    }
}

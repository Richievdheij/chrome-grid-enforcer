import { Actor, Vector, Rectangle, Color, GraphicsGroup } from "excalibur"

/**
 * Scrolling cityscape background with parallax support.
 * Draws procedurally generated buildings with neon-lit windows.
 */
export class Background extends Actor {

    #layer
    #scrollSpeed

    /**
     * @param {number} startX - horizontal position (0 or screen width for tiling)
     * @param {"far"|"near"} layer - depth layer: "far" scrolls slower for parallax
     */
    constructor(startX = 0, layer = "near") {
        super({ x: startX, y: 0, z: layer === "far" ? -2 : -1 })
        this.#layer = layer
        this.#scrollSpeed = layer === "far" ? 75 : 150
    }

    onInitialize(engine) {
        const w = engine.drawWidth
        const h = engine.drawHeight
        this.anchor = new Vector(0, 0)

        const isFar = this.#layer === "far"
        const members = []

        // building generation
        const count = isFar ? 7 : 9
        const minH = isFar ? 60 : 80
        const maxH = isFar ? 200 : 380
        const spacing = w / count

        for (let i = 0; i < count; i++) {
            const bw = isFar ? (30 + Math.random() * 50) : (40 + Math.random() * 80)
            const bh = minH + Math.random() * (maxH - minH)
            const bx = i * spacing + Math.random() * 30
            const by = h - bh - 40

            // building body with color variation
            const bodyColors = ["#1c1c3a", "#1a1a33", "#22224a", "#18183a"]
            const bodyColor = bodyColors[Math.floor(Math.random() * bodyColors.length)]
            members.push({
                graphic: new Rectangle({ width: bw, height: bh, color: Color.fromHex(bodyColor) }),
                offset: new Vector(bx, by)
            })

            // windows — near layer always, far layer 60% chance
            if (!isFar || Math.random() < 0.6) {
                const winW = 6
                const winH = 8
                const cols = Math.floor(bw / 14)
                const rows = Math.floor(bh / 20)

                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        const lit = Math.random() < 0.3
                        const neonColors = ["#00f2ff", "#ff00ea", "#00ddff", "#ff44cc"]
                        const winColor = lit ? neonColors[Math.floor(Math.random() * neonColors.length)] : "#1a1a33"
                        members.push({
                            graphic: new Rectangle({ width: winW, height: winH, color: Color.fromHex(winColor) }),
                            offset: new Vector(bx + 6 + col * 14, by + 8 + row * 20)
                        })
                    }
                }
            }

            // rooftop antenna — near layer only, 30% chance
            if (!isFar && Math.random() < 0.3) {
                const antennaH = 15 + Math.random() * 20
                const antennaX = bx + bw / 2 - 1
                members.push({
                    graphic: new Rectangle({ width: 2, height: antennaH, color: Color.fromHex("#444466") }),
                    offset: new Vector(antennaX, by - antennaH)
                })
                // red light on top — 50% chance
                if (Math.random() < 0.5) {
                    members.push({
                        graphic: new Rectangle({ width: 4, height: 4, color: Color.fromHex("#ff0033") }),
                        offset: new Vector(antennaX - 1, by - antennaH - 2)
                    })
                }
            }
        }

        // ground strip
        members.push({
            graphic: new Rectangle({ width: w, height: 40, color: Color.fromHex(isFar ? "#0e0e22" : "#141428") }),
            offset: new Vector(0, h - 40)
        })

        const group = new GraphicsGroup({ members })
        this.graphics.use(group)
    }

    get scrollSpeed() {
        return this.#scrollSpeed
    }
}

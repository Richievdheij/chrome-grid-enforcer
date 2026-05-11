import { Actor, Vector, Color, Font, FontUnit, GraphicsGroup, Rectangle, Text, TextAlign, BaseAlign } from "excalibur"

export class Button extends Actor {
    constructor(x, y, text, action) {
        // Zorg voor een minimale touch target size van 44px+ (UI/UX Pro Max rule)
        super({ 
            x, 
            y, 
            width: 280, 
            height: 60 
        })
        this.text = text
        this.action = action
    }

    onInitialize(engine) {
        this.bg = new Rectangle({
            width: 280, 
            height: 60,
            color: Color.fromHex("#FF0055"),
            strokeColor: Color.fromHex("#00FFFF"),
            lineWidth: 2
        })

        const textGraphic = new Text({
            text: this.text,
            font: new Font({
                size: 24,
                unit: FontUnit.Px,
                color: Color.White,
                bold: true,
                family: 'monospace'
            }),
            textAlign: TextAlign.Center,
            baseAlign: BaseAlign.Middle
        })

        const group = new GraphicsGroup({
            members: [
                { graphic: this.bg, offset: new Vector(-140, -30) },
                { graphic: textGraphic, offset: new Vector(0, 0), useBounds: false }
            ]
        })
        this.graphics.use(group)
        
        this.pointer.useGraphicsBounds = true

        this.on("pointerenter", () => {
            this.scale = new Vector(1.05, 1.05)
            this.bg.color = Color.fromHex("#FF2A70")
            document.body.style.cursor = "pointer"
        })
        
        this.on("pointerleave", () => {
            this.scale = new Vector(1, 1)
            this.bg.color = Color.fromHex("#FF0055")
            document.body.style.cursor = "default"
        })
        
        this.on("pointerdown", () => {
            this.scale = new Vector(0.95, 0.95)
            this.bg.color = Color.fromHex("#D60047")
        })

        this.on("pointerup", () => {
            this.scale = new Vector(1.05, 1.05)
            if (this.action) this.action()
        })
    }
}
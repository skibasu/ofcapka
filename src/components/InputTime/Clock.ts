import { Config } from "./Clock.types"

/**
 * Class representing a clock
 */
export class ClockMinutes {
    /**
     * The canvas rendering context
     */
    private ctx: CanvasRenderingContext2D | null = null

    /**
     * The configuration object
     */
    public config: Config

    /**
     * The canvas element
     */
    private canvas: HTMLCanvasElement
    private callback: (args: { h: number; m: number }) => void

    private hourPositions: { hour: number; x: number; y: number }[] = []
    private _currentBoardType: "hours" | "minutes" = "hours"
    private _switch: boolean = false
    private _angle: number = -90 // Angle of the clock hand
    private _minutes: number = 0
    private _hours: number = 0
    private _hoveredTime: number | null = null
    private _selectedTime: number | null = 0
    private dragging: boolean = false // Is the user dragging the clock hand?

    /**
     * Creates a new instance of the Clock class
     * @param config The configuration object
     * @param canvas The canvas element
     */
    constructor(
        config: Config,
        canvas: HTMLCanvasElement,

        callback: (args: { h: number; m: number }) => void
    ) {
        this.config = config
        this.canvas = canvas
        this.callback = callback

        canvas.width = config.root.width
        canvas.height = config.root.height

        if (!canvas) return

        const context = canvas.getContext("2d")

        this.ctx = context
        if (!context) return

        this.init()
        this.setCurrentTime()
        this.addMouseEvents()
    }

    /**
     * Draw the hand arrow (triangle) representing the clock's hand
     */
    private drawHandArrow() {
        const ctx = this.ctx
        const config = this.config
        const angle = this._angle

        if (!ctx) return

        const adjustedRadius =
            config.board.radius - config.houerHand.arrow.width - 40
        const angleInRadians = angle * (Math.PI / 180) // Convert angle to radians

        // Calculate the end of the hand on the circle's perimeter
        const lineEndX =
            config.houerHand.line.x + adjustedRadius * Math.cos(angleInRadians)
        const lineEndY =
            config.houerHand.line.y + adjustedRadius * Math.sin(angleInRadians)

        ctx.beginPath()

        // Arrow tip calculation relative to the angle
        ctx.moveTo(
            lineEndX +
                (this.config.houerHand.arrow.width / 2) *
                    Math.cos(angleInRadians - Math.PI / 2),
            lineEndY +
                (this.config.houerHand.arrow.width / 2) *
                    Math.sin(angleInRadians - Math.PI / 2)
        ) // Left side of the arrow

        ctx.lineTo(
            lineEndX +
                this.config.houerHand.arrow.height * Math.cos(angleInRadians),
            lineEndY +
                this.config.houerHand.arrow.height * Math.sin(angleInRadians)
        ) // Tip of the arrow

        ctx.lineTo(
            lineEndX +
                (this.config.houerHand.arrow.width / 2) *
                    Math.cos(angleInRadians + Math.PI / 2),
            lineEndY +
                (this.config.houerHand.arrow.width / 2) *
                    Math.sin(angleInRadians + Math.PI / 2)
        ) // Right side of the arrow

        ctx.closePath()
        ctx.strokeStyle = "white"
        ctx.stroke()
        ctx.fillStyle = "white"
        ctx.fill()
    }

    /**
     * Draw the clock hand line
     */
    private drawLine() {
        const ctx = this.ctx
        const config = this.config
        const angle = this._angle
        if (!ctx) return

        const adjustedRadius =
            config.board.radius - config.houerHand.arrow.width - 40
        const angleInRadians = angle * (Math.PI / 180) // Convert angle to radians

        const lineEndX =
            config.houerHand.line.x + adjustedRadius * Math.cos(angleInRadians)
        const lineEndY =
            config.houerHand.line.y + adjustedRadius * Math.sin(angleInRadians)

        ctx.beginPath()
        ctx.moveTo(config.houerHand.line.x, config.houerHand.line.y) // Start of the hand line in the center
        ctx.lineTo(lineEndX, lineEndY) // End of the hand line
        ctx.strokeStyle = "white"
        ctx.lineWidth = config.houerHand.line.width
        ctx.stroke()
    }

    /**
     * Draw the hours on the clock face
     */
    private drawHours() {
        const ctx = this.ctx
        const config = this.config

        if (!ctx) return

        config.hour.elements.forEach((hour, index) => {
            let bgr = "grey"
            if (index === this.hoveredTime) {
                bgr = "pink"
            } else if (index === this.selectedTime) {
                bgr = "red"
            }

            const angleForHour = (index * 30 - 90) * (Math.PI / 180) // Convert hour angle with -90 degree offset
            const hourX =
                config.hour.x +
                (config.board.radius - config.hour.offsetTop) *
                    Math.cos(angleForHour)
            const hourY =
                config.hour.y +
                (config.board.radius - config.hour.offsetTop) *
                    Math.sin(angleForHour)

            ctx.beginPath()
            ctx.globalAlpha = 0.5

            ctx.arc(hourX, hourY, config.hour.radius, 0, 2 * Math.PI)
            ctx.fillStyle = bgr
            ctx.fill()
            ctx.globalAlpha = 1

            this.hourPositions.push({ hour, x: hourX, y: hourY })
            ctx.font = "16px Arial"
            ctx.fillStyle = "white"
            ctx.textAlign = "center"
            ctx.textBaseline = "middle"
            ctx.fillText(
                this.currentBoardType === "hours"
                    ? hour.toString()
                    : (hour === 12 ? 0 : hour * 5).toString(),
                hourX,
                hourY
            )
        })
    }

    /**
     * Draw the center circle of the clock
     */
    private drawCenterCircle() {
        const ctx = this.ctx
        const config = this.config
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(
            config.centerCircle.x,
            config.centerCircle.y,
            config.centerCircle.radius,
            config.centerCircle.startAngle,
            2 * Math.PI
        )
        ctx.fillStyle = config.centerCircle.backgroundColor
        ctx.fill()
    }

    /**
     * Draw the board circle
     */
    private drawBoardCircle() {
        const ctx = this.ctx
        const config = this.config
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(
            config.board.x,
            config.board.y,
            config.board.radius,
            config.board.startAngle,
            2 * Math.PI
        )
        ctx.fillStyle = config.board.backgroundColor
        ctx.strokeStyle = config.board.border
        ctx.lineWidth = config.board.borderwidth
        ctx.fill()
        ctx.stroke()
    }

    /**
     * Clear the canvas context
     */
    private clearContext() {
        if (!this.ctx) return
        this.ctx.clearRect(
            0,
            0,
            this.config.root.width,
            this.config.root.height
        )
    }

    /**
     * Getters and setters
     */

    public get angle(): number {
        return this._angle
    }

    public set angle(value: number) {
        if (this._angle !== value) {
            this._angle = value
            this.update()
        }
    }

    public get minutes(): number {
        return this._minutes
    }

    public set minutes(min: number) {
        if (this._minutes !== min) {
            this._minutes = min
            this.callback({ h: this.hours, m: min })
        }
    }

    public get hours(): number {
        return this._hours
    }

    public set hours(h: number) {
        if (this._hours !== h) {
            this._hours = h
            this.callback({ h, m: this._minutes })
            // this.switchBoard()
        }
    }

    public get currentBoardType(): "hours" | "minutes" {
        return this._currentBoardType
    }
    public set currentBoardType(type: "hours" | "minutes") {
        if (this._currentBoardType !== type) {
            this._currentBoardType = type
        }
    }
    public get hoveredTime(): number | null {
        return this._hoveredTime
    }
    public set hoveredTime(time: number | null) {
        if (this._hoveredTime !== time) {
            this._hoveredTime = time
            this.update()
        }
    }

    public get selectedTime(): number | null {
        return this._selectedTime
    }
    public set selectedTime(time: number | null) {
        if (this._selectedTime !== time) {
            this._selectedTime = time
            this.update()
        }
    }

    private set switch(value: boolean) {
        this._switch = value
        value && this.switchBoard()
    }
    public get switch(): boolean {
        return this._switch
    }
    private switchBoard() {
        if (this.currentBoardType === "hours") {
            this.currentBoardType = "minutes"
            this.angle = this._minutes * 6 - 90
        } else if (this.currentBoardType === "minutes") {
            this.currentBoardType = "hours"
        }
        this.update()
    }
    private getCurrentTime() {
        const date = new Date()
        let hours = date.getHours()
        const minutes = date.getMinutes()

        // Ustal format AM/PM i przekształć godzinę na format 12-godzinny
        //const ampm = hours >= 12 ? "PM" : "AM"
        hours = hours % 12
        hours = hours ? hours : 12 // Zamień godzinę 0 na 12

        // Dodaj zero przed minutami, jeśli są mniejsze niż 10

        return { h: hours, m: minutes }
    }
    public setClock(h: number, m: number) {
        this.hours = h
        this.minutes = m
        this.selectedTime = h === 12 ? 0 : h
        this.angle = (h === 12 ? 0 : h * 30) - 90
    }
    private setCurrentTime() {
        const { h, m } = this.getCurrentTime()
        this.setClock(h, m)
    }

    /**
     * Mouse event handlers
     */

    private onMouseDown(e: MouseEvent) {
        const mousePos = this.getMousePos(e)

        for (let i = 0; i < this.hourPositions.length; i++) {
            const hourPosition = this.hourPositions[i]
            const distanceFromHour = Math.sqrt(
                Math.pow(mousePos.x - hourPosition.x, 2) +
                    Math.pow(mousePos.y - hourPosition.y, 2)
            )

            // If click is within the radius of an hour (consider 15px as tolerance)
            if (distanceFromHour <= 15) {
                this.angle = i * 30 - 90
                this.selectedTime = i
                this.hoveredTime = null

                if (this.currentBoardType === "hours") {
                    this.hours = i === 0 ? 12 : i
                } else {
                    this.minutes = Math.floor(
                        (this.angle + 90) / 6 > 60
                            ? (this.angle + 90) / 6 - 60
                            : (this.angle + 90) / 6
                    )
                }
                //this.switchBoard()
                this.switch = true
                console.log("Current time : ", this.hours, " : ", this._minutes)
                return // Exit the loop once the hour is set
            }
        }

        const adjustedRadius =
            this.config.board.radius - this.config.houerHand.arrow.width - 40
        const angleInRadians = this._angle * (Math.PI / 180)
        const lineEndX =
            this.config.houerHand.line.x +
            adjustedRadius * Math.cos(angleInRadians)
        const lineEndY =
            this.config.houerHand.line.y +
            adjustedRadius * Math.sin(angleInRadians)

        const arrowWidth = this.config.houerHand.arrow.width
        const arrowHeight = this.config.houerHand.arrow.height

        const point1 = {
            x:
                lineEndX +
                (arrowWidth / 2) * Math.cos(angleInRadians - Math.PI / 2),
            y:
                lineEndY +
                (arrowWidth / 2) * Math.sin(angleInRadians - Math.PI / 2),
        }
        const point2 = {
            x: lineEndX + arrowHeight * Math.cos(angleInRadians),
            y: lineEndY + arrowHeight * Math.sin(angleInRadians),
        }
        const point3 = {
            x:
                lineEndX +
                (arrowWidth / 2) * Math.cos(angleInRadians + Math.PI / 2),
            y:
                lineEndY +
                (arrowWidth / 2) * Math.sin(angleInRadians + Math.PI / 2),
        }

        if (this.isPointInTriangle(mousePos, point1, point2, point3)) {
            this.dragging = true
        }
    }

    private onMouseUp() {
        this.dragging = false

        // Calculate the closest hour based on the current angle
        let normalizedAngle = (this.angle + 90) % 360 // Normalize angle (90 degrees offset for 12 o'clock)
        let hourIndex = Math.floor(normalizedAngle / 30) // Each hour represents 30 degrees
        if (hourIndex === 12) {
            hourIndex = 0 // Reset 12 o'clock to index 0
        }

        this.selectedTime = hourIndex

        //this.update()
    }

    private onMouseMove(e: MouseEvent) {
        // Check if the mouse is hovering over any hour
        const mousePos = this.getMousePos(e)
        this.hoveredTime = null
        for (let i = 0; i < this.hourPositions.length; i++) {
            const hourPosition = this.hourPositions[i]
            const distanceFromHour = Math.sqrt(
                Math.pow(mousePos.x - hourPosition.x, 2) +
                    Math.pow(mousePos.y - hourPosition.y, 2)
            )

            // If hovering over the hour (considering 15px tolerance)
            if (distanceFromHour <= 15) {
                if (this.selectedTime !== i) {
                    this.hoveredTime = i
                    break // Exit loop when we find the hovered hour
                }
            }
        }
        // Check if the clock hand is covering any hour only for minutes
        if (this._currentBoardType === "hours") return
        if (!this.dragging) return

        if (this.dragging) {
            this.selectedTime = null
            const angleInRadians = Math.atan2(
                mousePos.y - this.config.houerHand.line.y,
                mousePos.x - this.config.houerHand.line.x
            )

            const angleInDegrees = this.angleWithDegrees(angleInRadians)

            this.angle = angleInDegrees

            this.minutes = this.angleToMinutes(angleInDegrees)
            this.hoveredTime = Math.floor(this.minutes / 5)
        }
    }

    /**
     * Utility methods
     */
    /**
     * Check if the clock hand is hovering over any hour
     */
    private angleToMinutes(angleInDegrees: number) {
        return Math.floor(
            (angleInDegrees + 90) / 6 >= 60
                ? (angleInDegrees + 90) / 6 - 60
                : (angleInDegrees + 90) / 6
        )
    }

    private angleWithDegrees(radians: number) {
        let angleInDegrees = radians * (180 / Math.PI)
        if (angleInDegrees < 0) {
            angleInDegrees = 360 + angleInDegrees
        }
        angleInDegrees = angleInDegrees % 360
        return angleInDegrees
    }
    private isPointInTriangle(
        p: { x: number; y: number },
        p0: { x: number; y: number },
        p1: { x: number; y: number },
        p2: { x: number; y: number }
    ): boolean {
        const area =
            (p1.y - p0.y) * (p2.x - p0.x) - (p1.x - p0.x) * (p2.y - p0.y)
        const s =
            ((p1.y - p0.y) * (p.x - p0.x) - (p1.x - p0.x) * (p.y - p0.y)) / area
        const t =
            ((p0.y - p2.y) * (p.x - p0.x) - (p0.x - p2.x) * (p.y - p0.y)) / area
        const u = 1 - s - t
        return s >= 0 && t >= 0 && u >= 0
    }

    private getMousePos(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect()
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
    }

    private addMouseEvents() {
        this.canvas.addEventListener("mousedown", (e) => this.onMouseDown(e))
        this.canvas.addEventListener("mousemove", (e) => this.onMouseMove(e))
        this.canvas.addEventListener("mouseup", () => this.onMouseUp())
    }

    /**
     * Initialize the clock components
     */
    private init() {
        this.drawBoardCircle()
        this.drawCenterCircle()
        this.drawHours()
        this.drawLine()
        this.drawHandArrow()
    }

    /**
     * Update and re-render the clock
     */
    private update() {
        this.clearContext()
        this.init()
    }
}

import { Ampm, Config, TimeValues } from "./Clock.types"

/**
 * Class representing a clock
 */
export class ClockMinutes {
    /** Consts */
    private fullCirce: number = 2 * Math.PI
    /**
     * The canvas rendering context
     */
    private ctx: CanvasRenderingContext2D | null = null

    /**
     * The configuration object
     */
    private config: Config

    /**
     * The canvas element
     */
    private canvas: HTMLCanvasElement
    private callback: (args: TimeValues) => void

    private adjustedRadius: number = 0
    private dragging: boolean = false // Is the user dragging the clock hand?
    private hourPositions: { hour: number; x: number; y: number }[] = []

    private _currentBoardType: "hours" | "minutes" = "hours"
    private _switch: boolean = false

    private _angle: number = 0

    private _minutes: number = 0
    private _hours: number = 0
    private _ampm: Ampm = "AM"

    private _hoveredTime: number | null = null
    private _selectedTime: number | null = 0

    /**
     * Creates a new instance of the Clock class
     * @param config The configuration object
     * @param canvas The canvas element
     */
    constructor(
        config: Config,
        canvas: HTMLCanvasElement,

        callback: (args: TimeValues) => void
    ) {
        this.config = config
        this.canvas = canvas

        this.adjustedRadius =
            this.config.board.radius -
            this.config.houerHand.arrow.height -
            this.config.hour.offsetTop -
            this.config.houerHand.line.offsetTop
        this._angle = this.config.angleOffset
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
     * Draw the board circle
     */
    private drawBoardCircle() {
        const ctx = this.ctx
        const config = this.config
        const full = this.fullCirce
        if (!ctx) return

        ctx.beginPath()
        ctx.arc(
            config.board.x,
            config.board.y,
            config.board.radius,
            config.board.startAngle,
            full
        )
        ctx.fillStyle = config.board.backgroundColor
        ctx.strokeStyle = config.board.border
        ctx.lineWidth = config.board.borderwidth
        ctx.fill()
        ctx.stroke()
    }

    /**
     * Draw the center circle of the clock
     */
    private drawCenterCircle() {
        const ctx = this.ctx
        const config = this.config
        const full = this.fullCirce
        if (!ctx) return

        ctx.beginPath()
        ctx.arc(
            config.centerCircle.x,
            config.centerCircle.y,
            config.centerCircle.radius,
            config.centerCircle.startAngle,
            full
        )
        ctx.fillStyle = config.centerCircle.backgroundColor
        ctx.fill()
    }

    /**
     * Draw the clock hand line
     */
    private drawLine() {
        const ctx = this.ctx
        const config = this.config

        if (!ctx) return

        const [lineEndX, lineEndY] = this.getHandLineEnds()

        if (!lineEndX || !lineEndY) return

        ctx.beginPath()
        ctx.moveTo(config.houerHand.line.x, config.houerHand.line.y)
        ctx.lineTo(lineEndX, lineEndY)
        ctx.strokeStyle = config.houerHand.line.backgroundColor
        ctx.lineWidth = config.houerHand.line.width
        ctx.stroke()
    }

    /**
     * Draw the hand arrow (triangle) representing the clock's hand
     */
    private drawHandArrow() {
        const ctx = this.ctx
        const config = this.config
        const angle = this.angle
        if (!ctx) return

        const [lineEndX, lineEndY] = this.getHandLineEnds()

        if (!lineEndX || !lineEndY) return

        ctx.beginPath()

        ctx.moveTo(
            lineEndX +
                (config.houerHand.arrow.width / 2) *
                    Math.cos(this.degreeToRadians(angle + config.angleOffset)),
            lineEndY +
                (config.houerHand.arrow.width / 2) *
                    Math.sin(this.degreeToRadians(angle + config.angleOffset))
        )

        ctx.lineTo(
            lineEndX +
                config.houerHand.arrow.height *
                    Math.cos(this.degreeToRadians(angle)),
            lineEndY +
                config.houerHand.arrow.height *
                    Math.sin(this.degreeToRadians(angle))
        )

        ctx.lineTo(
            lineEndX +
                (config.houerHand.arrow.width / 2) *
                    Math.cos(this.degreeToRadians(angle - config.angleOffset)),
            lineEndY +
                (config.houerHand.arrow.width / 2) *
                    Math.sin(this.degreeToRadians(angle - config.angleOffset))
        )
        ctx.closePath()
        ctx.strokeStyle = config.houerHand.arrow.border
        ctx.stroke()
        ctx.fillStyle = config.houerHand.arrow.backgroundColor
        ctx.fill()
    }
    /**
     * Draw the hours on the clock face
     */
    private drawHours() {
        const ctx = this.ctx
        const config = this.config

        if (!ctx) return

        config.hour.elements.forEach((hour, index) => {
            const angle = this.degreeToRadians(index * 30 + config.angleOffset)
            const backgroundColor = this.generateActiveHourColor(index)

            const hourX =
                config.hour.x +
                (config.board.radius - config.hour.offsetTop) * Math.cos(angle)
            const hourY =
                config.hour.y +
                (config.board.radius - config.hour.offsetTop) * Math.sin(angle)

            ctx.beginPath()

            ctx.globalAlpha = 0.5
            ctx.arc(hourX, hourY, config.hour.radius, 0, 2 * Math.PI)
            ctx.fillStyle = backgroundColor
            ctx.fill()
            ctx.globalAlpha = 1

            this.hourPositions.push({ hour, x: hourX, y: hourY })

            ctx.font = config.hour.font
            ctx.fillStyle = config.hour.color
            ctx.textAlign = config.hour.textAlign
            ctx.textBaseline = config.hour.textBaseline

            ctx.fillText(this.generateTimeText(hour) as string, hourX, hourY)
        })
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
            this.selectedTime =
                this.degreeToHours(this.angle) === 12
                    ? 0
                    : this.degreeToHours(this.angle)
            this.hoveredTime = null

            if (this.currentBoardType === "hours") {
                this.hours = this.degreeToHours(this.angle)
            } else {
                this.minutes = this.degreeToMinutes(this.angle)
            }
            if (this.switch) {
                if (this.currentBoardType === "hours") {
                    this.switchBoard()
                    this._angle = this.config.angleOffset
                    this.minutes = this.degreeToMinutes(this.angle)
                    this.selectedTime =
                        this.degreeToHours(this.angle) === 12
                            ? 0
                            : this.degreeToHours(this.angle)
                }
            }
            this.update()
        }
    }

    public get minutes(): number {
        return this._minutes
    }

    public set minutes(min: number) {
        if (this._minutes !== min) {
            this._minutes = min
            this.callback({ h: this.hours, m: min, ampm: this.ampm })
        }
    }

    public get hours(): number {
        return this._hours
    }

    public set hours(h: number) {
        if (this._hours !== h) {
            this._hours = h
            this.callback({ h, m: this.minutes, ampm: this.ampm })
        }
    }
    public get ampm(): Ampm {
        return this._ampm
    }

    public set ampm(value: Ampm) {
        if (this._ampm !== value) {
            this._ampm = value
            this.callback({ h: this.hours, m: this.minutes, ampm: value })
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
        }
    }

    private set switch(value: boolean) {
        this._switch = value
    }
    public get switch(): boolean {
        return this._switch
    }

    private getHandLineEnds(): [number, number] {
        const lineEndX =
            this.config.houerHand.line.x +
            this.adjustedRadius * Math.cos(this.degreeToRadians(this.angle))
        const lineEndY =
            this.config.houerHand.line.y +
            this.adjustedRadius * Math.sin(this.degreeToRadians(this.angle))
        return [lineEndX, lineEndY]
    }

    private switchBoard() {
        this.hoveredTime = null
        if (this.currentBoardType === "hours") {
            this.currentBoardType = "minutes"
        } else if (this.currentBoardType === "minutes") {
            this.currentBoardType = "hours"
        }
    }
    private getCurrentTime(): TimeValues {
        const date = new Date()
        let hours = date.getHours()
        const minutes = date.getMinutes()

        const ampm = hours >= 12 ? "PM" : "AM"
        console.log("Current time : ", hours, minutes, ampm)
        hours = hours % 12
        hours = hours ? hours : 12

        return { h: hours, m: minutes, ampm }
    }
    private setClock(time: TimeValues) {
        const { h, m, ampm } = time

        this.hours = h
        this.minutes = m
        this.ampm = ampm
        this.selectedTime = h === 12 ? 0 : h
        this.angle = (h === 12 ? 0 : h * 30) + this.config.angleOffset
    }
    private setCurrentTime() {
        const time = this.getCurrentTime()
        this.setClock(time)
    }
    private generateTimeText(hour: number): string | undefined {
        if (this.currentBoardType === "hours") {
            return hour.toString()
        } else if (this.currentBoardType === "minutes") {
            return (hour === 12 ? 0 : hour * 5).toString().length === 1
                ? `0${hour === 12 ? 0 : hour * 5}`
                : `${hour === 12 ? 0 : hour * 5}`
        }
    }

    private generateActiveHourColor(index: number): string {
        const config = this.config
        let backgroundColor = config.board.backgroundColor
        if (index === this.hoveredTime) {
            backgroundColor = config.hour.hoverColor
        } else if (index === this.selectedTime) {
            backgroundColor = config.hour.activeColor
        }
        return backgroundColor
    }
    /**
     * Mouse event handlers
     */

    private onMouseDown(e: MouseEvent) {
        this.switch = false
        const mousePos = this.getMousePos(e)
        const config = this.config

        for (let i = 0; i < this.hourPositions.length; i++) {
            const hourPosition = this.hourPositions[i]
            const distanceFromHour = Math.sqrt(
                Math.pow(mousePos.x - hourPosition.x, 2) +
                    Math.pow(mousePos.y - hourPosition.y, 2)
            )

            if (distanceFromHour <= 15) {
                this.switch = true
                this.angle = i * 30 + config.angleOffset

                return
            }
        }

        const [lineEndX, lineEndY] = this.getHandLineEnds()

        const arrowWidth = config.houerHand.arrow.width
        const arrowHeight = config.houerHand.arrow.height

        const point1 = {
            x:
                lineEndX +
                (arrowWidth / 2) *
                    Math.cos(
                        this.degreeToRadians(this.angle + config.angleOffset)
                    ),
            y:
                lineEndY +
                (arrowWidth / 2) *
                    Math.sin(
                        this.degreeToRadians(this.angle + config.angleOffset)
                    ),
        }
        const point2 = {
            x:
                lineEndX +
                arrowHeight * Math.cos(this.degreeToRadians(this.angle)),
            y:
                lineEndY +
                arrowHeight * Math.sin(this.degreeToRadians(this.angle)),
        }
        const point3 = {
            x:
                lineEndX +
                (arrowWidth / 2) *
                    Math.cos(
                        this.degreeToRadians(this.angle - config.angleOffset)
                    ),
            y:
                lineEndY +
                (arrowWidth / 2) *
                    Math.sin(
                        this.degreeToRadians(this.angle - config.angleOffset)
                    ),
        }

        if (this.isArrowHovered(mousePos, point1, point2, point3)) {
            this.dragging = true
        }
    }

    private onMouseUp() {
        if (this.dragging && this.currentBoardType === "minutes") {
            this.switch = true
        }
        this.dragging = false

        //this.selectedTime = this.degreeToHours(this.angle)
    }

    private onMouseMove(e: MouseEvent) {
        const mousePos = this.getMousePos(e)
        const config = this.config
        this.hoveredTime = null

        for (let i = 0; i < this.hourPositions.length; i++) {
            const hourPosition = this.hourPositions[i]
            const distanceFromHour = Math.sqrt(
                Math.pow(mousePos.x - hourPosition.x, 2) +
                    Math.pow(mousePos.y - hourPosition.y, 2)
            )

            if (distanceFromHour <= 15) {
                if (this.selectedTime !== i) {
                    this.hoveredTime = i
                    break
                }
            }
        }

        if (this._currentBoardType === "minutes") {
            if (!this.dragging) return

            this.selectedTime = null
            const angleInRadians = Math.atan2(
                mousePos.y - config.houerHand.line.y,
                mousePos.x - config.houerHand.line.x
            )

            const angleInDegrees = this.radiansToDegree(angleInRadians)

            this.angle = angleInDegrees

            // this.minutes = this.degreeToMinutes(angleInDegrees)
            this.hoveredTime = Math.floor(this.minutes / 5)
        }
    }

    /**
     * Utility methods
     */

    private degreeToRadians(angleInDegrees: number): number {
        return angleInDegrees * (Math.PI / 180)
    }

    private radiansToDegree(radians: number): number {
        let degrees = radians * (180 / Math.PI)
        if (degrees < 0) {
            degrees = 360 + degrees
        }
        degrees = degrees % 360
        return degrees
    }

    private degreeToMinutes(angleInDegrees: number) {
        const config = this.config
        return Math.floor(
            (angleInDegrees - config.angleOffset) / 6 >= 60
                ? (angleInDegrees - config.angleOffset) / 6 - 60
                : (angleInDegrees - config.angleOffset) / 6
        )
    }

    private degreeToHours(angleInDegrees: number) {
        let normalizedAngle = (this.angle - this.config.angleOffset) % 360 // Normalize angle (90 degrees offset for 12 o'clock)
        let hourIndex = Math.floor(normalizedAngle / 30)
        return hourIndex === 12 ? 0 : hourIndex
    }
    private isArrowHovered(
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

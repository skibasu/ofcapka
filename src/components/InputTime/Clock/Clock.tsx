import {
    Ampm,
    ArrowPositions,
    BoardType,
    Config,
    TimeValues,
} from "./Clock.types"
import { config as defaultConfig } from "./config"

/**
 * Class representing a clock
 */
export class Clock {
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
    private dragging: boolean = false
    private hourPositions: { hour: number; x: number; y: number }[] = []

    private _arrowPosition: ArrowPositions = {} as ArrowPositions
    private _cursorPosition: { x: number; y: number; radius: number } = {
        x: 0,
        y: 0,
        radius: 0,
    }

    private _currentBoardType: "hours" | "minutes" = "hours"

    private _angle: number = 0

    private _minutes: number = 0
    private _hours: number = 0
    private _ampm: Ampm = "AM"

    private _hoveredTime: number | null = null
    private _selectedTime: number | null = 0
    private _isSliderHovered: boolean = false

    private _isDelay: boolean = false

    /**
     * Creates a new instance of the Clock class
     * @param config The configuration object
     * @param canvas The canvas element
     */
    constructor(
        canvas: HTMLCanvasElement,

        callback: (args: TimeValues) => void,
        config?: Config
    ) {
        this.config = config || defaultConfig
        this.canvas = canvas

        this.adjustedRadius =
            this.config.board.radius -
            this.config.houerHand.arrow.height -
            this.config.hour.offsetTop -
            this.config.houerHand.line.offsetTop
        this._angle = this.config.angleOffset
        this.callback = callback

        canvas.width = this.config.root.width
        canvas.height = this.config.root.height

        if (!canvas) return

        const context = canvas.getContext("2d")

        this.ctx = context
        if (!context) return

        this.init()
        this.setCurrentTime()
        this.addMouseEvents()
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
     * Draw slider arrow
     */
    private drawSliderArrow() {
        const ctx = this.ctx
        const config = this.config

        if (!ctx || this.currentBoardType === "minutes") return
        const { point1, point2, point3 } = this.createSliderArrowPoints()
        ctx.beginPath()
        ctx.moveTo(point1.x, point1.y)

        ctx.lineTo(point2.x, point2.y)

        ctx.lineTo(point3.x, point3.y)
        ctx.closePath()
        ctx.strokeStyle = config.sliderArrow.backgroundColor
        ctx.stroke()
        ctx.fillStyle = this.isSliderHovered
            ? config.sliderArrow.hoverColor
            : config.sliderArrow.backgroundColor
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
        const points = this.getArrowPositions()
        ctx.beginPath()
        ctx.moveTo(points.point1.x, points.point1.y)

        ctx.lineTo(points.point2.x, points.point2.y)

        ctx.lineTo(points.point3.x, points.point3.y)
        ctx.closePath()
        ctx.strokeStyle = config.houerHand.arrow.border
        ctx.stroke()
        ctx.fillStyle = config.houerHand.arrow.backgroundColor
        ctx.fill()
        this.arrowPosition = points

        const circleCenterX =
            lineEndX +
            (config.houerHand.arrow.height + 17) *
                Math.cos(this.degreeToRadians(angle))
        const circleCenterY =
            lineEndY +
            (config.houerHand.arrow.height + 17) *
                Math.sin(this.degreeToRadians(angle))

        if (this.selectedTime === null) {
            ctx.beginPath()
            ctx.arc(circleCenterX, circleCenterY, 14, 0, Math.PI * 2)

            ctx.strokeStyle = config.houerHand.cursor.borderColor
            ctx.stroke()
            this.cursorPosition = {
                x: circleCenterX,
                y: circleCenterY,
                radius: config.houerHand.cursor.radius,
            }
        }
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

            const hourX =
                config.hour.x +
                (config.board.radius - config.hour.offsetTop) * Math.cos(angle)
            const hourY =
                config.hour.y +
                (config.board.radius - config.hour.offsetTop) * Math.sin(angle)

            ctx.beginPath()

            if (this.selectedTime === index || this.hoveredTime === index) {
                ctx.arc(hourX, hourY, 14, 0, 2 * Math.PI)
                ctx.fillStyle =
                    this.selectedTime === index ? "#182af0" : "#f0f0f0"
                ctx.fill()
            }
            if (this.selectedTime === index) {
                this.cursorPosition = {
                    x: hourX,
                    y: hourY,
                    radius: config.houerHand.cursor.radius,
                }
            }
            this.hourPositions.push({ hour, x: hourX, y: hourY })

            ctx.font = config.hour.font
            ctx.fillStyle =
                this.selectedTime === index ? "white" : config.hour.color

            ctx.textAlign = config.hour.textAlign
            ctx.textBaseline = config.hour.textBaseline

            ctx.fillText(this.generateTimeText(hour) as string, hourX, hourY)
        })
    }

    /**
     * Getters and setters
     */

    private get angle(): number {
        return this._angle
    }

    private set angle(value: number) {
        this.hoveredTime = null
        this._angle = Math.floor(value)

        if (this.currentBoardType === "hours") {
            this.selectedTime =
                this.degreeToHours() === 12 ? 0 : this.degreeToHours()
            this.hours = this.degreeToHours()
        } else {
            this.minutes = this.degreeToMinutes(this.angle)
            this.selectedTime =
                this.minutes % 5 === 0
                    ? this.degreeToHours() === 12
                        ? 0
                        : this.degreeToHours()
                    : null
        }

        this.update()
    }
    private get isDelay(): boolean {
        return this._isDelay
    }

    private set isDelay(isDelay: boolean) {
        if (this._isDelay !== isDelay) {
            this._isDelay = isDelay
        }
    }
    private get minutes(): number {
        return this._minutes
    }

    private set minutes(min: number) {
        if (this._minutes !== min) {
            this._minutes = min
            this.callback({ h: this.hours, m: min, ampm: this.ampm })
        }
    }
    private get isSliderHovered(): boolean {
        return this._isSliderHovered
    }

    private set isSliderHovered(value: boolean) {
        if (this._isSliderHovered !== value) {
            this._isSliderHovered = value
            this.update()
        }
    }
    private get hours(): number {
        return this._hours
    }

    private set hours(h: number) {
        if (this._hours !== h) {
            this._hours = h
            this.callback({ h, m: this.minutes, ampm: this.ampm })
        }
    }
    private get ampm(): Ampm {
        return this._ampm
    }

    private set ampm(value: Ampm) {
        if (this._ampm !== value) {
            this._ampm = value
            this.callback({ h: this.hours, m: this.minutes, ampm: value })
        }
    }

    private get currentBoardType(): "hours" | "minutes" {
        return this._currentBoardType
    }
    private set currentBoardType(type: BoardType) {
        if (this._currentBoardType !== type) {
            this._currentBoardType = type
            this.isDelay
                ? setTimeout(() => {
                      this.angle =
                          type === "minutes"
                              ? this.minutes * 6 + this.config.angleOffset
                              : this.hours * 30 + this.config.angleOffset
                  }, 300)
                : (() => {
                      this.angle =
                          type === "minutes"
                              ? this.minutes * 6 + this.config.angleOffset
                              : this.hours * 30 + this.config.angleOffset
                  })()
        }
    }
    private get hoveredTime(): number | null {
        return this._hoveredTime
    }
    private set hoveredTime(time: number | null) {
        if (this._hoveredTime !== time) {
            this._hoveredTime = time
            this.update()
        }
    }

    private get selectedTime(): number | null {
        return this._selectedTime
    }
    private set selectedTime(time: number | null) {
        if (this._selectedTime !== time) {
            this._selectedTime = time
        }
    }

    private get arrowPosition(): ArrowPositions {
        return this._arrowPosition
    }

    private set arrowPosition(value: ArrowPositions) {
        this._arrowPosition = value
    }
    private get cursorPosition(): { x: number; y: number; radius: number } {
        return this._cursorPosition
    }

    private set cursorPosition(value: {
        x: number
        y: number
        radius: number
    }) {
        this._cursorPosition = value
    }

    /**
     * Utility methods
     */
    private getMousePos(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect()
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
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
    private getCurrentTime(): TimeValues {
        const date = new Date()
        let hours = date.getHours()
        const minutes = date.getMinutes()

        const ampm = hours >= 12 ? "PM" : "AM"
        hours = hours % 12
        hours = hours ? hours : 12

        return { h: hours, m: minutes, ampm }
    }

    private switchBoard() {
        this.hoveredTime = null
        if (this.currentBoardType === "hours") {
            this.currentBoardType = "minutes"
        } else if (this.currentBoardType === "minutes") {
            this.currentBoardType = "hours"
        }
    }

    public setClock(time: TimeValues) {
        this._isDelay = false
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

    private degreeToRadians(angleInDegrees: number): number {
        return angleInDegrees * (Math.PI / 180)
    }

    private radiansToDegree(radians: number): number {
        let degrees = radians * (180 / Math.PI)
        if (degrees < 0) {
            degrees = 360 + degrees
        }
        degrees = degrees % 360
        return Math.floor(degrees)
    }

    private degreeToMinutes(angleInDegrees: number) {
        const config = this.config
        return Math.floor(
            (angleInDegrees - config.angleOffset) / 6 >= 60
                ? (angleInDegrees - config.angleOffset) / 6 - 60
                : (angleInDegrees - config.angleOffset) / 6
        )
    }

    private degreeToHours() {
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

    private isCursorHovered(
        p: { x: number; y: number; radius: number }, // Pozycja kursora
        center: { x: number; y: number } // Środek okręgu
    ): boolean {
        const radius = p.radius

        // Oblicz odległość między punktem kursora a środkiem okręgu
        const dx = p.x - center.x
        const dy = p.y - center.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Sprawdź, czy odległość jest mniejsza lub równa promieniowi
        return distance <= radius
    }
    private getArrowPositions(): ArrowPositions {
        const [lineEndX, lineEndY] = this.getHandLineEnds()
        const config = this.config
        const angle = this.angle
        const points = {
            point1: {
                x:
                    lineEndX +
                    (config.houerHand.arrow.width / 2) *
                        Math.cos(
                            this.degreeToRadians(angle + config.angleOffset)
                        ),
                y:
                    lineEndY +
                    (config.houerHand.arrow.width / 2) *
                        Math.sin(
                            this.degreeToRadians(angle + config.angleOffset)
                        ),
            },
            point2: {
                x:
                    lineEndX +
                    config.houerHand.arrow.height *
                        Math.cos(this.degreeToRadians(angle)),
                y:
                    lineEndY +
                    config.houerHand.arrow.height *
                        Math.sin(this.degreeToRadians(angle)),
            },
            point3: {
                x:
                    lineEndX +
                    (config.houerHand.arrow.width / 2) *
                        Math.cos(
                            this.degreeToRadians(angle - config.angleOffset)
                        ),
                y:
                    lineEndY +
                    (config.houerHand.arrow.width / 2) *
                        Math.sin(
                            this.degreeToRadians(angle - config.angleOffset)
                        ),
            },
        }
        return points
    }
    private createSliderArrowPoints() {
        const config = this.config

        const points = {
            point1: {
                x: config.sliderArrow.x,

                y: config.sliderArrow.y,
            },
            point2: {
                x: config.sliderArrow.x - config.sliderArrow.width / 2,

                y: config.sliderArrow.y - config.sliderArrow.height / 2,
            },
            point3: {
                x: config.sliderArrow.x - config.sliderArrow.width / 2,
                y: config.sliderArrow.y + config.sliderArrow.height / 2,
            },
        }
        return points
    }

    /**
     * hour and Minutes events handlers
     */
    private minuteClickHandler(mousePos: { x: number; y: number }) {
        const { x, y } = mousePos
        const config = this.config

        const dx = x - config.board.x
        const dy = y - config.board.y
        const distanceFromCenter = Math.sqrt(dx * dx + dy * dy)
        const isInOuterCircle = distanceFromCenter < config.board.radius
        const isOutsideInnerCircle =
            distanceFromCenter >
            config.board.radius - config.hour.offsetTop - 15

        if (
            this.hoveredTime !== null &&
            this.isCursorHovered(
                {
                    ...this.hourPositions[this.hoveredTime],
                    radius: config.hour.radius,
                },
                mousePos
            )
        ) {
            this.cursorPosition = {
                x: this.hourPositions[this.hoveredTime].x,
                y: this.hourPositions[this.hoveredTime].y,
                radius: config.houerHand.cursor.radius,
            }
            this.angle = this.hoveredTime * 30 + config.angleOffset
        } else if (isInOuterCircle && isOutsideInnerCircle) {
            const angleRadians = Math.atan2(dy, dx)
            const angleDegrees = this.radiansToDegree(angleRadians)

            this.angle = angleDegrees
        }
    }
    private sliderClickHandler() {
        if (this.isSliderHovered) {
            return
        }
    }
    private hourClickHandler = (mousePos: { x: number; y: number }) => {
        const { x, y } = mousePos
        const config = this.config

        for (let i = 0; i < this.hourPositions.length; i++) {
            const hourPosition = this.hourPositions[i]
            const distanceFromHour = Math.sqrt(
                Math.pow(x - hourPosition.x, 2) +
                    Math.pow(y - hourPosition.y, 2)
            )

            if (distanceFromHour <= 15) {
                if (this.dragging) return

                this.angle = i * 30 + config.angleOffset

                this.switchBoard()
                return
            }
        }
    }
    /**
     * Mouse event handlers
     */

    private onMouseDown(e: MouseEvent) {
        const mousePos = this.getMousePos(e)
        const config = this.config
        this.sliderClickHandler()
        const { point1, point2, point3 } = this.getArrowPositions()

        if (
            this.isArrowHovered(
                mousePos,
                {
                    x: config.sliderArrow.x,

                    y: config.sliderArrow.y,
                },
                {
                    x: config.sliderArrow.x - config.sliderArrow.width / 2,

                    y: config.sliderArrow.y - config.sliderArrow.height / 2,
                },
                {
                    x: config.sliderArrow.x - config.sliderArrow.width / 2,
                    y: config.sliderArrow.y + config.sliderArrow.height / 2,
                }
            )
        ) {
            this.currentBoardType = "minutes"
        }
        if (
            this.isArrowHovered(mousePos, point1, point2, point3) ||
            this.isCursorHovered(this.cursorPosition, mousePos) ||
            (this.selectedTime !== null &&
                this.isCursorHovered(
                    {
                        x: this.hourPositions[this.selectedTime]["x"],
                        y: this.hourPositions[this.selectedTime]["y"],
                        radius: config.hour.radius,
                    },
                    mousePos
                ))
        ) {
            this.dragging = true
        }

        if (this.currentBoardType === "minutes") {
            !this.dragging && this.minuteClickHandler(mousePos)
        } else if (this.currentBoardType === "hours") {
            !this.dragging && this.hourClickHandler(mousePos)
        }
    }

    private isCircleContained(
        circle1: { x: number; y: number; radius: number },
        circle2: { x: number; y: number; radius: number }
    ): boolean {
        const dx = circle2.x - circle1.x
        const dy = circle2.y - circle1.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        return (
            distance + Math.min(circle1.radius, circle2.radius) <=
            Math.max(circle1.radius, circle2.radius)
        )
    }

    private onMouseUp() {
        if (this.dragging) {
            if (this.currentBoardType === "hours") {
                this.switchBoard()
            }
        }

        this.dragging = false
    }

    private onMouseMove(e: MouseEvent) {
        const mousePos = this.getMousePos(e)
        const config = this.config
        this.hoveredTime = null
        this.isSliderHovered = false

        if (!this.dragging) {
            for (let i = 0; i < this.hourPositions.length; i++) {
                const hourPosition = this.hourPositions[i]
                const distanceFromHour = Math.sqrt(
                    Math.pow(mousePos.x - hourPosition.x, 2) +
                        Math.pow(mousePos.y - hourPosition.y, 2)
                )
                if (this.currentBoardType === "hours") {
                    if (distanceFromHour <= 15) {
                        if (this.selectedTime !== i) {
                            this.hoveredTime = i
                            break
                        }
                    }
                    if (
                        this.isArrowHovered(
                            mousePos,
                            {
                                x: config.sliderArrow.x,

                                y: config.sliderArrow.y,
                            },
                            {
                                x:
                                    config.sliderArrow.x -
                                    config.sliderArrow.width / 2,

                                y:
                                    config.sliderArrow.y -
                                    config.sliderArrow.height / 2,
                            },
                            {
                                x:
                                    config.sliderArrow.x -
                                    config.sliderArrow.width / 2,
                                y:
                                    config.sliderArrow.y +
                                    config.sliderArrow.height / 2,
                            }
                        )
                    ) {
                        this.isSliderHovered = true
                    }
                } else {
                    if (distanceFromHour <= 15) {
                        if (
                            !this.isCircleContained(this.cursorPosition, {
                                x: hourPosition.x,
                                y: hourPosition.y,
                                radius: 14,
                            })
                        ) {
                            this.hoveredTime = i
                        }
                        break
                    }
                }
            }
        } else {
            const angleInRadians = Math.atan2(
                mousePos.y - config.houerHand.line.y,
                mousePos.x - config.houerHand.line.x
            )

            const angleInDegrees = this.radiansToDegree(angleInRadians)
            if (this._currentBoardType === "hours") {
                if (angleInDegrees % 30 === 0) {
                    this.angle = angleInDegrees
                }
            } else {
                this.angle = angleInDegrees
            }
        }
    }
    /**
     * Initialize the events
     */
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
        this.drawSliderArrow()
    }

    /**
     * Update and re-render the clock
     */
    private update() {
        this.clearContext()
        this.init()
    }
    private destroy() {
        this.canvas.width = 0
        this.canvas.height = 0
        this.canvas.removeEventListener("mousedown", (e) => this.onMouseDown(e))
        this.canvas.removeEventListener("mousemove", (e) => this.onMouseMove(e))
        this.canvas.removeEventListener("mouseup", () => this.onMouseUp())
        this.clearContext()
    }

    public setBoard(type: BoardType) {
        this.isDelay = false
        this.currentBoardType = type
        this.isDelay = true
    }
    public setAmPm(value: Ampm) {
        this.ampm = value
    }
    public closeClock() {
        this.destroy()
    }
    public openClock(time?: TimeValues) {
        this.canvas.width = this.config.root.width
        this.canvas.height = this.config.root.height

        time ? this.setClock(time) : this.setCurrentTime()

        this.addMouseEvents()
        this.init()
    }
    public setHours(h: number) {
        this._isDelay = true
        const hour = h === 12 ? 0 : h
        if (hour === this.hours) return
        this.angle = (h === 12 ? 0 : h * 30) + this.config.angleOffset
    }
    public setMinutes(m: number) {
        this._isDelay = false
        if (m === this.minutes) return
        this.angle = m * 6 + this.config.angleOffset
    }
}

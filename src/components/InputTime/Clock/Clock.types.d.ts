export interface Config {
    angleStep: number
    angleOffset: number
    root: {
        width: number
        height: number
        backgroundColor: string
    }
    board: {
        x: number
        y: number
        backgroundColor: string
        border: string
        borderwidth: number
        radius: number
        startAngle: number
    }
    houerHand: Hand
    hour: {
        x: number
        y: number
        offsetTop: number
        elements: [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        radius: number
        activeColor: string
        hoverColor: string
        font: string
        color: string
        textAlign: CanvasTextAlign
        textBaseline: CanvasTextBaseline
    }
    centerCircle: {
        x: number
        y: number
        backgroundColor: string
        radius: number
        startAngle: number
    }
}

export interface Hand {
    arrow: {
        width: number
        height: number
        border: string
        backgroundColor: string
    }
    line: {
        x: number
        y: number
        offsetTop: number
        width: number
        backgroundColor: string
    }
}
export type Ampm = "AM" | "PM"
export interface TimeValues {
    h: number
    m: number
    ampm: Ampm
}

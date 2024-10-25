export interface Config {
    angleStep: number
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
    minuteHand: Hand
    hour: {
        x: number
        y: number
        offsetTop: number
        elements: [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        radius: number
    }
    minute: {}
    centerCircle: {
        x: number
        y: number
        backgroundColor: string
        radius: number
        startAngle: number
    }
    clockIndicator: {}
}

export interface Hand {
    arrow: {
        width: number
        height: number
    }
    line: {
        x: number
        y: number
        offsetTop: number
        width: number
    }
}

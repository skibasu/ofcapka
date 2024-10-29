import { Config } from "./Clock.types"

const width = 220
const height = 220
const padding = 10
const hours: [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] = [
    12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
]
const generateCenterPoint = (w: number, h: number) => ({ x: w / 2, y: h / 2 })

export const config: Config = {
    angleOffset: -90,
    angleStep: 30,
    root: { width, height, backgroundColor: "#fff" },
    board: {
        ...generateCenterPoint(width, height),
        backgroundColor: "gray",
        border: "#000",
        borderwidth: 1,
        radius: width / 2 - padding,
        startAngle: 0,
    },
    houerHand: {
        arrow: {
            width: 12,
            height: 20,
            backgroundColor: "#fff",
            border: "#fff",
        },
        line: {
            ...generateCenterPoint(width, height),
            offsetTop: 10,
            width: 2,
            backgroundColor: "#fff",
        },
    },
    hour: {
        ...generateCenterPoint(width, height),
        offsetTop: 22,
        elements: hours,
        radius: 16,
        activeColor: "red",
        hoverColor: "green",
        font: "16px Arial",
        color: "white",
        textAlign: "center",
        textBaseline: "middle",
    },
    centerCircle: {
        ...generateCenterPoint(width, height),
        backgroundColor: "#fff",
        radius: 5,
        startAngle: 0,
    },
}

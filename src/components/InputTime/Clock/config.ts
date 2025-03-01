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
        backgroundColor: "rgba(0,0,0,0.085)",
        border: "#000",
        borderwidth: 1,
        radius: width / 2 - padding,
        startAngle: 0,
    },
    houerHand: {
        cursor: {
            borderColor: "#182af0",
            radius: 14,
        },
        arrow: {
            width: 12,
            height: 20,
            backgroundColor: "black",
            border: "black",
        },
        line: {
            ...generateCenterPoint(width, height),
            offsetTop: 17,
            width: 2,
            backgroundColor: "black",
        },
    },
    hour: {
        ...generateCenterPoint(width, height),
        offsetTop: 22,
        elements: hours,
        radius: 16,
        activeColor: "red",
        hoverColor: "rgba(255,255,255,0.35)",
        font: "16px Arial",
        color: "black",
        textAlign: "center",
        textBaseline: "middle",
    },
    centerCircle: {
        ...generateCenterPoint(width, height),
        backgroundColor: "black",
        radius: 5,
        startAngle: 0,
    },
    sliderArrow: {
        x: 210,
        y: 20,
        width: 28,
        height: 16,
        backgroundColor: "rgba(0,0,0,0.085)",
        border: "black",
        hoverColor: "#182af0",
    },
}

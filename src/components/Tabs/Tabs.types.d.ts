import { PropsWithChildren } from "react"
import { Event } from "../../data/data.types"

export interface TabsProps extends PropsWithChildren {
    labels: string[]
}
export type TabProps = Pick<
    Event,
    "artist, date, duration, location, eventName, artistImage"
>

import { TProgramEvent } from "./data.types"
import { fridayEvents } from "./fridayevents"
import { thursdayEvents } from "./thursdayEvents"

export const events = {
    thursdayEvents,
    fridayEvents,
}

export type EventKeys = keyof typeof events

export const allEvents: Record<EventKeys, TProgramEvent[]> = events

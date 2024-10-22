export interface TProgramEvent {
    id: number
    date: Date
    duration: number
    eventName: string
    artist: string | string[]
    location: string
    paid: boolean
    ticketLink?: string
    artistImage: string | null
    videoSearch?: string
}

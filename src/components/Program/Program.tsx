import React from "react"
import { TProgramEvent } from "../../data/data.types"
import ProgramEvent from "./ProgramEvent"

const Program: React.FC<{ events: TProgramEvent[] }> = ({ events }) => {
    return (
        <>
            {events.map(
                ({
                    id,
                    artistImage,
                    eventName,
                    artist,
                    date,
                    location,
                    duration,
                    paid,
                    ticketLink,
                }) => (
                    <ProgramEvent
                        key={id}
                        artistImage={artistImage}
                        eventName={eventName}
                        artist={artist}
                        date={date}
                        location={location}
                        duration={duration}
                        paid={paid}
                        ticketLink={ticketLink}
                    />
                )
            )}
        </>
    )
}

export default Program

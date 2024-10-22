import React from "react"
import { TProgramEvent } from "../../data/data.types"
import { ReactComponent as Pin } from "../../assets/svg/pin.svg"
import { ReactComponent as Tickets } from "../../assets/svg/tickets.svg"
import ProgramFavorite from "./ProgramFavorite/ProgramFavorite"
import Badge from "../Bagde/Badge"

const ProgramEvent: React.FC<
    Pick<
        TProgramEvent,
        | "artistImage"
        | "eventName"
        | "artist"
        | "date"
        | "location"
        | "paid"
        | "duration"
        | "ticketLink"
    >
> = ({
    artistImage,
    eventName,
    artist,
    date,
    location,
    paid,
    duration,
    ticketLink,
}) => {
    return (
        <div className="border border-gray-900 rounded-lg  mb-4 relative overflow-hidden ">
            <div className="absolute top-0 left-0 w-full h-full opacity-90 bg-white"></div>
            <div className="flex relative z-10 px-2 pt-9 pb-10">
                <figure className="overflow-hidden rounded-full shrink-0 grow-0 h-[110px] w-[110px] border-white border-2">
                    <img
                        src={artistImage || ""}
                        alt={"artist"}
                        className="w-full h-full object-cover"
                    />
                </figure>

                <div className="grow-1 flex flex-col pl-3 pt-1 relative text-black">
                    <h2 className="h2 mb-2">{eventName}</h2>
                    <h3 className="h3 mb-2">{artist}</h3>
                    <p className="flex items-end leading-1 mb-1 text-medium">
                        <span className="shrink-0 block mr-2">
                            <Pin width="12px" />
                        </span>
                        <span>{location}</span>
                    </p>
                    {paid && ticketLink ? (
                        <a
                            href={ticketLink}
                            className="font-bold text-medium flex mt-2"
                        >
                            <Tickets /> <span className="ml-1">Kup bilet</span>
                        </a>
                    ) : null}
                </div>
            </div>
            <div className="absolute bottom-0 right-2 z-20">
                <ProgramFavorite />
            </div>
            <div className="absolute left-0 top-0 z-20">
                <Badge date={date} duration={duration} />
            </div>
        </div>
    )
}

export default ProgramEvent

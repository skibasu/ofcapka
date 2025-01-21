import TimeInput from "../components/TimeInput/TimeInput"
import { TimeInputProvider } from "../contexts/useTimeInputContext"

const Home = () => {
    return (
        <TimeInputProvider>
            <TimeInput />
        </TimeInputProvider>
    )
}

export default Home

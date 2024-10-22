import Router from "./router"
import NavBar from "./components/NavBar"
import { ProgramListProvider } from "./contexts/use-program-context"
import { TabProvider } from "./contexts/use-tab-context"

function App() {
    return (
        <TabProvider>
            <ProgramListProvider>
                <NavBar />
                <Router />
            </ProgramListProvider>
        </TabProvider>
    )
}

export default App

import { Route, Routes } from 'react-router-dom'
import './App.css'
import StartPage from './futures/StartPage'
import RoomPage from './futures/RoomPage'

function App() {
    // const [count, setCount] = useState(0)

    return (

        <Routes>
            <Route path="/" element={<StartPage />} />
            <Route path="/room/:roomId" element={<RoomPage />} />
        </Routes>

    )
}

export default App

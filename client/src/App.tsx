import { Route, Routes } from 'react-router-dom'
import './App.css'
import StartPage from './futures/StartPage'
import RoomPage from './futures/RoomPage'
import Header from './futures/Header';
import { useEffect } from 'react';
import { useRoomStore } from './store/useRoomStore';
import RouteWatcher from './utils/RouteWatcher';

function App() {
    const theme = useRoomStore((s) => s.theme);

    useEffect(() => {
        const { theme } = useRoomStore.getState();
        document.documentElement.classList.toggle('dark', theme === 'dark');
    }, [theme])

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <Routes>
                <Route path="/" element={<StartPage />} />
                <Route path="/room/:roomId" element={<RoomPage />} />
            </Routes>
             <RouteWatcher />
        </div>
    );
}

export default App

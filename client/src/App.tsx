import { Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './common/components/Header';
import RouteWatcher from './common/utils/RouteWatcher';
import JoinPage from './features/join-page/JoinPage';
import { useApplyTheme } from './common/hooks/useApplyTheme';
import { lazy, Suspense } from 'react';

const RoomPage = lazy(() => import('./features/room-page/RoomPage'));

function App() {
    useApplyTheme()

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Header />
            <Routes>
                <Route path="/" element={<JoinPage />} />
                <Route path="/room/:roomId" element={
                    <Suspense fallback={<div className="p-4">Loading room...</div>}>
                        <RoomPage />
                    </Suspense>
                } />
                <Route path="*" element={<div className="p-4">404 — Page Not Found</div>} />
            </Routes>
            <RouteWatcher />
        </div>
    );
}

export default App

import { useLocation, useNavigate } from 'react-router-dom';
import { useRoomStore } from '../../store/useRoomStore';

const Header = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { roomId, leaveRoom} = useRoomStore();
    const isInRoom = Boolean(roomId) && location.pathname.startsWith('/room');
    const { theme, setTheme } = useRoomStore();

    const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

    const handleLeave = () => {
        leaveRoom();
        navigate('/');
    };

    return (
        <header className="w-full h-14 shadow bg-white dark:bg-gray-800 sticky top-0 z-50">
            <div className=" mx-auto h-full px-4 flex justify-between items-center">

                {isInRoom ? (
                    <button
                        onClick={handleLeave}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded-full flex items-center gap-2 font-medium transition"
                    >
                        Leave
                    </button>
                ) : (
                    <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                        Planning Poker
                    </h1>
                )}

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Theme</span>
                        <button
                            onClick={toggleTheme}
                            className="w-12 h-6 flex items-center bg-gray-300 dark:bg-gray-600 rounded-full p-1 transition-colors duration-300 focus:outline-none"
                        >
                            <div
                                className={`w-4 h-4 rounded-full bg-white dark:bg-gray-800 shadow-md transform transition-transform duration-300 ${theme === 'dark' ? 'translate-x-6' : ''
                                    }`}
                            />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/useRoomStore';

const StartPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [nameError, setNameError] = useState(false);
    const [roomIdInput, setRoomIdInput] = useState('');
    const { joinRoom, setUserName, setRoomId } = useRoomStore();

    const onNameChange = (value: string) => {
        setName(value);
        if (nameError && value.trim()) setNameError(false);
    };

    const handleJoin = () => {
        if (!name.trim()) {
            setNameError(true);
            return;
        }
        setNameError(false);

        const finalRoomId = roomIdInput.trim() || crypto.randomUUID();

        setUserName(name.trim());
        setRoomId(finalRoomId);

        joinRoom(finalRoomId, name,
            () => navigate(`/room/${finalRoomId}`),
            (err) => {
                console.log(err);
                setNameError(true)
            }
        );
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h1 className="text-xl font-semibold mb-1 text-gray-800 dark:text-white">
                    Join Room
                </h1>
                <p className="text-gray-500 dark:text-gray-300 text-sm mb-6">
                    Enter your name and a room ID or leave it empty to create one
                </p>

                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleJoin();
                    }}
                    className="space-y-4"
                >
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Your name</label>
                        <input
                            type="text"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            className={`w-full border-b py-2 bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none
                                ${nameError ? 'border-yellow-400' : 'border-gray-300 dark:border-gray-600'}
                                focus:border-blue-500`}
                        />
                        <p
                            className={`text-xs mt-1 h-4 transition-opacity duration-200 ${nameError ? 'text-yellow-500 opacity-100 visible' : 'opacity-0 invisible'
                                }`}
                        >
                            {(name.length && nameError) ? 'Name already taken, try another' : 'Required'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
                            Room ID (optional)
                        </label>
                        <input
                            type="text"
                            placeholder="Leave empty to create"
                            value={roomIdInput}
                            onChange={(e) => setRoomIdInput(e.target.value)}
                            className="w-full border-b border-gray-300 dark:border-gray-600 py-2 bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-full flex items-center justify-center gap-2 font-medium"
                    >
                        Join
                        <span className="text-lg">→</span>
                    </button>
                </form>


                {/* <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">Your name</label>
                        <input
                            type="text"
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => onNameChange(e.target.value)}
                            className={`w-full border-b py-2 bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none
                                ${nameError ? 'border-yellow-400' : 'border-gray-300 dark:border-gray-600'}
                                focus:border-blue-500`}
                        />
                        <p
                            className={`text-xs mt-1 h-4 transition-opacity duration-200 ${nameError ? 'text-yellow-500 opacity-100 visible' : 'opacity-0 invisible'
                                }`}
                        >
                            {(name.length && nameError) ? 'Name already taken, try another' : 'Required'}
                        </p>

                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 dark:text-gray-200 mb-1">
                            Room ID (optional)
                        </label>
                        <input
                            type="text"
                            placeholder="Leave empty to create"
                            value={roomIdInput}
                            onChange={(e) => setRoomIdInput(e.target.value)}
                            className="w-full border-b border-gray-300 dark:border-gray-600 py-2 bg-transparent text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <button
                        onClick={handleJoin}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-full flex items-center justify-center gap-2 font-medium"
                    >
                        Join
                        <span className="text-lg">→</span>
                    </button>
                </div> */}
            </div>
        </div>
    );
};

export default StartPage;

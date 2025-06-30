import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRoomStore } from '../store/useRoomStore';

const RoomPage = () => {
    const routeRoomId = useParams().roomId;
    const { roomId, userName, joinRoom, vote, startTimer, resetRound } = useRoomStore();
    const { timerStart, timerDuration, setTimeLeft, timeLeft, setTimerDuration } = useRoomStore();
    const { users, votes, isRevealed } = useRoomStore();
    const { setMyVote, myVote } = useRoomStore();

    useEffect(() => {
        if (routeRoomId && userName) {
            joinRoom(routeRoomId, userName);
        }
    }, [routeRoomId, userName]);

    useEffect(() => {
        if (!timerStart || !timerDuration) return;

        const interval = setInterval(() => {
            const secondsLeft = Math.max(
                0,
                Math.ceil((timerDuration * 1000 - (Date.now() - timerStart)) / 1000)
            );
            setTimeLeft(secondsLeft);
            if (secondsLeft <= 0) clearInterval(interval);
        }, 1000);

        return () => clearInterval(interval);
    }, [timerStart, timerDuration]); 

    const handleVote = (value: number) => {
        if (!isRevealed) {
            vote(value);
            setMyVote(value);
        }
    };

    const handleStartTimer = () => {
        if (timerDuration > 0 && !isRevealed && (!timeLeft || timeLeft === 0)) {
            startTimer(timerDuration);
        }
    };

    const handleReset = () => {
        resetRound();
    };

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h1 className="text-xl font-bold mb-4">Room: {roomId}</h1>
            <p className="mb-2">You are <strong>{userName}</strong></p>

            <div className="mt-4">
                <h2 className="font-semibold mb-2">👥 Participants:</h2>
                <ul className="bg-white rounded-lg border p-3 space-y-1 text-sm">
                    {users.map((u, i) => (
                        <li key={i} className={u.voted ? 'text-green-600 font-semibold' : ''}>
                            • {u.name} {u.voted && '✅'}
                        </li>
                    ))}
                </ul>
                <div className="mt-6">
                    <h2 className="font-semibold mb-2">🗳 Vote:</h2>
                    <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3, 5, 8, 13].map((value) => (
                            <button
                                key={value}
                                onClick={() => handleVote(value)}
                                disabled={isRevealed}
                                className={`px-4 py-2 rounded-lg transition text-white 
                                        ${isRevealed
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : myVote === value
                                            ? 'bg-green-600 border-2 border-white'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }
                                        `}
                            >
                                {value}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mt-6 flex items-center gap-2">
                    <input
                        type="number"
                        min={5}
                        max={300}
                        value={timerDuration}
                        onChange={(e) => setTimerDuration(Number(e.target.value))}
                        className="w-24 px-2 py-1 border rounded text-sm"
                        placeholder="Seconds"
                    />
                    <button
                        onClick={handleStartTimer}
                        disabled={isRevealed || (timeLeft !== null && timeLeft > 0)}
                        className={`px-4 py-2 rounded transition text-white ${isRevealed || (timeLeft !== null && timeLeft > 0)
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-purple-600 hover:bg-purple-700'
                            }`}
                    >
                        ⏳ Start Timer
                    </button>

                </div>

                <div className="mt-6">
                    <h2 className="font-semibold mb-2">🧾 Votes:</h2>
                    <ul className="bg-gray-100 p-3 rounded text-sm space-y-1">
                        {votes.map((v, i) => (
                            <li key={i}>
                                <strong>{v.userName}</strong>: {v.value}
                            </li>
                        ))}
                    </ul>
                    <button
                        onClick={handleReset}
                        className="mt-6 px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition"
                    >
                        🔄 New Round
                    </button>

                </div>
                {timeLeft !== null && timeLeft > 0 && (
                    <div className="mt-4 text-center text-lg font-semibold text-red-600">
                        Time left: {timeLeft}s
                    </div>
                )}
            </div>
        </div>
    );
};

export default RoomPage;

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRoomStore } from '../store/useRoomStore';

const RoomPage = () => {
    const { roomId } = useParams();
    const userName = useRoomStore((state) => state.userName);
    const { myVote, setMyVote } = useRoomStore((state) => ({
        myVote: state.myVote,
        setMyVote: state.setMyVote,
    }));

    const [users, setUsers] = useState<{ name: string; voted: boolean }[]>([]);
    const [votes, setVotes] = useState<{ userName: string; value: number }[]>([]);
    const [isRevealed, setIsRevealed] = useState(false);
    const [timerStart, setTimerStart] = useState<number | null>(null);
    const [timerDuration, setTimerDuration] = useState<number>(30);
    const [timeLeft, setTimeLeft] = useState<number | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!timerStart || !timerDuration) return;

        const interval = setInterval(() => {
            const secondsLeft = Math.max(0, Math.ceil((timerDuration * 1000 - (Date.now() - timerStart)) / 1000));
            setTimeLeft(secondsLeft);
            if (secondsLeft <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timerStart, timerDuration]);


    useEffect(() => {
        const socket = new WebSocket('ws://localhost:3001');
        socketRef.current = socket;

        socket.onopen = () => {
            socket.send(JSON.stringify({
                type: 'join',
                roomId,
                userName,
            }));
        };

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'users') {
                setUsers(data.users);
            }

            if (data.type === 'reveal') {
                setVotes(data.votes); // [{ userName, value }]
                setIsRevealed(true);
                setTimerStart(null);
                setTimeLeft(null)
            }

            if (data.type === 'reset') {
                setVotes([]); // очищаем результаты
                setIsRevealed(false);
                setTimerStart(null);
                setTimeLeft(null);
                setMyVote(undefined);
            }

            if (data.type === 'timer_started') {
                setTimerStart(data.startTime);
                setTimerDuration(data.duration); // чтобы UI знал реальное значение
                setTimeLeft(data.duration);
            }

            if (data.type === 'room_status') {
                setIsRevealed(data.isRevealed);
            }
        };

        return () => {
            socket.close();
        };
    }, [roomId, userName]);

    const handleVote = (value: number) => {
        if (isRevealed) return;

        const message = {
            type: 'vote',
            roomId,
            userName,
            value,
        };

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(message));
        }
        setMyVote(value);
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
                        onClick={() => {
                            if (timerDuration > 0 && socketRef.current?.readyState === WebSocket.OPEN) {
                                socketRef.current.send(JSON.stringify({
                                    type: 'start_timer',
                                    roomId,
                                    duration: timerDuration,
                                }));
                            }
                        }}
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
                        onClick={() => {
                            if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                                socketRef.current.send(JSON.stringify({
                                    type: 'reset',
                                    roomId,
                                }));
                            }
                        }}
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

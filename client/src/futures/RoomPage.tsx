import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRoomStore } from '../store/useRoomStore';

const RoomPage = () => {
    const { roomId } = useParams();
    const userName = useRoomStore((state) => state.userName);
    const [votedUsers, setVotedUsers] = useState<string[]>([]);
    const [participants, setParticipants] = useState<string[]>([]);
    const [votes, setVotes] = useState<{ userName: string; value: number }[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    // TODO chek what happens when new user connect to the room where everybody already voted.
    // TODO maybe create one object to collect all user properties

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

            if (data.type === 'participants') {
                setParticipants(data.participants);
            }

            // if (data.type === 'vote') {
            //     setVotes((prev) => [
            //         ...prev.filter((v) => v.userName !== data.userName),
            //         { userName: data.userName, value: data.value },
            //     ]);
            // }

            if (data.type === 'voted') {
                setVotedUsers((prev) => {
                    if (!prev.includes(data.userName)) {
                        return [...prev, data.userName];
                    }
                    return prev;
                });
            }

            if (data.type === 'reveal') {
                setVotes(data.votes); // [{ userName, value }]
            }
        };

        return () => {
            socket.close();
        };
    }, [roomId, userName]);

    const handleVote = (value: number) => {
        const message = {
            type: 'vote',
            roomId,
            userName,
            value,
        };

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(message));
        }
    };

    return (
        <div className="p-4 max-w-xl mx-auto">
            <h1 className="text-xl font-bold mb-4">Room: {roomId}</h1>
            <p className="mb-2">You are <strong>{userName}</strong></p>

            <div className="mt-4">
                <h2 className="font-semibold mb-2">👥 Participants:</h2>
                <ul className="bg-white rounded-lg border p-3 space-y-1 text-sm">
                    {participants.map((p, i) => {
                        const hasVoted = votedUsers.includes(p);
                        return (
                            <li key={i} className={hasVoted ? 'text-green-600 font-semibold' : ''}>
                                • {p} {hasVoted && '✅'}
                            </li>
                        );
                    })}
                </ul>
                <div className="mt-6">
                    <h2 className="font-semibold mb-2">🗳 Vote:</h2>
                    <div className="flex gap-2 flex-wrap">
                        {[1, 2, 3, 5, 8, 13].map((value) => (
                            <button
                                key={value}
                                onClick={() => handleVote(value)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            >
                                {value}
                            </button>
                        ))}
                    </div>
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
                </div>
            </div>
        </div>
    );
};

export default RoomPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '../store/useRoomStore';

const StartPage = () => {
  const [name, setName] = useState('');
  const [roomIdInput, setRoomIdInput] = useState('');
  const navigate = useNavigate();

  const setUserName = useRoomStore((state) => state.setUserName);
  const setRoomId = useRoomStore((state) => state.setRoomId);

  const handleJoin = () => {
    if (!name.trim()) return;

    const finalRoomId = roomIdInput.trim() || crypto.randomUUID();

    setUserName(name);
    setRoomId(finalRoomId);

    navigate(`/room/${finalRoomId}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-bold text-center mb-6">Join Room</h1>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="text"
            placeholder="Room ID (optional)"
            value={roomIdInput}
            onChange={(e) => setRoomIdInput(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleJoin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded text-sm"
          >
            Join
          </button>
        </div>
      </div>
    </div>
  );
};

export default StartPage;

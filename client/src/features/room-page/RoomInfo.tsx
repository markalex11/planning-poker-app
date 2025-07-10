import { useState } from "react";

const RoomInfo = ({ userName, roomId }: { userName: string, roomId: string }) => {
    const [copied, setCopied] = useState(false);


    const handleCopy = () => {
        navigator.clipboard.writeText(roomId);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    return (
        <div className="mb-6 px-4 py-3 rounded-xl bg-gray-100 dark:bg-white/10 text-center text-sm text-gray-800 dark:text-white shadow-sm">
            <div className="mb-1 text-gray-900 dark:text-white font-medium">
                You: <span className="font-semibold">{userName}</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
                <span className="font-medium">Room ID:</span>
                <span
                    className={`font-mono transition-all duration-300 rounded ${copied ? 'bg-green-100 text-green-700 dark:bg-green-800/30 dark:text-green-300 px-1.5 py-0.5' : ''
                        }`}
                >
                    {roomId}
                </span>
                <button
                    onClick={handleCopy}
                    className=" text-xs bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-2 py-1 rounded-xl transition text-center"
                >
                    Copy
                </button>
            </div>
        </div>
    )
}

export default RoomInfo;
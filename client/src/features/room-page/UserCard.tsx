import { useEffect, useState } from "react";
import type { User, Vote } from "src/store/useRoomStore";

type UserCardProps = {
    user: User;
    vote: Vote | undefined;
    isRevealed: boolean;
};

const UserCard = ({ user, vote, isRevealed }: UserCardProps) => {
    const [flipped, setFlipped] = useState(false);
    
    useEffect(() => {
        setFlipped(isRevealed);
    }, [isRevealed]);

    
    let highlightClass = '';
    if (!isRevealed && user.voted) {
        highlightClass = 'ring-2 ring-green-400 dark:ring-green-500';
    }

    if (isRevealed) {
        if (vote && vote.value !== null) {
            highlightClass = 'ring-2 ring-green-400 dark:ring-green-500';
        } else {
            highlightClass = 'ring-2 ring-yellow-400 dark:ring-yellow-600';
        }
    }

    return (
        <div className="flex flex-col items-center">
            <div
                className={`flip-card bg-white dark:bg-gray-800 shadow-md rounded-xl p-2
                    ${highlightClass}
                    transition
                    perspective-500
                    ${flipped ? "flipped" : ""}
                `}
                style={{ width: 80, height: 100 }}
            >
                <div className="flip-card-inner">
                    {/* Front */}
                    <div className="flip-card-front text-2xl font-semibold text-gray-700 dark:text-white">
                        🙈
                    </div>
                    {/* Back */}
                    <div className="flip-card-back text-2xl font-semibold text-gray-700 dark:text-white">
                        {vote?.value ?? <span className="text-gray-400">?</span>}
                    </div>
                </div>
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-300 mt-2 w-full max-w-[72px] 
                truncate overflow-hidden whitespace-nowrap text-ellipsistext-center">
                {user.name}
            </div>
        </div>
    )
}

export default UserCard;
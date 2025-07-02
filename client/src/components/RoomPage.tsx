import { useEffect } from 'react';
import { useRoomStore } from '../store/useRoomStore';
import RoomInfo from './RoomInfo';
import UserCard from './UserCard';
import VoteCard from './VoteCard';
import TimerControls from './TimerControls';

const RoomPage = () => {
    const { roomId, userName, users, votes, isRevealed, myVote, timerStart, timerDuration, timeLeft,
        vote, startTimer, resetRound, setTimeLeft, setTimerDuration } = useRoomStore();

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
        <div className="p-4 max-w-xl mx-auto space-y-6" >

            <RoomInfo userName={userName} roomId={roomId} />

            <div className="mb-6 px-4">
                <div className="flex flex-wrap justify-center gap-4">
                    {users.map((user) => (
                        <UserCard
                            key={user.name}
                            user={user}
                            vote={votes.find((v) => v.userName === user.name)}
                            isRevealed={isRevealed}
                        />
                    ))}
                </div>
            </div>

            <div className="fixed bottom-0 left-0 w-full bg-white/95 dark:bg-gray-900/95
                    border-t border-gray-200 dark:border-gray-700 shadow-lg z-40 py-3">
                <div className="flex w-full max-w-7xl mx-auto items-center justify-between gap-2 px-4">
                    <div className="flex-1 flex items-center">
                        <button className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white
                                px-4 py-2 rounded-full font-medium shadow transition min-w-[117px]"
                            onClick={handleReset}
                        >
                            New Round
                        </button>
                    </div>

                    <div className="flex gap-3 flex-1 justify-center">
                        {[1, 2, 3, 5, 8, 13, 15].map((value) => (
                            <VoteCard
                                key={value}
                                value={value}
                                isActive={myVote === value}
                                isDisabled={isRevealed}
                                isRevealed={isRevealed}
                                onClick={() => handleVote(value)}
                            />
                        ))}
                    </div>

                    <div className="flex-1 flex flex-col items-end gap-1 min-w-[170px]">
                        <TimerControls
                            timerDuration={timerDuration}
                            setTimerDuration={setTimerDuration}
                            handleStartTimer={handleStartTimer}
                            timeLeft={timeLeft}
                            isRevealed={isRevealed}
                        />
                    </div>
                </div>
            </div>

            {timeLeft !== null && timeLeft > 0 && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50">
                    <span className="text-2xl sm:text-3xl font-bold text-orange-300 dark:text-orange-300 bg-white/80
                     dark:bg-gray-900/80 px-6 py-3 rounded-xl shadow-md border border-orange-300 dark:border-orange-200">
                        {timeLeft}s
                    </span>
                </div>
            )}

        </div>
    );
};

export default RoomPage;

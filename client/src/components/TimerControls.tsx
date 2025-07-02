type TimerControlsProps = {
    timerDuration: number;
    setTimerDuration: (n: number) => void;
    handleStartTimer: () => void;
    timeLeft: number | null;
    isRevealed: boolean;
};

const TimerControls = ({ timerDuration, setTimerDuration, handleStartTimer, timeLeft, isRevealed }: TimerControlsProps) => (
    <div className="flex items-center gap-2">
        <input
            type="number"
            min={1}
            max={300}
            value={timerDuration}
            onChange={e => setTimerDuration(Number(e.target.value))}
            className="w-16 sm:w-20 h-10 px-2 text-center font-mono rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900
                 dark:text-white border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                  dark:focus:ring-blue-800 outline-none transition placeholder-gray-400 dark:placeholder-gray-500 shadow-sm"
            placeholder="Sec"
        />
        <button
            onClick={handleStartTimer}
            disabled={isRevealed || (timeLeft !== null && timeLeft > 0)}
            className={`px-4 py-2 rounded-full font-medium transition shadow flex items-center gap-1 text-white
                ${isRevealed || (timeLeft !== null && timeLeft > 0)
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gray-700 hover:bg-gray-800'
                        }`}
        >
            Timer
        </button>
    </div>
);

export default TimerControls;

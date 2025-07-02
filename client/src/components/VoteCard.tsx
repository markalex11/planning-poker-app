type VoteCardProps = {
  value: number;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
  isRevealed: boolean;
};

const VoteCard = ({ value, isActive, isDisabled, onClick, isRevealed }: VoteCardProps) => (
    <button
        onClick={onClick}
        disabled={isDisabled}
        className={`w-[56px] h-[60px] rounded-xl flex items-center justify-center
                    text-xl font-bold shadow transition border-2
                    ${isRevealed
                    ? 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-700 text-gray-400 cursor-not-allowed'
                    : isActive
                    ? 'bg-green-500 border-green-600 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-orange-300 hover:border-orange-300 hover:shadow-md'
                        }
                    `}
        style={{ transition: "all 0.15s" }}
    >
        {value}
    </button>
);

export default VoteCard;

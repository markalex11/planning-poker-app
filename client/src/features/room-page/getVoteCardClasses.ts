import type { VoteCardProps } from "./VoteCard";

export function getVoteCardClasses({ isRevealed, isActive }: Pick<VoteCardProps, 'isRevealed' | 'isActive'>) {
  const base = 'w-[56px] h-[60px] rounded-xl flex items-center justify-center text-xl font-bold shadow transition border-2';

  if (isRevealed) {
    return `${base} bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-700 text-gray-400 cursor-not-allowed`;
  }

  if (isActive) {
    return `${base} bg-green-500 border-green-600 text-white`;
  }

  return `${base} bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-orange-300 hover:border-orange-300 hover:shadow-md`;
}

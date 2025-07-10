import React from "react";
import { getVoteCardClasses } from "./getVoteCardClasses";

export type VoteCardProps = {
  value: number;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
  isRevealed: boolean;
};

const VoteCard = React.memo(({ value, isActive, isDisabled, onClick, isRevealed }: VoteCardProps) => (
    <button
        onClick={onClick}
        disabled={isDisabled}
        className={getVoteCardClasses({ isActive, isRevealed })}
        style={{ transition: "all 0.15s" }}
    >
        {value}
    </button>
));

export default VoteCard;

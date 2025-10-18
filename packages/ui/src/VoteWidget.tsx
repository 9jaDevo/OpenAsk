import React, { useState } from 'react';

export interface VoteWidgetProps {
  voteCount: number;
  onVote: (value: 1 | -1) => Promise<{ voteCount: number }>;
  userVote?: 1 | -1 | null;
  disabled?: boolean;
}

export const VoteWidget: React.FC<VoteWidgetProps> = ({
  voteCount: initialCount,
  onVote,
  userVote = null,
  disabled = false,
}) => {
  const [voteCount, setVoteCount] = useState(initialCount);
  const [currentVote, setCurrentVote] = useState(userVote);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (value: 1 | -1) => {
    if (isVoting || disabled) return;

    // Optimistic update
    const previousVote = currentVote;
    const previousCount = voteCount;

    let newVote: 1 | -1 | null = value;
    let newCount = voteCount;

    // Calculate new state
    if (currentVote === value) {
      // Remove vote
      newVote = null;
      newCount = voteCount - value;
    } else if (currentVote === null) {
      // Add vote
      newVote = value;
      newCount = voteCount + value;
    } else {
      // Change vote
      newVote = value;
      newCount = voteCount - currentVote + value;
    }

    setCurrentVote(newVote);
    setVoteCount(newCount);
    setIsVoting(true);

    try {
      const result = await onVote(value);
      setVoteCount(result.voteCount);
    } catch (error) {
      // Revert on error
      setCurrentVote(previousVote);
      setVoteCount(previousCount);
      throw error;
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => handleVote(1)}
        disabled={isVoting || disabled}
        className={`p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          currentVote === 1 ? 'text-orange-500' : 'text-gray-400'
        }`}
        aria-label="Upvote"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill={currentVote === 1 ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      <span
        className={`text-lg font-semibold ${
          currentVote === 1 ? 'text-orange-500' : currentVote === -1 ? 'text-blue-500' : 'text-gray-700'
        }`}
      >
        {voteCount}
      </span>

      <button
        onClick={() => handleVote(-1)}
        disabled={isVoting || disabled}
        className={`p-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          currentVote === -1 ? 'text-blue-500' : 'text-gray-400'
        }`}
        aria-label="Downvote"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill={currentVote === -1 ? 'currentColor' : 'none'}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    </div>
  );
};

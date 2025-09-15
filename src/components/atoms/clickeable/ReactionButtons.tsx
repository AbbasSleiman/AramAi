// components/atoms/clickeable/ReactionButtons.tsx
import { useState } from "react";

interface ReactionButtonsProps {
  messageId: string;
  currentReaction?: 'like' | 'dislike' | null;
  onReactionChange: (messageId: string, reaction: 'like' | 'dislike' | null) => void;
  className?: string;
}

const ReactionButtons = ({ 
  messageId, 
  currentReaction, 
  onReactionChange, 
  className = "" 
}: ReactionButtonsProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleReaction = async (reaction: 'like' | 'dislike') => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // If clicking the same reaction, remove it (set to null)
      const newReaction = currentReaction === reaction ? null : reaction;
      await onReactionChange(messageId, newReaction);
    } catch (error) {
      console.error('Failed to update reaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {/* Like Button */}
      <button
        onClick={() => handleReaction('like')}
        disabled={isLoading}
        className={`!p-1.5 !rounded-md !border-0 !bg-transparent hover:!bg-gray-100 dark:hover:!bg-gray-600 !transition-colors !duration-200 !cursor-pointer disabled:!opacity-50 disabled:!cursor-not-allowed ${
          currentReaction === 'like' 
            ? '!text-green-600 dark:!text-green-400 !bg-green-50 dark:!bg-green-900' 
            : '!text-gray-500 dark:!text-gray-400 hover:!text-green-600 dark:hover:!text-green-400'
        }`}
        title={currentReaction === 'like' ? "Remove like" : "Like this response"}
        type="button"
      >
        <svg className="!w-4 !h-4" fill={currentReaction === 'like' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
      </button>

      {/* Dislike Button */}
      <button
        onClick={() => handleReaction('dislike')}
        disabled={isLoading}
        className={`!p-1.5 !rounded-md !border-0 !bg-transparent hover:!bg-gray-100 dark:hover:!bg-gray-600 !transition-colors !duration-200 !cursor-pointer disabled:!opacity-50 disabled:!cursor-not-allowed ${
          currentReaction === 'dislike' 
            ? '!text-red-600 dark:!text-red-400 !bg-red-50 dark:!bg-red-900' 
            : '!text-gray-500 dark:!text-gray-400 hover:!text-red-600 dark:hover:!text-red-400'
        }`}
        title={currentReaction === 'dislike' ? "Remove dislike" : "Dislike this response"}
        type="button"
      >
        <svg className="!w-4 !h-4" fill={currentReaction === 'dislike' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
        </svg>
      </button>

      {/* Loading indicator */}
      {isLoading && (
        <div className="!w-4 !h-4 !animate-spin !border-2 !border-gray-300 !border-t-blue-500 !rounded-full !ml-1"></div>
      )}
    </div>
  );
};

export default ReactionButtons;
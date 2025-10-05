import { useState, useRef, useEffect } from "react";

interface MessageRatingProps {
  messageId: string;
  currentRating?: number | null;  
  currentComment?: string;
  onSubmit: (messageId: string, rating: number, comment: string, feedbackType: string) => void;
  className?: string;
}

const MessageRating = ({ 
  messageId, 
  currentRating = 0, 
  currentComment = "",
  onSubmit, 
  className = "" 
}: MessageRatingProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(currentRating || 0);
  const [comment, setComment] = useState(currentComment);
  const [feedbackType, setFeedbackType] = useState<string>('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setRating(currentRating || 0);
    setComment(currentComment || "");
  }, [currentRating, currentComment]);

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(messageId, rating, comment, feedbackType);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to submit rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="!p-1.5 !rounded-md !border-0 !bg-transparent hover:!bg-gray-100 dark:hover:!bg-gray-600 !transition-colors !duration-200 !cursor-pointer"
          title={currentRating ? "Update rating" : "Rate this response"}
          type="button"
        >
          <svg 
            className={`!w-4 !h-4 ${
              currentRating 
                ? '!text-yellow-500 !fill-current' 
                : '!text-gray-500 dark:!text-gray-400'
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
      </div>

      {/* Modal overlay and popup */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Centered Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="!w-full !max-w-sm !bg-white dark:!bg-gray-800 !rounded-lg !shadow-xl !border !border-gray-200 dark:!border-gray-600 !p-4">
              <h3 className="!text-sm !font-medium !text-gray-900 dark:!text-white !mb-3">
                {currentRating ? 'Update your rating' : 'Rate this response'}
              </h3>
              
              {/* Star Rating */}
              <div className="!flex !gap-1 !mb-3 !justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="!p-1 hover:!scale-110 !transition-transform"
                    type="button"
                  >
                    <svg
                      className={`!w-8 !h-8 ${
                        star <= rating 
                          ? '!text-yellow-400 !fill-current' 
                          : '!text-gray-300 dark:!text-gray-600 !fill-current'
                      }`}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  </button>
                ))}
              </div>

              {/* Feedback Type */}
              <div className="!mb-3">
                <label className="!text-xs !text-gray-600 dark:!text-gray-400 !mb-1 !block">
                  Feedback type:
                </label>
                <select
                  value={feedbackType}
                  onChange={(e) => setFeedbackType(e.target.value)}
                  className="!w-full !px-3 !py-2 !text-sm !border !border-gray-300 dark:!border-gray-600 !rounded !bg-white dark:!bg-gray-700 !text-gray-900 dark:!text-white"
                >
                  <option value="general">General</option>
                  <option value="accuracy">Accuracy</option>
                  <option value="helpfulness">Helpfulness</option>
                  <option value="fluency">Fluency</option>
                  <option value="cultural_appropriateness">Cultural Appropriateness</option>
                </select>
              </div>

              {/* Comment */}
              <div className="!mb-4">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment (optional)"
                  className="!w-full !px-3 !py-2 !text-sm !border !border-gray-300 dark:!border-gray-600 !rounded !resize-none !h-20 !bg-white dark:!bg-gray-700 !text-gray-900 dark:!text-white"
                />
              </div>

              {/* Buttons */}
              <div className="!flex !gap-2 !justify-end">
                <button
                  onClick={() => setIsOpen(false)}
                  className="!px-4 !py-2 !text-sm !text-gray-600 dark:!text-gray-400 hover:!text-gray-800 dark:hover:!text-gray-200 !bg-gray-100 dark:!bg-gray-700 !rounded"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={rating === 0 || isSubmitting}
                  className="!px-4 !py-2 !text-sm !bg-blue-500 !text-white !rounded hover:!bg-blue-600 disabled:!bg-gray-400 disabled:!cursor-not-allowed"
                  type="button"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default MessageRating;
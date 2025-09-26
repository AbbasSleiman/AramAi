import { useState } from "react";
import InputField from "../atoms/InputField";

interface InputChatProps {
  onSubmit: (message: string) => void; // Remove taskType parameter
  isLoading: boolean;
}

const InputChat = ({ onSubmit, isLoading }: InputChatProps) => {
  const [inputText, setInputText] = useState<string>('');
  // Remove taskType state completely

  const handleSubmit = () => {
    if (inputText.trim() && !isLoading) {
      onSubmit(inputText); // Just pass the message, no task type
      setInputText('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      {/* Enhanced CSS Override with complete dark mode support */}
      <style>
        {`
          .enhanced-input-override {
            width: 100% !important;
            min-width: 0 !important;
            flex: 1 !important;
            border: 2px solid #d1d5db !important;
            border-radius: 0.75rem !important;
            padding: 16px 20px !important;
            font-size: 16px !important;
            line-height: 1.5 !important;
            min-height: 56px !important;
            max-height: 120px !important;
            background-color: #ffffff !important;
            outline: none !important;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1) !important;
            transition: all 0.2s ease-in-out !important;
            box-sizing: border-box !important;
            resize: none !important;
            font-family: inherit !important;
            color: #1f2937 !important;
          }
          
          /* Dark mode styles for input - using stronger selectors */
          html.dark .enhanced-input-override,
          .dark .enhanced-input-override,
          [data-theme="dark"] .enhanced-input-override {
            background-color: #374151 !important;
            background: #374151 !important;
            border-color: #4b5563 !important;
            color: #f9fafb !important;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3) !important;
          }
          
          /* Even stronger override for dark mode */
          html.dark input.enhanced-input-override,
          .dark input.enhanced-input-override {
            background-color: #374151 !important;
            background: #374151 !important;
            color: #f9fafb !important;
          }
          
          .enhanced-input-override:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
            outline: none !important;
          }
          
          .dark .enhanced-input-override:focus {
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2), 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
          }
          
          .enhanced-input-override:hover:not(:focus) {
            border-color: #9ca3af !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          }
          
          .dark .enhanced-input-override:hover:not(:focus) {
            border-color: #6b7280 !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
          }
          
          .enhanced-input-override::placeholder {
            color: #9ca3af !important;
            opacity: 1 !important;
          }
          
          .dark .enhanced-input-override::placeholder {
            color: #6b7280 !important;
          }
          
          .send-button-fixed {
            flex-shrink: 0 !important;
            width: auto !important;
            min-width: 100px !important;
            height: 56px !important;
            padding: 0 24px !important;
            font-size: 16px !important;
            font-weight: 600 !important;
            border-radius: 0.75rem !important;
            transition: all 0.2s ease-in-out !important;
            white-space: nowrap !important;
            border: none !important;
          }
        `}
      </style>
      
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-6 flex-shrink-0">
        <div className="max-w-4xl mx-auto w-full">
          <div className="space-y-6">
            {/* Remove the task type selector completely */}
            
            {/* Input Field with proper flex layout and dark mode */}
            <div className="flex gap-3 w-full items-end">
              <div className="flex-1 min-w-0" onKeyDown={handleKeyPress}>
                <InputField
                  type="text"
                  name="message"
                  placeholder="Enter your message (English or Syriac)..." // Updated placeholder
                  value={inputText}
                  on_change={(e) => setInputText(e.target.value)}
                  classname="enhanced-input-override"
                />
              </div>
              <button
                onClick={handleSubmit}
                disabled={!inputText.trim() || isLoading}
                className={`send-button-fixed ${
                  isLoading || !inputText.trim() 
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed text-gray-200 dark:text-gray-400' 
                    : 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700 hover:shadow-md text-white'
                } transition-all duration-200`}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default InputChat;
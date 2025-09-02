// InputChat component - Fixed input field sizing
import { useState } from "react";
import InputField from "../atoms/InputField";

interface InputChatProps {
  onSubmit: (message: string, taskType: 'translate' | 'continue') => void;
  isLoading: boolean;
}

const InputChat = ({ onSubmit, isLoading }: InputChatProps) => {
  const [inputText, setInputText] = useState<string>('');
  const [taskType, setTaskType] = useState<'translate' | 'continue'>('translate');

  const handleSubmit = () => {
    if (inputText.trim() && !isLoading) {
      onSubmit(inputText, taskType);
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
      {/* Enhanced CSS Override with better specificity */}
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
          }
          .enhanced-input-override:focus {
            border-color: #3b82f6 !important;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1), 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
            outline: none !important;
          }
          .enhanced-input-override:hover:not(:focus) {
            border-color: #9ca3af !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          }
          .enhanced-input-override::placeholder {
            color: #9ca3af !important;
            opacity: 1 !important;
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
          }
        `}
      </style>
      
      <div className="border-t bg-white px-4 py-6 flex-shrink-0">
        <div className="max-w-4xl mx-auto w-full">
          <div className="space-y-6">
            {/* Task Type Selector */}
            <div className="flex gap-8 justify-center">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="translate"
                  checked={taskType === 'translate'}
                  onChange={(e) => setTaskType(e.target.value as 'translate')}
                  className="mr-3 w-5 h-5"
                  disabled={isLoading}
                />
                <span className="text-base font-medium">English → Syriac</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  value="continue"
                  checked={taskType === 'continue'}
                  onChange={(e) => setTaskType(e.target.value as 'continue')}
                  className="mr-3 w-5 h-5"
                  disabled={isLoading}
                />
                <span className="text-base font-medium">Continue Syriac</span>
              </label>
            </div>
            
            {/* Input Field with proper flex layout */}
            <div className="flex gap-3 w-full items-end">
              <div className="flex-1 min-w-0" onKeyDown={handleKeyPress}>
                <InputField
                  type="text"
                  name="message"
                  placeholder={
                    taskType === 'translate' 
                      ? "Enter English text to translate..." 
                      : "Enter Syriac text to continue..."
                  }
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
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600 hover:shadow-md'
                } text-white`}
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
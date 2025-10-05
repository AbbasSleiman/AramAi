import { useState } from "react";
import InputField from "../atoms/InputField";
import SendBtn from "../atoms/clickeable/SendBtn";

interface InputChatProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
}

const InputChat = ({ onSubmit, isLoading }: InputChatProps) => {
  const [inputText, setInputText] = useState<string>("");

  const handleSubmit = () => {
    const msg = inputText.trim();
    if (!msg || isLoading) return;
    onSubmit(msg);
    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-3 ">
      {/* Input */}
      <div className="flex-1 min-w-0 " onKeyDown={handleKeyPress}>
        <InputField
          type="text"
          name="message"
          placeholder="Enter your message (English or Syriac)…"
          value={inputText}
          on_change={(e) => setInputText(e.target.value)}
          classname="w-full bg-third dark:bg-background text-text dark:text-background-dark placeholder:text-text/60 dark:placeholder:text-text-dark/60"
        />
      </div>

      {/* Send button */}
      <SendBtn
        onClick={handleSubmit}
        disabled={!inputText.trim() || isLoading}
        className="w-24"
        type="button"
      ></SendBtn>
    </div>
  );
};

export default InputChat;

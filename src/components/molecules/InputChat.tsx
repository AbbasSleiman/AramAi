import { useState } from "react";
import InputField from "../atoms/InputField";
import SendBtn from "../atoms/clickeable/SendBtn";
import { motion } from "framer-motion";
import { Keyboard } from "lucide-react";

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

  const disabled = !inputText.trim() || isLoading;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-2"
    >
      <div className="flex gap-3">
        {/* Input */}
        <div className="flex-1 min-w-0" onKeyDown={handleKeyPress}>
          <InputField
            type="text"
            name="message"
            placeholder="Enter your message (English or Syriac)…"
            value={inputText}
            on_change={(e) => setInputText(e.target.value)}
            classname={[
              "w-full bg-third dark:bg-background",
              "text-text dark:text-background-dark",
              "placeholder:text-text/60 dark:placeholder:text-text-dark/60",
              "transition-shadow focus:shadow-sm",
            ].join(" ")}
          />
        </div>

        {/* Send */}
        <SendBtn
          onClick={handleSubmit}
          disabled={disabled}
          className="w-24"
          type="button"
        />
      </div>

      <div className="flex items-center gap-2 text-xs opacity-60">
        <Keyboard className="w-3.5 h-3.5" />
        <span>
          Press <span className="font-semibold">Enter</span> to send •{" "}
          <span className="font-semibold">Shift + Enter</span> for a new line
        </span>
      </div>
    </motion.div>
  );
};

export default InputChat;

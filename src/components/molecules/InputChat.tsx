import SendBtn from "../atoms/clickeable/SendBtn";
import { useRef, useEffect, useState } from "react";

const ChatInput = () => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reset height
      textarea.style.height = `${textarea.scrollHeight}px`; // Adjust height
    }
  }, [text]);

  return (
    <div className="flex flex-row gap-4 py-3 px-4 rounded-2xl w-full items-end justify-between input-chat-container overflow-auto">
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask Anything"
        className="block max-h-60 h-10 w-full resize-none border-0 bg-transparent px-0 py-2 ring-0 overflow-y-auto focus:outline-none"
      />
      <SendBtn />
    </div>
  );
};

export default ChatInput;

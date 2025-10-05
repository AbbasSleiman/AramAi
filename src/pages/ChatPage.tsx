import { useChatPage, Message } from "../lib/hooks/useChatPage";
import SideBar from "../components/organisms/SideBar";
import ReactionButtons from "../components/atoms/clickeable/ReactionButtons";
import MessageRating from "../components/atoms/clickeable/MessageRating";
import CopyButton from "../components/atoms/clickeable/CopyButton";
import InputChat from "../components/molecules/InputChat";
import ExportButton from "../components/atoms/clickeable/ExportButton";
import OuterNavBar from "../components/organisms/OuterNavBar";
import Logo from "../components/atoms/Logo";
import { useSelector } from "react-redux";
import { RootState } from "../lib/store/store";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.2 } },
};

const ChatPage = () => {
  const {
    sideBarOpened,
    currentSession,
    chatSessions,
    isLoading,
    error,
    isTyping,
    typingMessageId,
    displayedText,
    messagesEndRef,
    formatRelativeTime,
    createNewSession,
    handleSideBar,
    handleSessionSelect,
    handleNewChat,
    handleReactionUpdate,
    handleRatingSubmit,
    sendMessage,
    setError,
  } = useChatPage();

  const user = useSelector((state: RootState) => state.user);

  const renderMessage = (message: Message) => {
    let messageDate: Date;
    try {
      messageDate = new Date(message.timestamp);
      if (isNaN(messageDate.getTime())) messageDate = new Date();
    } catch {
      messageDate = new Date();
    }
    const localTime = messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const messageContent =
      isTyping && typingMessageId === message.id
        ? displayedText
        : message.content;

    const isUser = message.type === "user";

    return (
      <motion.div
        layout
        key={message.id}
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={`mb-3 flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div className={`max-w-[72%] ${isUser ? "ml-4" : "mr-4"}`}>
          <motion.div
            layout
            className={[
              "rounded-2xl px-4 py-3 shadow-sm",
              isUser
                ? "bg-background2-dark text-text-dark dark:bg-background dark:text-background-dark"
                : "bg-third text-text dark:bg-background2-dark dark:text-text-dark",
            ].join(" ")}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
          >
            <div
              className={`text-sm leading-relaxed ${!isUser ? "font-roboto" : "font-roboto"} ${
                !isUser ? "text-lg" : ""
              }`}
              style={{ direction: !isUser ? "rtl" : "ltr" }}
            >
              {messageContent}
              {isTyping && typingMessageId === message.id && (
                <motion.span
                  className="inline-block"
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.9 }}
                >
                  |
                </motion.span>
              )}
            </div>
            <div
              className="text-[11px] opacity-70 mt-1"
              style={{ direction: "ltr" }}
            >
              {localTime}
            </div>
          </motion.div>

          {!isTyping && typingMessageId !== message.id && (
            <div className="flex mt-1 justify-between items-center">
              <div className="flex items-center gap-1">
                {message.type === "assistant" &&
                  currentSession?.state !== "archived" && (
                    <>
                      <ReactionButtons
                        messageId={message.id}
                        currentReaction={message.reaction}
                        onReactionChange={handleReactionUpdate}
                      />
                      <MessageRating
                        messageId={message.id}
                        currentRating={message.feedbackSummary?.user_rating}
                        currentComment={
                          message.feedbackSummary?.user_comment || ""
                        }
                        onSubmit={handleRatingSubmit}
                      />
                    </>
                  )}
              </div>
              <div className="flex-none">
                <CopyButton text={message.content} />
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Loading screen while we don’t know the user yet
  if (!user.is_auth || !user.db_id) {
    return (
      <div className="flex items-center justify-center h-screen bg-background dark:bg-background-dark">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-text dark:text-text-dark">
            Setting up your account...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background dark:bg-background-dark">
      {/* Sidebar */}
      <SideBar
        isVisible={sideBarOpened}
        toggleVisiblity={handleSideBar}
        chatSessions={chatSessions}
        currentSessionId={currentSession?.id}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col h-screen min-w-0 bg-background dark:bg-background-dark">
        <OuterNavBar toggleVisiblity={handleSideBar} />

        {!currentSession ? (
          // Welcome
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center text-center gap-3 px-4"
          >
            <motion.div
              initial={{ scale: 0.98 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Logo />
            </motion.div>
            <h1 className="mb-2 text-text dark:text-text-dark">
              Ancient Wisdom. Modern Intelligence.
            </h1>
            <p className="text-base text-text dark:text-text-dark opacity-80">
              Welcome {user.username}! Start a conversation in English or
              Syriac.
            </p>
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
              onClick={createNewSession}
              className="button-styled w-60 rounded-2xl"
            >
              Start New Chat
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <motion.div
              initial={{ y: -8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-background dark:bg-background2-dark border-b border-secondary dark:border-background px-4 py-3 flex-shrink-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-outfit font-semibold text-text dark:text-text-dark truncate">
                    {currentSession.title}
                  </h2>
                  <p className="text-xs text-text dark:text-text-dark opacity-70">
                    {currentSession.messages.length} messages • Updated{" "}
                    {formatRelativeTime(currentSession.updated_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <ExportButton session={currentSession} />
                </div>
              </div>
            </motion.div>

            {/* Archived banner */}
            {currentSession.state === "archived" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-third dark:bg-background2-dark border-b border-secondary dark:border-background px-4 py-2 flex-shrink-0"
              >
                <div className="flex items-center justify-center">
                  <span className="text-sm font-roboto text-text dark:text-text-dark">
                    📁 This chat is archived. You can view messages but cannot
                    send new ones.
                  </span>
                </div>
              </motion.div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-third dark:bg-background-dark min-h-0">
              <div className="max-w-4xl mx-auto">
                <AnimatePresence initial={false}>
                  {currentSession.messages.map(renderMessage)}
                </AnimatePresence>

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start mb-4"
                  >
                    <div className="rounded-2xl px-4 py-2 mr-4 input-chat-container">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm text-text dark:text-text-dark">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mx-4 my-3 border border-red-600/30 rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 flex-shrink-0"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </span>
                  <button
                    onClick={() => setError(null)}
                    className="thin-button !w-auto"
                  >
                    Dismiss
                  </button>
                </div>
              </motion.div>
            )}

            {/* Input */}
            {currentSession.state !== "archived" && (
              <div className="mx-12 mb-8">
                <InputChat
                  onSubmit={sendMessage}
                  isLoading={isLoading || isTyping}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;

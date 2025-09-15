// ChatPage component - Updated with reaction support
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../lib/store/store";

import Logo from "../components/atoms/Logo";
import InputChat from "../components/molecules/InputChat";
import OuterNavBar from "../components/organisms/OuterNavBar";
import SideBar from "../components/organisms/SideBar";

import CopyButton from "../components/atoms/clickeable/CopyButton";
import ExportButton from "../components/atoms/clickeable/ExportButton";
import ReactionButtons from "../components/atoms/clickeable/ReactionButtons";

// Updated Types with reaction support
interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    input_type?: 'translate' | 'continue';
    generation_params?: {
      max_new_tokens: number;
      num_beams: number;
    };
  };
  reaction?: 'like' | 'dislike' | null; // Added reaction field
}

interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  state?: string; // Added for archive functionality: 'ongoing', 'archived', 'deleted'
  messages: Message[];
}

const API_BASE_URL = 'http://127.0.0.1:8000';

// Helper function to create local timestamp in ISO-like format
const createLocalTimestamp = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Helper function for relative time formatting
const formatRelativeTime = (isoString: string) => {
  const date = new Date(isoString);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInHours < 168) {
    return `${Math.floor(diffInHours / 24)} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

const ChatPage = () => {
  const [sideBarOpened, setSideBarOpened] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Typing effect states
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState<string>('');
  
  // Get user info from Redux
  const user = useSelector((state: RootState) => state.user);
  
  // Refs for auto-scrolling and typing effect
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, displayedText]);

  // Load chat sessions when user is available
  useEffect(() => {
    if (user.userId) {
      loadChatSessions();
    }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.userId]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Monitor session state changes - handle archived sessions
  useEffect(() => {
    if (currentSession?.state === 'archived') {
      handleArchivedSessionAccess();
    }
  }, [currentSession?.state]);

  const handleSideBar = () => {
    setSideBarOpened((prev) => !prev);
  };

  // Handle archived session access
  const handleArchivedSessionAccess = () => {
    setCurrentSession(null);
    setError('This chat has been archived. Please select an active chat or start a new one.');
  };

  // Reaction update handler
  const handleReactionUpdate = async (messageId: string, reaction: 'like' | 'dislike' | null) => {
    if (!user.userId) {
      console.error('User ID is missing for reaction update');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/chat/messages/${messageId}/reaction`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.userId,
        },
        body: JSON.stringify({ reaction }),
      });

      if (response.ok) {
        console.log('Reaction updated successfully');
        
        // Update the message in currentSession
        setCurrentSession(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            messages: prev.messages.map(message => 
              message.id === messageId 
                ? { ...message, reaction } 
                : message
            )
          };
        });
      } else {
        const errorData = await response.text();
        console.error('Failed to update reaction:', errorData);
        throw new Error(`Failed to update reaction: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating reaction:', error);
      setError('Failed to update reaction. Please try again.');
    }
  };

  // Typing effect function
  const simulateTyping = (text: string, messageId: string, onComplete: () => void) => {
    setIsTyping(true);
    setTypingMessageId(messageId);
    setDisplayedText('');
    
    let currentIndex = 0;
    const typingSpeed = 30; // milliseconds per character (adjust for speed)
    
    const typeNextCharacter = () => {
      if (currentIndex < text.length) {
        setDisplayedText(text.substring(0, currentIndex + 1));
        currentIndex++;
        typingTimeoutRef.current = setTimeout(typeNextCharacter, typingSpeed);
      } else {
        // Typing complete
        setIsTyping(false);
        setTypingMessageId(null);
        setDisplayedText('');
        onComplete();
      }
    };
    
    typeNextCharacter();
  };

  // API Functions with user authentication
  const loadChatSessions = async () => {
    if (!user.userId) {
      console.warn('⚠️ No user ID available for loading sessions');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        headers: {
          'X-User-Id': user.userId,
        },
      });
      if (response.ok) {
        const sessions = await response.json();
        setChatSessions(sessions);
        console.log('✅ Loaded sessions:', sessions.length);
      } else {
        console.error('Failed to load chat sessions');
      }
    } catch (error) {
      console.error('Error loading chat sessions:', error);
    }
  };

  const createNewSession = async () => {
    if (!user.userId) {
      console.warn('⚠️ No user ID available for creating session');
      return null;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.userId,
        },
        body: JSON.stringify({ title: 'New Chat' })
      });
      
      if (response.ok) {
        const newSession = await response.json();
        setCurrentSession(newSession);
        setChatSessions(prev => [newSession, ...prev]);
        console.log('✅ Created new session:', newSession.id);
        return newSession;
      } else {
        setError('Failed to create new session');
      }
    } catch (error) {
      console.error('Failed to create new session:', error);
      setError('Network error while creating session');
    }
    return null;
  };

  const loadSession = async (sessionId: string) => {
    if (!user.userId) {
      console.warn('⚠️ No user ID available for loading session');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
        headers: {
          'X-User-Id': user.userId,
        },
      });
      
      if (response.ok) {
        const session = await response.json();
        
        // Check if the session is archived
        if (session.state === 'archived') {
          handleArchivedSessionAccess();
          return;
        }
        
        setCurrentSession(session);
        console.log('✅ Loaded session:', session.id, 'with', session.messages.length, 'messages');
      } else if (response.status === 404) {
        // Session might have been archived or deleted
        setCurrentSession(null);
        setError('This chat is no longer available. It may have been archived or deleted.');
      } else {
        console.error('Failed to load session');
        setError('Failed to load session');
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setError('Error loading session');
    }
  };

  const sendMessage = async (message: string, type: 'translate' | 'continue') => {
    if (!message.trim() || !user.userId) return;

    // Check if current session is somehow archived
    if (currentSession?.state === 'archived') {
      setError('Cannot send messages to archived chats. Please restore the chat first.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Create new session if none exists
      let session = currentSession;
      if (!session) {
        session = await createNewSession();
        if (!session) return;
      }

      // Double-check session is not archived before proceeding
      if (session.state === 'archived') {
        setError('Cannot send messages to archived chats. Please restore the chat first.');
        setIsLoading(false);
        return;
      }

      // Prepare the input text with the appropriate prefix
      const prefix = type === 'translate' ? 'translate english to syriac: ' : 'continue in syriac: ';
      const fullInput = prefix + message;

      // Create local timestamp - this ensures consistency and local time
      const messageTimestamp = createLocalTimestamp();

      // Add user message to current session immediately
      const userMessage: Message = {
        id: Date.now().toString() + '_user',
        type: 'user',
        content: message,
        timestamp: messageTimestamp,
        metadata: {
          input_type: type
        }
      };

      // Update UI immediately with user message
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, userMessage]
      } : null);

      console.log('🤖 Sending to AI:', fullInput);

      // Send to AI model
      const aiResponse = await fetch(`${API_BASE_URL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          input_text: fullInput,
          max_new_tokens: 96,
          num_beams: 2
        })
      });

      if (!aiResponse.ok) {
        throw new Error('Failed to get AI response');
      }

      const aiData = await aiResponse.json();
      console.log('✅ AI Response:', aiData.output_text);

      // Create assistant message with local timestamp
      const assistantTimestamp = createLocalTimestamp();
      const assistantMessage: Message = {
        id: Date.now().toString() + '_assistant',
        type: 'assistant',
        content: aiData.output_text,
        timestamp: assistantTimestamp,
        metadata: {
          input_type: type,
          generation_params: aiData.generation_params
        },
        reaction: null // Initialize with no reaction
      };

      // Add empty assistant message first (for typing effect)
      const emptyAssistantMessage = { ...assistantMessage, content: '' };
      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, emptyAssistantMessage]
      } : null);

      setIsLoading(false);

      // Start typing effect
      simulateTyping(aiData.output_text, assistantMessage.id, async () => {
        // After typing is complete, update with full message and save to database
        setCurrentSession(prev => prev ? {
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === assistantMessage.id ? assistantMessage : msg
          )
        } : null);

        // Save both messages to database
        try {
          // Ensure user.userId is not null before making the request
          if (!user.userId) {
            console.error('User ID is null when trying to save messages');
            setError('Authentication error. Please refresh the page.');
            return;
          }

          const saveResponse = await fetch(`${API_BASE_URL}/chat/sessions/${session.id}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-User-Id': user.userId, // Now TypeScript knows this is not null
            },
            body: JSON.stringify({
              messages: [userMessage, assistantMessage]
            })
          });

          if (saveResponse.ok) {
            // Update the session in the list (but not messages to avoid timestamp refresh)
            setChatSessions(prev => 
              prev.map(s => s.id === session.id ? {
                ...s,
                title: s.title,
                updated_at: createLocalTimestamp()
              } : s)
            );

            console.log('✅ Messages saved to database');
          } else {
            setError('Failed to save messages');
          }
        } catch (saveError) {
          console.error('Error saving messages:', saveError);
          setError('Failed to save messages');
        }
      });

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      setIsLoading(false);
      
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: createLocalTimestamp()
      };

      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage]
      } : null);
    }
  };

  // Handler for when a session is selected from sidebar
  const handleSessionSelect = (sessionId: string) => {
    // Stop any ongoing typing effect
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
      setTypingMessageId(null);
      setDisplayedText('');
    }
    loadSession(sessionId);
  };

  // Handler for creating new chat from sidebar
  const handleNewChat = () => {
    // Stop any ongoing typing effect
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
      setTypingMessageId(null);
      setDisplayedText('');
    }
    createNewSession();
  };

const renderMessage = (message: Message) => {
  // Simplified timestamp parsing since we're now using local timestamps
  let messageDate: Date;
  try {
    // Parse the local timestamp directly
    messageDate = new Date(message.timestamp);
    
    // Fallback if parsing fails
    if (isNaN(messageDate.getTime())) {
      console.warn('Error parsing timestamp:', message.timestamp);
      messageDate = new Date(); // Use current time as fallback
    }
  } catch (error) {
    console.log(error)
    console.warn('Error parsing timestamp:', message.timestamp);
    messageDate = new Date(); // Use current time as fallback
  }

  const localTime = messageDate.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });

  // Handle typing effect for assistant messages
  const messageContent = (isTyping && typingMessageId === message.id) 
    ? displayedText 
    : message.content;

  return (
    <div
      key={message.id}
      className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`max-w-[70%] ${message.type === 'user' ? 'ml-4' : 'mr-4'}`}>
        <div
          className={`rounded-lg px-4 py-2 ${
            message.type === 'user'
              ? 'bg-blue-500 dark:bg-blue-600 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
          }`}
        >
          <div 
            className={`text-sm ${message.type === 'assistant' ? 'font-mono text-lg' : ''}`} 
            style={{direction: message.type === 'assistant' ? 'rtl' : 'ltr'}}
          >
            {messageContent}
            {/* Show typing cursor during typing effect */}
            {isTyping && typingMessageId === message.id && (
              <span className="animate-pulse">|</span>
            )}
          </div>
          <div className="text-xs opacity-70 mt-1" style={{direction: 'ltr'}}>
            {localTime}
          </div>
        </div>
        
        {/* Buttons container - Fixed layout */}
        {!isTyping && typingMessageId !== message.id && (
          <div className="flex mt-1 justify-between items-center">
            {/* Left side - Reaction buttons (only for assistant messages) */}
            <div className="flex-none">
              {message.type === 'assistant' && currentSession?.state !== 'archived' && (
                <ReactionButtons
                  messageId={message.id}
                  currentReaction={message.reaction}
                  onReactionChange={handleReactionUpdate}
                />
              )}
            </div>
            
            {/* Right side - Copy button (for all messages) */}
            <div className="flex-none">
              <CopyButton text={message.content} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
  // Show loading if user is not ready
  if (!user.is_auth || !user.userId) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* SideBar */}
      <SideBar
        isVisible={sideBarOpened}
        toggleVisiblity={handleSideBar}
        chatSessions={chatSessions}
        currentSessionId={currentSession?.id}
        onSessionSelect={handleSessionSelect}
        onNewChat={handleNewChat}
      />
            
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 bg-white dark:bg-gray-900">
        <OuterNavBar toggleVisiblity={handleSideBar} />
        
        {/* Main Chat Area */}
        {!currentSession ? (
          // Welcome Screen
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 px-4 bg-white dark:bg-gray-900">
            <Logo />
            <h1 className="antialiased font-outfit text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              Ancient Wisdom. Modern Intelligence.
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Welcome {user.username}! Start a conversation to translate or continue text in Syriac.
            </p>
            <button
              onClick={createNewSession}
              className="bg-blue-500 dark:bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors w-1/3"
            >
              Start New Chat
            </button>
          </div>
        ) : (
          <>
            {/* Chat Header with Export Button */}
            <div className="!bg-white dark:!bg-gray-800 !border-b !border-gray-200 dark:!border-gray-700 !px-4 !py-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h2 className="!text-lg !font-semibold !text-gray-900 dark:!text-white truncate">
                    {currentSession.title}
                  </h2>
                  <p className="!text-xs !text-gray-500 dark:!text-gray-400">
                    {currentSession.messages.length} messages • Updated {formatRelativeTime(currentSession.updated_at)}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <ExportButton session={currentSession} />
                </div>
              </div>
            </div>

            {/* Show archived status if applicable */}
            {currentSession.state === 'archived' && (
              <div className="bg-yellow-50 dark:bg-yellow-900 border-b border-yellow-200 dark:border-yellow-700 px-4 py-2 flex-shrink-0">
                <div className="flex items-center justify-center">
                  <span className="text-yellow-800 dark:text-yellow-200 text-sm font-medium">
                    📁 This chat is archived. You can view messages but cannot send new ones.
                  </span>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900 min-h-0">
              <div className="max-w-4xl mx-auto">
                {currentSession.messages.map(renderMessage)}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 mr-4">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <span className="text-gray-600 dark:text-gray-300">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-200 dark:border-red-700 px-4 py-3 mx-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-red-700 dark:text-red-200 text-sm">{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 dark:text-red-300 hover:text-red-700 dark:hover:text-red-100 ml-4"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Input Area - Hide if session is archived */}
            {currentSession.state !== 'archived' && (
              <InputChat onSubmit={sendMessage} isLoading={isLoading || isTyping} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
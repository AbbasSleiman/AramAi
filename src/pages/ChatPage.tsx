// ChatPage component - Updated with fixed layout for SideBar
import { useState, useEffect, useRef } from "react";

import Logo from "../components/atoms/Logo";
import InputChat from "../components/molecules/InputChat";
import OuterNavBar from "../components/organisms/OuterNavBar";
import SideBar from "../components/organisms/SideBar";

// Types
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
}

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

const API_BASE_URL = 'http://127.0.0.1:8000';

const ChatPage = () => {
  const [sideBarOpened, setSideBarOpened] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  // Load chat sessions on component mount
  useEffect(() => {
    loadChatSessions();
  }, []);

  const handleSideBar = () => {
    setSideBarOpened((prev) => !prev);
  };

  // API Functions
  const loadChatSessions = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions`);
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
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
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
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`);
      if (response.ok) {
        const session = await response.json();
        setCurrentSession(session);
        console.log('✅ Loaded session:', session.id, 'with', session.messages.length, 'messages');
      } else {
        console.error('Failed to load session');
      }
    } catch (error) {
      console.error('Error loading session:', error);
    }
  };

  const sendMessage = async (message: string, type: 'translate' | 'continue') => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Create new session if none exists
      let session = currentSession;
      if (!session) {
        session = await createNewSession();
        if (!session) return;
      }

      // Prepare the input text with the appropriate prefix
      const prefix = type === 'translate' ? 'translate english to syriac: ' : 'continue in syriac: ';
      const fullInput = prefix + message;

      // Add user message to current session immediately
      const userMessage: Message = {
        id: Date.now().toString() + '_user',
        type: 'user',
        content: message,
        timestamp: new Date().toISOString(),
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

      // Create assistant message
      const assistantMessage: Message = {
        id: Date.now().toString() + '_assistant',
        type: 'assistant',
        content: aiData.output_text,
        timestamp: new Date().toISOString(),
        metadata: {
          input_type: type,
          generation_params: aiData.generation_params
        }
      };

      // Save both messages to database
      const saveResponse = await fetch(`${API_BASE_URL}/chat/sessions/${session.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [userMessage, assistantMessage]
        })
      });

      if (saveResponse.ok) {
        const updatedSession = await saveResponse.json();
        setCurrentSession(updatedSession);
        
        // Update the session in the list
        setChatSessions(prev => 
          prev.map(s => s.id === updatedSession.id ? updatedSession : s)
        );

        console.log('✅ Messages saved to database');
      } else {
        setError('Failed to save messages');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message. Please try again.');
      
      // Add error message to chat
      const errorMessage: Message = {
        id: Date.now().toString() + '_error',
        type: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };

      setCurrentSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, errorMessage]
      } : null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Remove from local state
        setChatSessions(prev => prev.filter(s => s.id !== sessionId));
        
        // If this was the current session, clear it
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
        }
        
        console.log('✅ Session deleted:', sessionId);
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const renderMessage = (message: Message) => (
    <div
      key={message.id}
      className={`mb-4 flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          message.type === 'user'
            ? 'bg-blue-500 text-white ml-4'
            : 'bg-gray-100 text-gray-900 mr-4'
        }`}
      >
        <div 
          className={`text-sm ${message.type === 'assistant' ? 'font-mono text-lg' : ''}`} 
          style={{direction: message.type === 'assistant' ? 'rtl' : 'ltr'}}
        >
          {message.content}
        </div>
        <div className="text-xs opacity-70 mt-1" style={{direction: 'ltr'}}>
          {new Date(message.timestamp).toLocaleTimeString()}
          {message.metadata?.input_type && (
            <span className="ml-2 bg-opacity-20 bg-white px-1 rounded">
              {message.metadata.input_type}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* SideBar - Now with fixed positioning */}
      <SideBar 
        isVisible={sideBarOpened} 
        toggleVisiblity={handleSideBar}
        chatSessions={chatSessions}
        currentSessionId={currentSession?.id}
        onSessionSelect={loadSession}
        onNewChat={createNewSession}
        onDeleteSession={handleDeleteSession}
      />
      
      {/* Main Content Area - Adjusted for sidebar */}
      <div className={`flex-1 flex flex-col h-screen min-w-0 transition-all duration-300 ${sideBarOpened ? 'lg:ml-0' : 'lg:ml-0'}`}>
        <OuterNavBar toggleVisiblity={handleSideBar} />
        
        {/* Main Chat Area */}
        {!currentSession ? (
          // Welcome Screen
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2 px-4">
            <Logo />
            <h1 className="antialiased font-outfit text-3xl font-bold mb-4">
              Ancient Wisdom. Modern Intelligence.
            </h1>
            <button
              onClick={createNewSession}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Start New Chat
            </button>
          </div>
        ) : (
          <>
            {/* Chat Messages - Fixed scrollable area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
              <div className="max-w-4xl mx-auto">
                {currentSession.messages.map(renderMessage)}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-100 rounded-lg px-4 py-2 mr-4">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                        <span className="text-gray-600">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-200 px-4 py-3 mx-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-red-700 text-sm">{error}</span>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-500 hover:text-red-700 ml-4"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            {/* Input Area - Fixed positioning */}
            <InputChat onSubmit={sendMessage} isLoading={isLoading} />
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
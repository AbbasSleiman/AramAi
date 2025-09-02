// SideBar component - Fixed positioning and button click issues
import { useState } from "react";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface SideBarProps {
  isVisible: boolean;
  toggleVisiblity: () => void;
  chatSessions: ChatSession[];
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onDeleteSession: (sessionId: string) => void;
}

const SideBar = ({
  isVisible,
  toggleVisiblity,
  chatSessions,
  currentSessionId,
  onSessionSelect,
  onNewChat,
  onDeleteSession
}: SideBarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const handleEditTitle = async (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/chat/sessions/${sessionId}/title`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: newTitle.trim() })
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to update title:', error);
    }
    
    setEditingId(null);
    setEditTitle('');
  };

  const startEditing = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleVisiblity}
        ></div>
      )}
      
      {/* Sidebar */}
      <div
        className={`${
          isVisible ? "translate-x-0" : "-translate-x-full"
        } fixed top-0 left-0 h-full w-80 bg-white dark:bg-background2-dark border-r border-gray-300 dark:border-gray-700 shadow-lg z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:translate-x-0 lg:shadow-none`}
      >
        <div className="flex flex-col h-full py-4 px-4 gap-4 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex-1">Chat History</h2>
            <button
              onClick={toggleVisiblity}
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors lg:hidden ml-2 flex-shrink-0 z-50"
              type="button"
            >
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Chat
          </button>

          {/* Chat Sessions List */}
          <div className="flex-1 overflow-y-auto">
            {chatSessions.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <p>No chats yet</p>
                <p className="text-sm">Start your first conversation!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {chatSessions.map((session) => (
                  <div
                    key={session.id}
                    className={`group relative rounded-lg p-3 cursor-pointer transition-colors duration-200 ${
                      currentSessionId === session.id 
                        ? 'bg-blue-50 border border-blue-200 dark:bg-blue-900 dark:border-blue-700' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                    onClick={() => onSessionSelect(session.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {editingId === session.id ? (
                          <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleEditTitle(session.id, editTitle);
                                } else if (e.key === 'Escape') {
                                  cancelEditing();
                                }
                              }}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditTitle(session.id, editTitle)}
                                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                type="button"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded hover:bg-gray-400"
                                type="button"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {session.title}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(session.updated_at)}
                            </p>
                          </>
                        )}
                      </div>

                      {editingId !== session.id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Edit Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(session);
                            }}
                            className="p-1 rounded bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                            title="Edit title"
                            type="button"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {/* Delete Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSession(session.id);
                            }}
                            className="p-1 rounded bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-300 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-700"
                            title="Delete chat"
                            type="button"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>

                    {currentSessionId === session.id && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;
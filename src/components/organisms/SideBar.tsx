// SideBar component - Complete fixed version with soft deletion
import { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../lib/store/store";

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
}

const SideBar = ({
  isVisible,
  toggleVisiblity,
  chatSessions,
  currentSessionId,
  onSessionSelect,
  onNewChat
}: SideBarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  
  // Get user from Redux state
  const user = useSelector((state: RootState) => state.user);

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

  const handleSoftDelete = async (sessionId: string) => {
    if (!user.userId) {
      alert('User ID is missing. Please try logging out and back in.');
      return;
    }

    // Show confirmation dialog
    if (!confirm('Are you sure you want to delete this chat?')) {
      return;
    }
    
    console.log('Attempting to soft delete session:', { sessionId, userId: user.userId });
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/chat/sessions/${sessionId}`, {
        method: 'DELETE',
        headers: { 
          'X-User-Id': user.userId.toString()
        }
      });
      
      console.log('Delete response status:', response.status);
      
      if (response.ok) {
        console.log('Session marked as deleted successfully');
        window.location.reload(); // Refresh to update the list
      } else {
        const errorText = await response.text();
        console.error('Delete failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        alert(`Failed to delete chat: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Network error:', error);
      alert(`Network error: ${errorMessage}`);
    }
  };

  const handleEditTitle = async (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    
    if (!user.userId) {
      alert('User ID is missing. Please try logging out and back in.');
      return;
    }
    
    console.log('Attempting to update title:', { sessionId, newTitle: newTitle.trim(), userId: user.userId });
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/chat/sessions/${sessionId}/title`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-User-Id': user.userId.toString()
        },
        body: JSON.stringify({ title: newTitle.trim() })
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Update successful:', responseData);
        window.location.reload();
      } else {
        const errorText = await response.text();
        console.error('Update failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        alert(`Failed to update title: ${response.status} ${response.statusText}\n${errorText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Network error:', error);
      alert(`Network error: ${errorMessage}`);
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
      {/* Mobile Overlay - only show on mobile when sidebar is open */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleVisiblity}
        ></div>
      )}
      
      {/* Sidebar - Fixed positioning logic */}
      <div
        className={`${
          isVisible ? "translate-x-0" : "-translate-x-full"
        } fixed top-0 left-0 h-full w-80 bg-white dark:bg-background2-dark border-r border-gray-300 dark:border-gray-700 shadow-lg z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:transform-none lg:translate-x-0 lg:shadow-none`}
      >
        <div className="flex flex-col h-full py-4 px-4 gap-4 overflow-y-auto">
          {/* Header - No X button */}
          <div className="flex items-center justify-between w-full">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex-1">Chat History</h2>
          </div>
          
          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="!w-full !bg-blue-500 !text-white py-2 px-4 rounded-lg hover:!bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-2"
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
                                className="text-xs !bg-blue-500 !text-white px-2 py-1 rounded hover:!bg-blue-600 !w-auto"
                                type="button"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="text-xs !bg-gray-300 !text-gray-700 px-2 py-1 rounded hover:!bg-gray-400 !w-auto"
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
                          {/* Edit Button - Fixed icon */}
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
                              handleSoftDelete(session.id);
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
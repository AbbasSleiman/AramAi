// Fixed SideBar component - Remove lg:hidden to show overlay on all screen sizes
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../lib/store/store";

interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  state?: string;
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
  const [currentView, setCurrentView] = useState<'ongoing' | 'archived'>('ongoing');
  const [archivedSessions, setArchivedSessions] = useState<ChatSession[]>([]);
  const [isLoadingArchives, setIsLoadingArchives] = useState<boolean>(false);
  
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

  // Load archived sessions when switching to archived view
  const loadArchivedSessions = async () => {
    if (!user.userId) {
      console.warn('⚠️ No user ID available for loading archived sessions');
      return;
    }
    
    setIsLoadingArchives(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/chat/sessions/archived`, {
        headers: {
          'X-User-Id': user.userId,
        },
      });
      if (response.ok) {
        const sessions = await response.json();
        setArchivedSessions(sessions);
        console.log('✅ Loaded archived sessions:', sessions.length);
      } else {
        console.error('Failed to load archived sessions');
      }
    } catch (error) {
      console.error('Error loading archived sessions:', error);
    } finally {
      setIsLoadingArchives(false);
    }
  };

  // Load archived sessions when view changes to archived
  useEffect(() => {
    if (currentView === 'archived') {
      loadArchivedSessions();
    }
  }, [currentView, user.userId]);

  const handleSoftDelete = async (sessionId: string) => {
    if (!user.userId) {
      alert('User ID is missing. Please try logging out and back in.');
      return;
    }

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

  const handleArchive = async (sessionId: string) => {
    if (!user.userId) {
      alert('User ID is missing. Please try logging out and back in.');
      return;
    }

    if (!confirm('Are you sure you want to archive this chat?')) {
      return;
    }
    
    console.log('Attempting to archive session:', { sessionId, userId: user.userId });
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/chat/sessions/${sessionId}/archive`, {
        method: 'PUT',
        headers: { 
          'X-User-Id': user.userId.toString()
        }
      });
      
      console.log('Archive response status:', response.status);
      
      if (response.ok) {
        console.log('Session archived successfully');
        window.location.reload(); // Refresh to update the list
      } else {
        const errorText = await response.text();
        console.error('Archive failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        alert(`Failed to archive chat: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Network error:', error);
      alert(`Network error: ${errorMessage}`);
    }
  };

  const handleRestore = async (sessionId: string) => {
    if (!user.userId) {
      alert('User ID is missing. Please try logging out and back in.');
      return;
    }

    if (!confirm('Are you sure you want to restore this chat?')) {
      return;
    }
    
    console.log('Attempting to restore session:', { sessionId, userId: user.userId });
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/chat/sessions/${sessionId}/restore`, {
        method: 'PUT',
        headers: { 
          'X-User-Id': user.userId.toString()
        }
      });
      
      console.log('Restore response status:', response.status);
      
      if (response.ok) {
        console.log('Session restored successfully');
        // Refresh archived sessions and switch to ongoing view
        await loadArchivedSessions();
        setCurrentView('ongoing');
        window.location.reload(); // Refresh to update the ongoing list
      } else {
        const errorText = await response.text();
        console.error('Restore failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        alert(`Failed to restore chat: ${response.status} ${response.statusText}`);
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
        
        // Refresh appropriate list based on current view
        if (currentView === 'archived') {
          await loadArchivedSessions();
        } else {
          window.location.reload();
        }
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

  const getCurrentSessions = () => {
    return currentView === 'ongoing' ? chatSessions : archivedSessions;
  };

  const getEmptyMessage = () => {
    if (currentView === 'ongoing') {
      return {
        primary: "No chats yet",
        secondary: "Start your first conversation!"
      };
    } else {
      return {
        primary: "No archived chats",
        secondary: "Archive chats to organize your conversations"
      };
    }
  };

  return (
    <>
      {/* Overlay - FIXED: Removed lg:hidden so it shows on all screen sizes */}
      {isVisible && (
        <div 
          className="fixed inset-0 bg-black z-40"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={toggleVisiblity}
        ></div>
      )}
      
      {/* Sidebar - Fixed positioning logic */}
      <div
        className={`${
          isVisible ? "translate-x-0" : "-translate-x-full"
        } fixed top-0 left-0 h-full w-80 bg-white dark:bg-background2-dark border-r border-gray-300 dark:border-gray-700 shadow-lg z-50 transform transition-transform duration-300 ease-in-out`}
      >
        <div className="flex flex-col h-full py-4 px-4 gap-4 overflow-y-auto">
          {/* Header with View Toggle */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Chat Management</h2>
            
            {/* View Toggle Buttons */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setCurrentView('ongoing')}
                className={`flex-1 !py-1 !px-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'ongoing'
                    ? '!bg-white dark:!bg-gray-700 !text-gray-900 dark:!text-white shadow-sm'
                    : '!bg-transparent dark:!bg-transparent !text-gray-600 dark:!text-gray-200 hover:!text-gray-900 dark:hover:!text-white hover:!bg-gray-50 dark:hover:!bg-gray-600'
                }`}
                type="button"
              >
                Active ({chatSessions.length})
              </button>
              <button
                onClick={() => setCurrentView('archived')}
                className={`flex-1 !py-1 !px-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === 'archived'
                    ? '!bg-white dark:!bg-gray-700 !text-gray-900 dark:!text-white shadow-sm'
                    : '!bg-transparent dark:!bg-transparent !text-gray-600 dark:!text-gray-200 hover:!text-gray-900 dark:hover:!text-white hover:!bg-gray-50 dark:hover:!bg-gray-600'
                }`}
                type="button"
              >
                Archived ({archivedSessions.length})
              </button>
            </div>
          </div>
          
          {/* New Chat Button - Only show in ongoing view */}
          {currentView === 'ongoing' && (
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
          )}

          {/* Chat Sessions List */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingArchives && currentView === 'archived' ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p>Loading archived chats...</p>
              </div>
            ) : getCurrentSessions().length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <p>{getEmptyMessage().primary}</p>
                <p className="text-sm">{getEmptyMessage().secondary}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {getCurrentSessions().map((session) => (
                  <div
                    key={session.id}
                    className={`group relative rounded-lg p-3 cursor-pointer transition-colors duration-200 ${
                      currentSessionId === session.id && currentView === 'ongoing'
                        ? 'bg-blue-50 border border-blue-200 dark:bg-blue-900 dark:border-blue-700' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    } ${currentView === 'archived' ? 'opacity-75' : ''}`}
                    onClick={() => {
                      if (currentView === 'ongoing') {
                        onSessionSelect(session.id);
                      }
                      // For archived sessions, we don't allow selection for now
                    }}
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
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {session.title}
                              </h3>
                              {currentView === 'archived' && (
                                <span className="text-xs bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                                  Archived
                                </span>
                              )}
                            </div>
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

                          {/* Archive/Restore Button */}
                          {currentView === 'ongoing' ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchive(session.id);
                              }}
                              className="p-1 rounded bg-white dark:bg-gray-800 hover:bg-yellow-50 dark:hover:bg-yellow-900 text-gray-500 dark:text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-300 transition-colors border border-transparent hover:border-yellow-200 dark:hover:border-yellow-700"
                              title="Archive chat"
                              type="button"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestore(session.id);
                              }}
                              className="p-1 rounded bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-green-900 text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-300 transition-colors border border-transparent hover:border-green-200 dark:hover:border-green-700"
                              title="Restore chat"
                              type="button"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                              </svg>
                            </button>
                          )}

                          {/* Delete Button */}
                          {currentView === 'ongoing' && (
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
                          )}
                        </div>
                      )}
                    </div>

                    {currentSessionId === session.id && currentView === 'ongoing' && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help Text for Archived View */}
          {currentView === 'archived' && archivedSessions.length > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              Archived chats are preserved but not active. You can restore them to make them active again.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default SideBar;
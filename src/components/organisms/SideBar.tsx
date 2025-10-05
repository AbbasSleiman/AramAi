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
  onNewChat,
}: SideBarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");
  const [currentView, setCurrentView] = useState<"ongoing" | "archived">(
    "ongoing"
  );
  const [archivedSessions, setArchivedSessions] = useState<ChatSession[]>([]);
  const [isLoadingArchives, setIsLoadingArchives] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const user = useSelector((state: RootState) => state.user);

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const loadArchivedSessions = async () => {
    if (!user.db_id) return;
    setIsLoadingArchives(true);
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/chat/sessions/archived`,
        {
          headers: { "X-User-Id": user.db_id },
        }
      );
      if (response.ok) {
        const sessions = await response.json();
        setArchivedSessions(sessions);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingArchives(false);
    }
  };

  useEffect(() => {
    if (currentView === "archived") loadArchivedSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentView, user.db_id]);

  const handleSoftDelete = async (sessionId: string) => {
    if (!user.db_id) return alert("User ID missing. Please relog.");
    if (!confirm("Delete this chat?")) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/chat/sessions/${sessionId}`,
        {
          method: "DELETE",
          headers: { "X-User-Id": user.db_id.toString() },
        }
      );
      if (res.ok) {
        window.location.reload();
      } else {
        alert(`Failed to delete: ${res.status} ${res.statusText}`);
      }
    } catch (e) {
      alert("Network error");
    }
  };

  const handleArchive = async (sessionId: string) => {
    if (!user.db_id) return alert("User ID missing. Please relog.");
    if (!confirm("Archive this chat?")) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/chat/sessions/${sessionId}/archive`,
        {
          method: "PUT",
          headers: { "X-User-Id": user.db_id.toString() },
        }
      );
      if (res.ok) {
        window.location.reload();
      } else {
        alert(`Failed to archive: ${res.status} ${res.statusText}`);
      }
    } catch {
      alert("Network error");
    }
  };

  const handleRestore = async (sessionId: string) => {
    if (!user.db_id) return alert("User ID missing. Please relog.");
    if (!confirm("Restore this chat?")) return;
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/chat/sessions/${sessionId}/restore`,
        {
          method: "PUT",
          headers: { "X-User-Id": user.db_id.toString() },
        }
      );
      if (res.ok) {
        await loadArchivedSessions();
        setCurrentView("ongoing");
        window.location.reload();
      } else {
        alert(`Failed to restore: ${res.status} ${res.statusText}`);
      }
    } catch {
      alert("Network error");
    }
  };

  const handleEditTitle = async (sessionId: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    if (!user.db_id) return alert("User ID missing. Please relog.");
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/chat/sessions/${sessionId}/title`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-User-Id": user.db_id.toString(),
          },
          body: JSON.stringify({ title: newTitle.trim() }),
        }
      );
      if (res.ok) {
        if (currentView === "archived") await loadArchivedSessions();
        else window.location.reload();
      } else {
        const t = await res.text();
        alert(`Failed to update title: ${res.status} ${res.statusText}\n${t}`);
      }
    } catch {
      alert("Network error");
    }
    setEditingId(null);
    setEditTitle("");
  };

  const startEditing = (s: ChatSession) => {
    setEditingId(s.id);
    setEditTitle(s.title);
  };
  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const getCurrentSessions = () => {
    const sessions =
      currentView === "ongoing" ? chatSessions : archivedSessions;
    if (!searchQuery.trim()) return sessions;
    return sessions.filter((s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span
          key={i}
          className="!bg-yellow-200 dark:!bg-yellow-600 !text-text dark:!text-text-dark"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const getEmptyMessage = () => {
    if (searchQuery.trim() && getCurrentSessions().length === 0) {
      return {
        primary: "No matching results",
        secondary: "Try different keywords",
      };
    }
    return currentView === "ongoing"
      ? { primary: "No chats yet", secondary: "Start your first conversation!" }
      : {
          primary: "No archived chats",
          secondary: "Archive chats to organize",
        };
  };

  return (
    <>
      {/* Overlay */}
      {isVisible && (
        <div
          className="fixed inset-0 z-40"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={toggleVisiblity}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out
        ${isVisible ? "translate-x-0" : "-translate-x-full"}
        bg-background dark:bg-background2-dark dark:border-background shadow-xl`}
      >
        <div className="flex flex-col h-full py-4 px-4 gap-4 overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-outfit font-semibold text-text dark:text-text-dark">
              Chat Management
            </h2>

            {/* View Toggle */}
            <div className="flex bg-third dark:bg-background rounded-lg p-1">
              <button
                onClick={() => setCurrentView("ongoing")}
                type="button"
                className={`flex-1 py-2 px-3 rounded-md text-sm font-roboto transition-colors
                ${
                  currentView === "ongoing"
                    ? "bg-background dark:bg-background2-dark text-text dark:text-white shadow-sm"
                    : "text-text dark:text-background-dark hover:bg-third dark:hover:bg-third bg-third"
                }`}
              >
                Active ({chatSessions.length})
              </button>
              <button
                onClick={() => setCurrentView("archived")}
                type="button"
                className={`flex-1 py-2 px-3 rounded-md text-sm font-roboto transition-colors
                ${
                  currentView === "archived"
                    ? "bg-background dark:bg-background2-dark text-text dark:text-white shadow-sm"
                    : "text-text dark:text-background-dark hover:bg-third dark:hover:bg-third bg-third"
                }`}
              >
                Archived ({archivedSessions.length})
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${currentView} chats...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text dark:text-text-dark/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* New Chat (ongoing only) */}
          {currentView === "ongoing" && (
            <button
              onClick={onNewChat}
              type="button"
              className="button-styled w-full flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              New Chat
            </button>
          )}

          {/* Lists */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingArchives && currentView === "archived" ? (
              <div className="text-center text-text dark:text-text-dark/80 mt-8">
                <div className="animate-spin h-6 w-6 border-2 border-background2-dark dark:border-background border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm">Loading archived chats…</p>
              </div>
            ) : getCurrentSessions().length === 0 ? (
              <div className="text-center text-text dark:text-text-dark/80 mt-8">
                <p className="font-roboto">{getEmptyMessage().primary}</p>
                <p className="text-sm opacity-80">
                  {getEmptyMessage().secondary}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {getCurrentSessions().map((session) => (
                  <div
                    key={session.id}
                    className={`group relative rounded-lg p-3 cursor-pointer transition-colors
                      ${
                        currentSessionId === session.id &&
                        currentView === "ongoing"
                          ? "bg-third border border-secondary dark:bg-background dark:border-background"
                          : "hover:bg-third dark:hover:bg-background-dark"
                      }
                      ${currentView === "archived" ? "opacity-80" : ""}`}
                    onClick={() => {
                      if (currentView === "ongoing")
                        onSessionSelect(session.id);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        {editingId === session.id ? (
                          <div
                            className="space-y-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="w-full text-sm font-roboto"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleEditTitle(session.id, editTitle);
                                else if (e.key === "Escape") cancelEditing();
                              }}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleEditTitle(session.id, editTitle)
                                }
                                className="thin-button !w-auto text-xs"
                                type="button"
                              >
                                Save
                              </button>
                              <button
                                onClick={cancelEditing}
                                className="thin-button !w-auto text-xs"
                                type="button"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-roboto font-medium text-text dark:text-text-dark truncate">
                                {highlightText(session.title, searchQuery)}
                              </h3>
                              {currentView === "archived" && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-third dark:bg-background text-text dark:text-text-dark">
                                  Archived
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-roboto text-text dark:text-text-dark/70 mt-1">
                              {formatDate(session.updated_at)}
                            </p>
                          </>
                        )}
                      </div>

                      {editingId !== session.id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Edit */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditing(session);
                            }}
                            className="hoverable-box"
                            title="Edit title"
                            type="button"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          {/* Archive / Restore */}
                          {currentView === "ongoing" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchive(session.id);
                              }}
                              className="hoverable-box"
                              title="Archive chat"
                              type="button"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
                                />
                              </svg>
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestore(session.id);
                              }}
                              className="hoverable-box"
                              title="Restore chat"
                              type="button"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                                />
                              </svg>
                            </button>
                          )}

                          {/* Delete (ongoing only) */}
                          {currentView === "ongoing" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSoftDelete(session.id);
                              }}
                              className="hoverable-box"
                              title="Delete chat"
                              type="button"
                            >
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {currentSessionId === session.id &&
                      currentView === "ongoing" && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-background-dark dark:bg-secondary rounded-r"></div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Archived hint */}
          {currentView === "archived" && archivedSessions.length > 0 && (
            <div className="text-xs text-text dark:text-text-dark/80 text-center p-2 bg-third dark:bg-background rounded-lg">
              Archived chats are preserved but not active. Restore to make them
              active again.
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default SideBar;

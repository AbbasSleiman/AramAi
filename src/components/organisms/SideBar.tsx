import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../lib/store/store";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, Pencil, Archive, Undo2, Trash2 } from "lucide-react";

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
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.45 }}
            exit={{ opacity: 0 }}
            onClick={toggleVisiblity}
            style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isVisible && (
          <motion.aside
            key="sidebar"
            initial={{ x: -320, opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 320, damping: 30 }}
            className="fixed top-0 left-0 h-full w-80 z-50 bg-background dark:bg-background2-dark dark:border-background shadow-xl"
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
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-roboto transition-colors ${
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
                    className={`flex-1 py-2 px-3 rounded-md text-sm font-roboto transition-colors ${
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
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text dark:text-text-dark/70" />
                </div>
              </div>

              {/* New Chat (ongoing only) */}
              {currentView === "ongoing" && (
                <button
                  onClick={onNewChat}
                  type="button"
                  className="button-styled w-full flex items-center justify-center gap-2 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
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
                      <motion.div
                        layout
                        key={session.id}
                        className={`group relative rounded-lg p-3 cursor-pointer transition-colors ${
                          currentSessionId === session.id &&
                          currentView === "ongoing"
                            ? "bg-third dark:bg-secondary-dark dark:text-text"
                            : "hover:bg-third dark:hover:bg-background-dark "
                        } ${currentView === "archived" ? "opacity-80" : ""}`}
                        onClick={() => {
                          if (currentView === "ongoing")
                            onSessionSelect(session.id);
                        }}
                        whileHover={{ scale: 1.01 }}
                        transition={{
                          type: "spring",
                          stiffness: 260,
                          damping: 20,
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
                                    else if (e.key === "Escape")
                                      cancelEditing();
                                  }}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleEditTitle(session.id, editTitle)
                                    }
                                    className="thin-button !w-auto text-xs rounded-lg"
                                    type="button"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEditing}
                                    className="thin-button !w-auto text-xs rounded-lg"
                                    type="button"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <h3 className="text-sm font-roboto font-medium text-text dark:text-third truncate">
                                    {highlightText(session.title, searchQuery)}
                                  </h3>
                                  {currentView === "archived" && (
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-third dark:bg-background text-text dark:text-text">
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
                                <Pencil className="w-3.5 h-3.5" />
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
                                  <Archive className="w-3.5 h-3.5" />
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
                                  <Undo2 className="w-3.5 h-3.5" />
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
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        {currentSessionId === session.id &&
                          currentView === "ongoing" && (
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-background-dark dark:bg-secondary rounded-r"></div>
                          )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Archived hint */}
              {currentView === "archived" && archivedSessions.length > 0 && (
                <div className="text-xs text-text text-center p-2 bg-third dark:bg-background dark:text-text rounded-lg">
                  Archived chats are preserved but not active. Restore to make
                  them active again.
                </div>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
};

export default SideBar;

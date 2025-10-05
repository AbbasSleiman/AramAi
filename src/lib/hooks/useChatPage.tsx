import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import { API_BASE_URL } from "../api/config";
import {
  createLocalTimestamp,
  formatRelativeTime,
} from "../helpers/TimeFunctions";

export interface FeedbackData {
  avg_rating: number | null;
  comments_count: number;
  user_rating: number | null;
  user_comment?: string | null;
}

export interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: string;
  metadata?: {
    generation_params?: {
      max_new_tokens: number;
      num_beams: number;
    };
  };
  reaction?: "like" | "dislike" | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  generation_time_ms?: number | null;
  feedbackSummary?: FeedbackData;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  state?: string;
  messages: Message[];
}

export function useChatPage() {
  // Redux user
  const user = useSelector((s: RootState) => s.user);

  // UI & data state
  const [sideBarOpened, setSideBarOpened] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(
    null
  );
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Typing effect
  const [isTyping, setIsTyping] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState("");

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const userId = useMemo(() => user?.db_id ?? null, [user?.db_id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages, displayedText]);

  // Load sessions when user ready
  useEffect(() => {
    if (userId) void loadChatSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Cleanup typing timer
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  // Handle viewing archived session
  useEffect(() => {
    if (currentSession?.state === "archived") {
      setCurrentSession(null);
      setError(
        "This chat has been archived. Please select an active chat or start a new one."
      );
    }
  }, [currentSession?.state]);

  const handleSideBar = () => setSideBarOpened((p) => !p);

  // ---- API helpers ----
  const loadChatSessions = async () => {
    if (!userId) return;
    try {
      const r = await fetch(`${API_BASE_URL}/chat/sessions`, {
        headers: { "X-User-Id": userId },
      });
      if (!r.ok) throw new Error("Failed to load chat sessions");
      const sessions: ChatSession[] = await r.json();
      setChatSessions(sessions);
    } catch (e) {
      console.error(e);
    }
  };

  const createNewSession = async (): Promise<ChatSession | null> => {
    if (!userId) return null;
    try {
      const r = await fetch(`${API_BASE_URL}/chat/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-User-Id": userId },
        body: JSON.stringify({ title: "New Chat" }),
      });
      if (!r.ok) throw new Error("Failed to create session");
      const s: ChatSession = await r.json();
      setCurrentSession(s);
      setChatSessions((prev) => [s, ...prev]);
      return s;
    } catch (e) {
      console.error(e);
      setError("Failed to create new session");
      return null;
    }
  };

  const hydrateFeedbackSummaries = async (
    session: ChatSession
  ): Promise<ChatSession> => {
    if (!userId) return session;
    const assistantMsgs = session.messages.filter(
      (m) => m.type === "assistant"
    );

    try {
      const results = await Promise.all(
        assistantMsgs.map(async (m) => {
          try {
            const res = await fetch(
              `${API_BASE_URL}/chat/messages/${m.id}/feedback`,
              { headers: { "X-User-Id": userId } }
            );
            if (!res.ok) return null;
            const data = await res.json();
            return { id: m.id, data };
          } catch {
            return null;
          }
        })
      );

      const map = new Map<string, FeedbackData>();
      results.forEach((r) => {
        if (r?.id) map.set(r.id, r.data);
      });

      return {
        ...session,
        messages: session.messages.map((m) => {
          if (m.type !== "assistant") return m;
          const d = map.get(m.id);
          return {
            ...m,
            feedbackSummary: d
              ? {
                  avg_rating: d?.avg_rating ?? null,
                  comments_count: d?.comments_count ?? 0,
                  user_rating: d?.user_rating ?? null,
                  user_comment: d?.user_comment ?? null,
                }
              : {
                  avg_rating: null,
                  comments_count: 0,
                  user_rating: null,
                  user_comment: null,
                },
          };
        }),
      };
    } catch {
      return session;
    }
  };

  const loadSession = async (sessionId: string) => {
    if (!userId) return;
    try {
      const r = await fetch(`${API_BASE_URL}/chat/sessions/${sessionId}`, {
        headers: { "X-User-Id": userId },
      });
      if (r.status === 404) {
        setCurrentSession(null);
        setError(
          "This chat is no longer available. It may have been archived or deleted."
        );
        return;
      }
      if (!r.ok) throw new Error("Failed to load session");
      const s: ChatSession = await r.json();
      if (s.state === "archived") {
        setCurrentSession(null);
        setError(
          "This chat has been archived. Please select an active chat or start a new one."
        );
        return;
      }
      setCurrentSession(await hydrateFeedbackSummaries(s));
    } catch (e) {
      console.error(e);
      setError("Error loading session");
    }
  };

  const simulateTyping = (
    text: string,
    messageId: string,
    onComplete: () => void
  ) => {
    setIsTyping(true);
    setTypingMessageId(messageId);
    setDisplayedText("");

    let i = 0;
    const speed = 30;
    const tick = () => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
        typingTimeoutRef.current = setTimeout(tick, speed);
      } else {
        setIsTyping(false);
        setTypingMessageId(null);
        setDisplayedText("");
        onComplete();
      }
    };
    tick();
  };

  const refreshMessageFeedback = async (messageId: string) => {
    if (!userId) return;
    try {
      const r = await fetch(
        `${API_BASE_URL}/chat/messages/${messageId}/feedback`,
        {
          headers: { "X-User-Id": userId },
        }
      );
      if (!r.ok) return;
      const data = await r.json();
      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === messageId
                  ? {
                      ...m,
                      feedbackSummary: {
                        avg_rating: data?.avg_rating ?? null,
                        comments_count: data?.comments_count ?? 0,
                        user_rating: data?.user_rating ?? null,
                        user_comment: data?.user_comment ?? null,
                      },
                    }
                  : m
              ),
            }
          : prev
      );
    } catch {
      // ignore
    }
  };

  const handleReactionUpdate = async (
    messageId: string,
    reaction: "like" | "dislike" | null
  ) => {
    if (!userId) return;
    try {
      const r = await fetch(
        `${API_BASE_URL}/chat/messages/${messageId}/reaction`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json", "X-User-Id": userId },
          body: JSON.stringify({ reaction }),
        }
      );
      if (!r.ok) throw new Error(await r.text());
      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((m) =>
                m.id === messageId ? { ...m, reaction } : m
              ),
            }
          : prev
      );
    } catch (e) {
      console.error(e);
      setError("Failed to update reaction. Please try again.");
    }
  };

  const handleRatingSubmit = async (
    messageId: string,
    rating: number,
    comment: string,
    feedbackType: string
  ) => {
    if (!userId) return;
    try {
      const r = await fetch(
        `${API_BASE_URL}/chat/messages/${messageId}/comment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-User-Id": userId },
          body: JSON.stringify({
            rating,
            comment: comment || null,
            feedback_type: feedbackType,
          }),
        }
      );
      if (!r.ok) throw new Error(await r.text());

      // optimistic update
      setCurrentSession((prev) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((m) => {
                if (m.id !== messageId) return m;
                const prevCount = m.feedbackSummary?.comments_count ?? 0;
                const had =
                  (m.feedbackSummary?.user_comment?.trim()?.length ?? 0) > 0;
                const will = (comment?.trim()?.length ?? 0) > 0;
                const nextCount = prevCount + (will && !had ? 1 : 0);
                return {
                  ...m,
                  feedbackSummary: {
                    avg_rating: m.feedbackSummary?.avg_rating ?? rating,
                    comments_count: nextCount,
                    user_rating: rating,
                    user_comment: comment || null,
                  },
                };
              }),
            }
          : prev
      );

      await refreshMessageFeedback(messageId);
    } catch (e) {
      console.error(e);
      setError("Failed to submit rating. Please try again.");
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
      setTypingMessageId(null);
      setDisplayedText("");
    }
    void loadSession(sessionId);
  };

  const handleNewChat = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
      setTypingMessageId(null);
      setDisplayedText("");
    }
    void createNewSession();
  };

  const sendMessage = async (message: string) => {
    if (!message.trim() || !userId) return;
    if (currentSession?.state === "archived") {
      setError(
        "Cannot send messages to archived chats. Please restore the chat first."
      );
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ensure session
      let session = currentSession;
      if (!session) {
        session = await createNewSession();
        if (!session) return;
      }
      if (session.state === "archived") {
        setError(
          "Cannot send messages to archived chats. Please restore the chat first."
        );
        setIsLoading(false);
        return;
      }

      const userMsg: Message = {
        id: Date.now().toString() + "_user",
        type: "user",
        content: message,
        timestamp: createLocalTimestamp(),
        input_tokens: Math.max(
          1,
          message.split(" ").length + Math.floor(message.length / 4)
        ),
        output_tokens: null,
        generation_time_ms: null,
      };

      setCurrentSession((prev) =>
        prev ? { ...prev, messages: [...prev.messages, userMsg] } : prev
      );

      // ask model
      const estimatedTokens = Math.round(Math.max(150, message.length * 2.5));
      const aiRes = await fetch(`${API_BASE_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
          input_text: message,
          max_new_tokens: estimatedTokens,
          num_beams: 2,
        }),
      });
      if (!aiRes.ok) throw new Error("Failed to get AI response");
      const ai = await aiRes.json();

      const assistantMsg: Message = {
        id: Date.now().toString() + "_assistant",
        type: "assistant",
        content: ai.output_text,
        timestamp: createLocalTimestamp(),
        metadata: { generation_params: ai.generation_params },
        reaction: null,
        input_tokens: null,
        output_tokens: ai.performance_metrics?.output_tokens || null,
        generation_time_ms: ai.performance_metrics?.generation_time_ms || null,
        feedbackSummary: {
          avg_rating: null,
          comments_count: 0,
          user_rating: null,
          user_comment: null,
        },
      };

      // typing effect: push empty first
      const emptyAssistant = { ...assistantMsg, content: "" };
      setCurrentSession((prev) =>
        prev ? { ...prev, messages: [...prev.messages, emptyAssistant] } : prev
      );

      setIsLoading(false);

      simulateTyping(ai.output_text, assistantMsg.id, async () => {
        setCurrentSession((prev) =>
          prev
            ? {
                ...prev,
                messages: prev.messages.map((m) =>
                  m.id === assistantMsg.id ? assistantMsg : m
                ),
              }
            : prev
        );

        // persist
        try {
          const save = await fetch(
            `${API_BASE_URL}/chat/sessions/${session!.id}/messages`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-User-Id": userId,
              },
              body: JSON.stringify({ messages: [userMsg, assistantMsg] }),
            }
          );
          if (!save.ok) throw new Error("Failed to save messages");

          // bump session list updated_at locally
          setChatSessions((prev) =>
            prev.map((s) =>
              s.id === session!.id
                ? { ...s, updated_at: createLocalTimestamp() }
                : s
            )
          );
          await refreshMessageFeedback(assistantMsg.id);
        } catch (e) {
          console.error(e);
          setError("Failed to save messages");
        }
      });
    } catch (e) {
      console.error(e);
      setError("Failed to send message. Please try again.");
      setIsLoading(false);

      const errMsg: Message = {
        id: Date.now().toString() + "_error",
        type: "assistant",
        content:
          "Sorry, I encountered an error while processing your request. Please try again.",
        timestamp: createLocalTimestamp(),
      };
      setCurrentSession((prev) =>
        prev ? { ...prev, messages: [...prev.messages, errMsg] } : prev
      );
    }
  };

  return {
    // state
    sideBarOpened,
    currentSession,
    chatSessions,
    isLoading,
    error,
    isTyping,
    typingMessageId,
    displayedText,

    // refs & utils
    messagesEndRef,
    scrollToBottom,
    formatRelativeTime,
    createLocalTimestamp,

    createNewSession,

    // setters
    setSideBarOpened,
    setError,

    // handlers
    handleSideBar,
    handleSessionSelect,
    handleNewChat,
    handleReactionUpdate,
    handleRatingSubmit,
    refreshMessageFeedback,
    sendMessage,
  };
}

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../lib/store/store";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/atoms/Logo";
import ChangeThemeBtn from "../components/atoms/clickeable/ChangeThemeBtn";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase/firebaseConfig";
import { API_BASE_URL } from "../lib/api/config";

interface DashboardStats {
  total_users: number;
  new_users_30d: number;
  new_users_7d: number;
  active_sessions: number;
  archived_sessions: number;
  deleted_sessions: number;
  new_sessions_30d: number;
  total_messages: number;
  user_messages: number;
  assistant_messages: number;
  new_messages_30d: number;
  total_input_tokens: number;
  total_output_tokens: number;
  avg_output_tokens: number;
  avg_generation_time: number;
  max_generation_time: number;
  total_likes: number;
  total_dislikes: number;
  total_comments: number;
  avg_rating: number;
  users_who_commented: number;
  active_admins: number;
  admin_actions_30d: number;
}

interface RatingsDistribution {
  one: number;
  two: number;
  three: number;
  four: number;
  five: number;
}

interface RecentFeedbackItem {
  message_id: string;
  session_id: string;
  user_id: string;
  rating: number | null;
  comment: string | null;
  created_at: string; // ISO
  message_preview?: string | null;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ratingsDist, setRatingsDist] = useState<RatingsDistribution | null>(
    null
  );
  const [recentFeedback, setRecentFeedback] = useState<RecentFeedbackItem[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  const loadDashboardStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: {
          "X-User-Id": user.db_id || "",
        },
      });

      if (response.ok) {
        const data: DashboardStats = await response.json();
        setStats(data);
      } else if (response.status === 403) {
        setError("Access denied. Admin privileges required.");
        setTimeout(() => navigate("/chat"), 1500);
      } else {
        setError("Failed to load dashboard statistics");
      }
    } catch {
      setError("Network error while loading dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [user.db_id, navigate]);

  const loadRatingsDistribution = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/dashboard/ratings-distribution`,
        {
          headers: { "X-User-Id": user.db_id || "" },
        }
      );
      if (!res.ok) return;
      const data: RatingsDistribution = await res.json();
      setRatingsDist(data);
    } catch {
      /* noop */
    }
  }, [user.db_id]);

  const loadRecentFeedback = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/admin/dashboard/recent-feedback?limit=12`,
        {
          headers: { "X-User-Id": user.db_id || "" },
        }
      );
      if (!res.ok) return;
      const data: RecentFeedbackItem[] = await res.json();
      setRecentFeedback(Array.isArray(data) ? data : []);
    } catch {
      /* noop */
    }
  }, [user.db_id]);

  const handleRefresh = () => {
    loadDashboardStats();
    loadRatingsDistribution();
    loadRecentFeedback();
  };

  useEffect(() => {
    if (!user.db_id) {
      navigate("/login");
      return;
    }
    loadDashboardStats();
    loadRatingsDistribution();
    loadRecentFeedback();
  }, [
    user.db_id,
    navigate,
    loadDashboardStats,
    loadRatingsDistribution,
    loadRecentFeedback,
  ]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch {
      /* noop */
    }
  };

  // Panel wrapper
  const Panel: React.FC<{
    className?: string;
    title?: string;
    children: React.ReactNode;
  }> = ({ className = "", title, children }) => (
    <div
      className={[
        "rounded-xl shadow",
        "bg-third dark:bg-background2-dark",
        "border border-secondary dark:border-background-dark/40",
        "hover-raise moving-sheen", // <-- add
        className,
      ].join(" ")}
    >
      {title ? (
        <div className="px-5 py-3 border-b border-secondary dark:border-background-dark/40">
          <h2 className="text-base font-outfit">{title}</h2>
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </div>
  );

  // StatCard
  const StatCard = ({
    title,
    value,
    subtext,
  }: {
    title: string;
    value: number | string;
    subtext?: string;
  }) => (
    <div
      className={[
        "rounded-xl p-5 shadow",
        "bg-third dark:bg-background2-dark",
        "border border-secondary dark:border-background-dark/40",
        "hover-raise moving-sheen", // <-- add
      ].join(" ")}
    >
      <p className="text-sm opacity-70">{title}</p>
      <p className="text-2xl font-outfit mt-1">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {subtext ? <p className="text-xs opacity-60 mt-1">{subtext}</p> : null}
    </div>
  );

  const StarRow = ({ value }: { value: number }) => {
    const v = Math.max(0, Math.min(5, Math.round(value)));
    return (
      <span className="font-mono">
        {"★★★★★".slice(0, v)}
        {"☆☆☆☆☆".slice(0, 5 - v)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-background-dark">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-text dark:border-text-dark border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading admin dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background dark:bg-background-dark">
        <div className="text-center space-y-4">
          <p className="error">{error}</p>
          <button
            onClick={() => navigate("/chat")}
            className="button-styled !w-auto px-6 py-2 rounded-lg"
          >
            Go to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark">
      {/* Header */}
      <div className="border-b border-secondary dark:border-background-dark/40 bg-background dark:bg-background2-dark">
        <div className="px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/">
                <Logo />
              </Link>
              <h1>Admin Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <ChangeThemeBtn />
              <button
                onClick={handleRefresh}
                className="thin-button !w-auto rounded-lg px-4 py-2"
              >
                Refresh Data
              </button>
              <button
                onClick={() => navigate("/chat")}
                className="thin-button !w-auto rounded-lg px-4 py-2"
              >
                Go to Chat
              </button>
              <button
                onClick={handleLogout}
                className="button-styled !w-auto rounded-lg px-4 py-2"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="px-6 py-8 max-w-7xl mx-auto space-y-8">
        {/* Overview */}
        <section>
          <h2 className="mb-4">Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={stats?.total_users ?? 0}
              subtext={`+${stats?.new_users_7d ?? 0} this week`}
            />
            <StatCard
              title="Active Sessions"
              value={stats?.active_sessions ?? 0}
              subtext={`${stats?.archived_sessions ?? 0} archived`}
            />
            <StatCard
              title="Total Messages"
              value={stats?.total_messages ?? 0}
              subtext={`+${stats?.new_messages_30d ?? 0} last 30 days`}
            />
            <StatCard
              title="Average Rating"
              value={
                typeof stats?.avg_rating === "number"
                  ? stats.avg_rating.toFixed(1)
                  : "0.0"
              }
              subtext={`from ${stats?.users_who_commented ?? 0} users`}
            />
          </div>
        </section>

        {/* Engagement */}
        <section>
          <h2 className="mb-4">User Engagement</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Reactions"
              value={(stats?.total_likes ?? 0) + (stats?.total_dislikes ?? 0)}
              subtext={`👍 ${stats?.total_likes ?? 0} / 👎 ${stats?.total_dislikes ?? 0}`}
            />
            <StatCard
              title="Total Comments"
              value={stats?.total_comments ?? 0}
              subtext={`${stats?.users_who_commented ?? 0} unique users`}
            />
            <StatCard
              title="Like Ratio"
              value={
                typeof stats?.total_likes === "number" &&
                typeof stats?.total_dislikes === "number" &&
                stats.total_likes + stats.total_dislikes > 0
                  ? `${((stats.total_likes / (stats.total_likes + stats.total_dislikes)) * 100).toFixed(1)}%`
                  : "N/A"
              }
              subtext="Positive feedback rate"
            />
          </div>
        </section>

        {/* Performance */}
        <section>
          <h2 className="mb-4">System Performance</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Tokens"
              value={
                (stats?.total_input_tokens ?? 0) +
                (stats?.total_output_tokens ?? 0)
              }
              subtext="Input + Output"
            />
            <StatCard
              title="Avg Output Tokens"
              value={
                typeof stats?.avg_output_tokens === "number"
                  ? stats.avg_output_tokens.toFixed(0)
                  : "0"
              }
              subtext="Per response"
            />
            <StatCard
              title="Avg Generation Time"
              value={`${((stats?.avg_generation_time ?? 0) as number).toFixed(0)}ms`}
              subtext={`Max: ${stats?.max_generation_time ?? 0}ms`}
            />
            <StatCard
              title="Active Admins"
              value={stats?.active_admins ?? 0}
              subtext={`${stats?.admin_actions_30d ?? 0} actions (30d)`}
            />
          </div>
        </section>

        {/* Ratings Distribution */}
        <section>
          <Panel title="Ratings Distribution">
            {!ratingsDist ? (
              <p>Loading ratings…</p>
            ) : (
              <div className="space-y-3">
                {(
                  [
                    { label: "5 stars", value: ratingsDist.five, stars: 5 },
                    { label: "4 stars", value: ratingsDist.four, stars: 4 },
                    { label: "3 stars", value: ratingsDist.three, stars: 3 },
                    { label: "2 stars", value: ratingsDist.two, stars: 2 },
                    { label: "1 star", value: ratingsDist.one, stars: 1 },
                  ] as const
                ).map((row) => {
                  const total =
                    ratingsDist.one +
                      ratingsDist.two +
                      ratingsDist.three +
                      ratingsDist.four +
                      ratingsDist.five || 1;
                  const pct = Math.round((row.value / total) * 100);
                  return (
                    <div key={row.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <StarRow value={row.stars} />
                          <span className="text-sm opacity-70">
                            {row.label}
                          </span>
                        </div>
                        <span className="text-sm">
                          {row.value} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-secondary/50 dark:bg-background-dark/40 rounded h-2 overflow-hidden">
                        <div
                          className="h-2 bg-text dark:bg-text-dark"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Panel>
        </section>

        {/* Recent Feedback */}
        <section>
          <Panel title="Recent Feedback">
            {!recentFeedback.length ? (
              <div className="opacity-70">No recent feedback yet.</div>
            ) : (
              <div className="divide-y divide-secondary dark:divide-background-dark/40">
                {recentFeedback.map((fb) => (
                  <div
                    key={`${fb.session_id}-${fb.message_id}-${fb.created_at}`}
                    className="py-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm opacity-70">
                        <span className="mr-2">Session:</span>
                        <span className="font-mono">
                          {fb.session_id.slice(0, 8)}…
                        </span>
                        <span className="mx-2">•</span>
                        <span>{new Date(fb.created_at).toLocaleString()}</span>
                      </div>
                      {typeof fb.rating === "number" && (
                        <div className="text-sm">
                          <StarRow value={fb.rating} />
                        </div>
                      )}
                    </div>
                    {fb.message_preview && (
                      <div className="mt-2 text-xs opacity-70 dark:text-text-dark">
                        <span className="uppercase tracking-wider ">
                          Message
                        </span>
                        : {fb.message_preview}
                      </div>
                    )}
                    {fb.comment && (
                      <div className="mt-2 dark:text-text-dark">
                        “{fb.comment}”
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </section>

        {/* Detailed Statistics */}
        <section>
          <Panel title="Detailed Statistics">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm opacity-70">
                    New Users (30 days)
                  </span>
                  <span className="text-sm font-medium">
                    {stats?.new_users_30d ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm opacity-70">
                    New Sessions (30 days)
                  </span>
                  <span className="text-sm font-medium">
                    {stats?.new_sessions_30d ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm opacity-70">Deleted Sessions</span>
                  <span className="text-sm font-medium">
                    {stats?.deleted_sessions ?? 0}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm opacity-70">User Messages</span>
                  <span className="text-sm font-medium">
                    {stats?.user_messages ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm opacity-70">Assistant Messages</span>
                  <span className="text-sm font-medium">
                    {stats?.assistant_messages ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm opacity-70">
                    Admin Actions (30 days)
                  </span>
                  <span className="text-sm font-medium">
                    {stats?.admin_actions_30d ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </Panel>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;

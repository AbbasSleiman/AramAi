import { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../lib/store/store";
import { useNavigate } from "react-router-dom";
import Logo from "../components/atoms/Logo";
import ChangeThemeBtn from "../components/atoms/clickeable/ChangeThemeBtn";

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

const API_BASE_URL = "http://127.0.0.1:8000";

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ratingsDist, setRatingsDist] = useState<RatingsDistribution | null>(null);
  const [recentFeedback, setRecentFeedback] = useState<RecentFeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const user = useSelector((state: RootState) => state.user);
  const navigate = useNavigate();

  // Tailwind-safe color classes (avoid dynamic class strings so purge works)
  const colorClasses = useMemo(
    () => ({
      blue: "text-blue-600 dark:text-blue-400",
      green: "text-green-600 dark:text-green-400",
      purple: "text-purple-600 dark:text-purple-400",
      yellow: "text-yellow-600 dark:text-yellow-400",
      red: "text-red-600 dark:text-red-400",
      gray: "text-gray-900 dark:text-white",
    }),
    []
  );

  const loadDashboardStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: {
          "X-User-Id": user.userId || "",
        },
      });

      if (response.ok) {
        const data: DashboardStats = await response.json();
        setStats(data);
      } else if (response.status === 403) {
        setError("Access denied. Admin privileges required.");
        setTimeout(() => navigate("/chat"), 2000);
      } else {
        setError("Failed to load dashboard statistics");
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Network error while loading dashboard");
    } finally {
      setIsLoading(false);
    }
  }, [user.userId, navigate]);

  const loadRatingsDistribution = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/dashboard/ratings-distribution`, {
        headers: { "X-User-Id": user.userId || "" },
      });
      if (!res.ok) return;
      const data: RatingsDistribution = await res.json();
      setRatingsDist(data);
    } catch (e) {
      console.error("Failed to load ratings distribution", e);
    }
  }, [user.userId]);

  const loadRecentFeedback = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/dashboard/recent-feedback?limit=12`, {
        headers: { "X-User-Id": user.userId || "" },
      });
      if (!res.ok) return;
      const data: RecentFeedbackItem[] = await res.json();
      setRecentFeedback(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load recent feedback", e);
    }
  }, [user.userId]);

  useEffect(() => {
    if (!user.userId) {
      navigate("/login");
      return;
    }
    loadDashboardStats();
    loadRatingsDistribution();
    loadRecentFeedback();
  }, [user.userId, navigate, loadDashboardStats, loadRatingsDistribution, loadRecentFeedback]);

  const handleLogout = () => {
    // Implement logout logic
    navigate("/login");
  };

  const StatCard = ({
    title,
    value,
    subtext,
    color = "blue",
  }: {
    title: string;
    value: number | string;
    subtext?: string;
    color?: keyof typeof colorClasses;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-2xl font-bold ${colorClasses[color]} mt-1`}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </p>
          {subtext && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {subtext}
            </p>
          )}
        </div>
      </div>
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate("/chat")}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Chat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <ChangeThemeBtn />
              <button
                onClick={() => navigate("/chat")}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Go to Chat
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-8">
        {/* Overview Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Users"
              value={stats?.total_users ?? 0}
              subtext={`+${stats?.new_users_7d ?? 0} this week`}
              color="blue"
            />
            <StatCard
              title="Active Sessions"
              value={stats?.active_sessions ?? 0}
              subtext={`${stats?.archived_sessions ?? 0} archived`}
              color="green"
            />
            <StatCard
              title="Total Messages"
              value={stats?.total_messages ?? 0}
              subtext={`+${stats?.new_messages_30d ?? 0} last 30 days`}
              color="purple"
            />
            <StatCard
              title="Average Rating"
              value={
                typeof stats?.avg_rating === "number"
                  ? stats.avg_rating.toFixed(1)
                  : "0.0"
              }
              subtext={`from ${stats?.users_who_commented ?? 0} users`}
              color="yellow"
            />
          </div>
        </div>

        {/* Engagement Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            User Engagement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              title="Total Reactions"
              value={(stats?.total_likes ?? 0) + (stats?.total_dislikes ?? 0)}
              subtext={`👍 ${stats?.total_likes ?? 0} / 👎 ${
                stats?.total_dislikes ?? 0
              }`}
              color="blue"
            />
            <StatCard
              title="Total Comments"
              value={stats?.total_comments ?? 0}
              subtext={`${stats?.users_who_commented ?? 0} unique users`}
              color="blue"
            />
            <StatCard
              title="Like Ratio"
              value={
                typeof stats?.total_likes === "number" &&
                typeof stats?.total_dislikes === "number" &&
                stats.total_likes + stats.total_dislikes > 0
                  ? `${(
                      (stats.total_likes /
                        (stats.total_likes + stats.total_dislikes)) *
                      100
                    ).toFixed(1)}%`
                  : "N/A"
              }
              subtext="Positive feedback rate"
              color="green"
            />
          </div>
        </div>

        {/* Performance Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            System Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Tokens"
              value={
                (stats?.total_input_tokens ?? 0) +
                (stats?.total_output_tokens ?? 0)
              }
              subtext="Input + Output"
              color="blue"
            />
            <StatCard
              title="Avg Output Tokens"
              value={
                typeof stats?.avg_output_tokens === "number"
                  ? stats.avg_output_tokens.toFixed(0)
                  : "0"
              }
              subtext="Per response"
              color="blue"
            />
            <StatCard
              title="Avg Generation Time"
              value={`${(
                (stats?.avg_generation_time ?? 0) as number
              ).toFixed(0)}ms`}
              subtext={`Max: ${stats?.max_generation_time ?? 0}ms`}
              color="blue"
            />
            <StatCard
              title="Active Admins"
              value={stats?.active_admins ?? 0}
              subtext={`${stats?.admin_actions_30d ?? 0} actions (30d)`}
              color="blue"
            />
          </div>
        </div>

        {/* Ratings Distribution */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Ratings Distribution
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            {!ratingsDist ? (
              <p className="text-gray-600 dark:text-gray-300">Loading ratings…</p>
            ) : (
              <div className="space-y-3">
                {([
                  { label: "5 stars", value: ratingsDist.five, stars: 5 },
                  { label: "4 stars", value: ratingsDist.four, stars: 4 },
                  { label: "3 stars", value: ratingsDist.three, stars: 3 },
                  { label: "2 stars", value: ratingsDist.two, stars: 2 },
                  { label: "1 star", value: ratingsDist.one, stars: 1 },
                ] as const).map((row) => {
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
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {row.label}
                          </span>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-200">
                          {row.value} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2 overflow-hidden">
                        <div
                          className="h-2 bg-blue-500 dark:bg-blue-400"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Feedback
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
            {!recentFeedback.length ? (
              <div className="p-6 text-gray-600 dark:text-gray-300">
                No recent feedback yet.
              </div>
            ) : (
              recentFeedback.map((fb) => (
                <div
                  key={`${fb.session_id}-${fb.message_id}-${fb.created_at}`}
                  className="p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">Session:</span>
                      <span className="font-mono">
                        {fb.session_id.slice(0, 8)}…
                      </span>
                      <span className="mx-2">•</span>
                      <span>{new Date(fb.created_at).toLocaleString()}</span>
                    </div>
                    {typeof fb.rating === "number" && (
                      <div className="text-sm text-gray-700 dark:text-gray-200">
                        <StarRow value={fb.rating} />
                      </div>
                    )}
                  </div>
                  {fb.message_preview && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="uppercase tracking-wider">Message</span>
                      : {fb.message_preview}
                    </div>
                  )}
                  {fb.comment && (
                    <div className="mt-2 text-gray-800 dark:text-gray-100">
                      “{fb.comment}”
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detailed Stats Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Detailed Statistics
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    New Users (30 days)
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.new_users_30d ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    New Sessions (30 days)
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.new_sessions_30d ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Deleted Sessions
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.deleted_sessions ?? 0}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    User Messages
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.user_messages ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Assistant Messages
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.assistant_messages ?? 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Admin Actions (30 days)
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.admin_actions_30d ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => {
              loadDashboardStats();
              loadRatingsDistribution();
              loadRecentFeedback();
            }}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

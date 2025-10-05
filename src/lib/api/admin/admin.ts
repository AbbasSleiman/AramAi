import { API_BASE_URL } from "../config";

/** Stats shape used by the Admin Dashboard */
export interface DashboardStats {
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

/**
 * Fetch Admin Dashboard statistics for an admin user.
 * Requires the backend to authorize using the `X-User-Id` header.
 */
export const getAdminDashboardStats = async (
  userId: string
): Promise<DashboardStats> => {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
    },
  });

  if (response.status === 403) {
    throw new Error("Access denied. Admin privileges required.");
  }

  if (!response.ok) {
    throw new Error("Failed to load dashboard statistics");
  }

  return (await response.json()) as DashboardStats;
};

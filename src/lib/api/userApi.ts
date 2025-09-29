// Prefer env override if present, fallback to local dev URL
export const API_BASE_URL: string =
  (typeof process !== "undefined" &&
    (process as unknown as { env?: { API_BASE_URL?: string } }).env
      ?.API_BASE_URL) ||
  "http://127.0.0.1:8000";

/** Payload for creating or returning an existing user */
export interface CreateUserRequest {
  firebase_uid: string;
  email: string;
  username: string;
}

/** User record returned by the backend */
export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

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
 * Create a new user if not exists, otherwise return the existing user.
 */
export const createOrGetUser = async (
  userData: CreateUserRequest
): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error("Failed to create or get user");
  }

  return (await response.json()) as User;
};

/**
 * Get a user by Firebase UID.
 */
export const getUserByFirebaseUid = async (
  firebaseUid: string
): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to get user");
  }

  return (await response.json()) as User;
};

/**
 * Check if a given user is an admin.
 * Returns `true` if admin, otherwise `false`.
 */
export const isUserAdmin = async (userId: string): Promise<boolean> => {
  const response = await fetch(`${API_BASE_URL}/admin/is-admin`, {
    headers: {
      "Content-Type": "application/json",
      "X-User-Id": userId,
    },
  });
  if (!response.ok) return false;
  const data: { is_admin?: boolean } = await response.json();
  return Boolean(data.is_admin);
};

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

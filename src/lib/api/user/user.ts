import { API_BASE_URL } from "../config";

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

/**
 * Create a new user if not exists, otherwise return the existing user.
 */
export async function createOrGetUser(payload: {
  firebase_uid: string;
  email: string;
  username: string;
}) {
  const existing = await getUserByFirebaseUid(payload.firebase_uid);
  if (existing) return existing;

  console.log("im gere");
  // otherwise POST
  const res = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("POST /users failed");
  return res.json();
}
/**
 * Get a user by Firebase UID.
 */
export async function getUserByFirebaseUid(firebase_uid: string) {
  const res = await fetch(`${API_BASE_URL}/users/${firebase_uid}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GET /users/${firebase_uid} failed`);
  return res.json();
}

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
  console.log(response);
  if (!response.ok) return false;
  const data: { is_admin?: boolean } = await response.json();
  return Boolean(data.is_admin);
};

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface CreateUserRequest {
  firebase_uid: string;
  email: string;
  username: string;
}

export interface User {
  id: string;
  firebase_uid: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export const createOrGetUser = async (userData: CreateUserRequest): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error('Failed to create or get user');
  }

  return response.json();
};

export const getUserByFirebaseUid = async (firebaseUid: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/users/${firebaseUid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get user');
  }

  return response.json();
};
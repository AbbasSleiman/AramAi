import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  name: string;
  username: string;
  email: string | null;
  uid: string | null;
  userId: string | null; // Local database user ID
  is_auth: boolean;
}

const initialState: UserState = {
  name: "",
  username: "",
  email: null,
  uid: null,
  userId: null,
  is_auth: false,
};

interface SignInUserPayload {
  name: string;
  username: string;
  email: string | null;
  uid: string;
  userId?: string; // Local database user ID
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    signInUser: (state, action: PayloadAction<SignInUserPayload>) => {
      state.name = action.payload.name;
      state.username = action.payload.username;
      state.email = action.payload.email;
      state.uid = action.payload.uid;
      state.userId = action.payload.userId || null;
      state.is_auth = true;
    },
    setUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    signOutUser: (state) => {
      state.name = "";
      state.username = "";
      state.email = null;
      state.uid = null;
      state.userId = null;
      state.is_auth = false;
    },
  },
});

export const { signInUser, setUserId, signOutUser } = userSlice.actions;
export default userSlice.reducer;
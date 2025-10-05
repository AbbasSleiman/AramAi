import "../styles/App.css";

import MainPage from "./MainPage";
import ChatPage from "./ChatPage";
import LogInPage from "./LogInPage";
import SignUpPage from "./SignUpPage";
import ProtectedRoute from "../routes/ProtectedRoute";
import AuthRedirectRoute from "../routes/AuthRedirectRoute";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { AppDispacth } from "../lib/store/store";
import { useDispatch } from "react-redux";
import { signInUser, signOutUser } from "../lib/store/slices/userSlice";
import { auth } from "../lib/firebase/firebaseConfig";
import { createOrGetUser, isUserAdmin } from "../lib/api/user/user";
import AdminRoute from "../routes/AdminRoute";
import AdminDashboard from "./AdminDashboard";

function App() {
  const dispatch: AppDispacth = useDispatch();

  const getUserIsAdmin = async (uid: string) => {
    const admin = await isUserAdmin(uid);
    if (admin) return admin;
    return false;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const localUser = await createOrGetUser({
            firebase_uid: user.uid,
            email: user.email || "",
            username: user.email?.split("@")[0] || "",
          });

          const admin = await getUserIsAdmin(localUser.id);

          dispatch(
            signInUser({
              name: "",
              username: localUser.username,
              email: user.email,
              uid: user.uid,
              db_id: localUser.id,
              admin: admin,
            })
          );
        } catch (error) {
          console.error("❌ Failed to sync user with local database:", error);
          dispatch(
            signInUser({
              name: "",
              username: user.email!.split("@")[0],
              email: user.email,
              uid: user.uid,
              db_id: "",
              admin: false,
            })
          );
        }
      } else {
        dispatch(signOutUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="chat" element={<ChatPage />} />
        <Route
          path="/login"
          element={
            <AuthRedirectRoute>
              <LogInPage />
            </AuthRedirectRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRedirectRoute>
              <SignUpPage />
            </AuthRedirectRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* <Route path="*" element={<_404Page />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

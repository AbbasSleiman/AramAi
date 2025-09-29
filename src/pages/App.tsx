import "../styles/App.css";

import MainPage from "./MainPage";
import ChatPage from "./ChatPage";
import LogInPage from "./LogInPage";
import SignUpPage from "./SignUpPage";
import ProtectedRoute from "../routes/ProtectedRoute";
import AuthRedirectRoute from "../routes/AuthRedirectRoute";
import AdminRoute from "../routes/AdminRoute"; // <-- ADD THIS import

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { AppDispatch } from "../lib/store/store";
import { useDispatch } from "react-redux";
import { signInUser, signOutUser } from "../lib/store/slices/userSlice";
import { auth } from "../lib/firebase/firebaseConfig";
import { createOrGetUser } from "../lib/api/userApi";
import AdminDashboard from "../pages/AdminDashboard";

function App() {
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const localUser = await createOrGetUser({
            firebase_uid: currentUser.uid,
            email: currentUser.email || "",
            username: currentUser.email?.split("@")[0] || "",
          });

          dispatch(
            signInUser({
              name: "",
              username: localUser.username,
              email: currentUser.email,
              uid: currentUser.uid,
              userId: localUser.id,
            })
          );
        } catch (error) {
          console.error("❌ Failed to sync user with local database:", error);
          dispatch(
            signInUser({
              name: "",
              username: currentUser.email!.split("@")[0],
              email: currentUser.email,
              uid: currentUser.uid,
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

        {/* Keep only the PROTECTED /chat route (remove the unprotected duplicate) */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

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

        {/* Use AdminRoute here, not ProtectedRoute */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Optionally add a 404 route later */}
        {/* <Route path="*" element={<_404Page />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

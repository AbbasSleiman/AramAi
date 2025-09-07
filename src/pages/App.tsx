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
import { createOrGetUser } from "../lib/api/userApi";

function App() {
  const dispatch: AppDispacth = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // Create/get user in local database FIRST
          const localUser = await createOrGetUser({
            firebase_uid: currentUser.uid,
            email: currentUser.email || '',
            username: currentUser.email?.split("@")[0] || '',
          });

          // Now dispatch with the ACTUAL username from database
          dispatch(
            signInUser({
              name: "",
              username: localUser.username, // Use database username, not email-based
              email: currentUser.email,
              uid: currentUser.uid,
              userId: localUser.id, // Include userId directly
            })
          );

          console.log('✅ User synced with local database:', localUser.id);
          console.log('✅ Username from database:', localUser.username);
        } catch (error) {
          console.error('❌ Failed to sync user with local database:', error);
          
          // Fallback: use email-based username if database fails
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
        // User is signed out
        dispatch(signOutUser());
        console.log('✅ User signed out, Redux state cleared');
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
        {/* <Route path="*" element={<_404Page />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
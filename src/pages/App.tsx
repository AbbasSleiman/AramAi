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

function App() {
  const dispatch: AppDispacth = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(
          signInUser({
            name: "",
            username: user.email!.split("@")[0],
            email: user.email,
            uid: user.uid,
          })
        );
      } else {
        dispatch(signOutUser());
      }
    });

    return () => unsubscribe();
  }, []);

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

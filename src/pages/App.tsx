import "../styles/App.css";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./MainPage";
import ChatPage from "./ChatPage";
import LogInPage from "./LogInPage";
import SignUpPage from "./SignUpPage";
import ProtectedRoute from "../routes/ProtectedRoute";
import AuthRedirectRoute from "../routes/AuthRedirectRoute";

function App() {
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

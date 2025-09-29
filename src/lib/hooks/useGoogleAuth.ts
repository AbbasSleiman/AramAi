// lib/hooks/useGoogleAuth.ts
import { signInWithPopup, signOut, AuthError } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { getUserByFirebaseUid, isUserAdmin } from "../api/userApi";

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const signInWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Sign out any existing user first
      if (auth.currentUser) {
        await signOut(auth);
        console.log("🔄 Signed out existing user before Google auth");
      }

      const result = await signInWithPopup(auth, googleProvider);
      console.log("✅ Google sign-in successful:", result.user.email);

      // Determine admin vs user destination
      const uid = auth.currentUser?.uid;
      if (uid) {
        try {
          const localUser = await getUserByFirebaseUid(uid);
          const admin = await isUserAdmin(localUser.id);
          navigate(admin ? "/admin" : "/chat");
        } catch (lookupErr) {
          console.error("User lookup/admin check failed:", lookupErr);
          // Fallback to chat if we can't determine admin status
          navigate("/chat");
        }
      } else {
        // Fallback: if uid is missing for some reason
        navigate("/chat");
      }
    } catch (err) {
      const firebaseError = err as AuthError;
      console.error("❌ Google sign-in error:", firebaseError.message);

      if (firebaseError.code === "auth/popup-closed-by-user") {
        setError("Sign-in was cancelled. Please try again.");
      } else if (firebaseError.code === "auth/popup-blocked") {
        setError("Pop-up was blocked. Please allow pop-ups and try again.");
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    isLoading,
    error,
  };
};

// lib/hooks/useGoogleAuth.ts
import { signInWithPopup, signOut, AuthError } from "firebase/auth";
import { auth, googleProvider } from "../firebase/firebaseConfig";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Sign out any existing user first
      if (auth.currentUser) {
        await signOut(auth);
        console.log('🔄 Signed out existing user before Google auth');
      }
      
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Google sign-in successful:', result.user.email);
      navigate("/chat");
    } catch (error) {
      const firebaseError = error as AuthError;
      console.error('❌ Google sign-in error:', firebaseError.message);
      
      if (firebaseError.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (firebaseError.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Please allow pop-ups and try again.');
      } else {
        setError('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signInWithGoogle,
    isLoading,
    error
  };
};
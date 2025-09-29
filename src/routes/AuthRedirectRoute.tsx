// src/routes/AuthRedirectRoute.tsx
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../lib/store/store";
import { isUserAdmin } from "../lib/api/userApi";

const AuthRedirectRoute = ({ children }: { children: ReactNode }) => {
  const user = useSelector((s: RootState) => s.user);

  // null = deciding; "admin" | "chat" = redirect target
  const [dest, setDest] = useState<null | "admin" | "chat">(null);

  useEffect(() => {
    let mounted = true;

    const decide = async () => {
      // If not authenticated yet, show the login/signup page itself
      if (!user?.is_auth || !user?.userId) {
        if (mounted) setDest(null);
        return;
      }

      try {
        const admin = await isUserAdmin(user.userId);
        if (mounted) setDest(admin ? "admin" : "chat");
      } catch {
        if (mounted) setDest("chat");
      }
    };

    decide();
    return () => {
      mounted = false;
    };
  }, [user.is_auth, user.userId]);

  // Not authenticated → render the child (Login / Signup) normally
  if (!user?.is_auth || !user?.userId) return <>{children}</>;

  // Authenticated → once we decide, redirect to the right place
  if (dest === "admin") return <Navigate to="/admin" replace />;
  if (dest === "chat") return <Navigate to="/chat" replace />;

  // Brief spinner while deciding
  return (
    <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-900 dark:text-white">Preparing your workspace…</p>
      </div>
    </div>
  );
};

export default AuthRedirectRoute;

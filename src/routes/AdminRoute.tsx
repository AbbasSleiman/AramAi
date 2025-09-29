// src/routes/AdminRoute.tsx
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../lib/store/store";
import { isUserAdmin } from "../lib/api/userApi";

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const user = useSelector((s: RootState) => s.user);

  // null = loading; true = allowed; false = not allowed
  const [allowed, setAllowed] = useState<null | boolean>(null);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      // If we don't yet know auth state or don't have a userId, keep loading.
      if (!user?.is_auth || !user?.userId) {
        if (mounted) setAllowed(null);
        return;
      }
      try {
        const ok = await isUserAdmin(user.userId);
        if (mounted) setAllowed(ok);
      } catch {
        if (mounted) setAllowed(false);
      }
    };

    check();
    return () => {
      mounted = false;
    };
  }, [user.is_auth, user.userId]);

  // Show a spinner while we don't know yet (avoids early redirect race)
  if (allowed === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white">Checking access…</p>
        </div>
      </div>
    );
  }

  if (!allowed) return <Navigate to="/chat" replace />;

  return <>{children}</>;
};

export default AdminRoute;

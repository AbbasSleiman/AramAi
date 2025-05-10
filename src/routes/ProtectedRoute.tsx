// components/routes/ProtectedRoute.tsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../lib/store/store";
import { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const user = useSelector((state: RootState) => state.user.is_auth);

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;

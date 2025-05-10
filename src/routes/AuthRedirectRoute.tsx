// components/routes/AuthRedirectRoute.tsx
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { RootState } from "../lib/store/store";
import { JSX } from "react";

const AuthRedirectRoute = ({ children }: { children: JSX.Element }) => {
  const user = useSelector((state: RootState) => state.user);

  if (user.is_auth) {
    return <Navigate to="/chat" replace />;
  }

  return children;
};

export default AuthRedirectRoute;

// components/sections/SiteHeader.tsx
import { Link } from "react-router-dom";
import Logo from "../../components/atoms/Logo";
import { motion } from "motion/react";
import ChangeThemeBtn from "../atoms/clickeable/ChangeThemeBtn";
import ProfileDropdown from "../organisms/ProfileDropdown";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../lib/store/store";
import { useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase/firebaseConfig";
import { signOutUser } from "../../lib/store/slices/userSlice";
import { useNavigate } from "react-router-dom";

const SiteHeader = () => {
  const is_auth = useSelector((state: RootState) => state.user.is_auth);
  const user = useSelector((state: RootState) => state.user);

  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(signOutUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/70 dark:supports-[backdrop-filter]:bg-background-dark/60 bg-background dark:bg-background-dark border-b border-secondary/40 dark:border-background">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
          <span className="font-outfit font-semibold">AramAI</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-5 text-sm ml-6 sm:ml-10">
          <a href="#features">Features</a>
          <a href="#examples">Examples</a>
          <a href="#how">How it works</a>
          <a href="#model">Model</a>
          <a href="#faq">FAQ</a>
        </nav>

        <div className="flex-1" />

        <div className="flex items-center gap-3">
          <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
            <ChangeThemeBtn />
          </motion.div>

          {typeof is_auth === "boolean" ? (
            is_auth ? (
              <div className="relative">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setIsProfileOpen((s) => !s)}
                  className={[
                    "flex items-center gap-2 px-2.5 py-1.5 rounded-xl",
                    "transition-colors",
                    "hover:bg-third dark:hover:bg-background-dark",
                    "!w-auto !bg-transparent",
                    "focus:outline-none focus:ring-2 focus:ring-background-dark/20 dark:focus:ring-background/30",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "w-8 h-8 rounded-full flex items-center justify-center",
                      "text-sm font-medium",
                      "bg-background-dark text-text-dark",
                      "dark:bg-background dark:text-background-dark",
                      "ring-1 ring-secondary/50",
                    ].join(" ")}
                  >
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-roboto font-medium text-text dark:text-text-dark">
                    {user.username}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.button>

                <ProfileDropdown
                  isOpen={isProfileOpen}
                  onClose={() => setIsProfileOpen(false)}
                  onLogout={handleLogout}
                />
              </div>
            ) : (
              <Link
                to="/login"
                className="thin-button !w-auto rounded-xl px-3 py-1"
              >
                Log In
              </Link>
            )
          ) : (
            <span className="text-sm opacity-70">Loading…</span>
          )}
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;

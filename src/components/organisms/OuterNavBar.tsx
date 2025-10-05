import ChangeThemeBtn from "../atoms/clickeable/ChangeThemeBtn";
import LinesBtn from "../atoms/clickeable/LinesBtn";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase/firebaseConfig";
import { useDispatch, useSelector } from "react-redux";
import { signOutUser } from "../../lib/store/slices/userSlice";
import { RootState } from "../../lib/store/store";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ProfileDropdown from "./ProfileDropdown";

import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const OuterNavBar = ({ toggleVisiblity }: { toggleVisiblity: () => void }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(signOutUser());
      navigate("/login");
      console.log("User logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <nav
      className={[
        // translucent bar that matches your theme tokens
        "sticky top-0 z-40 flex-shrink-0",
        "border-b border-secondary dark:border-background",
        "backdrop-blur supports-[backdrop-filter]:bg-background/80",
        "dark:supports-[backdrop-filter]:bg-background-dark/70",
        "bg-background dark:bg-background2-dark",
        "px-4 py-2.5",
      ].join(" ")}
    >
      <div className="flex items-center justify-between w-full">
        {/* Left: menu button */}
        <motion.div
          whileTap={{ scale: 0.96 }}
          whileHover={{ scale: 1.02 }}
          className="flex items-center justify-start min-w-0"
        >
          <LinesBtn toggleVisiblity={toggleVisiblity} />
        </motion.div>

        {/* Right controls */}
        <div className="flex items-center gap-3 relative">
          <motion.div whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.02 }}>
            <ChangeThemeBtn />
          </motion.div>

          {/* Profile */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.98 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setIsProfileOpen((s) => !s)}
              aria-expanded={isProfileOpen}
              aria-haspopup="menu"
              className={[
                "flex items-center gap-2 px-2.5 py-1.5 rounded-xl",
                "transition-colors",
                "hover:bg-third dark:hover:bg-background-dark",
                "!w-auto !bg-transparent",
                "focus:outline-none focus:ring-2 focus:ring-background-dark/20 dark:focus:ring-background/30",
              ].join(" ")}
            >
              {/* Initial avatar that flips colors across themes */}
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

              <motion.span
                animate={{ rotate: isProfileOpen ? 180 : 0 }}
                transition={{ type: "tween", duration: 0.18 }}
                className="text-text/80 dark:text-text-dark/80"
              >
                <ChevronDown className="w-4 h-4" />
              </motion.span>
            </motion.button>

            <ProfileDropdown
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default OuterNavBar;

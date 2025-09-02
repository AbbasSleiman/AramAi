import { useSelector } from "react-redux";
import { RootState } from "../../lib/store/store";
import { Link, useNavigate } from "react-router-dom";
import { useRef } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase/firebaseConfig";

import useOutsideClick from "../../lib/hooks/useOutsideClick";
import ThinButton from "./clickeable/ThinButton";

const AccountFrame = ({
  isVisible,
  toggleVisibility,
}: {
  isVisible: boolean;
  toggleVisibility: () => void;
}) => {
  const navigate = useNavigate();
  const username = useSelector((state: RootState) => state.user.username);

  // ref for the container ( close when clicked outside )
  const containerRef = useRef<HTMLDivElement>(null);
  useOutsideClick(containerRef, toggleVisibility, isVisible);

  // Logout Handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {}
  };

  return (
    <div
      ref={containerRef}
      className={` ${isVisible ? "flex" : "hidden"} flex-col gap-2 w-64 bg-background shadow-2xl rounded-xl p-4 z-10 absolute top-14 right-2 dark:bg-background2-dark`}
    >
      <span className="opacity-65">{username}</span>
      <hr className="dark:text-background opacity-25" />
      {/* Profile Buttons Container*/}
      <div className="flex flex-col gap-2">
        <ThinButton text="Profile" />
        <ThinButton text="Settings" />
      </div>
      <hr className="dark:text-background opacity-25" />
      {/* General Links Container*/}
      <div className="flex flex-col gap-2">
        <ThinButton text="Home Page" on_click={() => navigate("/")} />
        <ThinButton
          text="Terms & Condition"
          on_click={() => navigate("/terms")}
        />
      </div>
      <hr className="dark:text-background opacity-25" />
      {/* <NotificationBox text="Error Logging Out" classname="bg-red-500 text-text-dark"/> */}
      <ThinButton text="logout" classname="error" on_click={handleLogout} />
    </div>
  );
};

export default AccountFrame;

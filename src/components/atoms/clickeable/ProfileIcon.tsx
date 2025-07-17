import AccountFrame from "../AccountFrame";
import avatarImg from "/avatar.jpg";

import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { useEffect, useState } from "react";

const ProfileIcon = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAccountFrameToggled, setAccountFrameToggled] =
    useState<boolean>(false);

  const toggleAccountFrame = () => {
    setAccountFrameToggled((prev) => !prev);
  };

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  const src = user?.photoURL ?? avatarImg;

  return (
    <div>
      <div onClick={toggleAccountFrame} className="hoverable-box cursor-pointer w-fit">
        <img
          src={src}
          alt="Profile Icon Image"
          className=" w-8 h-8 bg-secondary rounded-full object-cover"
        />
      </div>
      <AccountFrame
        isVisible={isAccountFrameToggled}
        toggleVisibility={toggleAccountFrame}
      />
    </div>
  );
};

export default ProfileIcon;

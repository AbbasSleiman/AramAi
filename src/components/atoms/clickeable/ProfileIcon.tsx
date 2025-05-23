import AccountFrame from "../AccountFrame";

import { useSelector } from "react-redux";
import { RootState } from "../../../lib/store/store";
import { getAuth } from "firebase/auth";
import { useState } from "react";

const ProfileIcon = () => {
  const [isAccountFrameToggled, setAccountFrameToggled] =
    useState<boolean>(false);

  const toggleAccountFrame = () => {
    setAccountFrameToggled((prev) => !prev);
  };

  const auth = getAuth();
  const user = auth.currentUser;

  return (
    <div>
      <div onClick={toggleAccountFrame}>
        <img
          src={"/avatar.jpg"}
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

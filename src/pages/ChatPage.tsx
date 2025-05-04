import { useState } from "react";

import Logo from "../components/atoms/Logo";
import InputChat from "../components/molecules/InputChat";
import OuterNavBar from "../components/organisms/OuterNavBar";
import SideBar from "../components/organisms/SideBar";

const ChatPage = () => {
  const [sideBarOpened, setSideBarOpened] = useState<boolean>(false);

  const handleSideBar = () => {
    setSideBarOpened((prev) => !prev);
  };

  return (
    <div className="flex flex-row">
      <SideBar isVisible={sideBarOpened} toggleVisiblity={handleSideBar} />
      <div className="w-full">
        <OuterNavBar toggleVisiblity={handleSideBar} />
        <div className="flex flex-col items-center justify-center text-center gap-2 border-1-text rounded-2xl sm:w-8/12 lg:w-8/12 px-2 m-auto mt-64">
          <Logo />
          <h1 className="antialiased font-outfit text-3xl font-bold">
            Ancient Wisdom. Modern Intelligence.
          </h1>
          <InputChat />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;

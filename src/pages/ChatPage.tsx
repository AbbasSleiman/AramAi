import Logo from "../components/atoms/Logo";
import InputChat from "../components/molecules/InputChat";
import OuterNavBar from "../components/organisms/OuterNavBar";

const ChatPage = () => {
  return (
    <div>
      <OuterNavBar />
      <div className="flex flex-col items-center justify-center text-center gap-2 border-1-text rounded-2xl w-full sm:w-2/5 m-auto mt-64">
        <Logo />
        <h1 className="antialiased font-outfit text-3xl font-bold">
          Ancient Wisdom. Modern Intelligence.
        </h1>
        <InputChat />
      </div>
    </div>
  );
};

export default ChatPage;

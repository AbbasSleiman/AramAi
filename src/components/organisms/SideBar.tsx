const SideBar = ({
  isVisible,
  toggleVisiblity,
}: {
  isVisible: boolean;
  toggleVisiblity: () => void;
}) => {
  return (
    <div
      className={`${isVisible ? "flex" : "hidden"} flex-col top-0 left-0 w-80 h-screen py-12 px-6 gap-0 overflow-y-auto border-r border-gray-300 dark:border-0 shadow-xl bg-background dark:bg-background2-dark absolute z-10 md:relative`}
    >


    </div>
  );
};

export default SideBar;

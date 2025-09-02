// OuterNavBar component - Using your existing LinesBtn component
import ChangeThemeBtn from "../atoms/clickeable/ChangeThemeBtn";
import LinesBtn from "../atoms/clickeable/LinesBtn";

const OuterNavBar = ({ toggleVisiblity }: { toggleVisiblity: () => void }) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
      <div className="flex items-center justify-between w-full">
        {/* Left side - Using your existing LinesBtn component */}
        <div className="flex items-center justify-start min-w-0">
          <LinesBtn toggleVisiblity={toggleVisiblity} />
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          <ChangeThemeBtn />
          <span className="text-sm text-gray-500">Test Mode - No Login Required</span>
        </div>
      </div>
    </nav>
  );
};

export default OuterNavBar;
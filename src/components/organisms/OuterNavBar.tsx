import NavBar from "../molecules/NavBar";
import LinesBtn from "../atoms/clickeable/LinesBtn";

const OuterNavBar = ({ toggleVisiblity }: { toggleVisiblity: () => void }) => {
  return (
    <div className="flex flex-row items-center justify-between p-4 m-0">
      <div>
        <LinesBtn toggleVisiblity={toggleVisiblity} />
      </div>
      <NavBar />
    </div>
  );
};

export default OuterNavBar;

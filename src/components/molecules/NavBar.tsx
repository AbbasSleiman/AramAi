import ChangeThemeBtn from "../atoms/clickeable/ChangeThemeBtn";

import { Link } from "react-router-dom";

const NavBar = () => {

  return (
    <nav>
      <div className="flex flex-row items-center justify-center gap-4">
        <ChangeThemeBtn />
        <Link to="/login">Log In</Link>
      </div>
    </nav>
  );
};

export default NavBar;

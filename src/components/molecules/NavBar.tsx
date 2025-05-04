import ChangeThemeBtn from "../atoms/clickeable/ChangeThemeBtn";
import { Link } from "react-router-dom";

const NavBar = () => {
  return (
    <nav className="flex flex-row items-center justify-between p-2">
      <ChangeThemeBtn />
      <Link to="/">Log In</Link>
    </nav>
  );
};

export default NavBar;

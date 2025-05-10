import ChangeThemeBtn from "../atoms/clickeable/ChangeThemeBtn";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../lib/store/store";

const NavBar = () => {
  const is_auth = useSelector((state: RootState) => state.user.is_auth);
  return (
    <nav>
      <div className="flex flex-row items-center justify-center gap-4">
        <ChangeThemeBtn />
        {is_auth === true ? <p>test</p> : <Link to="/login">Log In</Link>}
      </div>
    </nav>
  );
};

export default NavBar;

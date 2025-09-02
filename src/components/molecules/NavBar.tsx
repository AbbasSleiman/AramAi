//NavBar
import ChangeThemeBtn from "../atoms/clickeable/ChangeThemeBtn";
import ProfileIcon from "../atoms/clickeable/ProfileIcon";

import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../lib/store/store";

const NavBar = () => {
  // get from Redux the state of is_auth
  const is_auth = useSelector((state: RootState) => state.user.is_auth);

  return (
    <nav>
      <div className="flex flex-row items-center justify-center gap-4">
        <ChangeThemeBtn />
        {typeof is_auth === "boolean" ? (
          is_auth ? (
            <ProfileIcon />
          ) : (
            <Link to="/login">Log In</Link>
          )
        ) : (
          <span>Loading...</span>
        )}{" "}
      </div>
    </nav>
  );
};

export default NavBar;

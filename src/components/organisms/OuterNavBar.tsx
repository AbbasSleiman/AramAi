// components/organisms/OuterNavBar.tsx
import ChangeThemeBtn from "../atoms/clickeable/ChangeThemeBtn";
import LinesBtn from "../atoms/clickeable/LinesBtn";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase/firebaseConfig";
import { useDispatch, useSelector } from "react-redux";
import { signOutUser } from "../../lib/store/slices/userSlice";
import { RootState } from "../../lib/store/store";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ProfileDropdown from "./ProfileDropdown";

const OuterNavBar = ({ toggleVisiblity }: { toggleVisiblity: () => void }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(signOutUser());
      navigate("/login");
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 flex-shrink-0">
      <div className="flex items-center justify-between w-full">
        {/* Left side - Menu button */}
        <div className="flex items-center justify-start min-w-0">
          <LinesBtn toggleVisiblity={toggleVisiblity} />
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4 relative">
          <ChangeThemeBtn />
          
          {/* Profile Section */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors !text-gray-700 hover:!text-gray-900 !w-auto !bg-transparent hover:!bg-gray-100"
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user.username?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium !text-gray-700">{user.username}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
                        
            <ProfileDropdown 
              isOpen={isProfileOpen} 
              onClose={() => setIsProfileOpen(false)}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default OuterNavBar;
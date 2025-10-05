// components/organisms/ProfileDropdown.tsx - Updated with admin features
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../lib/store/store";
import { signInUser } from "../../lib/store/slices/userSlice";
import useOutsideClick from "../../lib/hooks/useOutsideClick";
import { useNavigate } from "react-router-dom";
import { isUserAdmin } from "../../lib/api/user/user";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const ProfileDropdown = ({
  isOpen,
  onClose,
  onLogout,
}: ProfileDropdownProps) => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user.username);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useOutsideClick(dropdownRef, onClose, isOpen);

  useEffect(() => {
    setEditUsername(user.username);
  }, [user.username]);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user.db_id) {
        try {
          const adminStatus = await isUserAdmin(user.db_id);
          setIsAdmin(adminStatus);
        } catch (error) {
          console.error("Failed to check admin status:", error);
          setIsAdmin(false);
        }
      }
    };

    checkAdminStatus();
  }, [user.db_id]);

  const handleSaveProfile = async () => {
    if (!editUsername.trim() || !user.db_id) {
      console.error("Missing data:", { editUsername, userId: user.db_id });
      setError("Missing user data. Please try logging out and back in.");
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log("Updating profile:", {
      userId: user.db_id,
      username: editUsername.trim(),
    });

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/users/${user.db_id}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: editUsername.trim(),
          }),
        }
      );

      console.log("Response status:", response.status);

      if (response.ok) {
        const updatedUser = await response.json();
        console.log("Updated user:", updatedUser);

        dispatch(
          signInUser({
            name: user.name,
            username: updatedUser.username,
            email: user.email,
            uid: user.uid!,
            userId: user.db_id,
          })
        );

        setIsEditing(false);
        console.log("Profile updated successfully");
      } else {
        const errorText = await response.text();
        console.error("API Error:", errorText);
        let errorMessage = "Failed to update profile";

        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }

        setError(errorMessage);
      }
    } catch (error) {
      console.error("Network error:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditUsername(user.username);
    setIsEditing(false);
    setError(null);
  };

  const handleGoToDashboard = () => {
    navigate("/admin");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-background2-dark rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
    >
      <div className="p-4">
        {/* Profile Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 flex items-center gap-2">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {user.username}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
            {isAdmin && (
              <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 dark:text-green-100 dark:bg-green-800 rounded-md">
                Admin
              </span>
            )}
          </div>
        </div>

        <hr className="mb-4 border-gray-200 dark:border-gray-700" />

        {/* Profile Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                  placeholder="Enter username"
                />

                {error && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading || !editUsername.trim()}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-gray-900 dark:text-white">
                  {user.username}
                </span>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-medium !text-blue-600 dark:!text-blue-400 hover:!text-blue-800 dark:hover:!text-blue-300 transition-colors !w-auto !bg-transparent hover:!bg-blue-50 dark:hover:!bg-blue-900 !p-1"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {user.email}
            </span>
          </div>
        </div>

        <hr className="my-4 border-gray-200 dark:border-gray-700" />

        {/* Action Buttons */}
        <div className="space-y-2">
          {/* Admin Dashboard Button - Only show for admins */}
          {isAdmin && (
            <button
              onClick={handleGoToDashboard}
              className="w-full text-center px-3 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Admin Dashboard
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full text-center px-3 py-2 bg-rose-400 text-white rounded-md hover:bg-rose-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;

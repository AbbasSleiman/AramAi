// components/organisms/ProfileDropdown.tsx
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../lib/store/store";
import { signInUser } from "../../lib/store/slices/userSlice";
import useOutsideClick from "../../lib/hooks/useOutsideClick";

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const ProfileDropdown = ({ isOpen, onClose, onLogout }: ProfileDropdownProps) => {
  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState(user.username);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useOutsideClick(dropdownRef, onClose, isOpen);

  useEffect(() => {
    setEditUsername(user.username);
  }, [user.username]);

  const handleSaveProfile = async () => {
    if (!editUsername.trim() || !user.userId) {
      console.error('Missing data:', { editUsername, userId: user.userId });
      setError('Missing user data. Please try logging out and back in.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    console.log('Updating profile:', { userId: user.userId, username: editUsername.trim() });
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/users/${user.userId}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: editUsername.trim(),
        }),
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const updatedUser = await response.json();
        console.log('Updated user:', updatedUser);
        
        // Update Redux state - this should trigger re-render of all components using the username
        dispatch(signInUser({
          name: user.name,
          username: updatedUser.username,
          email: user.email,
          uid: user.uid!,
          userId: user.userId,
        }));
        
        setIsEditing(false);
        console.log('Profile updated successfully');
        
        // Remove the page reload - Redux state update should be sufficient
        // The UI should automatically update due to Redux state change
        
      } else {
        const errorText = await response.text();
        console.error('API Error:', errorText);
        let errorMessage = 'Failed to update profile';
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Network error:', error);
      setError('Network error. Please check if the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditUsername(user.username);
    setIsEditing(false);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <div className="p-4">
        {/* Profile Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
            {user.username?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{user.username}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>

        <hr className="mb-4" />

        {/* Profile Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Enter username"
                />
                
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading || !editUsername.trim()}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={isLoading}
                    className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
          <div className="flex items-center justify-between">
            <span className="text-gray-900">{user.username}</span>
            <button
              onClick={() => setIsEditing(true)}
              className="text-sm font-medium !text-blue-600 hover:!text-blue-800 transition-colors !w-auto !bg-transparent hover:!bg-blue-50 !p-1"
            >
              Edit
            </button>
          </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <span className="text-gray-500 text-sm">{user.email}</span>
          </div>
        </div>

        <hr className="my-4" />

        {/* Logout Button - Fixed styling */}
        <button
          onClick={onLogout}
          className="w-full text-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default ProfileDropdown;
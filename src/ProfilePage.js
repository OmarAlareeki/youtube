import React, { useEffect } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const ProfilePage = ({ user, darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  const handleDarkModeToggle = async () => {
    setDarkMode(!darkMode);
  };

  const handleLogin = async () => {
    await signInWithPopup(auth, googleProvider);
    navigate('/profilepage');
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    if (!user) {
      navigate('/profilepage');
    }
  }, [user, navigate]);

  return (
    <div className={`profile-page ${darkMode ? 'dark-mode' : ''}`}>
      <h1>Profile</h1>
      {user ? (
        <>
          <img src={user.photoURL} alt={user.displayName} className="profile-avatar" />
          <p>{user.displayName}</p>
          <p>{user.email}</p>
          <button onClick={handleLogout}>Sign Out</button>
          <div className="dark-mode-toggle">
            <label htmlFor="darkModeToggle">
              Dark Mode
            </label>
            <input
              type="checkbox"
              id="darkModeToggle"
              checked={darkMode}
              onChange={handleDarkModeToggle}
            />
          </div>
        </>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  );
};

export default ProfilePage;

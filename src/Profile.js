import React, { useEffect } from 'react';
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import "./ProfilePage.css";

const Profile = ({ user, darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    await signInWithPopup(auth, googleProvider);
    navigate('/profile');
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    if (!user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleDarkModeToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`profile-page ${darkMode ? 'dark-mode' : ''}`}>
      {user ? (
        <>
          <img src={user.photoURL} alt={user.displayName} className="profile-avatar" />
          <p>{user.displayName}</p>
          <p>{user.email}</p>
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
          <button 
          style={{
            marginTop: "20px",
            padding: "10px",
            background: "#d31919",
            border: "none",
            borderRadius: "10px",
            color: "#121212"}}
          onClick={handleLogout}>Sign Out</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login with Google</button>
      )}
    </div>
  );
};

export default Profile;

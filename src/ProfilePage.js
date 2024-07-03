// Profile.js
import React, { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Profile = ({ user, darkMode, setDarkMode }) => {
  const navigate = useNavigate();

  const handleDarkModeToggle = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { darkMode: newDarkMode }, { merge: true });
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className={`profile-page ${darkMode ? 'dark-mode' : ''}`}>
      <h1>Profile</h1>
      {user && (
        <>
          <img src={user.photoURL} alt={user.displayName} className="profile-avatar" />
          <p>{user.displayName}</p>
          <p>{user.email}</p>
          <button onClick={handleLogout}>Sign Out</button>
          <div className="dark-mode-toggle">
            <label htmlFor="darkModeToggle">Dark Mode</label>
            <input
              type="checkbox"
              id="darkModeToggle"
              checked={darkMode}
              onChange={handleDarkModeToggle}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Profile;

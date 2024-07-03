import React from 'react';
import { Link } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

const Header = ({ user, handleLoginLogout, categories, searchTerm, setSearchTerm, handleSearch, darkMode }) => {
  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error logging in: ", error);
    }
  };

  return (
    <header className={`app-header ${darkMode ? 'dark-mode' : ''}`}>
      <nav>
        <ul>
          {categories.map((category, index) => (
            <li key={index}><Link to={`/${category.toLowerCase()}`}>{category}</Link></li>
          ))}
        </ul>
      </nav>
      <form className="search-form" onSubmit={handleSearch}>
        <input
          className="search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for videos"
        />
        <button className="search-button" type="submit">Search</button>
      </form>
      <div className="user-info">
        {user ? (
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="user-avatar"
            onClick={() => window.location.href = '/profile'}
          />
        ) : (
          <button onClick={handleLogin}>Login</button>
        )}
      </div>
    </header>
  );
};

export default Header;

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ user, handleLoginLogout, categories, searchTerm, setSearchTerm, handleSearch, darkMode }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/search');
    handleSearch(e);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={`header ${darkMode ? 'dark-mode' : ''}`}>
      <div className="logo">
        <Link to="/"><img src="/logo.png" width={100} alt="Logo" /></Link>
      </div>

      <form onSubmit={onSearchSubmit} className="search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
        />
        <button type="submit">Search</button>
      </form>

      <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {categories.map((category, index) => (
          <Link key={index} to={`/${category.toLowerCase()}`}>
            {category}
          </Link>
        ))}
        {user && (
          <div className="profile mobile-profile" onClick={handleProfileClick}>
            <img src={user.photoURL} alt="Avatar" className="avatar" />
          </div>
        )}
        {!user && (
          <button className="login-btn mobile-profile" onClick={handleProfileClick}>LOGIN</button>
        )}
      </nav>

      <div className="profile desktop-profile">
        <button className="login-btn" onClick={handleProfileClick}>
          {user ? <img src={user.photoURL} alt="Avatar" className="avatar" /> : 'LOGIN'}
        </button>
      </div>

      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>
    </header>
  );
};

export default Header;

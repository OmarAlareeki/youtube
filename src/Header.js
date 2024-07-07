import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = ({ user, handleLoginLogout, categories, searchTerm, setSearchTerm, handleSearch, darkMode }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profilepage');
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    navigate('/search');
    handleSearch(e);
  };

  return (
    <header className={`header ${darkMode ? 'dark-mode' : ''}`}>
      <div className="logo">
        <Link to="/"><img src="/logo.png" width={100}/></Link>
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
      <div className="nav-links">
        {categories.map((category, index) => (
          <Link key={index} to={`/${category.toLowerCase()}`}>
            {category}
          </Link>
        ))}
      </div>
      <div className="profile">
        <button onClick={handleProfileClick}>
          {user ? <img src={user.photoURL} alt="Avatar" className="avatar" /> : 'LOGIN'}
        </button>
      </div>
    </header>
  );
};

export default Header;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Movies from './Movies';
import Songs from './Songs';
import Library from './Library';
import VideoDetails from './VideoDetails';
import './App.css';

const App = () => {
  const [homeVideoHistory, setHomeVideoHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['Sports', 'News', 'Trending', 'Education', 'Reels']);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          maxResults: 10,
          key: process.env.REACT_APP_YOUTUBE_API_KEY,
          q: searchTerm,
        },
      });
      setHomeVideoHistory((prevHistory) => [...prevHistory, ...response.data.items]);
      if (!categories.includes(searchTerm)) {
        setCategories([...categories, searchTerm]);
      }
    } catch (err) {
      setError('Failed to fetch videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginLogout = () => {
    if (user) {
      signOut(auth);
    } else {
      signInWithPopup(auth, googleProvider);
    }
  };

  const truncateTitle = (title, wordLimit) => {
    const words = title.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return title;
  };

  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <img src="/logo.png" alt="App Logo" className="app-logo" />
          <nav>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/movies">Movies</Link></li>
              <li><Link to="/songs">Songs</Link></li>
              {categories.map((category, index) => (
                <li key={index}><Link to={`/${category.toLowerCase()}`}>{category}</Link></li>
              ))}
              <li><Link to="/library">Library</Link></li>
            </ul>
          </nav>
          <div className="user-info">
            <img
              src={user ? user.photoURL : '/default-avatar.png'}
              alt={user ? user.displayName : 'Login'}
              className="user-avatar"
              onClick={handleLoginLogout}
            />
          </div>
        </header>
        <Routes>
          <Route path="/" element={
            <div>
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
              <div className="video-list">
                {loading && <p>Loading...</p>}
                {error && <p className="error-message">{error}</p>}
                {homeVideoHistory.map((video) => (
                  <div className="video-item" key={video.id.videoId}>
                    <Link to={`/video/${video.id.videoId}`}>
                      <h3 className="video-title">{truncateTitle(video.snippet.title, 8)}</h3>
                      <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          } />
          <Route path="/movies" element={<Movies truncateTitle={truncateTitle} />} />
          <Route path="/songs" element={<Songs truncateTitle={truncateTitle} />} />
          <Route path="/library" element={<Library truncateTitle={truncateTitle} />} />
          <Route path="/video/:videoId" element={<VideoDetails />} />
          {categories.map((category, index) => (
            <Route
              key={index}
              path={`/${category.toLowerCase()}`}
              element={<CategoryPage category={category} truncateTitle={truncateTitle} />}
            />
          ))}
        </Routes>
      </div>
    </Router>
  );
};

const CategoryPage = ({ category, truncateTitle }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            maxResults: 10,
            key: process.env.REACT_APP_YOUTUBE_API_KEY,
            q: category,
          },
        });
        setVideos(response.data.items);
      } catch (err) {
        setError('Failed to fetch videos. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [category]);

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="video-list">
        {videos.map((video) => (
          <div className="video-item" key={video.id.videoId}>
            <Link to={`/video/${video.id.videoId}`}>
              <h3 className="video-title">{truncateTitle(video.snippet.title, 8)}</h3>
              <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

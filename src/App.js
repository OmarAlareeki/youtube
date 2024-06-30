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
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [videoHistory, setVideoHistory] = useState([]);

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
      setVideos(response.data.items);
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

  const handleVideoSelect = (video) => {
    setVideoHistory((prevHistory) => [...prevHistory, video]);
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
              {loading && <p>Loading...</p>}
              {error && <p className="error-message">{error}</p>}
              <div className="video-list">
                {videos.map((video) => (
                  <Link to={`/video/${video.id.videoId}`} key={video.id.videoId} onClick={() => handleVideoSelect(video)}>
                    <div className="video-item">
                      <h3 className="video-title">{video.snippet.title}</h3>
                      <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          } />
          <Route path="/movies" element={<Movies />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/library" element={<Library videoHistory={videoHistory} />} />
          <Route path="/video/:id" element={<VideoDetails videos={videos} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import Movies from './Movies';
import Songs from './Songs';
import Library from './Library';
import VideoDetails from './VideoDetails';
import Profile from './ProfilePage';
import Header from './Header';
import './App.css';

const App = () => {
  const [homeVideoHistory, setHomeVideoHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['Home', 'Movies', 'Songs', 'Library', 'Sports', 'News', 'Trending', 'Education', 'Reels']);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setDarkMode(docSnap.data().darkMode);
        }
      } else {
        setUser(null);
      }
    });
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
        params: {
          part: 'snippet',
          maxResults: 30,
          key: process.env.REACT_APP_YOUTUBE_API_KEY,
          q: searchTerm,
        },
      });

      const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');
      
      const statsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'statistics',
          id: videoIds,
          key: process.env.REACT_APP_YOUTUBE_API_KEY,
        },
      });

      const videosWithStats = searchResponse.data.items.map(video => ({
        ...video,
        statistics: statsResponse.data.items.find(item => item.id === video.id.videoId)?.statistics,
      }));

      setHomeVideoHistory(videosWithStats);
      if (!categories.includes(searchTerm)) {
        setCategories([...categories, searchTerm]);
      }
    } catch (err) {
      setError('Failed to fetch videos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginLogout = async () => {
    if (user) {
      await auth.signOut();
      setUser(null);
    } else {
      await signInWithPopup(auth, googleProvider);
    }
  };

  const truncateTitle = (title, wordLimit) => {
    const words = title.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return title;
  };

  const formatViews = (views) => {
    if (views >= 1000000000) {
      return `${(views / 1000000000).toFixed(1)}B`;
    } else if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return `${views}`;
  };

  return (
    <Router>
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <Header
          user={user}
          handleLoginLogout={handleLoginLogout}
          categories={categories}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={handleSearch}
          darkMode={darkMode}
        />
        <Routes>
          <Route path="/" element={
            <div>
              <div className="video-list">
                {loading && <p>Loading...</p>}
                {error && <p className="error-message">{error}</p>}
                {homeVideoHistory.map((video) => (
                  <div className="video-item" key={video.id.videoId}>
                    <Link to={`/video/${video.id.videoId}`}>
                      <h3 className="video-title">{truncateTitle(video.snippet.title, 8)}</h3>
                      <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
                      <p className="video-views">{formatViews(video.statistics?.viewCount || 0)}</p>
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
          <Route path="/profile" element={<Profile user={user} darkMode={darkMode} setDarkMode={setDarkMode} />} />
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

  const formatViews = (views) => {
    if (views >= 1000000000) {
      return `${(views / 1000000000).toFixed(1)}B`;
    } else if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return `${views}`;
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="video-list">
        {videos.map((video) => (
          <div className="video-item" key={video.id.videoId}>
            <Link to={`/video/${video.id.videoId}`}>
              <h3 className="video-title">{truncateTitle(video.snippet.title, 5)}</h3>
              <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
              <p className="video-views">{formatViews(video.statistics?.viewCount || 0)}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, googleProvider, db } from './firebase';
import { signInWithPopup, onAuthStateChanged } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Movies from './Movies';
import Songs from './Songs';
import Library from './Library';
import VideoDetails from './VideoDetails';
import ProfilePage from './ProfilePage';
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
          part: 'statistics,snippet',
          id: videoIds,
          key: process.env.REACT_APP_YOUTUBE_API_KEY,
        },
      });

      const channelIds = statsResponse.data.items.map(item => item.snippet.channelId).join(',');

      const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          part: 'snippet',
          id: channelIds,
          key: process.env.REACT_APP_YOUTUBE_API_KEY,
        },
      });

      const channelData = channelResponse.data.items.reduce((acc, channel) => {
        acc[channel.id] = channel.snippet;
        return acc;
      }, {});

      const videosWithStats = statsResponse.data.items.map(video => ({
        ...video,
        channelTitle: channelData[video.snippet.channelId].title,
        channelId: video.snippet.channelId,
        channelImage: channelData[video.snippet.channelId].thumbnails.default.url,
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

  const updateDarkModeInFirestore = async (newDarkMode) => {
    if (user) {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { darkMode: newDarkMode }, { merge: true });
    }
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    updateDarkModeInFirestore(newDarkMode);
  };

  return (
    <Router>
      <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
        <Header
          user={user}
          categories={categories}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          handleSearch={handleSearch}
          darkMode={darkMode}
          handleDarkModeToggle={handleDarkModeToggle}
        />
        <Routes>
          <Route path="/" element={
            <div>
              <div className="video-list">
                {loading && <p>Loading...</p>}
                {error && <p className="error-message">{error}</p>}
                {homeVideoHistory.map((video) => (
                  <div className="video-item" key={video.id}>
                    <Link to={`/video/${video.id}`}>
                      <h3 className="video-title">{video.snippet.title}</h3>
                      <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} />
                    </Link>
                    <p className="video-views">
                      {video.statistics.viewCount || 0} views
                      <br />
                      <div>
                      <Link 
                      style={{display: "flex", flexDirection: "raw", justifyContent: "space-around", textDecoration: "none"}}
                      to={`https://www.youtube.com/channel/${video.channelId}`}>
                        <img 
                        style={{width: "30px", borderRadius: "50%"}}
                        src={video.channelImage} alt={video.channelTitle} className="channel-image" />
                        {video.channelTitle}
                      </Link>

                      </div>
                 
                    </p>
                  </div>
                ))}
              </div>
            </div>
          } />
          <Route path="/movies" element={<Movies />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/library" element={<Library />} />
          <Route path="/video/:videoId" element={<VideoDetails />} />
          <Route path="/profilepage" element={<ProfilePage user={user} darkMode={darkMode} handleDarkModeToggle={handleDarkModeToggle} />} />
          {categories.map((category, index) => (
            <Route
              key={index}
              path={`/${category.toLowerCase()}`}
              element={<CategoryPage category={category} />}
            />
          ))}
        </Routes>
      </div>
    </Router>
  );
};

const CategoryPage = ({ category }) => {
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

        const videoIds = response.data.items.map(item => item.id.videoId).join(',');

        const statsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'statistics,snippet',
            id: videoIds,
            key: process.env.REACT_APP_YOUTUBE_API_KEY,
          },
        });

        const channelIds = statsResponse.data.items.map(item => item.snippet.channelId).join(',');

        const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
          params: {
            part: 'snippet',
            id: channelIds,
            key: process.env.REACT_APP_YOUTUBE_API_KEY,
          },
        });

        const channelData = channelResponse.data.items.reduce((acc, channel) => {
          acc[channel.id] = channel.snippet;
          return acc;
        }, {});

        const videosWithStats = statsResponse.data.items.map(video => ({
          ...video,
          channelTitle: channelData[video.snippet.channelId].title,
          channelId: video.snippet.channelId,
          channelImage: channelData[video.snippet.channelId].thumbnails.default.url,
        }));

        setVideos(videosWithStats);
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
          <div className="video-item" key={video.id}>
            <Link to={`/video/${video.id}`}>
              <h3 className="video-title">{video.snippet.title}</h3>
              <img src={video.snippet.thumbnails.medium.url} alt={video.snippet.title} />
            </Link>
            <p className="video-views">
              {video.statistics.viewCount || 0} views
              <br />
              <Link to={`https://www.youtube.com/channel/${video.channelId}`}>
                <img src={video.channelImage} className="channel-image" />
                {video.channelTitle}
              </Link>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

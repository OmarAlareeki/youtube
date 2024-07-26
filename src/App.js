import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth, db, googleProvider, onAuthStateChanged } from './firebase';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Movies from './Movies';
import Songs from './Songs';
import Sports from './Sports';
import News from './News';
import Trending from './Trending';
import Education from './Education';
import Reels from './Reels';
import Library from './Library';
import VideoDetails from './VideoDetails';
import Profile from './Profile';
import Header from './Header';
import CategoryPage from './CategoryPage';
import ChannelDetail from './ChannelDetail';
import VideoItem from './VideoItem';
import './App.css';

const App = () => {
  const [videoList, setVideoList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState(['All', 'Movies', 'Songs', 'Library', 'Sports', 'News', 'Trending', 'Education', 'Reels']);
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

      setVideoList(videosWithStats);
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

  const formatViews = (views) => {
    if (views >= 1000000000) {
      return `${(views / 1000000000).toFixed()}B`;
    } else if (views >= 1000000) {
      return `${(views / 1000000).toFixed()}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed()}K`;
    }
    return `${views}`;
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
          handleDarkModeToggle={handleDarkModeToggle}
          darkMode={darkMode} // Pass darkMode prop to Header
        />
        <Routes>
          <Route path="/" element={<CategoryPage category="All" />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/library" element={<Library />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/news" element={<News />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/education" element={<Education />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/profile" element={<Profile user={user} darkMode={darkMode} setDarkMode={setDarkMode} handleDarkModeToggle={handleDarkModeToggle} />} />
          <Route path="/video/:videoId" element={<VideoDetails />} />
          <Route path="/channel/:channelId" element={<ChannelDetail formatViews={formatViews}/>} />
        </Routes>
        <div className="video-list">
          {loading && <p>Loading...</p>}
          {error && <p className="error-message">{error}</p>}
          {videoList.map((video) => (
            <VideoItem key={video.id} video={video} />
          ))}
        </div>
      </div>
    </Router>
  );
};

export default App;

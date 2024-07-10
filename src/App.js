import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth, db, onAuthStateChanged } from './firebase';
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
import VideoItem from './VideoItem';
import useInfiniteScroll from './useInfiniteScroll';
import './App.css';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [categories, setCategories] = useState(['Home', 'Movies', 'Songs', 'Library', 'Sports', 'News', 'Trending', 'Education', 'Reels']);
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
  const fetchUrl = 'https://www.googleapis.com/youtube/v3/search';

  const { videoList, loading, error, fetchVideos } = useInfiniteScroll(searchTerm, fetchUrl, apiKey);

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
    await fetchVideos();
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
                {videoList.map((video) => (
                  <div className="video-item" key={video.id}>
                    <VideoItem video={video} />
                  </div>
                ))}
              </div>
            </div>
          } />
          <Route path="/movies" element={<Movies useInfiniteScroll={useInfiniteScroll}/>} />
          <Route path="/songs" element={<Songs />} />
          <Route path="/sports" element={<Sports />} />
          <Route path="/library" element={<Library />} />
          <Route path="/news" element={<News />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/education" element={<Education />} />
          <Route path="/reels" element={<Reels />} />
          <Route path="/video/:videoId" element={<VideoDetails />} />
          <Route path="/profile" element={<Profile user={user} darkMode={darkMode} handleDarkModeToggle={handleDarkModeToggle} />} />
          <Route path="/search" element={<SearchResults videoList={videoList} />} />
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

const SearchResults = ({ videoList }) => (
  <div className="video-list">
    {videoList.map((video) => (
      <VideoItem key={video.id} video={video} />
    ))}
  </div>
);

export default App;

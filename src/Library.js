import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import VideoItem from './VideoItem';
import './Library.css';

const Library = ({ darkMode }) => {
  const [videos, setVideos] = useState([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      const fetchVideoHistory = async () => {
        const q = query(collection(db, 'users', user.uid, 'videoHistory'), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const videoList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVideos(videoList);
      };

      fetchVideoHistory();
    }
  }, [user]);

  if (!user) return <p>Please log in to view your library.</p>;

  return (
    <div className={`library ${darkMode ? 'dark-mode' : ''}`}>
      <h1>Library</h1>
      <div className="video-list">
        {videos.map((video) => (
          <VideoItem key={video.videoId} video={video} />
        ))}
      </div>
    </div>
  );
};

export default Library;

import React, { useEffect, useState } from 'react';
import { db } from './firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { Link } from 'react-router-dom';

const Library = ({ truncateTitle }) => {
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
    <div>
      <h1>Library</h1>
      <div className="video-list">
        {videos.map((video) => (
          <div className="video-item" key={video.videoId}>
            <Link to={`/video/${video.videoId}`}>
              <h3 className="video-title">{truncateTitle(video.snippet.title, 8)}</h3>
              <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;

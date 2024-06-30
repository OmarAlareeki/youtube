// LikedVideos.js
import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import './LikedVideos.css'; // Add CSS for styling if needed

const LikedVideos = () => {
  const [likedVideos, setLikedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        const userId = auth.currentUser.uid;
        const likedVideosRef = collection(db, 'users', userId, 'likedVideos');
        const likedVideosSnapshot = await getDocs(likedVideosRef);
        const likedVideosData = likedVideosSnapshot.docs.map(doc => doc.data());
        setLikedVideos(likedVideosData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching liked videos: ', error);
      }
    };

    fetchLikedVideos();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="liked-videos-page">
      <h1>Liked Videos</h1>
      <div className="video-list">
        {likedVideos.map((video) => (
          <div className="video-item" key={video.videoId}>
            <h3 className="video-title">{video.title}</h3>
            <img src={video.thumbnail} alt={video.title} />
            <iframe
              title={video.title}
              width="560"
              height="315"
              src={`https://www.youtube.com/embed/${video.videoId}`}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LikedVideos;

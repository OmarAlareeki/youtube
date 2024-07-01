import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';

const VideoDetails = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,contentDetails,statistics',
            id: videoId,
            key: process.env.REACT_APP_YOUTUBE_API_KEY,
          },
        });
        setVideo(response.data.items[0]);

        // Save video to Firestore
        if (user) {
          await setDoc(doc(db, 'users', user.uid, 'videoHistory', videoId), {
            videoId,
            snippet: response.data.items[0].snippet,
            timestamp: new Date(),
          });
        }
      } catch (err) {
        console.error('Failed to fetch video details', err);
      }
    };

    fetchVideoDetails();
  }, [videoId, user]);

  if (!video) return <p>Loading...</p>;

  return (
    <div>
      <h1>{video.snippet.title}</h1>
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${videoId}`}
        frameBorder="0"
        allowFullScreen
        title={video.snippet.title}
      ></iframe>
      <p>{video.snippet.description}</p>
    </div>
  );
};

export default VideoDetails;

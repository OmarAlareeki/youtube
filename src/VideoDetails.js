import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './VideoDetails.css';

const VideoDetails = () => {
  const { videoId } = useParams();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,contentDetails,statistics',
            id: videoId,
            key: process.env.REACT_APP_YOUTUBE_API_KEY,
          },
        });
        setVideo(response.data.items[0]);
      } catch (err) {
        setError('Failed to fetch video details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [videoId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!video) {
    return <div>No video details found.</div>;
  }

  return (
    <div className="video-details">
      <h2>{video.snippet.title}</h2>
      <iframe
        title={video.snippet.title}
        width="560"
        height="315"
        src={`https://www.youtube.com/embed/${video.id}`}
        frameBorder="0"
        allowFullScreen
      ></iframe>
      <p>{video.snippet.description}</p>
      <p>View count: {video.statistics.viewCount}</p>
      <p>Likes: {video.statistics.likeCount}</p>
    </div>
  );
};

export default VideoDetails;

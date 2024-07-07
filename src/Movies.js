import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { fetchVideoStatistics } from './utils';

const truncateTitle = (title, wordLimit) => {
  const words = title.split(' ');
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...';
  }
  return title;
};

const Movies = ({videoList}) => {
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
            maxResults: 20,
            key: process.env.REACT_APP_YOUTUBE_API_KEY,
            q: 'trending movies',
            type: 'video',
          },
        });

        const videoIds = response.data.items.map(video => video.id.videoId);
        const statistics = await fetchVideoStatistics(videoIds);

        const videosWithStats = response.data.items.map(video => ({
          ...video,
          statistics: statistics.find(stat => stat.id === video.id.videoId)?.statistics,
        }));

        setVideos(videosWithStats);
      } catch (err) {
        setError('Failed to fetch videos. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <div>
      <h1>Trending Movies</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="video-list">
        {videoList.map((video) => (
          <div className="video-item" key={video.id.videoId}>
            <Link to={`/video/${video.id.videoId}`}>
              <h3 className="video-title">{truncateTitle(video.snippet.title, 8)}</h3>
              <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
              <p className="video-views">{video.statistics ? `${video.statistics.viewCount} views` : 'No views'}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Movies;

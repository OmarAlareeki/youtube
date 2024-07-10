import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoItem from './VideoItem';
import './Movies.css';

const Education = () => {
  const [videoList, setVideoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovieVideos = async () => {
      setLoading(true);
      setError(null);

      try {
        const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            maxResults: 30,
            key: process.env.REACT_APP_YOUTUBE_API_KEY,
            q: 'learning videos',
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
      } catch (err) {
        setError('Failed to fetch movie videos. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovieVideos();
  }, []);

  return (
    <div className="movies">
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="video-list">
        {videoList.map((video) => (
          <VideoItem key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default Education;

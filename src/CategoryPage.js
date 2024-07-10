import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoItem from './VideoItem';

const CategoryPage = ({ category, videoList }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTrendingVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'snippet,statistics',
            chart: 'mostPopular',
            regionCode: 'US',
            maxResults: 10,
            videoCategoryId: getCategoryID(category),
            key: process.env.REACT_APP_YOUTUBE_API_KEY,
          },
        });

        const channelIds = response.data.items.map(item => item.snippet.channelId).join(',');

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

        const videosWithChannels = response.data.items.map(video => ({
          ...video,
          channelTitle: channelData[video.snippet.channelId].title,
          channelId: video.snippet.channelId,
          channelImage: channelData[video.snippet.channelId].thumbnails.default.url,
        }));

        setVideos(videosWithChannels);
      } catch (err) {
        setError('Failed to fetch videos. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingVideos();
  }, [category]);

  const getCategoryID = (category) => {
    switch (category.toLowerCase()) {
      case 'movies':
        return '1'; // Change with appropriate category ID
      case 'songs':
        return '10'; // Change with appropriate category ID
      case 'news':
        return '25'; // Change with appropriate category ID
      case 'trending':
        return ''; // No specific category ID for trending
      case 'reels':
        return ''; // No specific category ID for reels
      default:
        return '';
    }
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <div className="video-list">
        {videos.length > 0 ? (
          videos.map((video) => (
            <VideoItem key={video.id} video={video} />
          ))
        ) : (
          <p>No videos found for this category.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;

import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const useInfiniteScroll = (searchTerm, fetchUrl, apiKey) => {
  const [videoList, setVideoList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [nextPageToken, setNextPageToken] = useState('');

  const fetchVideos = useCallback(async (pageToken = '') => {
    setLoading(true);
    try {
      const searchResponse = await axios.get(fetchUrl, {
        params: {
          part: 'snippet',
          maxResults: 30,
          key: apiKey,
          q: searchTerm,
          pageToken: pageToken,
        },
      });

      const videoIds = searchResponse.data.items.map(item => item.id.videoId).join(',');
      setNextPageToken(searchResponse.data.nextPageToken);

      const statsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
        params: {
          part: 'statistics,snippet',
          id: videoIds,
          key: apiKey,
        },
      });

      const channelIds = statsResponse.data.items.map(item => item.snippet.channelId).join(',');

      const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
        params: {
          part: 'snippet',
          id: channelIds,
          key: apiKey,
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

      setVideoList(prevVideos => [...prevVideos, ...videosWithStats]);
    } catch (err) {
      setError('Failed to fetch videos. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, fetchUrl, apiKey]);

  useEffect(() => {
    const handleScroll = async () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || loading) return;
      await fetchVideos(nextPageToken);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, nextPageToken, fetchVideos]);

  return { videoList, loading, error, fetchVideos };
};

export default useInfiniteScroll;

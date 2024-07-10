import axios from 'axios';

export const fetchVideoStatistics = async (videoIds) => {
  try {
    const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
      params: {
        part: 'statistics',
        id: videoIds.join(','),
        key: process.env.REACT_APP_YOUTUBE_API_KEY,
      },
    });
    return response.data.items;
  } catch (err) {
    console.error('Failed to fetch video statistics:', err);
    return [];
  }
};

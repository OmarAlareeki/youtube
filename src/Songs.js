import React, { useState } from 'react';
import VideoItem from './VideoItem';
import './Songs.css';
import useInfiniteScroll from './useInfiniteScroll';

const Songs = () => {
  const [searchTerm] = useState('trending songs');
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
  const fetchUrl = 'https://www.googleapis.com/youtube/v3/search';

  const { videoList, loading, error } = useInfiniteScroll(searchTerm, fetchUrl, apiKey);

  return (
    <div className="songs">
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

export default Songs;

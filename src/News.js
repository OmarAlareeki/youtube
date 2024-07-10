import React from 'react';
import VideoItem from './VideoItem';
import './Movies.css';
import useInfiniteScroll from './useInfiniteScroll';

const News = () => {
  const searchTerm = 'latest news';
  const apiKey = process.env.REACT_APP_YOUTUBE_API_KEY;
  const fetchUrl = 'https://www.googleapis.com/youtube/v3/search';

  const { videoList, loading, error } = useInfiniteScroll(searchTerm, fetchUrl, apiKey);

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

export default News;

import React from 'react';
import { Link } from 'react-router-dom';

const VideoItem = ({ video }) => {
  const truncateTitle = (title, wordLimit) => {
    const words = title.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return title;
  };

  const formatViews = (views) => {
    if (views >= 1000000000) {
      return `${(views / 1000000000).toFixed(1)}B`;
    } else if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return `${views}`;
  };

  return (
    <div className="video-item">
      <Link to={`/video/${video.id}`}>
        <h3 className="video-title">{truncateTitle(video.snippet.title, 8)}</h3>
        <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
        <div className="video-views">
          {formatViews(video.statistics.viewCount || 0)}
          <Link to={`/channel/${video.channelId}`}>
            <img src={video.channelImage} alt={video.channelTitle} className="channel-image" />
            {video.channelTitle}
          </Link>
        </div>
      </Link>
    </div>
  );
};

export default VideoItem;

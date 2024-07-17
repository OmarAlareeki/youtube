import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './VideoItem.css'; // Create this CSS file for styling

const VideoItem = ({ video }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const formatViews = (views) => {
    if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(0)}B`;
    if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(0)}M`;
    if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K`;
    return `${views}`;
  };

  const truncateTitle = (title) => {
    const words = title.split(' ');
    return words.length > 4 ? words.slice(0, 4).join(' ') + '...' : title;
  };

  return (
    <div
      className="video-item"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={`/video/${video.id}`}>
        <h3 className="video-title">{truncateTitle(video.snippet.title)}</h3>
        <img
          src={isHovered ? `https://img.youtube.com/vi/${video.id}/mqdefault.jpg` : video.snippet.thumbnails.high.url}
          alt={video.snippet.title}
        />
      </Link>
      <p className="video-views">
        {formatViews(video.statistics.viewCount) || 0} views
        <br />
      </p>
      <div>
        <Link
          style={{
            display: 'flex',
            textDecoration: 'none',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
          to={`/channel/${video.channelId}`} // Use your custom Channel Detail page route
        >
          <img
            style={{ width: '30px', borderRadius: '50%' }}
            src={video.channelImage}
            alt={video.channelTitle}
            className="channel-image"
          />
          {video.channelTitle}
        </Link>
      </div>
    </div>
  );
};

export default VideoItem;

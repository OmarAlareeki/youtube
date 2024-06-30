import React from 'react';
import {Link} from "react-router-dom"
const Library = ({ videoHistory, truncateTitle }) => {
  return (
    <div className="library">
      <h2>Library</h2>
      <div className="video-list">
        {videoHistory.map((video) => (
          <div className="video-item" key={video.id.videoId}>
            <Link to={`/video/${video.id.videoId}`}>
              <h3 className="video-title">{truncateTitle(video.snippet.title, 8)}</h3>
              <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Library;

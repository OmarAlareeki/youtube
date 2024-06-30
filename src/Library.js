import React from 'react';
import './Library.css';

const Library = ({ videoHistory }) => {
  return (
    <div className="library">
      <h2>Library</h2>
      <ul>
        {videoHistory.map((video, index) => (
          <li key={index}>
            <img src={video.snippet.thumbnails.default.url} alt={video.snippet.title} />
            <h3>{video.snippet.title}</h3>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Library;

import React from 'react';
import { useParams } from 'react-router-dom';
import './VideoDetails.css';

const VideoDetails = ({ videos }) => {
  const { id } = useParams();
  const video = videos.find((video) => video.id.videoId === id);

  if (!video) {
    return <p>Video not found</p>;
  }

  return (
    <div className="video-details">
      <h2>{video.snippet.title}</h2>
      <div className="video-player">
        <iframe
          title="YouTube Video Player"
          width="560"
          height="315"
          src={`https://www.youtube.com/embed/${video.id.videoId}`}
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
      <div className="video-info">
        <p><strong>Channel:</strong> {video.snippet.channelTitle}</p>
        <p><strong>Description:</strong> {video.snippet.description}</p>
      </div>
    </div>
  );
};

export default VideoDetails;

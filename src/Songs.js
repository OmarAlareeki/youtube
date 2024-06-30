import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Songs.css';

const Songs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            maxResults: 10,
            q: 'trending songs',
            key: process.env.REACT_APP_YOUTUBE_API_KEY,
            type: 'video',
            videoCategoryId: '10', // YouTube category for music
          },
        });
        setSongs(response.data.items);
      } catch (err) {
        setError('Failed to fetch songs. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  return (
    <div className="songs">
      <h2>Trending Songs</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <ul className="songs-list">
        {songs.map((song) => (
          <li key={song.id.videoId} className="song-item">
            <h3 className="song-title">{song.snippet.title}</h3>
            <img src={song.snippet.thumbnails.default.url} alt={song.snippet.title} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Songs;

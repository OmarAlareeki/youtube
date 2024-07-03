import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Movies.css';

const Movies = ({ truncateTitle }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            maxResults: 10,
            q: 'trending movies',
            key: process.env.REACT_APP_YOUTUBE_API_KEY,
            type: 'video',
            videoCategoryId: '1', // YouTube category for movies
          },
        });
        setMovies(response.data.items);
      } catch (err) {
        setError('Failed to fetch movies. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  

  return (
    <div className="movies">
      <h2>Trending Movies</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <ul className="movies-list">
        {movies.map((movie) => (
          <li key={movie.id.videoId} className="movie-item">
            <Link to={`/video/${movie.id.videoId}`}>
              <h3 className="movie-title">{truncateTitle(movie.snippet.title, 8)}</h3>
              <img src={movie.snippet.thumbnails.default.url} alt={movie.snippet.title} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Movies;

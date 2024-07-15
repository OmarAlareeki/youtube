import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import VideoItem from './VideoItem';
import './ChannelDetail.css';

const ChannelDetail = ({formatViews}) => {
  const { channelId } = useParams();
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChannelDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
          params: {
            part: 'snippet,statistics',
            id: channelId,
            key: process.env.REACT_APP_YOUTUBE_API_KEY,
          },
        });

        const videosResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
          params: {
            part: 'snippet',
            channelId: channelId,
            maxResults: 30,
            order: 'date',
            key: process.env.REACT_APP_YOUTUBE_API_KEY,
          },
        });

        const videoIds = videosResponse.data.items.map(item => item.id.videoId).join(',');

        const statsResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'statistics,snippet',
            id: videoIds,
            key: process.env.REACT_APP_YOUTUBE_API_KEY,
          },
        });

        const videosWithStats = statsResponse.data.items.map(video => ({
          ...video,
          channelTitle: channelResponse.data.items[0].snippet.title,
          channelId: channelResponse.data.items[0].id,
          channelImage: channelResponse.data.items[0].snippet.thumbnails.default.url,
        }));

        setChannel(channelResponse.data.items[0]);
        setVideos(videosWithStats);
      } catch (err) {
        setError('Failed to fetch channel details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChannelDetails();
  }, [channelId]);

  return (
    <div className="channel-detail">
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {channel && (
        <div className="channel-header" style={{ height: '300px' }}>
          <div className="channel-info">
            <img 
            style={{width: "200px"}}
            src={channel.snippet.thumbnails.high.url} alt={channel.snippet.title} className="channel-image" />
            <div>
              <h1>{channel.snippet.title}</h1>
              <p>{formatViews(channel.statistics.subscriberCount)} subscribers</p>
            </div>
          </div>
        </div>
      )}
      <div className="video-list">
        {videos.map((video) => (
          <VideoItem key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default ChannelDetail;

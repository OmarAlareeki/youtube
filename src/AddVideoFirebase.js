// AddVideoFirebase.js

import { db } from './firebase'; // Assuming you have a firebase.js file exporting db

import { collection, addDoc } from 'firebase/firestore'; // Import Firestore functions

const addVideoToLibrary = async (userId, videoData) => {
  const userVideosCollection = collection(db, 'userVideos'); // Firestore collection reference

  try {
    const docRef = await addDoc(userVideosCollection, {
      userId: userId,
      videoId: videoData.id.videoId,
      title: videoData.snippet.title,
      thumbnail: videoData.snippet.thumbnails.default.url,
      // Add other relevant video data you want to store
    });
    console.log('Video added to library with ID: ', docRef.id);
  } catch (e) {
    console.error('Error adding video to library: ', e);
  }
};

export { addVideoToLibrary };

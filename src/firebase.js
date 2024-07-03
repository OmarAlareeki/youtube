// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth,signOut, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAhYKFxv5XrkYwtw07Tj_7E55G3rHItoMQ",
    authDomain: "chat-8a301.firebaseapp.com",
    projectId: "chat-8a301",
    storageBucket: "chat-8a301.appspot.com",
    messagingSenderId: "497192685957",
    appId: "1:497192685957:web:476aea922daec781efb4ec",
    measurementId: "G-83WBRFFK9N"
  };
  
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();
  const db = getFirestore(app);
  
  export { auth, signOut, googleProvider, db };
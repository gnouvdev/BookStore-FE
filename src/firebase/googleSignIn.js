// googleSignIn.js

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from './firebase'; // Import auth from your firebase.js file
import axios from 'axios'; // Make sure you have axios installed for sending requests

const provider = new GoogleAuthProvider();

async function googleSignIn() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Get the ID token from Firebase User
    const idToken = await user.getIdToken();

    // Send ID token to the backend
    const response = await axios.post('/api/auth/google', { idToken });

    // Save JWT token received from backend for further use
    localStorage.setItem('token', response.data.token);

    // Optionally, redirect user or update UI with user info
    console.log('User Info:', user);
  } catch (error) {
    console.error("Google Sign-in error", error);
  }
}

export default googleSignIn;

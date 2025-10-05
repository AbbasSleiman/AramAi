// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAwiKP76jMUvKXPLmte4LJlv-2rirVr5MU",
  authDomain: "aramai.firebaseapp.com",
  projectId: "aramai",
  storageBucket: "aramai.firebasestorage.app",
  messagingSenderId: "115233890554",
  appId: "1:115233890554:web:b2a4adf48500b83b526943",
  measurementId: "G-L6JJVS3Q43",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const googleProvider = new GoogleAuthProvider();
export const auth = getAuth(app);

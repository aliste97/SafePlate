// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAYStNsQpYpglnVhICFgHT8222mFlpeiIk",
  authDomain: "pantrypal-budwm.firebaseapp.com",
  projectId: "pantrypal-budwm",
  storageBucket: "pantrypal-budwm.firebasestorage.app",
  messagingSenderId: "45625507051",
  appId: "1:45625507051:web:0f777c81052ae5295e52ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
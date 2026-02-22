import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQpvImxyfmOiT7jJQc9lSLAjgz2pbFSyo",
  authDomain: "clean-city-8eaae.firebaseapp.com",
  projectId: "clean-city-8eaae",
  storageBucket: "clean-city-8eaae.firebasestorage.app",
  messagingSenderId: "789178706810",
  appId: "1:789178706810:web:82b6348074c522697044c3",
  measurementId: "G-WXE08F5MJJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (check if supported as it may fail in some environments)
const analytics = typeof window !== 'undefined' ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

// Initialize other services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };

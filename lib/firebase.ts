import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// Initialize Auth with proper persistence for React Native
const auth = Platform.OS === 'web'
  ? getAuth(app)
  : initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });

const db = Platform.OS === 'web'
  ? (() => {
      try {
        // Expo web can fail on WebChannel in some networks; force long-polling for stability.
        return initializeFirestore(app, {
          experimentalForceLongPolling: true,
          useFetchStreams: false,
        });
      } catch {
        // If Firestore is already initialized (hot reload), reuse the existing instance.
        return getFirestore(app);
      }
    })()
  : getFirestore(app);
const storage = getStorage(app);

export { app, analytics, auth, db, storage };

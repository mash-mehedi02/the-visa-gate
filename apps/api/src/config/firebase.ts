import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyABCsXCtTQVwz5IP4Sc8qUIjHSB8dqeV7M",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "thevisagate-73544.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "thevisagate-73544",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "thevisagate-73544.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "881168055491",
  appId: process.env.FIREBASE_APP_ID || "1:881168055491:web:3e5e36a15c8e53efbeb676",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-F0J7GJJ6J2"
};

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const firestore = getFirestore(firebaseApp);

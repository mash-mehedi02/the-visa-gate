import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyABCsXCtTQVwz5IP4Sc8qUIjHSB8dqeV7M",
  authDomain: "thevisagate-73544.firebaseapp.com",
  projectId: "thevisagate-73544",
  storageBucket: "thevisagate-73544.firebasestorage.app",
  messagingSenderId: "881168055491",
  appId: "1:881168055491:web:3e5e36a15c8e53efbeb676",
  measurementId: "G-F0J7GJJ6J2"
};

// Initialize Firebase client instance
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore database
export const db = getFirestore(app);

// Initialize Firebase Cloud Storage for files and documents
export const storage = getStorage(app);

// Analytics initialization (browser only)
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

// lib/server/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
    apiKey: 'AIzaSyATgB2squ4Bb0e1gNhkJvMcSuoS1A8P1ys',
    authDomain: 'learn-lingo-331bb.firebaseapp.com',
    databaseURL: 'https://learn-lingo-331bb-default-rtdb.firebaseio.com',
    projectId: 'learn-lingo-331bb',
    storageBucket: 'learn-lingo-331bb.appspot.com',
    messagingSenderId: '82554963329',
    appId: '1:82554963329:web:8b815decab7628a4235480',
    measurementId: 'G-91Z93LM5KW',
};

// Avoid re-initializing
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Optional: Init Realtime Database
const db = getDatabase(app);

// Export initialized app and db
export { app, db };

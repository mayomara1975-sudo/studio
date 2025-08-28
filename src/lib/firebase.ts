import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
   apiKey: "AIzaSyCQNHmeaNenxIJSUGOvcJm2skXbpCzYceI",
  authDomain: "profeai-477m8.firebaseapp.com",
  projectId: "profeai-477m8",
  storageBucket: "profeai-477m8.firebasestorage.app",
  messagingSenderId: "248807415233",
  appId: "1:248807415233:web:981af976577cf879c0a340"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

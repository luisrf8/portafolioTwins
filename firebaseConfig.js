// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCPKjKIKwsq3WGHO_UX9i4D9vdWgv8nMX4",
  authDomain: "twins-lanza-k.firebaseapp.com",
  projectId: "twins-lanza-k",
  storageBucket: "twins-lanza-k.firebasestorage.app",
  messagingSenderId: "884280261994",
  appId: "1:884280261994:web:12c1d4e64ace7a4dbd3913",
  measurementId: "G-JT570G2395"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

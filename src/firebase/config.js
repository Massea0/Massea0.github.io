// src/firebase/config.js
import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
// Importez d'autres services Firebase si vous les utilisez (Firestore, Storage, etc.)
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCB148fmbsUwQ4lfzUP6RAY1U-s8iwUA14",
    authDomain: "arcadisspace.firebaseapp.com",
    projectId: "arcadisspace",
    storageBucket: "arcadisspace.firebasestorage.app",
    messagingSenderId: "137950081598",
    appId: "1:137950081598:web:35ead5be2b11779a44176f",
    measurementId: "G-K7R3G624FZ"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialiser d'autres services Firebase si nécessaire et les exporter
// const db = getFirestore(app);
// const storage = getStorage(app);

export {auth /*, db, storage */};
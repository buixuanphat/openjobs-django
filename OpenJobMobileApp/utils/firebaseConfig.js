import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCPmc9CrH4V9Dm8Sbo61tat93Lr5yco-Wc",
    authDomain: "fir-firebase-3e0dc.firebaseapp.com",
    databaseURL: "https://fir-firebase-3e0dc-default-rtdb.firebaseio.com",
    projectId: "fir-firebase-3e0dc",
    storageBucket: "fir-firebase-3e0dc.firebasestorage.app",
    messagingSenderId: "160347508290",
    appId: "1:160347508290:web:c71f77b1c64c7b153a27db",
    measurementId: "G-4KEPLSYQ9B"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)
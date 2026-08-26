import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA7TmPXSddxu7iI6686D8cEnD_yWe18SDA",
  authDomain: "aashnaai.firebaseapp.com",
  projectId: "aashnaai",
  storageBucket: "aashnaai.firebasestorage.app",
  messagingSenderId: "176003753915",
  appId: "1:176003753915:web:234eb197601c3fcf92869e",
  measurementId: "G-69Y8S6LNWH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);

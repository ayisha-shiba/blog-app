
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNd-Bsa1l2wqms3021MB_EbQ9qRPzCtac",
  authDomain: "blog-project-1f344.firebaseapp.com",
  projectId: "blog-project-1f344",
  storageBucket: "blog-project-1f344.firebasestorage.app",
  messagingSenderId: "1098681514821",
  appId: "1:1098681514821:web:dd01eb6c2601f7226d5c2c",
  measurementId: "G-64PHZ0C5G8",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

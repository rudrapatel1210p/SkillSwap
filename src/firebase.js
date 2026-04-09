import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBGIN6GAeT6IcbhlqjHF5rjwpy7vBE2dXs",
  authDomain: "skillswap-e5830.firebaseapp.com",
  projectId: "skillswap-e5830",
  storageBucket: "skillswap-e5830.firebasestorage.app",
  messagingSenderId: "844298479510",
  appId: "1:844298479510:web:e04e8bac70a42b751d1fb7",
  measurementId: "G-7FL9YPYC40"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

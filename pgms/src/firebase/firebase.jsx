// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCgvMsdGXXv10xvfN_NNCjiQyTtxTmrokk",
  authDomain: "pgms-ba667.firebaseapp.com",
  projectId: "pgms-ba667",
  storageBucket: "pgms-ba667.appspot.com",
  messagingSenderId: "916389254549",
  appId: "1:916389254549:web:dffb86eec8dc5abc86929c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
export { app, db };

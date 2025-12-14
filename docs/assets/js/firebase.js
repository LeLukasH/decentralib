// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBHXjodNSFrrCXgd2LkgYYkPI6kR61Noco",
    authDomain: "decentralib-f5ea4.firebaseapp.com",
    projectId: "decentralib-f5ea4",
    storageBucket: "decentralib-f5ea4.firebasestorage.app",
    messagingSenderId: "171632768700",
    appId: "1:171632768700:web:2fc799d19b72911de1c2b9",
    measurementId: "G-ZD2KLGXQYV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and db instances
export const auth = getAuth(app);
export const db = getFirestore(app);
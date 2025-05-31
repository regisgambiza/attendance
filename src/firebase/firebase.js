import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyC0wBwi8oP0KTQOt-lCW3EFu4NLTDU2zfE",
    authDomain: "tcs-class-participation.firebaseapp.com",
    projectId: "tcs-class-participation",
    storageBucket: "tcs-class-participation.firebasestorage.app",
    messagingSenderId: "116252288931",
    appId: "1:116252288931:web:2ec2358917ed8ec4d5dc16",
    measurementId: "G-JZ4PJHVG64"
  };


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
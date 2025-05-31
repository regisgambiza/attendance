import React from "react";
import { googleProvider, signInWithGoogle } from "../firebase/auth";
import '../styles/login.css';
import '../styles/login.css';


// Use exported helper instead of calling auth.signInWithPopup directly
export default function Login() {
    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
        } catch (error) {
            console.error("Firebase Authentication Error:", error);
            alert("Authentication failed. Please try again.");
        }
    };

    return (
        <div className="login-container">
            <h1>Teacher Regis Student Attendance App</h1>
            <button className="login-button" onClick={handleGoogleLogin}>
                Login via Google
            </button>
        </div>
    );
}
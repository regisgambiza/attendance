import React from "react";
import { signInWithGoogle } from "../firebase/auth";
import "../styles/login.css";

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
            <div className="login-card">
                <h1>Welcome to Teacher Regis' Attendance Tracker</h1>
                <p className="subtitle">Your simple and secure way to log student attendance</p>

                <div className="info-section">
                    <p>
                        📚 <strong>What is this?</strong><br />
                        This web app allows students to log their attendance digitally using their Google account.
                    </p>
                    <p>
                        ⏰ <strong>Why use it?</strong><br />
                        It ensures accurate records and makes attendance easy to manage for both teachers and learners.
                    </p>
                    <p>
                        🔒 <strong>Secure & Private</strong><br />
                        All logins are handled via Google, and your information is protected and only used for school attendance.
                    </p>
                </div>

                <button className="login-button" onClick={handleGoogleLogin}>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}

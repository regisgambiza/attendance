import React, { useState } from "react";
import { db } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";
import '../styles/register.css';


export default function Register({ user }) {
  const [selectedClass, setSelectedClass] = useState("");
  const [error, setError] = useState("");
  const classes = ["7/1", "7/2", "7/3", "8/1", "8/2"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedClass) {
      setError("Please select a class");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await setDoc(
        userRef,
        {
          class: selectedClass,
          name: user.displayName || "Anonymous",
        },
        { merge: true }
      );

      // App.js will detect this change and redirect automatically via onSnapshot
    } catch (err) {
      setError("Failed to save: " + err.message);
    }
  };

  return (
    <div className="register-container">
      <h1>Complete Registration</h1>
      <p>Please select your class:</p>
      <form onSubmit={handleSubmit}>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="class-select"
        >
          <option value="">Select a class</option>
          {classes.map((cls) => (
            <option key={cls} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="submit-button">
          Save
        </button>
      </form>
    </div>
  );
}

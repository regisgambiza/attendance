import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth, db } from "./firebase/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [registered, setRegistered] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        const userDocRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeDoc = onSnapshot(
          userDocRef,
          (userDoc) => {
            if (userDoc.exists() && userDoc.data().class) {
              setRegistered(true);
            } else {
              setRegistered(false);
            }
            setInitializing(false);
          },
          (error) => {
            console.error("Error listening to user document:", error);
            setRegistered(false);
            setInitializing(false);
          }
        );

        return () => {
          unsubscribeDoc();
        };
      } else {
        setUser(null);
        setRegistered(false);
        setInitializing(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  if (initializing) return <div>Loading...</div>;

  return (
    <Routes>
      <Route
        path="/"
        element={
          !user ? (
            <Login />
          ) : registered ? (
            <Navigate to="/dashboard" />
          ) : (
            <Navigate to="/register" />
          )
        }
      />
      <Route
        path="/register"
        element={
          user && !registered ? <Register user={user} /> : <Navigate to="/" />
        }
      />
      <Route
        path="/dashboard"
        element={
          user && registered ? <Dashboard user={user} /> : <Navigate to="/" />
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

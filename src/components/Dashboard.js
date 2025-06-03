import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import AttendanceButton from "./AttendanceButton";
import "../styles/dashboard.css";

export default function Dashboard({ user }) {
  const [userData, setUserData] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [lastAttendance, setLastAttendance] = useState(null);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [loadingAttendance, setLoadingAttendance] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    const fetchAttendanceStats = async () => {
      setLoadingAttendance(true);
      try {
        const attendanceQuery = query(
          collection(db, "attendance"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(attendanceQuery);
        setAttendanceCount(querySnapshot.size);

        const lastAttendanceQuery = query(
          collection(db, "attendance"),
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        const lastAttendanceSnap = await getDocs(lastAttendanceQuery);
        if (!lastAttendanceSnap.empty) {
          setLastAttendance(
            lastAttendanceSnap.docs[0].data().timestamp.toDate()
          );
        } else {
          setLastAttendance(null);
        }
      } catch (err) {
        console.error("Failed to fetch attendance data:", err);
      }
      setLoadingAttendance(false);
    };

    fetchAttendanceStats();

    const intervalId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      unsubscribeUser();
      clearInterval(intervalId);
    };
  }, [user?.uid]);

  const handleLogout = async () => {
    await auth.signOut();
  };

  if (!userData) return <div className="loading-container">Loading profile...</div>;

  const hour = currentTime.getHours();
  const greeting =
    hour < 12 ? "Good morning" :
    hour < 18 ? "Good afternoon" :
    "Good evening";

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const dayOfWeek = days[currentTime.getDay()];

  const lastAttendanceText = lastAttendance
    ? lastAttendance.toLocaleString()
    : "No attendance logged yet";

  return (
    <>
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="navbar-brand">Attendance Tracker</div>
        <div className="navbar-user">
          <div className="user-avatar">{userData.name?.charAt(0)}</div>
          <div className="user-info">
            <span className="user-name">{userData.name}</span>
            <span className="user-class">{userData.class}</span>
          </div>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="dashboard-container">
        {/* Header */}
        <section className="dashboard-header">
          <h2>.</h2>
          <h2>.</h2>
          
        </section>
        {/* Header */}
        <section className="dashboard-header"> 
          <h2>{greeting}, {userData.name}</h2>
          <p>Welcome to your attendance dashboard. Stay consistent, stay on track.</p>
        </section>

        {/* User Info */}
        <section className="user-info-card">
          <div className="info-group">
            <span className="info-label">Email</span>
            <span className="info-value">{user.email}</span>
          </div>
          <div className="info-group">
            <span className="info-label">Class</span>
            <span className="info-value">{userData.class}</span>
          </div>
          <div className="info-group">
            <span className="info-label">Day</span>
            <span className="info-value">{dayOfWeek}</span>
          </div>
          <div className="info-group">
            <span className="info-label">Current Time</span>
            <span className="info-value">{currentTime.toLocaleString()}</span>
          </div>
        </section>

        {/* Buttons */}
        <div className="top-buttons">
          <AttendanceButton user={user} userData={userData} />
        </div>

        {/* Attendance Stats */}
        <section className="attendance-info">
          <h3>Your Attendance Overview</h3>

          {loadingAttendance ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-value">{attendanceCount}</div>
                <div className="stat-label">Total Sessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {lastAttendance ? lastAttendance.toLocaleDateString() : "N/A"}
                </div>
                <div className="stat-label">Last Marked</div>
              </div>
            </div>
          )}

          <div className="last-attendance">
            <p>
              <span className="info-label">Last Attendance Time:</span>
              <span className="info-value">{lastAttendanceText}</span>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
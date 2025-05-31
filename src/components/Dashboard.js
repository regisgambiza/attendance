import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase/firebase";
import { doc, onSnapshot, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
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
          setLastAttendance(lastAttendanceSnap.docs[0].data().timestamp.toDate());
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

  if (!userData) return <div>Loading profile...</div>;

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
    <div className="dashboard-container">
      <h2>{greeting}, {userData.name}</h2>
      <p>Email: <strong>{user.email}</strong></p>
      <p>Class: <strong>{userData.class}</strong></p>
      <p>Day: <strong>{dayOfWeek}</strong></p>
      <p>Current Time: <strong>{currentTime.toLocaleString()}</strong></p>

      <div className="top-buttons">
        <AttendanceButton user={user} userData={userData} />
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="attendance-info">
        <h3>Attendance Info</h3>
        {loadingAttendance ? (
          <p>Loading attendance data...</p>
        ) : (
          <>
            <p>Total Attendance Logged: <strong>{attendanceCount}</strong></p>
            <p>Last Attendance: <strong>{lastAttendanceText}</strong></p>
          </>
        )}
      </div>
    </div>
  );
}

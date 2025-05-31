import React, { useState } from "react";
import { db } from "../firebase/firebase";
import { GeoPoint, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { getDistanceInMeters } from "../utils/geoUtils";

const SCHOOL_LAT = -26.9600556;
const SCHOOL_LNG = 29.225;
const ALLOWED_DISTANCE = 999999999999999999999;

export default function AttendanceButton({ user, userData }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    const logAttendance = async () => {
        setLoading(true);
        setError("");
        setSuccess("");

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser.");
            setLoading(false);
            return;
        }

        // Check if attendance already logged today
        try {
            const attendanceRef = collection(db, "attendance");
            const q = query(attendanceRef, where("userId", "==", user.uid));
            const querySnapshot = await getDocs(q);

            const hasLoggedToday = querySnapshot.docs.some(doc => {
                const ts = doc.data().timestamp;
                const date = ts.toDate ? ts.toDate() : new Date(ts);
                return isSameDay(date, new Date());
            });

            if (hasLoggedToday) {
                setError("You have already logged attendance today.");
                setLoading(false);
                return;
            }
        } catch (err) {
            setError("Failed to check attendance: " + err.message);
            setLoading(false);
            return;
        }

        // Get geolocation and log attendance if within allowed distance
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const distance = getDistanceInMeters(latitude, longitude, SCHOOL_LAT, SCHOOL_LNG);

                if (distance <= ALLOWED_DISTANCE) {
                    try {
                        await addDoc(collection(db, "attendance"), {
                            userId: user.uid,
                            name: userData.name,
                            class: userData.class,
                            timestamp: new Date(),
                            location: new GeoPoint(latitude, longitude),
                        });
                        setSuccess("Attendance logged successfully!");
                    } catch (err) {
                        setError("Failed to log attendance: " + err.message);
                    }
                } else {
                    setError(`You are ${distance.toFixed(2)} meters away from school. Only within ${ALLOWED_DISTANCE} meters is allowed.`);
                }
                setLoading(false);
            },
            (err) => {
                setError("Error getting location: " + err.message);
                setLoading(false);
            }
        );
    };

    return (
        <div className="attendance-container">
            <button
                onClick={logAttendance}
                disabled={loading}
                className="attendance-button"
            >
                {loading ? "Logging..." : "Log Attendance"}
            </button>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
        </div>
    );
}

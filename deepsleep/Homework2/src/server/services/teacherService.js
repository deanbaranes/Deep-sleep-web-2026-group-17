/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer (Client Proxy).
 * It abstracts the API calls from the client-side View layer.
 */
import { apiClient } from "../../config/api";

/**
 * Fetch sleep data for a specific class
 */
export async function teacherGetClassData(experimentId, classId) {
  if (!experimentId || !classId) {
    throw new Error("חובה לספק מזהה ניסוי ומזהה כיתה");
  }

  try {
    const data = await apiClient(`/api/teacher/class-data?experimentId=${experimentId}&classId=${classId}`);
    return data;
  } catch (e) {
    console.error(e);
    throw new Error("שגיאה במשיכת נתונים");
  }
}

/**
 * Returns the total number of submissions for the class
 */
export async function teacherGetSubmissionCount(experimentId, classId) {
  if (!experimentId || !classId) return 0;

  try {
    const res = await apiClient(`/api/teacher/submission-count?experimentId=${experimentId}&classId=${classId}`);
    return res.count;
  } catch (e) {
    console.error("Error counting class submissions:", e);
    return 0;
  }
}

/**
 * Registers a new Teacher (Self-Service).
 * Creates the Teacher user AND the Class document if needed.
 */
export async function registerTeacher(teacherData) {
  const { experimentId, teacherName, email, password, schoolName, grade, classNum } = teacherData;
  // Validation handled by server mostly, but keeping client validation is fine too
  // Just passing transparently
  const res = await apiClient("/api/teacher/register", {
    method: "POST",
    body: teacherData
  });
  return res;
}
/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer (Client Proxy).
 * It abstracts the API calls from the client-side View layer.
 */
import { apiClient } from "../../config/api";

/**
 * Create a new student in Database in the new hierarchy
 */
export async function researchManagerCreateStudent(studentData) {
  const { experimentId, username, password, schoolName, grade, classNum } = studentData;
  const res = await apiClient("/api/research/students", {
    method: "POST",
    body: studentData
  });
  return res.id;
}

/**
 * Delete student from Database
 */
export async function researchManagerDeleteStudent(experimentId, classId, username) {
  try {
    await apiClient("/api/research/students", {
      method: "DELETE",
      body: { experimentId, classId, username }
    });
    return true;
  } catch (e) {
    console.error("Error deleting student: ", e);
    throw new Error("שגיאה במחיקת התלמיד. וודא שהפרטים נכונים.");
  }
}
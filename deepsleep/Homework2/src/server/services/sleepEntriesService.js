/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer (now Client Service Proxy).
 * It abstracts the API calls from the client-side View layer.
 */
import { apiClient } from "../../config/api";

/**
 * Save sleep entry in hierarchical path
 * Uses Express server
 */
export async function saveSleepEntry(experimentId, classId, studentId, entry) {
  if (!experimentId || !classId || !studentId) {
    throw new Error("חסרים מזהי הקשר נדרשים (experimentId, classId, studentId)");
  }

  try {
    const { docId } = await apiClient("/api/sleep/entry", {
      body: {
        experimentId,
        classId,
        studentId,
        entry
      }
    });

    return docId;

  } catch (error) {
    console.error("Save Sleep Entry API Error:", error);
    throw error;
  }
}

/**
 * Return number of entries filled by user (for progress bar and unlock stages)
 */
export async function getUserSubmissionCount(experimentId, classId, studentId) {
  try {
    const result = await apiClient(`/api/sleep/count/${experimentId}/${classId}/${studentId}`);
    return result.count;
  } catch (err) {
    console.error("Error counting submissions:", err);
    return 0;
  }
}

/**
 * Return last submission time (timestamp) of student
 * To calculate when they can submit again (e.g. next day at 7am)
 */
export async function getLastSubmissionTime(experimentId, classId, studentId) {
  try {
    const result = await apiClient(`/api/sleep/last-time/${experimentId}/${classId}/${studentId}`);
    if (result.lastTime) {
      return new Date(result.lastTime);
    }
    return null;
  } catch (err) {
    console.error("Error fetching last submission time:", err);
    return null;
  }
}

/**
 * Fetch all sleep entries from all classes for reports
 */
export async function fetchAllSleepEntries() {
  try {
    const data = await apiClient("/api/sleep/all");
    return data;
  } catch (err) {
    console.error("Error fetching all sleep entries:", err);
    return [];
  }
}

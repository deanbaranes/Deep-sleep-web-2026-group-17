/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer (Client Proxy).
 * It abstracts the API calls from the client-side View layer.
 */
import { apiClient } from "../../config/api";

/**
 * Submits a request to add a question (e.g. by a teacher)
 */
export async function submitQuestionRequest(experimentId, classId, questionData) {
  const { text, type = "text", options = [] } = questionData;
  if (!text || !text.trim()) throw new Error("טקסט השאלה לא יכול להיות ריק");

  await apiClient("/api/questions/request", {
    method: "POST",
    body: {
      experimentId,
      classId,
      questionData: { text, type, options }
    }
  });
}

/**
 * Fetches all pending questions from all classes and experiments
 */
export async function fetchPendingQuestions() {
  const data = await apiClient("/api/questions/pending");
  // The server returns simpler object, client might expect Firestore specific properties?
  // Our server returns { id, ...data, classId, experimentId, path }.
  // The logic in client might rely on 'd.ref.parent.parent'. Let's check usages.
  // Actually, client usages usually just use the data fields.
  // If usage depends on 'path', we provided it.
  return data;
}

/**
 * Approve list of questions (including edit and categorize)
 */
export async function approveQuestions(approvedQuestionsList) {
  await apiClient("/api/questions/approve", {
    method: "POST",
    body: { approvedQuestionsList }
  });
}

/**
 * Fetch active questions (for students/dashboard usage)
 */
export async function fetchActiveQuestions(experimentId, classId) {
  const data = await apiClient(`/api/questions/active/${experimentId}/${classId}`);
  return data;
}

/**
 * Fetch all active questions from all classes for reports
 */
export async function fetchAllGlobalActiveQuestions() {
  const data = await apiClient("/api/questions/active/all");
  return data;
}

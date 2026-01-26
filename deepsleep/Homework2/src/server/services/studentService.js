/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer (Client Proxy).
 * It abstracts the API calls from the client-side View layer.
 */
import { apiClient } from "../../config/api";

/**
 * Handles the "Anonymous" login for a student using a specific code (e.g., last 4 digits).
 */
export async function getOrCreateAnonymousStudent(experimentId, classId, localCode) {
    if (!localCode || localCode.length < 3) {
        throw new Error("קוד זיהוי חייב להכיל לפחות 3 תווים");
    }

    const data = await apiClient("/api/users/student-login", {
        method: "POST",
        body: { experimentId, classId, localCode }
    });
    return data;
}

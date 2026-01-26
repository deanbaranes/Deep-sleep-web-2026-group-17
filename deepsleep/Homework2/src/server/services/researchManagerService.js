/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer (Client Proxy).
 * It abstracts the API calls from the client-side View layer.
 */
import { apiClient } from "../../config/api";

/**
 * Fetch all classes for a specific experiment
 */
export async function fetchResearchClasses(experimentId) {
    if (!experimentId) throw new Error("Experiment ID is required");
    const data = await apiClient(`/api/research/classes/${experimentId}`);
    return data;
}

/**
 * Create a new class within an experiment
 */
export async function createResearchClass(experimentId, classId, classData) {
    if (!experimentId || !classId) throw new Error("Missing ID");
    await apiClient("/api/research/classes", {
        method: "POST",
        body: { experimentId, classId, classData }
    });
}

/**
 * Fetch all available experiments
 */
export async function fetchAllExperiments() {
    const data = await apiClient("/api/research/experiments");
    return data;
}

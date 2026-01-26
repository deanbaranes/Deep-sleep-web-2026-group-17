/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer (Client Proxy).
 * It abstracts the API calls from the client-side View layer.
 */
import { apiClient } from "../../config/api";

export async function ensureResearcherSeed() {
  await apiClient("/api/users/seed-researcher", {
    method: "POST"
  });
}

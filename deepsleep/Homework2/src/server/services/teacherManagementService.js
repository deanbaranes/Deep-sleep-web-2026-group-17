/**
 * Logical Backend Service
 * -----------------------
 * This file is part of the server-side logic layer (Client Proxy).
 * It abstracts the API calls from the client-side View layer.
 */
import { apiClient } from "../../config/api";

/**
 * Creates a new Teacher user in the database.
 * The classId is strictly derived from the School -> Grade -> Class hierarchy.
 */
export async function researchManagerCreateTeacher(teacherData) {
  // Pass same validation from client, server will also validate
  const res = await apiClient("/api/teacher/create", {
    method: "POST",
    body: teacherData
  });
  return res;
}

import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
// Check for environment variable first (Production)
let serviceAccount;

// 1. Try Environment Variable
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (error) {
        console.error("Error parsing FIREBASE_SERVICE_ACCOUNT JSON:", error.message);
    }
}

// 2. Fallback to File (only if env var failed/missing)
if (!serviceAccount) {
    try {
        serviceAccount = require("./serviceAccountKey.json");
    } catch (error) {
        // Silent fallback, final check will catch it
    }
}

// 3. Final Check
if (!serviceAccount) {
    console.error("CRITICAL: No Firebase credentials found via Env Var or File.");
    // We throw a clear error that will show up in Vercel logs
    throw new Error("Firebase Credentials Missing. Please checks FIREBASE_SERVICE_ACCOUNT environment variable.");
}

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    if (!/already exists/.test(error.message)) {
        console.error("Firebase admin initialization error", error.stack);
    }
}

export const db = admin.firestore();
export const auth = admin.auth();
export { admin };

console.log("Firebase Admin Initialized");

import express from "express";
import { db, admin } from "../config/firebase.js";
const router = express.Router();

// GET /api/teacher/class-data - Fetch all entries for class (export)
router.get("/class-data", async (req, res) => {
    try {
        const { experimentId, classId } = req.query;
        if (!experimentId || !classId) return res.status(400).json({ error: "Missing required query params" });

        const snapshot = await db.collection("experiments").doc(experimentId).collection("classes").doc(classId).collection("responses").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        res.json(data);
    } catch (error) {
        console.error("Error fetching class data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/teacher/submission-count
router.get("/submission-count", async (req, res) => {
    try {
        const { experimentId, classId } = req.query;
        if (!experimentId || !classId) return res.json({ count: 0 });

        const snapshot = await db.collection("experiments").doc(experimentId).collection("classes").doc(classId).collection("responses").get();
        res.json({ count: snapshot.size });
    } catch (error) {
        console.error("Error counting submissions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Helper for username check
async function isTeacherUsernameTaken(username) {
    const snapshot = await db.collectionGroup("users")
        .where("role", "==", "teacher")
        .where("username", "==", username)
        .limit(1)
        .get();
    return !snapshot.empty;
}

const sanitize = (str) => str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\u0590-\u05FF]/g, '');

// POST /api/teacher/register - Self register
router.post("/register", async (req, res) => {
    try {
        const { experimentId, teacherName, email, password, schoolName, grade, classNum } = req.body;

        if (!experimentId || !teacherName || !email || !password || !schoolName || !grade || !classNum) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const trimmedEmail = email.trim();
        if (await isTeacherUsernameTaken(trimmedEmail)) {
            return res.status(400).json({ error: "Email already taken" });
        }

        const safeSchool = sanitize(schoolName);
        const safeGrade = sanitize(grade);
        const safeClassNum = sanitize(classNum);
        const derivedClassId = `${safeSchool}_${safeGrade}_${safeClassNum}`;

        const customId = `Teacher-${derivedClassId}-${sanitize(teacherName)}`;

        // Admin SDK operations
        // 1. Ensure Exp exists
        await db.collection("experiments").doc(experimentId).set({
            id: experimentId,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 2. Ensure Class exists
        await db.collection("experiments").doc(experimentId).collection("classes").doc(derivedClassId).set({
            schoolName,
            grade,
            classNum,
            experimentId,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 3. Create Teacher User
        const userData = {
            role: "teacher",
            fullName: teacherName,
            username: trimmedEmail,
            email: trimmedEmail,
            password,
            schoolName,
            grade,
            classNum,
            experimentId,
            classId: derivedClassId,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("experiments").doc(experimentId).collection("classes").doc(derivedClassId).collection("users").doc(customId).set(userData);

        res.json({ id: customId, ...userData });

    } catch (error) {
        console.error("Teacher registration error:", error);
        res.status(500).json({ error: error.message });
    }
});

// POST /api/teacher/create - Manager create teacher
router.post("/create", async (req, res) => {
    try {
        const { experimentId, teacherName, email, password, schoolName, grade, classNum } = req.body;

        if (!experimentId || !teacherName || !email || !password || !schoolName || !grade || !classNum) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const trimmedEmail = email.trim();
        if (await isTeacherUsernameTaken(trimmedEmail)) {
            return res.status(400).json({ error: "Email already taken" });
        }

        const safeSchool = sanitize(schoolName);
        const safeGrade = sanitize(grade);
        const safeClassNum = sanitize(classNum);
        const derivedClassId = `${safeSchool}_${safeGrade}_${safeClassNum}`;

        const customId = `Teacher-${derivedClassId}-${sanitize(teacherName)}`;

        await db.collection("experiments").doc(experimentId).set({
            id: experimentId,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        await db.collection("experiments").doc(experimentId).collection("classes").doc(derivedClassId).set({
            schoolName,
            grade,
            classNum,
            experimentId,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        const userData = {
            role: "teacher",
            fullName: teacherName,
            username: trimmedEmail,
            email: trimmedEmail,
            password,
            schoolName,
            grade,
            classNum,
            experimentId,
            classId: derivedClassId,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await db.collection("experiments").doc(experimentId).collection("classes").doc(derivedClassId).collection("users").doc(customId).set(userData);

        res.json({ id: customId, classId: derivedClassId });
    } catch (error) {
        console.error("Manager create teacher error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;

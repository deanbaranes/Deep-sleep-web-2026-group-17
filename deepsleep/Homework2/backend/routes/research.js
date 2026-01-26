import express from "express";
import { db, admin } from "../config/firebase.js";
const router = express.Router();

// GET /api/research/experiments - Fetch all experiments
router.get("/experiments", async (req, res) => {
    try {
        const snapshot = await db.collection("experiments").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(data);
    } catch (error) {
        console.error("Error fetching experiments:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/research/classes/:experimentId - Fetch classes for experiment
router.get("/classes/:experimentId", async (req, res) => {
    try {
        const { experimentId } = req.params;
        const snapshot = await db.collection("experiments").doc(experimentId).collection("classes").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(data);
    } catch (error) {
        console.error("Error fetching classes:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/research/classes - Create class
router.post("/classes", async (req, res) => {
    try {
        const { experimentId, classId, classData } = req.body;
        if (!experimentId || !classId) return res.status(400).json({ error: "Missing ID" });

        // 1. Ensure ROOT Experiment
        await db.collection("experiments").doc(experimentId).set({
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
            id: experimentId
        }, { merge: true });

        // 2. Create Class
        await db.collection("experiments").doc(experimentId).collection("classes").doc(classId).set({
            ...classData,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            experimentId
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error creating class:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Helper for student username check
async function isStudentUsernameTaken(username) {
    const snapshot = await db.collectionGroup("users")
        .where("role", "==", "student")
        .where("username", "==", username)
        .limit(1)
        .get();
    return !snapshot.empty;
}

const sanitize = (str) => str.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-\u0590-\u05FF]/g, '');

// POST /api/research/students - Create student
router.post("/students", async (req, res) => {
    try {
        const { experimentId, username, password, schoolName, grade, classNum } = req.body;

        if (!experimentId || !username || !password || !schoolName || !grade || !classNum) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const trimmedUser = username.trim();
        if (await isStudentUsernameTaken(trimmedUser)) {
            return res.status(400).json({ error: "Username taken" });
        }

        const safeSchool = sanitize(schoolName);
        const safeGrade = sanitize(grade);
        const safeClassNum = sanitize(classNum);
        const derivedClassId = `${safeSchool}_${safeGrade}_${safeClassNum}`;

        const customId = `Student-${derivedClassId}-${trimmedUser}`;

        await db.collection("experiments").doc(experimentId).collection("classes").doc(derivedClassId).collection("users").doc(customId).set({
            role: "student",
            username: trimmedUser,
            password: password.trim(),
            className: `${grade}${classNum}`,
            schoolName,
            grade,
            classNum,
            experimentId,
            classId: derivedClassId,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ id: customId });

    } catch (error) {
        console.error("Error creating student:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE /api/research/students - Delete student
router.delete("/students", async (req, res) => {
    try {
        const { experimentId, classId, username } = req.body; // Using body for DELETE is allowed but sometimes tricky. Query param better? Or path?
        // Let's use body for consistent object passing
        const trimmedExpId = experimentId.trim();
        const trimmedClassId = classId.trim();
        const trimmedUsername = username.trim();

        const customId = `Student-${trimmedClassId}-${trimmedUsername}`;
        await db.collection("experiments").doc(trimmedExpId).collection("classes").doc(trimmedClassId).collection("users").doc(customId).delete();

        res.json({ success: true });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


export default router;

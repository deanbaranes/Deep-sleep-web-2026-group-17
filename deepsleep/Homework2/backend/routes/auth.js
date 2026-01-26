import express from "express";
import { db, admin } from "../config/firebase.js";
const router = express.Router();

router.post("/login", async (req, res) => {
    try {
        const { role, username, password } = req.body;

        if (!role || !username || !password) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Search across all "users" collections
        const snapshot = await db.collectionGroup("users")
            .where("role", "==", role)
            .where("username", "==", username.trim())
            .where("password", "==", password.trim())
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const doc = snapshot.docs[0];
        const userData = doc.data();

        // Remove sensitive data if necessary (e.g. password) before sending back
        // delete userData.password; 

        res.status(200).json({
            id: doc.id,
            ...userData
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// POST /api/users/student-login - Anonymous Student Login
router.post("/student-login", async (req, res) => {
    try {
        const { experimentId, classId, localCode } = req.body;

        if (!localCode || localCode.length < 3) {
            return res.status(400).json({ error: "Code too short" });
        }

        const studentId = localCode.trim();
        const studentRef = db.collection("experiments").doc(experimentId).collection("classes").doc(classId).collection("users").doc(studentId);

        const docSnap = await studentRef.get();

        if (docSnap.exists) {
            // Existing
            const data = docSnap.data();
            res.json({
                id: studentId,
                experimentId,
                classId,
                role: "student",
                username: studentId,
                ...data
            });
        } else {
            // New
            const newStudentData = {
                role: "student",
                username: studentId,
                code: studentId,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                isAnonymous: true
            };

            await studentRef.set(newStudentData);

            res.json({
                id: studentId,
                experimentId,
                classId,
                role: "student",
                ...newStudentData
            });
        }

    } catch (error) {
        console.error("Student login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/users/seed-researcher - Ensure default researcher exists
router.post("/seed-researcher", async (req, res) => {
    try {
        const researcherRef = db.collection("users").doc("researchManager_123");
        const snap = await researcherRef.get();

        if (!snap.exists) {
            await researcherRef.set({
                role: "researchManager",
                username: "123",
                password: "123",
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            console.log("Seeded research manager");
        }
        res.json({ success: true });
    } catch (error) {
        console.error("Seed error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;

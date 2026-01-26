import express from "express";
import { db, admin } from "../config/firebase.js";
const router = express.Router();

router.post("/entry", async (req, res) => {
    try {
        const { experimentId, classId, studentId, entry } = req.body;

        if (!experimentId || !classId || !studentId || !entry) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const dateStr = entry.date || new Date().toISOString().split('T')[0];
        const docId = `${studentId}_${dateStr}`;

        const path = `experiments/${experimentId}/classes/${classId}/responses/${docId}`;
        await db.doc(path).set({
            ...entry,
            studentId,
            experimentId,
            classId,
            date: dateStr,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ success: true, docId });

    } catch (error) {
        console.error("Sleep entry error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// GET /api/sleep/count/:experimentId/:classId/:studentId
router.get("/count/:experimentId/:classId/:studentId", async (req, res) => {
    try {
        const { experimentId, classId, studentId } = req.params;
        const collRef = db.collection("experiments").doc(experimentId).collection("classes").doc(classId).collection("responses");
        const snapshot = await collRef.where("studentId", "==", studentId).get();
        // Admin SDK might support count(), but .get().size is safe for small numbers
        res.json({ count: snapshot.size });
    } catch (error) {
        console.error("Error counting submissions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/sleep/last-time/:experimentId/:classId/:studentId
router.get("/last-time/:experimentId/:classId/:studentId", async (req, res) => {
    try {
        const { experimentId, classId, studentId } = req.params;
        const collRef = db.collection("experiments").doc(experimentId).collection("classes").doc(classId).collection("responses");
        const snapshot = await collRef.where("studentId", "==", studentId).get();

        if (snapshot.empty) {
            return res.json({ lastTime: null });
        }

        // Manual sort (Server-side) to avoid composite index requirement
        const docs = snapshot.docs.map(d => d.data());
        docs.sort((a, b) => {
            const timeA = a.updatedAt?.toDate ? a.updatedAt.toDate().getTime() : 0;
            const timeB = b.updatedAt?.toDate ? b.updatedAt.toDate().getTime() : 0;
            return timeB - timeA;
        });

        const latest = docs[0];
        res.json({ lastTime: latest.updatedAt ? latest.updatedAt.toDate() : null });

    } catch (error) {
        console.error("Error fetching last submission time:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/sleep/all - Fetch all entries from all collections (Collection Group)
router.get("/all", async (req, res) => {
    try {
        const snapshot = await db.collectionGroup("responses").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(data);
    } catch (error) {
        console.error("Error fetching all sleep entries:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/sleep/class/:experimentId/:classId - Fetch entries for a specific class
router.get("/class/:experimentId/:classId", async (req, res) => {
    try {
        const { experimentId, classId } = req.params;
        const colRef = db.collection("experiments").doc(experimentId).collection("classes").doc(classId).collection("responses");
        const snapshot = await colRef.get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(data);
    } catch (error) {
        console.error("Error fetching class entries:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;

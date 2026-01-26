import express from "express";
import { db, admin } from "../config/firebase.js";
const router = express.Router();

// POST /api/questions/request - Submit a question request
router.post("/request", async (req, res) => {
    try {
        const { experimentId, classId, questionData } = req.body;
        const { text, type = "text", options = [] } = questionData;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: "Text is required" });
        }

        const ref = db.collection("experiments").doc(experimentId).collection("classes").doc(classId).collection("questionRequests");
        await ref.add({
            text,
            type,
            options,
            status: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true });
    } catch (error) {
        console.error("Error submitting question:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/questions/pending - Fetch all pending questions
router.get("/pending", async (req, res) => {
    try {
        const snapshot = await db.collectionGroup("questionRequests").where("status", "==", "pending").get();
        const data = snapshot.docs.map(doc => {
            const classRef = doc.ref.parent.parent;
            const expRef = classRef.parent.parent;
            return {
                id: doc.id,
                ...doc.data(),
                classId: classRef.id,
                experimentId: expRef.id,
                path: doc.ref.path
            };
        });
        res.json(data);
    } catch (error) {
        console.error("Error fetching pending questions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST /api/questions/approve - Approve list of questions
router.post("/approve", async (req, res) => {
    try {
        const { approvedQuestionsList } = req.body;
        const batch = db.batch();

        for (const item of approvedQuestionsList) {
            const { originalId, finalText, category, classId, experimentId, type, options } = item;
            if (!classId || !experimentId) continue;

            // 1. Create in activeQuestions
            const newRef = db.collection("experiments").doc(experimentId).collection("classes").doc(classId).collection("activeQuestions").doc();
            batch.set(newRef, {
                text: finalText,
                category: category || "general",
                type: type || "text",
                options: options || [],
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                originRequestId: originalId,
                isVisible: true
            });

            // 2. Update status of request
            const reqRef = db.collection("experiments").doc(experimentId).collection("classes").doc(classId).collection("questionRequests").doc(originalId);
            batch.update(reqRef, {
                status: "approved",
                approvedAt: admin.firestore.FieldValue.serverTimestamp(),
                finalQuestionId: newRef.id
            });
        }

        await batch.commit();
        res.json({ success: true });

    } catch (error) {
        console.error("Error approving questions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/questions/active/all - Fetch all active questions
router.get("/active/all", async (req, res) => {
    try {
        const snapshot = await db.collectionGroup("activeQuestions").get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(data);
    } catch (error) {
        console.error("Error fetching all active questions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET /api/questions/active/:experimentId/:classId - Fetch active questions for class
router.get("/active/:experimentId/:classId", async (req, res) => {
    try {
        const { experimentId, classId } = req.params;
        const ref = db.collection("experiments").doc(experimentId).collection("classes").doc(classId).collection("activeQuestions");
        const snapshot = await ref.get();
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(data);
    } catch (error) {
        console.error("Error fetching class questions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./backend/routes/auth.js";
import sleepRoutes from "./backend/routes/sleep.js";
import questionsRoutes from "./backend/routes/questions.js";
import researchRoutes from "./backend/routes/research.js";
import teacherRoutes from "./backend/routes/teacher.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", authRoutes);
app.use("/api/sleep", sleepRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/teacher", teacherRoutes);

app.get("/", (req, res) => {
    res.send("DeepSleep API Server is running");
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: "Internal Server Error",
        message: err.message,
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Export app for Vercel
export default app;

// Only listen when running locally
if (process.env.NODE_ENV !== "production") {
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    });
}

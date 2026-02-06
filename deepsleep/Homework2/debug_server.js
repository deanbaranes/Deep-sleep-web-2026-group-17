import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./backend/routes/auth.js";
import sleepRoutes from "./backend/routes/sleep.js";
import questionsRoutes from "./backend/routes/questions.js";
import researchRoutes from "./backend/routes/research.js";
import teacherRoutes from "./backend/routes/teacher.js";

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

console.log("------------------------------------------------");
console.log("DEBUG: Loading Routes...");
try {
    console.log("DEBUG: Auth Routes Stack:", authRoutes?.stack?.length);
    console.log("DEBUG: Sleep Routes Stack:", sleepRoutes?.stack?.length);
    console.log("DEBUG: Teacher Routes Stack:", teacherRoutes?.stack?.length);
} catch (e) {
    console.error("Error inspecting routes:", e);
}
console.log("------------------------------------------------");


dotenv.config();

const app = express();
const port = 3333; // FORCE PORT FOR DEBUGGING

// Middleware
app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => res.send("TEST WORKS"));

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
    });
});

console.log("Attempting to listen on port", port);
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

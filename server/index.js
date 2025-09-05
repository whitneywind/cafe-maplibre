import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import cafesRouter from "./routes/cafes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();

// enable CORS for all origins (restrict this later)
app.use(cors());

// Basic middleware
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api", cafesRouter);

// Serve the React app (optional for now)
// app.use(express.static(path.join(__dirname, "../src")));

// Simple health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

export default app;

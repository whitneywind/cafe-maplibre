import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cafesRouter from "./routes/cafes.js";

dotenv.config();

const app = express();

// enable CORS for all origins (restrict this later)
app.use(cors());

// basic middleware
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// API routes
app.use("/api/cafes", cafesRouter);

// Simple health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

export default app;

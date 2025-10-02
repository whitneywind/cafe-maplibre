import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cafesRouter from "./routes/cafes.js";

dotenv.config();

const app = express();

// enable CORS for all origins (i'll restrict this later)
app.use(cors());

// basic middleware
app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});

// API routes
app.use("/api/cafes", cafesRouter);

// Simple health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Nominatim geocoding proxy
app.get("/api/geocode", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Missing query parameter 'q'" });

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`,
      {
        headers: {
          "User-Agent": "coffeeshopmap", 
          "Referer": "http://localhost:3000",
        },
  }
    );

        // Ensure you got a JSON response
    if (!response.ok) {
      console.log("Nominatim response not OK:", response.status);
      return res.status(response.status).json({ error: "Failed to fetch geocoding data" });
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("Geocode proxy error:", err);
    res.status(500).json({ error: "Failed to fetch geocoding data" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

export default app;

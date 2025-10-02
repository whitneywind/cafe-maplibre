import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db/pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, "../src/assets/neighborhoods/nbrs.json");
const rawData = fs.readFileSync(jsonPath, "utf8");
const data = JSON.parse(rawData);

async function importNeighborhoods() {
  for (const feature of data.features) {
    const name = feature.name || "unknown";
    const geojsonString = JSON.stringify(feature.geometry);

    try {
      await pool.query(
        `INSERT INTO neighborhoods (name, geom)
         VALUES ($1, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))
         ON CONFLICT DO NOTHING`,
        [name, geojsonString]
      );
    } catch (err) {
      console.error(`Error inserting neighborhood ${name}:`, err.message);
    }
  }

  console.log("Neighborhoods imported successfully!");
  process.exit(0);
}

importNeighborhoods().catch((err) => {
  console.error(err);
  process.exit(1);
});

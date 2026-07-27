import { Router } from "express";
import pool from "../db/pool.js";
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

// GET /neighborhoods
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geom)::jsonb,
            'properties', jsonb_build_object(
              'id', id,
              'name', name
            )
          )
        )
      ) AS geojson
      FROM neighborhoods
      WHERE name IS NOT NULL;
    `);

    res.json(result.rows[0].geojson);
  } catch (err) {
    console.error("Error fetching neighborhoods:", err);
    res.status(500).send("Error fetching neighborhoods");
  }
});

// POST /neighborhoods
router.post("/", requireAuth, requireRole('admin', 'moderator'), async (req, res) => {
  const { name, geometry } = req.body;

  try {
    await pool.query(
      `
      INSERT INTO neighborhoods (name, geom)
      VALUES ($1, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326))
      `,
      [name, JSON.stringify(geometry)]
    );

    res.status(201).json({ message: "Neighborhood added successfully" });
  } catch (err) {
    console.error("Error adding neighborhood:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;

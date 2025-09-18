import { Router } from "express";
import pool from "../db/pool.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT jsonb_build_object(
        'type', 'FeatureCollection',
        'features', jsonb_agg(
          jsonb_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(coordinates)::jsonb,
            'properties', to_jsonb(c) - 'coordinates'
          )
        )
      ) AS geojson
      FROM cafes c;
    `);
    res.json(result.rows[0].geojson);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching cafes");
  }
});

router.post("/", async (req, res) => {
  const {
    id,
    name,
    address,
    coordinates,
    website,
    opening_hours,
    specialty,
    roaster,
    in_house_roast,
    outdoor_seating,
    wifi,
    special_items,
    vibe_tags,
  } = req.body;

  try {
    await pool.query(
      `INSERT INTO cafes (
        id, name, address, website, opening_hours, specialty,
        roaster, in_house_roast, outdoor_seating, wifi, special_items, vibe_tags, coordinates
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,$11,$12,ST_SetSRID(ST_MakePoint($13, $14),4326)
      )
      ON CONFLICT (id) DO NOTHING`,
      [
        id,
        name,
        address,
        website,
        opening_hours,
        specialty,
        roaster,
        in_house_roast,
        outdoor_seating,
        wifi,
        special_items,
        vibe_tags,
        coordinates[0], // lng
        coordinates[1], // lat
      ]
    );

    res.status(201).json({ message: "Cafe added successfully" });
  } catch (err) {
    console.error("Error adding cafe:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// DELETE /cafes/:id
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("id in cafes.js: ", id)

  try {
    const result = await pool.query(
      "DELETE FROM cafes WHERE id = $1 RETURNING *",
      [id]
    );
    console.log("result: ", result)

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cafe not found" });
    }

    res.json({ message: "Cafe removed successfully", cafe: result.rows[0] });
  } catch (err) {
    console.error("Error deleting cafe:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

export default router;

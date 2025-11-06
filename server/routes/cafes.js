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
    neighborhood,
    website,
    opening_hours,
    phone,
    instagram,
    parking,
    closest_metro,
    bathroom,
    specialty,
    in_house_roast,
    outdoor_seating,
    wifi,
    outlets,
    laptop_friendly,
    roaster,
    special_items,
    notes,
  } = req.body;

  if (!id || !name || !coordinates || coordinates.length !== 2) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // todo: make array properties (currently null) into string for db (special_items, roaster)
  try {
    await pool.query(
      `INSERT INTO cafes (
        id,
        name,
        address,
        neighborhood,
        website,
        opening_hours,
        phone,
        instagram,
        parking,
        closest_metro,
        bathroom,
        specialty,
        in_house_roast,
        outdoor_seating,
        wifi,
        outlets,
        laptop_friendly,
        roaster,
        special_items, 
        notes,
        coordinates
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17,
        $18, $19, $20,
        ST_SetSRID(ST_MakePoint($21, $22), 4326)
      )
      ON CONFLICT (id) DO NOTHING`,
      [
        id,
        name,
        address,
        neighborhood,
        website,
        opening_hours,
        phone,
        instagram,
        parking,
        closest_metro,
        bathroom,
        specialty,
        in_house_roast,
        outdoor_seating,
        wifi,
        outlets,
        laptop_friendly,
        roaster,
        special_items,
        notes,
        parseFloat(coordinates[0]),
        parseFloat(coordinates[1]),
      ]
    );

    res.status(201).json({ message: "Cafe added successfully" });
  } catch (err) {
    console.error("Error adding cafe:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;

  const {
    name,
    address,
    coordinates,
    neighborhood,
    website,
    opening_hours,
    phone,
    instagram,
    parking,
    closest_metro,
    bathroom,
    specialty,
    in_house_roast,
    outdoor_seating,
    wifi,
    outlets,
    laptop_friendly,
    roaster,
    special_items,
    notes,
  } = req.body;

  if (!id || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `UPDATE cafes
       SET
         name = $1,
         address = $2,
         neighborhood = $3,
         website = $4,
         opening_hours = $5,
         phone = $6,
         instagram = $7,
         parking = $8,
         closest_metro = $9,
         bathroom = $10,
         specialty = $11,
         in_house_roast = $12,
         outdoor_seating = $13,
         wifi = $14,
         outlets = $15,
         laptop_friendly = $16,
         roaster = $17,
         special_items = $18,
         notes = $19,
         coordinates = ST_SetSRID(ST_MakePoint($20, $21), 4326)
       WHERE id = $22
       RETURNING *`,
      [
        name,
        address,
        neighborhood,
        website,
        opening_hours,
        phone,
        instagram,
        parking,
        closest_metro,
        bathroom,
        specialty,
        in_house_roast,
        outdoor_seating,
        wifi,
        outlets,
        laptop_friendly,
        Array.isArray(roaster) ? roaster : [],
        Array.isArray(special_items) ? special_items : [],
        notes,
        coordinates ? parseFloat(coordinates[0]) : null,
        coordinates ? parseFloat(coordinates[1]) : null,
        id,
      ]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Cafe not found" });
    }

    res.json({ message: "Cafe updated successfully", cafe: result.rows[0] });
  } catch (err) {
    console.error("Error updating cafe:", err);
    res.status(500).json({ error: "Database error" });
  }
});


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

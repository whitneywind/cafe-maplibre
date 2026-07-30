import { Router } from "express";
import pool from "../db/pool.js";
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = Router();

const BATHROOM_ACCESS_VALUES = new Set([
  "open",
  "key-required",
  "password-required",
  "unavailable",
]);

const EDITABLE_FIELDS = [
  "name",
  "address",
  "neighborhood",
  "roaster",
  "in_house_roast",
  "specialty",
  "coffee_rec",
  "matcha_rec",
  "matcha",
  "matcha_brand",
  "alt_milks",
  "alt_milks_cost",
  "latte_price",
  "popular_items",
  "bathroom",
  "bathroom_access",
  "indoor_seating",
  "outdoor_seating",
  "wifi",
  "outlets",
  "laptop_friendly",
  "parking",
  "closest_metro",
  "opening_hours",
  "website",
  "phone",
  "instagram",
  "notes",
];

const normalizeBathroomAccess = (value) => {
  return typeof value === "string" && BATHROOM_ACCESS_VALUES.has(value)
    ? value
    : null;
};

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

router.post("/", requireAuth, requireRole('admin', 'moderator'), async (req, res) => {
  const {
    id,
    name,
    address,
    coordinates,
    neighborhood,
    roaster,
    coffee_rec,
    matcha_rec,
    in_house_roast,
    specialty,
    matcha,
    matcha_brand,
    alt_milks,
    alt_milks_cost,
    latte_price,
    popular_items,
    bathroom,
    bathroom_access,
    indoor_seating,
    outdoor_seating,
    wifi,
    outlets,
    laptop_friendly,
    parking,
    closest_metro,
    opening_hours,
    website,
    phone,
    instagram,
    notes,
  } = req.body;

  if (!id || !name || !coordinates || coordinates.length !== 2) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const normalizedBathroomAccess = normalizeBathroomAccess(bathroom_access);

  try {
    await pool.query(
      `INSERT INTO cafes (
        id, name, address, neighborhood,
        roaster, in_house_roast, specialty, coffee_rec, matcha_rec,
        matcha, matcha_brand, alt_milks, alt_milks_cost, latte_price, popular_items,
        bathroom, bathroom_access, indoor_seating, outdoor_seating, wifi, outlets, laptop_friendly,
        parking, closest_metro, opening_hours, website, phone, instagram, notes,
        coordinates
      )
      VALUES (
        $1,$2,$3,$4,
        $5,$6,$7,$8,$9,
        $10,$11,$12,$13,$14,$15,
        $16,$17,$18,$19,$20,$21,$22,
        $23,$24,$25,$26,$27,$28,$29,
        ST_SetSRID(ST_MakePoint($30, $31), 4326)
      )
      ON CONFLICT (id) DO NOTHING`,
      [
        id,
        name,
        address || null,
        neighborhood || null,
        Array.isArray(roaster) ? roaster : null,
        in_house_roast ?? null,
        specialty ?? false,
        coffee_rec ?? null,
        matcha_rec ?? null,
        matcha ?? null,
        matcha_brand || null,
        Array.isArray(alt_milks) ? alt_milks : null,
        alt_milks_cost || null,
        latte_price || null,
        Array.isArray(popular_items) ? popular_items : null,
        bathroom ?? null,
        normalizedBathroomAccess,
        indoor_seating ?? null,
        outdoor_seating ?? null,
        wifi ?? null,
        outlets ?? null,
        laptop_friendly ?? null,
        parking || null,
        closest_metro || null,
        opening_hours || null,
        website || null,
        phone || null,
        instagram || null,
        notes || null,
        parseFloat(coordinates[0]),
        parseFloat(coordinates[1])
      ]
    );

    res.status(201).json({ message: "Cafe added successfully" });
  } catch (err) {
    console.error("Error adding cafe:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

router.put("/:id", requireAuth, requireRole('admin', 'moderator'), async (req, res) => {
  const { id } = req.params;

  const {
    name,
    address,
    coordinates,
    neighborhood,
    roaster,
    in_house_roast,
    specialty,
    coffee_rec,
    matcha_rec,
    matcha,
    matcha_brand,
    alt_milks,
    alt_milks_cost,
    latte_price,
    popular_items,
    bathroom,
    bathroom_access,
    indoor_seating,
    outdoor_seating,
    wifi,
    outlets,
    laptop_friendly,
    parking,
    closest_metro,
    opening_hours,
    website,
    phone,
    instagram,
    notes,
  } = req.body;

  if (!id || !name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const normalizedBathroomAccess = normalizeBathroomAccess(bathroom_access);

  try {
    const result = await pool.query(
      `UPDATE cafes
      SET
        name = $1,
        address = $2,
        neighborhood = $3,
        roaster = $4,
        in_house_roast = $5,
        specialty = $6,
        coffee_rec = $7,
        matcha_rec = $8,
        matcha = $9,
        matcha_brand = $10,
        alt_milks = $11,
        alt_milks_cost = $12,
        latte_price = $13,
        popular_items = $14,
        bathroom = $15,
        bathroom_access = $16,
        indoor_seating = $17,
        outdoor_seating = $18,
        wifi = $19,
        outlets = $20,
        laptop_friendly = $21,
        parking = $22,
        closest_metro = $23,
        opening_hours = $24,
        website = $25,
        phone = $26,
        instagram = $27,
        notes = $28,
        coordinates = ST_SetSRID(ST_MakePoint($29, $30), 4326)
      WHERE id = $31
       RETURNING *`,
      [
        name,
        address || null,
        neighborhood || null,
        Array.isArray(roaster) ? roaster : null,
        in_house_roast ?? null,
        specialty ?? false,
        coffee_rec ?? null,
        matcha_rec ?? null,
        matcha ?? null,
        matcha_brand || null,
        Array.isArray(alt_milks) ? alt_milks : null,
        alt_milks_cost || null,
        latte_price || null,
        Array.isArray(popular_items) ? popular_items : null,
        bathroom ?? null,
        normalizedBathroomAccess,
        indoor_seating ?? null,
        outdoor_seating ?? null,
        wifi ?? null,
        outlets ?? null,
        laptop_friendly ?? null,
        parking || null,
        closest_metro || null,
        opening_hours || null,
        website || null,
        phone || null,
        instagram || null,
        notes || null,
        coordinates ? parseFloat(coordinates[0]) : null,
        coordinates ? parseFloat(coordinates[1]) : null,
        id
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

router.delete("/:id", requireAuth, requireRole('admin', 'moderator'), async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM cafes WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Cafe not found" });
    }

    res.json({ message: "Cafe removed successfully", cafe: result.rows[0] });
  } catch (err) {
    console.error("Error deleting cafe:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

// non-admin users suggesting new cafes
router.post("/suggest", requireAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const cafeData = req.body;

    console.log("suggestion user: ", userId)

    if (
      !cafeData.name ||
      !cafeData.coordinates ||
      cafeData.coordinates.length !== 2
    ) {
      return res.status(400).json({
        error: "Missing required fields",
      });
    }

    if (cafeData.bathroom_access) {
      cafeData.bathroom_access = normalizeBathroomAccess(cafeData.bathroom_access);
    }

    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM cafe_suggestions
      WHERE user_id = $1 AND created_at > now() - interval '7 days'`,
      [userId]
    );

    if (parseInt(rows[0].count, 10) >= 5) {
      return res.status(429).json({ error: "You've reached your weekly limit of 5 cafe suggestions." });
    }

    const inserted = await pool.query(
      `INSERT INTO cafe_suggestions (user_id, cafe_data) VALUES ($1, $2) RETURNING id, created_at`,
      [userId, cafeData]
    );

    res.status(201).json({
      id: inserted.rows[0].id,
      message: "Cafe suggestion submitted for review."
    });

  } catch (err) {
    console.error("Error creating cafe suggestion:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// non-admin users requesting edits to existing cafes
router.post("/:id/edit-requests", requireAuth, async (req, res) => {
  try {
    const cafeId = req.params.id;
    const userId = req.userId;
    const { changes } = req.body;

    if (!changes || typeof changes !== "object" || Object.keys(changes).length === 0) {
      return res.status(400).json({
        error: "No changes submitted",
      });
    }

    // verify cafe exists
    const cafeResult = await pool.query(
      `SELECT id FROM cafes WHERE id = $1`,
      [cafeId]
    );

    if (cafeResult.rows.length === 0) {
      return res.status(404).json({
        error: "Cafe not found",
      });
    }

    const filteredChanges = Object.fromEntries(
      Object.entries(changes).filter(([key]) =>
        EDITABLE_FIELDS.includes(key)
      )
    );

    if (Object.keys(filteredChanges).length === 0) {
      return res.status(400).json({
        error: "No valid editable fields submitted",
      });
    }

    const { rows: existing } = await pool.query(
      `
      SELECT id
      FROM edit_requests
      WHERE user_id = $1
        AND cafe_id = $2
        AND status = 'pending'
      `,
      [userId, cafeId]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        error: "You already have a pending edit request for this cafe.",
      });
    }


    // max 5 edit suggestions per week
    const { rows } = await pool.query(
      `
      SELECT COUNT(*)
      FROM edit_requests
      WHERE user_id = $1
        AND created_at > now() - interval '7 days'
      `,
      [userId]
    );

    if (parseInt(rows[0].count, 10) >= 5) {
      return res.status(429).json({
        error: "You've reached your weekly limit of 5 edit requests.",
      });
    }


    const inserted = await pool.query(
      `
      INSERT INTO edit_requests (
        cafe_id,
        user_id,
        changes
      )
      VALUES ($1, $2, $3)
      RETURNING id, created_at
      `,
      [
        cafeId,
        userId,
        filteredChanges,
      ]
    );

    res.status(201).json({
      id: inserted.rows[0].id,
      message: "Edit request submitted for review.",
    });

  } catch (err) {
    console.error("Error creating edit request:", err);
    res.status(500).json({
      error: "Database error",
    });
  }
});

export default router;


// // public
// GET /api/cafes

// // Authenticated users
// POST /api/cafes/suggest
// POST /api/cafes/:id/edit-requests

// // Admin/moderator only
// POST /api/cafes
// PUT /api/cafes/:id
// DELETE /api/cafes/:id

// GET /api/cafes/suggestions
// GET /api/cafes/edit-requests

// PATCH /api/cafes/suggestions/:id/approve
// PATCH /api/cafes/suggestions/:id/reject

// PATCH /api/cafes/edit-requests/:id/approve
// PATCH /api/cafes/edit-requests/:id/reject
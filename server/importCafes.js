import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db/pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, "../src/assets/json/ccafes.json");

// Load your JSON file
// const rawData = fs.readFileSync("../src/assets/json/ccafes.json");
const rawData = fs.readFileSync(jsonPath, "utf8");
const data = JSON.parse(rawData);

// Map JSON features to your DB columns
function transformFeature(feature) {
  const p = feature.properties;

  return {
    id: feature.id, // use GeoJSON id
    name: p.name || "",
    address: p.address || "",
    coordinates: feature.geometry.coordinates, // [lng, lat]
    neighborhood: p.neighborhood || null,
    roaster: p.roaster || [],
    in_house_roast: p.inHouseRoast || false,
    vibe_tags: p.vibeTags || [],
    special_items: p.specialItems || [],
    outdoor_seating: p.outdoorSeating || false,
    wifi: p.wifi || false,
    outlets: p.outlets || false,
    laptop_friendly: p.laptopFriendly || false,
    parking: p.parking || null,
    closest_metro: p.closestMetro || null,
    opening_hours: p.opening_hours || p.openingHours || null,
    website: p.website || null,
    phone: p.phone || null,
    specialty: p.specialty || false,
  };
}

async function importCafes() {
  for (const feature of data.features) {
    const cafe = transformFeature(feature);
    const [lng, lat] = cafe.coordinates;

    try {
      await pool.query(
        `INSERT INTO cafes (
          id, name, address, neighborhood, roaster, in_house_roast, 
          vibe_tags, special_items, outdoor_seating, wifi, outlets, laptop_friendly, 
          parking, closest_metro, opening_hours, website, phone, specialty, coordinates
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,
          $9,$10,$11,$12,$13,$14,
          $15,$16,$17,$18,ST_SetSRID(ST_MakePoint($19, $20), 4326)
        )
        ON CONFLICT (id) DO NOTHING`,
        [
          cafe.id,
          cafe.name,
          cafe.address,
          cafe.neighborhood,
          cafe.roaster,
          cafe.in_house_roast,
          cafe.vibe_tags,
          cafe.special_items,
          cafe.outdoor_seating,
          cafe.wifi,
          cafe.outlets,
          cafe.laptop_friendly,
          cafe.parking,
          cafe.closest_metro,
          cafe.opening_hours,
          cafe.website,
          cafe.phone,
          cafe.specialty,
          lng,
          lat
        ]
      );
    } catch (err) {
      console.error(`Error inserting ${cafe.name}:`, err.message);
    }
  }

  console.log("Cafes imported successfully!");
  process.exit(0);
}

importCafes().catch((err) => {
  console.error(err);
  process.exit(1);
});

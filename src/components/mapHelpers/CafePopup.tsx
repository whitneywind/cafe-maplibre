import React from "react";
import { Box, Typography, Link, Button, Stack, IconButton, Tooltip } from "@mui/material";
import StarsIcon from '@mui/icons-material/Stars';
import WifiIcon from "@mui/icons-material/Wifi";
import PowerIcon from "@mui/icons-material/Power";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import WcIcon from "@mui/icons-material/Wc";
import DeckIcon from "@mui/icons-material/Deck";
import CoffeeIcon from "@mui/icons-material/Coffee";
import BuildIcon from "@mui/icons-material/Build";
import { NewCoffeeShop } from "../../../types";
import { showUpdateCafeDialog } from "./mapFns";

interface CafePopupProps {
  cafe: NewCoffeeShop;
  coordinates: any;
}

const CafePopup: React.FC<CafePopupProps> = ({ cafe, coordinates }) => {
  const { 
    name,
    neighborhood,
    bathroom,
    outdoor_seating,
    indoor_seating,
    wifi,
    outlets,
    laptop_friendly,
    parking,
    website,
    phone,
    instagram,
    specialty,
    in_house_roast,
    matcha,
    matcha_brand,
    latte_price,
    alt_milks,
    alt_milks_cost,
    roaster,
    popular_items,
    notes,
    opening_hours,
  } = cafe;

  console.log(typeof popular_items)

    // --- normalize array fields ---
  const normalizeArrayField = (field: string[] | string | null | undefined): string[] => {
    if (Array.isArray(field)) {
      return field.map(s => s.replace(/_/g, " ").trim());
    }

    if (typeof field === "string") {
      try {
        const parsed = JSON.parse(field); // try parsing JSON array
        if (Array.isArray(parsed)) {
          return parsed.map(s => s.replace(/_/g, " ").trim());
        }
      } catch {
        // not JSON, fallback to comma-separated
      }

      return field.split(",").map(s => s.replace(/_/g, " ").trim());
    }

    return [];
  };

  const popularItemsArray: string[] = normalizeArrayField(popular_items);
  const altMilksArray: string[] = normalizeArrayField(alt_milks);

  console.log(popularItemsArray)



  const [lng, lat] = coordinates;

  const googleMapsURL = name
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  
  const handleUpdateClick = () => {
    const dialogContainer = document.createElement("div");
    document.body.appendChild(dialogContainer);

    showUpdateCafeDialog(dialogContainer, cafe);
  };

  return (
    <Box
      sx={{
        minWidth: 200,
        maxWidth: "calc(100vw - 40px)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 0.5,
        position: "relative",
      }}
    >
      <IconButton
        size="small"
        onClick={handleUpdateClick}
        sx={{ position: "absolute", top: 2, right: 2, padding: 0, width: 20, height: 20 }}
      >
        <BuildIcon fontSize="small" />
      </IconButton>

      {/* Name + Specialty */}
      {name && (
        <Typography variant="subtitle1" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {name}
          {specialty && <StarsIcon sx={{ color: "#F2C94C", fontSize: 16 }} />}
          {in_house_roast && <CoffeeIcon sx={{ color: "#795548", fontSize: 16 }} />}
        </Typography>
      )}

      {/* Neighborhood */}
      {neighborhood && neighborhood !== "unknown" && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {neighborhood}
        </Typography>
      )}

      {/* Opening Hours */}
      {opening_hours && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          ⏰ {opening_hours}
        </Typography>
      )}

      {/* Links */}
      <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap", justifyContent: "center" }}>
        {website && (
          <Link href={website} target="_blank" rel="noopener noreferrer" underline="hover" variant="body2">
            Website
          </Link>
        )}
        {instagram && (
          <Link href={`https://instagram.com/${instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" underline="hover" variant="body2">
            Instagram
          </Link>
        )}
        {phone && <Typography variant="caption">☎ {phone}</Typography>}
      </Stack>

      {/* Amenities Icons */}
      <Stack direction="row" spacing={1} justifyContent="center" alignItems="center" sx={{ mt: 0.5, flexWrap: "wrap" }}>
        {wifi && <Tooltip title="Wi-Fi"><WifiIcon sx={{ fontSize: 18, color: "text.secondary" }} /></Tooltip>}
        {outlets && <Tooltip title="Outlets"><PowerIcon sx={{ fontSize: 18, color: "text.secondary" }} /></Tooltip>}
        {laptop_friendly && <Tooltip title="Laptop-friendly"><PowerIcon sx={{ fontSize: 18, color: "text.secondary" }} /></Tooltip>}
        {parking && <Tooltip title={`Parking: ${parking}`}><LocalParkingIcon sx={{ fontSize: 18, color: "text.secondary" }} /></Tooltip>}
        {outdoor_seating && <Tooltip title="Outdoor seating"><DeckIcon sx={{ fontSize: 18, color: "text.secondary" }} /></Tooltip>}
        {indoor_seating && <Tooltip title="Indoor seating"><DeckIcon sx={{ fontSize: 18, color: "text.secondary" }} /></Tooltip>}
        {bathroom && <Tooltip title="Bathroom"><WcIcon sx={{ fontSize: 18, color: "text.secondary" }} /></Tooltip>}
        {matcha && matcha_brand && <Tooltip title={`Matcha: ${matcha_brand}`}><CoffeeIcon sx={{ fontSize: 18, color: "#4caf50" }} /></Tooltip>}
      </Stack>

      {/* Optional Details */}
      <Stack direction="column" spacing={0.25} sx={{ mt: 0.5, width: "100%" }}>
        {latte_price && <Typography variant="caption">☕ Latte Price: ${latte_price}</Typography>}

        {altMilksArray && altMilksArray.length > 0 && (
          <Typography variant="caption">
            🥛 Alt Milks: {altMilksArray?.join(", ")}{alt_milks_cost ? ` ($${alt_milks_cost})` : ""}
          </Typography>
        )}

        {roaster && roaster.length > 0 && (
          <Typography variant="caption">🌱 Roasters: {roaster}</Typography>
        )}

        {popularItemsArray && popularItemsArray.length > 0 && (
          <Typography variant="caption">⭐ Popular Items: {popularItemsArray.join(", ")}</Typography>
        )}

        {notes && <Typography variant="caption">📝 {notes}</Typography>}
      </Stack>

      <Button
        variant="contained"
        size="small"
        sx={{ mt: 0.5, fontSize: "0.65rem", padding: "4px 8px" }}
        href={googleMapsURL}
        target="_blank"
        rel="noopener noreferrer"
      >
        Google Maps
      </Button>
    </Box>
  );
};

export default CafePopup;

import React from "react";
import { Box, Typography, Button, Stack, Tooltip } from "@mui/material";
import WifiIcon from "@mui/icons-material/Wifi";
import PowerIcon from "@mui/icons-material/Power";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import WcIcon from "@mui/icons-material/Wc";
import DeckIcon from "@mui/icons-material/Deck";
import { NewCoffeeShop } from "../../../types";
import StarsIcon from "@mui/icons-material/Stars";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import { showUpdateCafeDialog } from "./mapFns";

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

    // normalize array fields
    // TODO: move all this to full info modal
  // const normalizeArrayField = (field: string[] | string | null | undefined): string[] => {
  //   if (Array.isArray(field)) {
  //     return field.map(s => s.replace(/_/g, " ").trim());
  //   }

  //   if (typeof field === "string") {
  //     try {
  //       const parsed = JSON.parse(field); // try parsing JSON array
  //       if (Array.isArray(parsed)) {
  //         return parsed.map(s => s.replace(/_/g, " ").trim());
  //       }
  //     } catch {
  //       // not JSON, fallback to comma-separated
  //     }

  //     return field.split(",").map(s => s.replace(/_/g, " ").trim());
  //   }

  //   return [];
  // };

  // const popularItemsArray: string[] = normalizeArrayField(popular_items);
  // const altMilksArray: string[] = normalizeArrayField(alt_milks);

  // const handleUpdateClick = () => {
  //   const dialogContainer = document.createElement("div");
  //   document.body.appendChild(dialogContainer);

  //   showUpdateCafeDialog(dialogContainer, cafe);
  // };


  const [lng, lat] = coordinates;

  const googleMapsURL = name
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  

  return (
    <Box
      sx={{
        minWidth: 220,
        maxWidth: 260,
        p: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        position: "relative",
      }}
    >
      {/* Edit button */}
      {/* TODO: move this to the larger modal */}
      {/* <IconButton
        size="small"
        onClick={handleUpdateClick}
        sx={{ position: "absolute", top: 4, right: 4 }}
      >
        <BuildIcon fontSize="small" />
      </IconButton> */}

      {/* name */}
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "1rem",
          lineHeight: 1.8,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name || "Unnamed Cafe"}
      </Typography>

      {/* badges */}
      <Stack direction="row" spacing={0.75} alignItems="center">
        {specialty && (
          <Tooltip title="Specialty coffee">
            <Box
              sx={{
                fontSize: "0.6rem",
                fontWeight: 600,
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                bgcolor: "#f3e5ab",
                color: "#6f4e37",
              }}
            >
              Specialty Coffee
            </Box>
          </Tooltip>
        )}

        {/*  */}
        {matcha && (
          <Tooltip title={matcha_brand ? `Matcha: ${matcha_brand}` : "Matcha available"}>
            <Box
              sx={{
                fontSize: "0.6rem",
                fontWeight: 600,
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                bgcolor: "#e8f5e9",
                color: "#2e7d32",
              }}
            >
              Matcha
            </Box>
          </Tooltip>
        )}

        {!matcha && (
          <Tooltip title="Coffee">
            <Box
              sx={{
                fontSize: "0.6rem",
                fontWeight: 600,
                px: 0.75,
                py: 0.25,
                borderRadius: 1,
                bgcolor: "#ede7f6",
                color: "#5e35b1",
              }}
            >
              Coffee
            </Box>
          </Tooltip>
        )}
      </Stack>

      {/* amenities */}
      <Stack
        direction="row"
        spacing={0.75}
        sx={{ color: "text.secondary", flexWrap: "wrap" }}
      >
        {wifi && <Tooltip title="Wi-Fi"><WifiIcon fontSize="small" /></Tooltip>}
        {outlets && <Tooltip title="Outlets"><PowerIcon fontSize="small" /></Tooltip>}
        {laptop_friendly && <Tooltip title="Laptop-friendly"><PowerIcon fontSize="small" /></Tooltip>}
        {parking && <Tooltip title={`Parking: ${parking}`}><LocalParkingIcon fontSize="small" /></Tooltip>}
        {outdoor_seating && <Tooltip title="Outdoor seating"><DeckIcon fontSize="small" /></Tooltip>}
        {bathroom && <Tooltip title="Bathroom"><WcIcon fontSize="small" /></Tooltip>}
      </Stack>

      {/* google maps link */}
      <Button
          variant="contained"
          size="small"
          sx={{ fontSize: "0.60rem", padding: "4px 60", backgroundColor: "#0f9d58c7" }}
          href={googleMapsURL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Maps
      </Button>

      {/* actions */}
      <Stack direction="row" spacing={1} sx={{ mt: 0.5, justifyContent: "center" }}>
  {/* Save button */}
  <Button
    variant="contained"
    size="small"
    startIcon={<StarsIcon fontSize="inherit" />}
    sx={{
      fontSize: "0.65rem",
      px: 1.25,
      py: 0.5,
      borderRadius: 3, // pill-shaped
      textTransform: "none",
      bgcolor: "#ffe0b2", // soft warm color
      color: "#6f4e37",
      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      "&:hover": {
        bgcolor: "#ffcc80",
        transform: "scale(1.05)",
        boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
      },
      transition: "all 0.2s ease-in-out",
    }}
  >
    Save
  </Button>

  {/* View all details button */}
  <Button
    variant="contained"
    size="small"
    endIcon={<ArrowForwardIcon fontSize="inherit" />}
    sx={{
      fontSize: "0.65rem",
      px: 1.25,
      py: 0.5,
      borderRadius: 3,
      textTransform: "none",
      bgcolor: "#c8e6c9", // soft green
      color: "#2e7d32",
      boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      "&:hover": {
        bgcolor: "#a5d6a7",
        transform: "scale(1.05)",
        boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
      },
      transition: "all 0.2s ease-in-out",
    }}
  >
    View all details
  </Button>
</Stack>

      {/* <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
        <Button
          variant="outlined"
          size="small"
          sx={{ fontSize: "0.65rem", px: 1 }}
        >
          Save
        </Button>

        <Button
          variant="outlined"
          size="small"
          sx={{ fontSize: "0.65rem", px: 1 }}
        >
          View all details
        </Button>
      </Stack> */}
    </Box>
  );
};

export default CafePopup;

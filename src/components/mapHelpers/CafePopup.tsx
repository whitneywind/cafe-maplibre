import React from "react";
import { Box, Typography, Link, Button, Stack } from "@mui/material";
import StarsIcon from '@mui/icons-material/Stars';
import WifiIcon from "@mui/icons-material/Wifi";
import PowerIcon from "@mui/icons-material/Power";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import WcIcon from "@mui/icons-material/Wc";
import DeckIcon from "@mui/icons-material/Deck";
import { Tooltip } from "@mui/material";
import { CoffeeShop } from "../../../types";


const CafePopup: React.FC<CoffeeShop> = ({ 
      name,
      coordinates,
      neighborhood,
      bathroom,
      outdoor_seating,
      wifi,
      outlets,
      parking,
      // opening_hours,
      website,
      phone,
      instagram,
      specialty,
 }) => {
  const [lng, lat] = coordinates;
  console.log("outlets: ", outlets)

  const googleMapsURL = name
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;


// const handleDeleteClick = () => {
//   if (onDelete) onDelete(id);
// };

  return (
    <Box
        sx={{
            minWidth: 200,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
        }}
    >
      {/* TODO: move this delete functionality to the suggest changes page after accounts feature */}
      {/* <IconButton
        size="small"
        onClick={handleDeleteClick}
        sx={{
          position: "absolute",
          top: 2,
          right: 2,
          padding: 0,
          width: 20,
          height: 20,
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton> */}

      {name && (
        <Typography
            variant="subtitle1"
            fontWeight="bold"
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          {name}
        {specialty && (
            <StarsIcon
                sx={{
                    color: "#F2C94C",
                    verticalAlign: "middle",
                    fontSize: 16, 
                }}
            />
          )}
        </Typography>
      )}
      
      {/* additional info */}
      {neighborhood && neighborhood !== "unknown" && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {neighborhood}
        </Typography>
      )}

      {/* Links */}
      {website && (
        <Link
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          variant="body2"
          sx={{ display: "block", mt: 0.5 }}
        >
          Website
        </Link>
      )}
      {instagram && (
        <Link
          href={`https://instagram.com/${instagram.replace("@", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          variant="body2"
          sx={{ display: "block", mt: 0.3 }}
        >
          Instagram
        </Link>
      )}
      {phone && (
        <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.3 }}>
          ☎ {phone}
        </Typography>
      )}

      {/* Amenities icons */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 1, flexWrap: "wrap" }}
      >
        {wifi && (
          <Tooltip title="Wi-Fi" arrow>
            <WifiIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          </Tooltip>
        )}
        {outlets && (
          <Tooltip title="Outlets" arrow>
            <PowerIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          </Tooltip>
        )}
        {parking === "Parking lot" && (
          <Tooltip title="Parking" arrow>
            <LocalParkingIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          </Tooltip>
        )}
        {outdoor_seating && (
          <Tooltip title="Outdoor seating" arrow>
            <DeckIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          </Tooltip>
        )}
        {/* Add when bathroom in schema */}
        {bathroom && (
          <Tooltip title="Bathroom" arrow>
            <WcIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          </Tooltip>
        )}
      </Stack>

      <Button
          variant="contained"
          size="small"
          sx={{
              mt: 1,
              fontSize: "0.65rem",
              padding: "4px 8px",
          }}
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

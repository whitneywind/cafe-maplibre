import React from "react";
import { Box, Typography, Button, Stack, Tooltip } from "@mui/material";
import WifiIcon from "@mui/icons-material/Wifi";
import PowerIcon from "@mui/icons-material/Power";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import WcIcon from "@mui/icons-material/Wc";
import DeckIcon from "@mui/icons-material/Deck";
import { CafePopupProps } from "../../../types";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import useMapStore from "../../store/useMapStore";
import { focusCafeIfNeeded } from "./mapFns";


const CafePopup: React.FC<CafePopupProps> = ({ cafe }) => {
  const { 
    name,
    bathroom,
    outdoor_seating,
    wifi,
    outlets,
    laptop_friendly,
    parking,
    specialty,
    matcha,
    matcha_brand,
  } = cafe;
  const { openCafeDetails, addFavorite, removeFavorite, isFavorite } = useMapStore();
  const favorited = isFavorite(cafe.id);

  return (
    <Box
      sx={{
        minWidth: 220,
        maxWidth: "fit-content",
        p: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        position: "relative",
      }}
      onClick={() => {
        focusCafeIfNeeded(
          useMapStore.getState().map,
          cafe
        );
      }}
    >

      <Typography
        sx={{
          fontWeight: 600,
          fontSize: "1.15rem",
          lineHeight: 1.6,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {name || "Mystery Cafe"}
      </Typography>

      <Stack direction="row" spacing={0.75} alignItems="center">
        {specialty && (
          <Tooltip title="Specialty coffee">
            <Box
              sx={{
                fontSize: "0.7rem",
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
                fontSize: "0.7rem",
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

        {!matcha && !specialty && (
          <Tooltip title="Coffee">
            <Box
              sx={{
                fontSize: "0.7rem",
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

      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          size="small"
          startIcon={favorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          onClick={() => favorited ? removeFavorite(cafe.id) : addFavorite(cafe)}
          sx={{
            borderColor: "#b23a62",
            borderWidth: "1.5px",
            borderRadius: 1,
            color: "#b23a62",
            flex: 1,
            textTransform: "none",
            "&:hover": {
              borderColor: "#992c52",
              backgroundColor: "rgba(111,78,55,0.06)",
            },
            "& .MuiButton-startIcon": {
              marginRight: "4px", 
              marginLeft: 0,
            },

            "& .MuiButton-startIcon svg": {
              fontSize: "0.9rem",
            },
          }}
        >
          { favorited ? "Saved" : "Save" }
        </Button>

        <Button
          variant="outlined"
          size="small"
          sx={{
            borderColor: "#6f4e37",
            borderWidth: "1.5px",
            borderRadius: 1,
            color: "#6f4e37",
            flex: 1,
            textWrap: "nowrap",
            px: "16px",
            textTransform: "none",
            "&:hover": {
              borderColor: "#6f4e37",
              backgroundColor: "rgba(111,78,55,0.06)",
            },
          }}
          onClick={() => openCafeDetails(cafe)}
        >
          See Details
        </Button>
      </Stack>
    </Box>
  );
};

export default CafePopup;

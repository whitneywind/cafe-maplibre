import React from "react";
import { Box, Typography, Link, Button, Stack, Chip } from "@mui/material";
import StarsIcon from '@mui/icons-material/Stars';
// import CloseIcon from "@mui/icons-material/Close";
import { CoffeeShop } from "../../../types";


const CafePopup: React.FC<CoffeeShop> = ({ 
      id,
      name,
      address,
      coordinates,
      neighborhood,
      roaster,
      in_house_roast,
      vibe_tags,
      special_items,
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
      specialty,
      notes,
 }) => {
  const [lng, lat] = coordinates;
  console.log("neigh", neighborhood)

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
      
      {/* additional info */}
      {/* {address && (
        <Typography variant="body2" sx={{ mt: 0.3 }}>
          {address}
        </Typography>
      )} */}
      {neighborhood && neighborhood !== "unknown" && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {neighborhood}
        </Typography>
      )}

      {/* Roaster info */}
      {roaster?.length ? (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Roaster: {roaster.join(", ")}
        </Typography>
      ) : (
        in_house_roast && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            In-house roast
          </Typography>
        )
      )}

      {/* Vibe tags */}
      {vibe_tags?.length ? (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{ flexWrap: "wrap", justifyContent: "center", mt: 0.5 }}
        >
          {vibe_tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" sx={{ fontSize: "0.65rem" }} />
          ))}
        </Stack>
      ) : null}

      {/* Amenities */}
      {/* <Box sx={{ mt: 0.5 }}>
        {[
          outdoor_seating && "Outdoor seating",
          wifi && "Wi-Fi",
          outlets && "Outlets",
          laptop_friendly && "Laptop friendly",
        ]
          .filter(Boolean)
          .map((amenity) => (
            <Typography
              key={amenity}
              variant="caption"
              sx={{ display: "block", color: "text.secondary" }}
            >
              • {amenity}
            </Typography>
          ))}
      </Box> */}

      {/* Details */}
      {special_items?.length && (
        <Typography variant="body2" sx={{ mt: 0.5 }}>
          Specialties: {special_items.join(", ")}
        </Typography>
      )}
      {closest_metro && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          🚇 {closest_metro}
        </Typography>
      )}
      {parking && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          🅿 {parking}
        </Typography>
      )}
      {opening_hours && (
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          ⏰ {opening_hours}
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

      {/* Notes */}
      {notes && (
        <Typography
          variant="caption"
          sx={{ mt: 0.6, fontStyle: "italic", color: "text.secondary" }}
        >
          {notes}
        </Typography>
      )}

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
          View on Google Maps
      </Button>
    </Box>
  );
};

export default CafePopup;

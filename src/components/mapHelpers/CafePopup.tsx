import React from "react";
import { Box, Typography, Link, Button, IconButton } from "@mui/material";
import StarsIcon from '@mui/icons-material/Stars';
import CloseIcon from "@mui/icons-material/Close";


interface CafePopupProps {
  id: string;
  name?: string;
  cuisine?: string;
  address?: string;
  website?: string;
  coordinates: [number, number];
  specialty?: boolean;
  onDelete?: (id: string) => void;
}

const CafePopup: React.FC<CafePopupProps> = ({
  id,
  name,
  website,
  coordinates,
  specialty,
  onDelete,
}) => {
  const [lng, lat] = coordinates;

  const googleMapsURL = name
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;


const handleDeleteClick = () => {
  if (onDelete) onDelete(id);
};

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
      <IconButton
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
      </IconButton>

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

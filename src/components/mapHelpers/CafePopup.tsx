import React from "react";
import { Box, Typography, Link, Button } from "@mui/material";
import StarsIcon from '@mui/icons-material/Stars';

interface CafePopupProps {
  name?: string;
  cuisine?: string;
  address?: string;
  website?: string;
  coordinates: [number, number];
  specialty?: boolean;
}

const CafePopup: React.FC<CafePopupProps> = ({
  name,
  website,
  coordinates,
  specialty,
}) => {
  const [lng, lat] = coordinates;

  const googleMapsURL = name
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
    : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

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

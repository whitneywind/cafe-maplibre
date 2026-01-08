import React, { useRef } from "react";
import { Box, Card, CardContent, Typography, IconButton } from "@mui/material";
import { ChevronLeft } from "@mui/icons-material";
import { ChevronRight } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import SpaIcon from "@mui/icons-material/Spa"; // matcha stand-in
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import { NewCoffeeShop } from "../../../types";
import { Map, Popup } from "maplibre-gl";
import { flyToCafe, showCafePopup } from "./mapFns";
import useMapStore from "../../store/useMapStore";


interface CafeScrollerProps {
  visibleCafes: NewCoffeeShop[];
  map: Map | null;
  popupRef: React.RefObject<Popup>;
};

const CafeScroller: React.FC<CafeScrollerProps> = ({ visibleCafes, map, popupRef }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
    const selectedNeighborhood = useMapStore((state) => state.selectedNeighborhood);
  const setSelectedNeighborhood = useMapStore((state) => state.setSelectedNeighborhood);

  const scrollAmount = 300; // pixels to scroll per click

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

    const handleClickCafe = (cafe: NewCoffeeShop) => {
    if (!map) return;

    // clear selected neighborhood if cafe is outside it
    if (selectedNeighborhood && cafe.neighborhood !== selectedNeighborhood.name) {
      setSelectedNeighborhood(null);
    }

    // fly to and show popup
    flyToCafe(map, cafe, 14);
    showCafePopup(map, popupRef, cafe);
  };

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: "12vh",
        bgcolor: "rgba(255,255,255,0.9)",
        zIndex: 999,
        p: 1.25,
        boxShadow: "0 -2px 5px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.5,
        overflow: "hidden",
      }}
    >
      {/* left scroll button */}
      <IconButton
        onClick={scrollLeft}
        sx={{
          p: 0.5,
          bgcolor: "rgba(255, 255, 255, 0.7)",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          "&:hover": {
            bgcolor: "rgba(255,255,255,1)",
          },
          zIndex: 1000,
        }}
      >
        <ChevronLeft />
      </IconButton>

      <Box
        ref={scrollRef}
        sx={{
          display: "flex",
          alignItems: "center", 
          flexGrow: 1,
          height: "100%",
          gap: 1.5,
          paddingLeft: 0.8,
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {visibleCafes.map((cafe, index) => (
          <Card
            key={index}
            onClick={() => handleClickCafe(cafe)}
            sx={{
              width: 270,
              minWidth: 250,
              height: "95%",
              alignSelf: "center",
              display: "flex",
              cursor: "pointer",
              borderRadius: 2,
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              "&:hover": {
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                transform: "scale(1.02)",
                transition: "all 0.2s ease-in-out",
              },
            }}
            elevation={3}
          >
            <CardContent
              sx={{
                display: "flex",
                flex: 1,
                justifyContent: "center",
                flexDirection: "column",
                overflowY: "auto",
                paddingY: 0,
                paddingX: "5px",
              }}
            >
              {/* row 1: name */}
              <Typography
                fontWeight="bold"
                sx={{
                  textAlign: "center",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {cafe.name || "Unnamed Cafe"}
              </Typography>

            {/* row 2— icons */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  gap: 1,
                  mb: "1px",
                  alignItems: "center",
                  color: "#555",
                }}
              >
                {/* Coffee */}
                <Tooltip title="Coffee-focused" arrow>
                  <LocalCafeIcon sx={{ fontSize: 16 }} />
                </Tooltip>

                {/* TODO: update this to reflect matcha specialty or matcha recommended */}
                {/* Matcha */}
                {cafe.matcha && (
                  <Tooltip title="High-Quality Matcha" arrow>
                    <SpaIcon sx={{ fontSize: 16 }} />
                  </Tooltip>
                )}

                {/* Parking */}
                {cafe.parking && (
                  <Tooltip title="Parking available" arrow>
                    <LocalParkingIcon sx={{ fontSize: 16 }} />
                  </Tooltip>
                )}
              </Box>

              {/* row 3 */}
              <Typography
                sx={{
                  textAlign: "center",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                }}
              >
                {`${cafe.neighborhood && cafe.neighborhood !== "unknown" ? cafe.neighborhood : ""}`}
              </Typography>

            </CardContent>
          </Card>
        ))}
      </Box>

      {/* right scroll button */}
      <IconButton
        onClick={scrollRight}
        sx={{
          p: 0.5,
          bgcolor: "rgba(255,255,255,0.7)",
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          "&:hover": {
            bgcolor: "rgba(255,255,255,1)",
          },
          zIndex: 1000,
        }}
      >
        <ChevronRight />
      </IconButton>
    </Box>
  );
};

export default CafeScroller;
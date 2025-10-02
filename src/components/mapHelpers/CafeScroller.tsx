import React, { useRef } from 'react';
import { Box, Card, CardContent, Typography, IconButton } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import { ChevronRight } from '@mui/icons-material';
import { CoffeeShop } from '../../../types';
import { Map, Popup } from 'maplibre-gl';
import { flyToCafe, showCafePopup } from './mapFns';
import useMapStore from '../../store/useMapStore';


interface CafeScrollerProps {
  visibleCafes: CoffeeShop[];
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
        behavior: 'smooth',
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  };

    const handleClickCafe = (cafe: CoffeeShop) => {
    if (!map) return;

    // Clear selected neighborhood if cafe is outside it
    if (selectedNeighborhood && cafe.neighborhood !== selectedNeighborhood.name) {
      setSelectedNeighborhood(null);
    }

    // Fly to and show popup
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
        height: 100,
        bgcolor: "rgba(255,255,255,0.9)",
        zIndex: 999,
        p: 1.25,
        boxShadow: "0 -2px 5px rgba(0,0,0,0.2)",
        display: "flex",
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        overflow: "hidden",
      }}
    >
      {/* left scroll button */}
      <IconButton
        onClick={scrollLeft}
        sx={{
          p: 0.5,
          bgcolor: 'rgba(255,255,255,0.7)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,1)',
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
          alignItems: 'center',
          gap: 1.5,
          paddingLeft: 0.8,
          overflowX: "auto",
          flexGrow: 1,
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {visibleCafes.map((cafe, index) => (
          <Card
            key={index}
            onClick={() => handleClickCafe(cafe)}
            sx={{
              width: 270,
              minWidth: 250,
              flexShrink: 0,
              cursor: "pointer",
              borderRadius: 2,
              height: "100%",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              ":hover": {
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                transform: "scale(1.02)",
                transition: "all 0.2s ease-in-out",
              },
            }}
            elevation={3}
          >
            <CardContent
              sx={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                overflowY: "auto",
              }}
            >
              <Typography
                fontWeight="bold"
                sx={{
                  textAlign: 'center',
                  fontFamily: '"Montserrat", sans-serif',
                }}
              >
                {cafe.name || "Unnamed Cafe"}
              </Typography>
              <Typography
                sx={{
                  textAlign: 'center',
                }}
              >
                {(cafe.neighborhood && cafe.neighborhood !== "unknown") ? `${cafe.neighborhood}` : "Los Angeles"}
              </Typography>
              <Typography
                sx={{
                  textAlign: 'center',
                }}
              >
                {`Specialty Coffee: ${cafe.specialty ? "Yes" : "No"}`}
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
          bgcolor: 'rgba(255,255,255,0.7)',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
          '&:hover': {
            bgcolor: 'rgba(255,255,255,1)',
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
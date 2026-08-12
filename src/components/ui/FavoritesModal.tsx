import React from "react";
import {
  Box,
  Typography,
  Stack,
  Tooltip,
  Modal,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useMapStore from "../../stores/useMapStore";
import { flyToCafe, showCafePopup } from "../mapComponents/mapFns";
import { FavoritesModalProps } from "../../../types";


const FavoritesModal: React.FC<FavoritesModalProps> = ({ open, onClose }) => {
  const favorites = useMapStore((state) => state.favorites);
  const map = useMapStore((state) => state.map);

  const handleCafeClick = (cafe: any) => {
    if (map) {
      showCafePopup(map, cafe);
      flyToCafe(map, cafe, 14);
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: { backgroundColor: "rgba(20, 14, 10, 0.55)" },
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "46%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 320,
          bgcolor: "rgba(255, 255, 255, 0.91)",
          borderRadius: 1.5,
          boxShadow: "0 24px 48px rgba(30, 20, 12, 0.35)",
          maxHeight: "64vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid #E4D8C0",
        }}
      >
        <Box
          sx={{
            bgcolor: "#c94f5c",
            color: "rgba(255, 255, 255, 0.91)",
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}
            >
              Favorites
            </Typography>
            {favorites.length > 0 && (
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  color: "rgba(255, 255, 255, 0.91)",
                  opacity: 0.85,
                }}
              >
                {`${favorites.length} Cafes Saved`}
              </Typography>
            )}
          </Stack>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "rgba(255, 255, 255, 0.91)", opacity: 0.7, "&:hover": { opacity: 1 } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {favorites.length === 0 && (
          <Box
            sx={{
              py: 5,
              px: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Typography
              sx={{
                fontStyle: "italic",
                fontSize: "0.95rem",
                color: "#4A3B2E",
                textAlign: "center",
              }}
            >
              Nothing saved yet
            </Typography>
          </Box>
        )}
        <Stack
          sx={{
            overflowY: "auto",
            overscrollBehavior: "contain",
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {favorites.map((cafe, i) => (
            <Box
              key={cafe.id}
              onClick={() => handleCafeClick(cafe)}
              sx={{
                px: 2,
                py: 1.4,
                cursor: "pointer",
                borderBottom:
                  i < favorites.length - 1 ? "1px dashed #D9CBAE" : "none",
                transition: "background-color 120ms ease",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.91)" },
                "&:hover .cafe-name": { color: "#B9622B" },
              }}
            >
              <Stack direction="row" alignItems="flex-start" spacing={1.25}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Stack
                    direction="row"
                    alignItems="baseline"
                    spacing={0.75}
                    sx={{ minWidth: 0 }}
                  >
                    <Typography
                      className="cafe-name"
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.95rem",
                        color: "#2B1D14",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        transition: "color 120ms ease",
                      }}
                    >
                      {cafe.name || "Unnamed Cafe"}
                    </Typography>

                    {cafe.neighborhood && (
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          color: "#A8977A",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                        }}
                      >
                        · {cafe.neighborhood}
                      </Typography>
                    )}
                  </Stack>
                  <Typography
                    sx={{
                      fontSize: "0.65rem",
                      letterSpacing: "0.02em",
                      color: "#8A7861",
                      textTransform: "uppercase",
                      mt: 0.25,
                    }}
                  >
                    {cafe.specialty && cafe.matcha
                      ? "Specialty · Matcha"
                      : cafe.specialty
                      ? "Specialty coffee"
                      : cafe.matcha
                      ? cafe.matcha_brand
                        ? `Matcha · ${cafe.matcha_brand}`
                        : "Matcha available"
                      : "Coffee"}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Modal>
  );
};

export default FavoritesModal;
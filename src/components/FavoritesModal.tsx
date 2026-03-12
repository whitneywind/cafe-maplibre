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
import useMapStore from "../store/useMapStore";
import { flyToCafe, showCafePopup } from "./mapComponents/mapFns";
import { FavoritesModalProps } from "../../types";


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
        sx: { backgroundColor: "rgba(0, 0, 0, 0.4)" }
        }
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 280,
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 2,
          maxHeight: "60vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", top: 6, right: 6 }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {favorites.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No favorites yet.
          </Typography>
        )}

        <Stack
          spacing={1}
          sx={{
            overflowY: "auto",
            overscrollBehavior: "contain",
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {favorites.map((cafe) => (
            <Box
              key={cafe.id}
              sx={{
                p: 1,
                borderRadius: 1,
                cursor: "pointer",
                "&:hover": { backgroundColor: "rgba(255, 200, 200, 0.2)" },
              }}
              onClick={() => handleCafeClick(cafe)}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "1rem",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {cafe.name || "Unnamed Cafe"}
              </Typography>

              <Stack direction="row" spacing={0.5} mt={0.5}>
                {cafe.specialty && (
                  <Tooltip title="Specialty coffee">
                    <Box
                      sx={{
                        fontSize: "0.65rem",
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

                {cafe.matcha && (
                  <Tooltip title={cafe.matcha_brand ? `Matcha: ${cafe.matcha_brand}` : "Matcha available"}>
                    <Box
                      sx={{
                        fontSize: "0.65rem",
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

                {!cafe.specialty && !cafe.matcha && (
                  <Tooltip title="Coffee">
                    <Box
                      sx={{
                        fontSize: "0.65rem",
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
            </Box>
          ))}
        </Stack>
      </Box>
    </Modal>
  );
};

export default FavoritesModal;
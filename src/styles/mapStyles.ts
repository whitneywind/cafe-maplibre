import { SxProps, Theme } from "@mui/material";

export const clearFiltersButtonSx: SxProps<Theme> = {
  position: "absolute",
  bottom: "150 px",
  left: "50%",
  transform: "translateX(-50%)",
  padding: "8px 16px",
  backgroundColor: "#b23a48",
  color: "#fff",
  border: "none",
  borderRadius: "20px",
  cursor: "pointer",
  fontSize: "0.9em",
  zIndex: 1000,
  boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  "&:hover": {
    backgroundColor: "#962f3c",
  },
};
import { useMemo, useState } from "react";
import { AppBar, Toolbar, Button, TextField, Autocomplete, Box, IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CoffeeIcon from "@mui/icons-material/Coffee";
import "../../styles/MenuBar.css";
import NewCafeDialog from "./NewCafeDialog";
import useMapStore from "../../stores/useMapStore";
import FavoritesModal from "./FavoritesModal";
import SearchModal from "./SearchModal";
import { AuthMenu } from "../authComponents/AuthMenu";
import useAuthStore from "../../stores/useAuthStore";


const TopMenu = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const map = useMapStore((state) => state.map);
  const neighborhoods = useMapStore((state) => state.neighborhoods);
  const cafes = useMapStore((state) => state.cafes);

  const { session, openAuthModal } = useAuthStore();
  const loggedIn = !!session;

  const neighborhoodOptions = useMemo(() => {
    if (!neighborhoods?.features) return [];

    const neighborhoodsWithCafes = new Set(
      cafes.map((cafe) => cafe.neighborhood).filter(Boolean)
    );

    return neighborhoods?.features
    .filter((f) => f.properties?.name && neighborhoodsWithCafes.has(f.properties.name))
    .sort((a, b) => a.properties.name > b.properties.name ? 1 : -1)
    || [];
  }, [neighborhoods, cafes]);

  const selectedNeighborhood = useMapStore((state) => state.selectedNeighborhood);
  const setSelectedNeighborhood = useMapStore((state) => state.setSelectedNeighborhood);

  const handleNeighborhoodSelect = (event, value) => {
    if (!map) return;
    setSelectedNeighborhood(value);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
    <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "#c94f5c",
          borderBottom: "none",
          px: 1,
          pt: 0.75,
          pb: 0.75,
          position: "relative",
          // zIndex: 1, // uncomment to show scallops
          // "&::after": {
          //   content: '""',
          //   position: "absolute",
          //   top: "calc(100% - 1px)", // 1px overlap eliminates gap/white line
          //   left: 0,
          //   right: 0,
          //   height: "10px",
          //   backgroundColor: "#c94f5c",
          //   WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 18' preserveAspectRatio='none'%3E%3Cpath d='M0 0 Q 20 18 40 18 Q 60 18 80 0 Z' fill='%23000'/%3E%3C/svg%3E")`,
          //   maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 18' preserveAspectRatio='none'%3E%3Cpath d='M0 0 Q 20 18 40 18 Q 60 18 80 0 Z' fill='%23000'/%3E%3C/svg%3E")`,
          //   WebkitMaskSize: "110px 10px", // higher first num will make wider scallops
          //   maskSize: "110px 10px", // needs to match^
          //   WebkitMaskRepeat: "repeat-x",
          //   maskRepeat: "repeat-x",
          //   pointerEvents: "none",
          // },
        }}
        className="top-menu"
      >
        <Toolbar
          disableGutters
          sx={{
            minHeight: "48px !important",
            display: "grid",
            gridTemplateColumns: { xs: "auto 1fr auto", md: "1fr 4fr 1fr" },
            alignItems: "center",
            gap: { xs: 1, sm: 1.5, md: 2 },
          }}
        >
          {/* home button + neighborhood boundary */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, justifySelf: "start" }}>
            <Tooltip title="Reset View">
              <IconButton
                onClick={() => {
                  if (map) {
                    map.flyTo({
                      center: [-118.3226, 34.075],
                      zoom: 12,
                      speed: 1.2,
                    });
                  }
                }}
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.18)",
                  color: "#fff",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.28)",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <CoffeeIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            <Autocomplete
              options={neighborhoodOptions}
              getOptionLabel={(option) => option?.properties.name || ""}
              size="small"
              value={selectedNeighborhood || null}
              onChange={(event, value) => handleNeighborhoodSelect(event, value)}
              sx={{
                display: { xs: "none", md: "inline-flex" },
                width: { md: 150, lg: 170 },
                "& .MuiInputBase-root": {
                  height: 36,
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  backgroundColor: "rgba(255,255,255,0.16)",
                  borderRadius: "999px",
                  paddingLeft: "14px !important",
                  paddingRight: "10px !important",
                  transition: "background-color 0.2s ease",
                  "& fieldset": { border: "none" },
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.26)" },
                  "&.Mui-focused": {
                    backgroundColor: "rgba(255,255,255,0.28)",
                    boxShadow: "0 0 0 2px rgba(255,255,255,0.35)",
                  },
                },
                "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.85)", fontSize: 18 },
              }}
              // sx={{
              //   display: { xs: "none", md: "inline-flex" },
              //   width: { xs: 110, sm: 140, md: 160 },
              //   "& .MuiInputBase-root": {
              //     height: 36,
              //     color: "white",
              //     fontSize: "0.85rem",
              //     backgroundColor: "rgba(255, 255, 255, 0.15)",
              //     borderRadius: "3px",
              //     paddingLeft: "12px !important",
              //     paddingRight: "8px !important",
              //     transition: "all 0.2s ease-in-out",
              //     "& fieldset": { border: "none" },
              //     "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.25)" },
              //     "&.Mui-focused": {
              //       backgroundColor: "rgba(255, 255, 255, 0.25)",
              //       boxShadow: "0 0 0 2px rgba(255,255,255,0.3)",
              //     },
              //   },
              //   "& .MuiSvgIcon-root": {
              //     color: "rgba(255, 255, 255, 0.8)",
              //     fontSize: 18,
              //   },
              // }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Neighborhood"
                  sx={{
                    "& .MuiInputBase-input": {
                      padding: "0 !important",
                      "&::placeholder": {
                        color: "rgba(255, 255, 255, 0.7)",
                        opacity: 1,
                      },
                    },
                  }}
                />
              )}
              slotProps={{
                paper: {
                  elevation: 4,
                  sx: { borderRadius: "3px", marginTop: "6px", overflow: "hidden" },
                },
                listbox: { sx: { fontSize: "0.85rem", padding: "4px" } },
                option: {
                  sx: {
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    padding: "6px 12px",
                    margin: "2px 0",
                    "&[aria-selected='true']": {
                      backgroundColor: "#fce4ec !important",
                      color: "#b23a48",
                      fontWeight: 600,
                    },
                    "&:hover": { backgroundColor: "#fff0f3", color: "#b23a48" },
                  },
                },
              }}
            />
          </Box>

          {/* search */}
          <Box sx={{ display: "flex", justifyContent: { xs: "stretch", md: "center" } }}>
            <Button
              onClick={() => setSearchOpen(true)}
              sx={{
                height: 40,
                width: { xs: "100%", sm: "100%", md: "auto" },
                minWidth: { md: 380, lg: 480, xl: 560 },
                mx: 2,
                px: { xs: 2.5, sm: 3.5 },
                borderRadius: "999px",
                fontSize: { xs: "0.9rem", sm: "1rem" },
                fontWeight: 700,
                textTransform: "none",
                letterSpacing: 0.2,
                color: "#7a2430",
                backgroundColor: "rgba(255, 255, 255, 0.91)",
                border: "1.5px dashed rgba(122,36,48,0.35)",
                boxShadow: "0 3px 0 rgba(122,36,48,0.25)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:hover": {
                  backgroundColor: "#fffaf4",
                  transform: "translateY(-2px)",
                  boxShadow: "0 5px 0 rgba(122,36,48,0.28)",
                },
                "&:active": {
                  transform: "translateY(1px)",
                  boxShadow: "0 1px 0 rgba(122,36,48,0.28)",
                },
              }}
            >
              Find a Cafe
            </Button>
          </Box>

          {/* add button + favorites button + login */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, justifySelf: "end" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                backgroundColor: "rgba(0,0,0,0.12)",
                padding: "3px 6px",
                borderRadius: "999px",
              }}
            >
              <Tooltip title="Suggest a cafe" arrow>
                <IconButton
                  onClick={(e) => { e.currentTarget.blur(); handleDialogOpen(); }}
                  sx={{
                    width: 32,
                    height: 32,
                    color: "#fff",
                    transition: "transform 0.2s ease, background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.2)",
                    },
                  }}
                >
                  <AddIcon sx={{ fontSize: 19 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Favorites" arrow>
                <IconButton
                  onClick={(e) => { e.currentTarget.blur(); setFavoritesOpen(true); }}
                  sx={{
                    width: 32,
                    height: 32,
                    color: "#ffccd5",
                    transition: "transform 0.2s ease, background-color 0.2s ease",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: "#ffb3c1",
                    },
                  }}
                >
                  <FavoriteIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Box>
            <AuthMenu />
          </Box>
        </Toolbar>
      </AppBar>

      <NewCafeDialog open={dialogOpen} onClose={handleDialogClose} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <FavoritesModal open={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
    </>

  );
};

export default TopMenu;
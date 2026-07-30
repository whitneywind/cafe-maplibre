import { useMemo, useState } from "react";
import { AppBar, Toolbar, Button, TextField, Autocomplete, Box, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import CoffeeIcon from "@mui/icons-material/Coffee";
import "../styles/MenuBar.css";
import NewCafeDialog from "./NewCafeDialog";
import useMapStore from "../stores/useMapStore";
import FavoritesModal from "./FavoritesModal";
import SearchModal from "./SearchModal";
import { AuthMenu } from "./AuthMenu";
import useAuthStore from "../stores/useAuthStore";


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
        sx={{ backgroundColor: "#b23a48" }}
        className="top-menu"
      >
        <Toolbar disableGutters sx={{ px: 0.5 }}>
          <Button
            color="inherit"
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
              minWidth: 0,
              marginRight: "10px",
              color: "white",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
            }}
          >
            <CoffeeIcon sx={{ fontSize: 25 }} />
          </Button>

          <Button
            color="inherit"
            onClick={() => setSearchOpen(true)}
            sx={{
              ml: 1,
              px: { xs: "1.5rem", sm: "2.5rem", md: "3rem" }, 
              fontSize: "0.95rem",
              textTransform: "none",
              letterSpacing: 1,
              backgroundColor: "rgba(255, 255, 255, 0.17)",
              borderRadius: "8px",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.2)" },
            }}
          >
            Find a Cafe
          </Button>

          <Autocomplete
            options={neighborhoodOptions}
            getOptionLabel={(option) => option?.properties.name || ""}
              sx={{
                minWidth: 120,
                width: "auto",
                mx: "10px",
                "& .MuiInputBase-root": {
                  color: "white",
                  fontSize: "0.6rem",
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  paddingRight: "4px",
                  "& fieldset": { border: "none" },
                },
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiSvgIcon-root": {
                  color: "white",
                },
                "& .MuiAutocomplete-popupIndicatorOpen": {
                  transform: "rotate(180deg)",
                },
                "& .MuiOutlinedInput-root.Mui-focused": {
                  backgroundColor: "rgba(255,255,255,0.15)",
                },
                "& .MuiAutocomplete-option": {
                  backgroundColor: "white",
                  color: "black",
                  "&[aria-selected='true']": {
                    backgroundColor: "#f3e5f5 !important",
                  },
                  "&:hover": {
                    backgroundColor: "#f8bbd0",
                  },
                },
              }}
              size="small"
              value={selectedNeighborhood || null}
              onChange={(event, value) => handleNeighborhoodSelect(event, value)}
              renderInput={(params) => (
                <TextField 
                  {...params}
                  placeholder="Area"
                  sx={{
                    "& .MuiInputBase-input": { fontSize: "0.8rem", padding: "6px 8px" },
                    "& .MuiInputLabel-root": { fontSize: "0.75rem" },
                  }}
                />
              )}
              slotProps={{
              // styles to the dropdown listbox
              paper: {
                sx: { fontSize: "0.8rem" },
              },
              listbox: {
                sx: {
                  fontSize: "0.8rem",
                  padding: 0,
                },
              },
              option: {
                sx: {
                  fontSize: "0.8rem",
                  padding: "4px 10px",
                  "&[aria-selected='true']": { backgroundColor: "#f3e5f5 !important" },
                  "&:hover": { backgroundColor: "#f8bbd0" },
                },
              },
            }}
          />

          <Box sx={{ flexGrow: 1 }} />

          <IconButton
            color="inherit"
            onClick={(e) => {
              e.currentTarget.blur();
              handleDialogOpen();
            }}
            sx={{ ml: 1 }}
          >
            <AddIcon />
          </IconButton>

          <IconButton 
            color="inherit"
            onClick={(e) => {
              e.currentTarget.blur();
              setFavoritesOpen(true);
            }}
          >
            <FavoriteIcon />
          </IconButton>

          <AuthMenu />

        </Toolbar>
      </AppBar>

      <NewCafeDialog open={dialogOpen} onClose={handleDialogClose} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <FavoritesModal open={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
    </>
  );
};

export default TopMenu;

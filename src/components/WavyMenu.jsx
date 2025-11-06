import { useMemo, useState } from "react";
import { AppBar, Toolbar, Button, TextField, Autocomplete } from "@mui/material";
import "../styles/MenuBar.css";
import NewCafeDialog from "./NewCafeDialog"
import useMapStore from "../store/useMapStore";


const WavyMenu = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const map = useMapStore((state) => state.map);
  const neighborhoods = useMapStore((state) => state.neighborhoods);

  const neighborhoodOptions = useMemo(() => {
    return neighborhoods?.features
      .filter((f) => f.properties?.name)
      .sort((a, b) => a.properties.name > b.properties.name ? 1 : -1)
      || [];
  }, [neighborhoods]);

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

const handleNewCafeSubmit = (newCafe) => {
  console.log("New Cafe:", newCafe);

  const geoJsonFeature = {
    type: "Feature",
    id: newCafe.id,
    geometry: {
      type: "Point",
      coordinates: newCafe.coordinates,
    },
    properties: {
      amenity: "cafe",
      cuisine: "coffee_shop",
      name: newCafe.name,
      address: newCafe.address,
      phone: newCafe.phone || "",
      website: newCafe.website || "",
      opening_hours: newCafe.openingHours || "",
      specialty: newCafe.specialty,
      roaster: newCafe.roaster,
      inHouseRoast: newCafe.inHouseRoast,
      outdoorSeating: newCafe.outdoorSeating,
      wifi: newCafe.wifi ?? false,
      takeaway: false,
      wheelchairAccessible: false,
      specialItems: newCafe.specialItems,
      vibeTags: newCafe.vibeTags,
    },
  };

  console.log("GeoJSON Feature ready to save:", geoJsonFeature);
};

  return (
    <>
      <AppBar
        position="static"
        sx={{ backgroundColor: "#b23a48" }}
        className="wavy-menu"
      >
        <Toolbar>
          {/* a coffeecup or something */}
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
          >
            Home
          </Button>

          <Button color="inherit">Filter</Button>

          <Autocomplete
            options={neighborhoodOptions}
            getOptionLabel={(option) => option?.properties.name || ""}
              sx={{
                width: 200,
                mx: "10px",
                "& .MuiInputBase-root": {
                  color: "white",
                  fontSize: "0.8rem",
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
                placeholder="Neighborhood"
                sx={{
                  "& .MuiInputBase-input": { fontSize: "0.8rem", padding: "6px 8px" },
                  "& .MuiInputLabel-root": { fontSize: "0.75rem" },
                }}
              />
            )}
          />

          <Button color="inherit" onClick={handleDialogOpen}>
            Suggest New
          </Button>

        </Toolbar>
      </AppBar>
      <NewCafeDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleNewCafeSubmit}
      />
    </>
  );
};

export default WavyMenu;

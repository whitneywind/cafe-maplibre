import { useEffect, useState } from "react";
import { AppBar, Toolbar, Button, TextField, Autocomplete } from "@mui/material";
import "../styles/MenuBar.css";
import NewCafeDialog from "./NewCafeDialog"
import useMapStore from "../store/useMapStore";
import neighborhoodPolygons from "../assets/neighborhoods/nbrs.json";


const WavyMenu = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const map = useMapStore((state) => state.map);

  const selectedNeighborhood = useMapStore((state) => state.selectedNeighborhood);
  const setSelectedNeighborhood = useMapStore((state) => state.setSelectedNeighborhood);

  const neighborhoods = neighborhoodPolygons.features.filter(f => f.name);  

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
  console.log("🆕 New Cafe:", newCafe);

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

  // append to geojson array or POST to server here
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

          <Autocomplete
            options={neighborhoods}
            getOptionLabel={(option) => option?.name || ""}
            sx={{ width: 200, marginLeft: 2 }}
            size="small"
            value={selectedNeighborhood || null}
            onChange={(event, value) => handleNeighborhoodSelect(event, value)}
            renderInput={(params) => <TextField {...params} label="Neighborhood" />}
          />

          <Button color="inherit">Filter</Button>
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

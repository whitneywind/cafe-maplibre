import { useState } from "react";
import { AppBar, Toolbar, Button, Menu, MenuItem } from "@mui/material";
import "../styles/MenuBar.css";
import NewCafeDialog from "./NewCafeDialog"


const WavyMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setMenuOpen(true);
  };

  const handleClose = () => {
    setMenuOpen(false);
  };

  const handleDialogOpen = () => {
    setDialogOpen(true);
    setMenuOpen(false);
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

  // 🔥 Append to your local GeoJSON array or POST to server here
  console.log("GeoJSON Feature ready to save:", geoJsonFeature);
};


  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#3fa977" }}>
        <Toolbar>
          <Button color="inherit">Home</Button>
          <Button color="inherit">About</Button>
          <Button color="inherit" onClick={handleClick}>
            Contribute
          </Button>
          <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleClose}>
            <MenuItem onClick={handleDialogOpen}>Suggest New Cafe</MenuItem>
          </Menu>
          <Button color="inherit">Contact</Button>
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

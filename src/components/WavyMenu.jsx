import { useState } from "react";
import { AppBar, Toolbar, Button, Menu, MenuItem } from "@mui/material";
import "../styles/MenuBar.css";

const WavyMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [open, setOpen] = useState(false);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: "#8839bd" }}>
        <Toolbar>
          <Button color="inherit">Home</Button>
          <Button color="inherit">About</Button>
          <Button color="inherit" onClick={handleClick}>
            Services
          </Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
            <MenuItem onClick={handleClose}>Web Design</MenuItem>
            <MenuItem onClick={handleClose}>App Development</MenuItem>
            <MenuItem onClick={handleClose}>SEO</MenuItem>
          </Menu>
          <Button color="inherit">Contact</Button>
        </Toolbar>
      </AppBar>
    </>
  );
};

export default WavyMenu;

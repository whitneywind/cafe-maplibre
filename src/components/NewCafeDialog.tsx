import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
  Box,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Typography,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { useState, ChangeEvent } from "react";
import { NewCoffeeShop, BathroomAccess } from "../../types.ts";

type NewCafeDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function NewCafeDialog({ open, onClose }: NewCafeDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    neighborhood: "",
    website: "",
    opening_hours: "",
    phone: "",
    instagram: "",
    parking: "",
    closest_metro: "",
    bathroom: false,
    bathroom_access: "" as BathroomAccess | "",
    specialty: false,
    in_house_roast: false,
    indoor_seating: false,
    outdoor_seating: false,
    wifi: false,
    outlets: false,
    laptop_friendly: false,
    roaster: [] as string[],
    matcha: false,
    matcha_brand: "",
    alt_milks: [] as string[],
    alt_milks_cost: "",
    latte_price: "",
    popular_items: [] as string[],
    notes: "",
  });
  
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [popularItemsInput, setPopularItemsInput] = useState("");
  

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
    
  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchInput)}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Geocode error:", error);
      setSearchResults([]);
    }
    setLoading(false);
  };

  const handleSelectResult = (result: { display_name: string; lat: string; lon: string }) => {
    setFormData((prev) => ({
      ...prev,
      address: result.display_name,
      latitude: result.lat,
      longitude: result.lon,
    }));
    setSearchResults([]);
    setSearchInput("");
  };

  const handleSubmit = async () => {
    const { name, address, latitude, longitude } = formData;

    if (!name || !address || !latitude || !longitude) {
      alert("Please fill out all required fields and select a location.");
      return;
    }

    const popularItemsArray = popularItemsInput
      .split(",")
      .map(s => s.trim())            // remove leading/trailing spaces
      .map(s => s.replace(/\s+/g, " "))  // condense multiple spaces to one
      .map(s => s.replace(/ /g, "_")); // storing individual items using  snake case for now (TODO: come up with a better idea for this)

    const newCafe: NewCoffeeShop = {
      id: `cafe${Date.now()}`,
      name: formData.name,
      address: formData.address || undefined,
      coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
      neighborhood: formData.neighborhood || undefined,
      website: formData.website || undefined,
      opening_hours: formData.opening_hours || undefined,
      phone: formData.phone || undefined,
      instagram: formData.instagram || undefined,
      parking: formData.parking || undefined,
      closest_metro: formData.closest_metro || undefined,
      bathroom: formData.bathroom ?? undefined,
      bathroom_access: formData.bathroom_access || undefined,
      specialty: formData.specialty,
      in_house_roast: formData.in_house_roast,
      indoor_seating: formData.indoor_seating ?? undefined,
      outdoor_seating: formData.outdoor_seating ?? undefined,
      wifi: formData.wifi ?? undefined,
      outlets: formData.outlets ?? undefined,
      laptop_friendly: formData.laptop_friendly ?? undefined,
      roaster: formData.roaster,
      matcha: formData.matcha ?? undefined,
      matcha_brand: formData.matcha_brand || undefined,
      alt_milks: formData.alt_milks.length ? formData.alt_milks : undefined,
      alt_milks_cost: formData.alt_milks_cost || undefined,
      latte_price: formData.latte_price || undefined,
      popular_items: popularItemsArray,
      notes: formData.notes || undefined,
    };

    try {
      const res = await fetch("http://localhost:3000/api/cafes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCafe),
      });

      if (!res.ok) {
        throw new Error("Failed to add cafe");
      }

      const result = await res.json();
      console.log("Cafe added:", result);

      onClose();

      // reset form
      setFormData({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        neighborhood: "",
        website: "",
        opening_hours: "",
        phone: "",
        instagram: "",
        parking: "",
        closest_metro: "",
        bathroom: false,
        bathroom_access: "" as BathroomAccess | "",
        specialty: false,
        in_house_roast: false,
        indoor_seating: false,
        outdoor_seating: false,
        wifi: false,
        outlets: false,
        laptop_friendly: false,
        roaster: [],
        matcha: false,
        matcha_brand: "",
        alt_milks: [],
        alt_milks_cost: "",
        latte_price: "",
        popular_items: [],
        notes: "",
      });

      setShowMoreDetails(false);
    } catch (error) {
      console.error(error);
      alert("There was a problem adding the cafe. Try again.");
    }
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth disableEnforceFocus disableRestoreFocus>
      <DialogTitle>Suggest a New Cafe</DialogTitle>
      <DialogContent>
        <TextField
          label="Cafe Name"
          name="name"
          fullWidth
          required
          margin="dense"
          value={formData.name}
          onChange={handleTextChange}
        />

        <TextField
          label="Search Address or Place"
          fullWidth
          margin="dense"
          value={searchInput}
          onChange={handleSearchInputChange}
          helperText="Type an address or place and click Search"
        />
        <Button
          onClick={handleSearch}
          disabled={loading || !searchInput.trim()}
          size="small"
          variant="outlined"
          sx={{ mb: 1 }}
        >
          {loading ? <CircularProgress size={18} /> : "Search"}
        </Button>

        {searchResults.length > 0 && (
          <List
            dense
            sx={{
              maxHeight: 150,
              overflowY: "auto",
              border: "1px solid #ddd",
              mb: 1,
              borderRadius: 1,
            }}
          >
            {searchResults.map((res, i) => (
              <ListItem key={i} disablePadding>
                <ListItemButton onClick={() => handleSelectResult(res)}>
                  <ListItemText primary={res.display_name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        <TextField
          label="Selected Address"
          name="address"
          fullWidth
          required
          margin="dense"
          value={formData.address}
          onChange={handleTextChange}
          disabled
        />
        {formData.latitude && formData.longitude && (
            <div style={{ margin: "8px 0" }}>
                <strong>Coordinates:</strong> {formData.latitude}, {formData.longitude}
            </div>
        )}

        {/* Toggle for extra details */}
        <Button size="small" onClick={() => setShowMoreDetails(prev => !prev)}>
          {showMoreDetails ? "Hide extra details" : "Add more details"}
        </Button>

        {showMoreDetails && (
          <Box sx={{ mt: 1 }}>

            {/* boolean options */}
            <FormControlLabel control={<Checkbox name="wifi" checked={formData.wifi} onChange={handleCheckboxChange} />} label="Wifi" />
            <FormControlLabel control={<Checkbox name="bathroom" checked={formData.bathroom} onChange={handleCheckboxChange} />} label="Bathroom" />
            <FormControlLabel control={<Checkbox name="outlets" checked={formData.outlets} onChange={handleCheckboxChange} />} label="Outlets" />
            <FormControlLabel control={<Checkbox name="laptop_friendly" checked={formData.laptop_friendly} onChange={handleCheckboxChange} />} label="Laptop-friendly" />
            <FormControlLabel control={<Checkbox name="outdoor_seating" checked={formData.outdoor_seating} onChange={handleCheckboxChange} />} label="Outdoor seating" />
            <FormControlLabel control={<Checkbox name="indoor_seating" checked={formData.indoor_seating} onChange={handleCheckboxChange} />} label="Indoor seating" />
            <FormControlLabel control={<Checkbox name="specialty" checked={formData.specialty} onChange={handleCheckboxChange} />} label="Specialty Coffee" />
            <FormControlLabel control={<Checkbox name="in_house_roast" checked={formData.in_house_roast} onChange={handleCheckboxChange} />} label="In-house Roast" />
            <FormControlLabel control={<Checkbox name="matcha" checked={formData.matcha} onChange={handleCheckboxChange} />} label="Matcha" />

            {/* non-boolean options */}
            {/* TODO: make reusable and share with update */}
            <Box sx={{ mt: 2, width: "75%", mx: "auto" }}>
              <Typography gutterBottom>Latte Price (${parseFloat(formData.latte_price || "0").toFixed(2)})</Typography>
              <Slider
                value={formData.latte_price ? parseFloat(formData.latte_price) : 3}
                min={3}
                max={10}
                step={0.25}
                valueLabelDisplay="auto"
                onChange={(_, value) => {
                  if (typeof value === "number") {
                    // store as str with 2 decimals
                    setFormData(prev => ({ ...prev, latte_price: value.toFixed(2) }));
                  }
                }}
                sx={{
                  color: "#b23a48",
                  "& .MuiSlider-thumb": {
                    "&:hover, &.Mui-focusVisible, &.Mui-active": {
                      boxShadow: "0 0 0 8px rgba(139,92,246,0.16)",
                    },
                  },
                }}
              />
            </Box>

            <TextField label="Instagram" name="instagram" fullWidth margin="dense" value={formData.instagram} onChange={handleTextChange} />
            <TextField label="Website" name="website" fullWidth margin="dense" value={formData.website} onChange={handleTextChange} />
            <TextField label="Matcha Brand" name="matcha_brand" fullWidth margin="dense" value={formData.matcha_brand} onChange={handleTextChange} />
            <TextField label="Alt Milks (comma-separated)" name="alt_milks" fullWidth margin="dense" value={formData.alt_milks.join(", ")} onChange={(e) => setFormData(prev => ({ ...prev, alt_milks: e.target.value.split(",").map(s => s.trim()) }))} />
            <TextField label="Alt Milks Cost" name="alt_milks_cost" fullWidth margin="dense" value={formData.alt_milks_cost} onChange={handleTextChange} />

            <TextField
              label="Popular Items (comma-separated)"
              name="popular_items"
              fullWidth
              margin="dense"
              value={popularItemsInput}
              onChange={(e) => setPopularItemsInput(e.target.value)}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel id="parking-label">Parking</InputLabel>
              <Select
                labelId="parking-label"
                name="parking"
                value={formData.parking}
                onChange={handleSelectChange}
              >
                <MenuItem value="">None</MenuItem> {/* optional */}
                <MenuItem value="parking lot">Parking lot</MenuItem>
                <MenuItem value="street parking">Street parking</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense">
              <InputLabel id="bathroom-access-label">Bathroom Access</InputLabel>
              <Select labelId="bathroom-access-label" name="bathroom_access" value={formData.bathroom_access} onChange={handleSelectChange}>
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="key">Physical Key</MenuItem>
                <MenuItem value="keypad">Keypad Access</MenuItem>
                <MenuItem value="unavailable">Unavailable</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Roasters"
              name="roaster"
              fullWidth
              value={formData.roaster.join(", ")}
              onChange={(e) => setFormData(prev => ({ ...prev, roaster: e.target.value.split(",").map(s => s.trim()) }))}
            />

            <TextField label="Notes" name="notes" fullWidth margin="dense" value={formData.notes} onChange={handleTextChange} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

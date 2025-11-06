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
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { useState, ChangeEvent } from "react";
import { CoffeeShop } from "../../types.ts";

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
    specialty: false,
    in_house_roast: false,
    outdoor_seating: false,
    wifi: false,
    outlets: false,
    laptop_friendly: false,
    roaster: [] as string[],
    special_items: [] as string[],
    notes: "",
  });
  
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  

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

    const newCafe: CoffeeShop = {
      id: `cafe${Date.now()}`,
      name: formData.name,
      address: formData.address,
      coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
      website: formData.website || undefined,
      opening_hours: formData.opening_hours || undefined,
      neighborhood: formData.neighborhood || undefined,
      phone: formData.phone || undefined,
      instagram: formData.instagram || undefined,
      parking: formData.parking || undefined,
      closest_metro: formData.closest_metro || undefined,
      bathroom: formData.bathroom || undefined,
      specialty: formData.specialty,
      in_house_roast: formData.in_house_roast,
      outdoor_seating: formData.outdoor_seating,
      wifi: formData.wifi,
      outlets: formData.outlets,
      laptop_friendly: formData.laptop_friendly,
      roaster: formData.roaster,
      special_items: formData.special_items,
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
        website: "",
        opening_hours: "",
        neighborhood: "",
        phone: "",
        instagram: "",
        parking: "",
        closest_metro: "",
        bathroom: false,
        specialty: false,
        in_house_roast: false,
        outdoor_seating: false,
        wifi: false,
        outlets: false,
        laptop_friendly: false,
        roaster: [],
        special_items: [],
        notes: "",
      });
      setShowMoreDetails(false);
    } catch (error) {
      console.error(error);
      alert("There was a problem adding the cafe. Try again.");
    }
  };


  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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

        {/* <TextField
          label="Opening Hours"
          name="opening_hours"
          fullWidth
          margin="dense"
          value={formData.opening_hours}
          onChange={handleTextChange}
        /> */}

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
            <FormControlLabel control={<Checkbox name="specialty" checked={formData.specialty} onChange={handleCheckboxChange} />} label="Specialty Coffee" />

            {/* non-boolean options */}
            <TextField 
              label="Instagram"
              name="instagram"
              fullWidth margin="dense"
              value={formData.instagram}
              onChange={handleTextChange}
            />

            <TextField
              label="Website"
              name="website"
              fullWidth
              margin="dense"
              value={formData.website}
              onChange={handleTextChange}
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

            <TextField
              label="Roasters"
              name="roaster"
              fullWidth
              value={formData.roaster.join(", ")}
              onChange={(e) => setFormData(prev => ({ ...prev, roaster: e.target.value.split(",").map(s => s.trim()) }))}
            />
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

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
} from "@mui/material";
import { useState, ChangeEvent } from "react";
import { CoffeeShop } from "../../types.ts";

type NewCafeDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CoffeeShop) => void;
};

export default function NewCafeDialog({ open, onClose, onSubmit }: NewCafeDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
    website: "",
    opening_hours: "",
  });
  
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [loading, setLoading] = useState(false);
  

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSearch = async () => {
    if (!searchInput.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(searchInput)}`);
      console.log("res: ", res)
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

  // const handleSubmit = () => {
  //   const { name, address, latitude, longitude } = formData;

  //   if (!name || !address || !latitude || !longitude) {
  //     alert("Please fill out all required fields and select a location.");
  //     return;
  //   }

  //   const newCafe: CoffeeShop = {
  //     id: `user-${Date.now()}`,
  //     name,
  //     address,
  //     coordinates: [parseFloat(longitude), parseFloat(latitude)],
  //     website: formData.website || "",
  //     opening_hours: formData.opening_hours || "",
  //     specialty: true,
  //     roaster: [],
  //     in_house_roast: false,
  //     outdoor_seating: false,
  //     wifi: false,
  //     special_items: [],
  //     vibe_tags: [],
  //   };

  //   onSubmit(newCafe);
  //   onClose();
  //   setFormData({
  //     name: "",
  //     address: "",
  //     latitude: "",
  //     longitude: "",
  //     website: "",
  //     opening_hours: "",
  //   });
  // };


  const handleSubmit = async () => {
    const { name, address, latitude, longitude } = formData;

    if (!name || !address || !latitude || !longitude) {
      alert("Please fill out all required fields and select a location.");
      return;
    }

    const newCafe: CoffeeShop = {
      id: `user-${Date.now()}`,
      name,
      address,
      coordinates: [parseFloat(longitude), parseFloat(latitude)],
      website: formData.website || "",
      opening_hours: formData.opening_hours || "",
      specialty: true,
      roaster: [],
      in_house_roast: false,
      outdoor_seating: false,
      wifi: false,
      special_items: [],
      vibe_tags: [],
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

      // Optionally refresh cafes in parent
      onSubmit(newCafe);
      onClose();

      // reset form
      setFormData({
        name: "",
        address: "",
        latitude: "",
        longitude: "",
        website: "",
        opening_hours: "",
      });
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
          onChange={handleChange}
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
          onChange={handleChange}
          disabled
        />
        {formData.latitude && formData.longitude && (
            <div style={{ margin: "8px 0" }}>
                <strong>Coordinates:</strong> {formData.latitude}, {formData.longitude}
            </div>
        )}


        <TextField
          label="Website"
          name="website"
          fullWidth
          margin="dense"
          value={formData.website}
          onChange={handleChange}
        />
        <TextField
          label="Opening Hours"
          name="opening_hours"
          fullWidth
          margin="dense"
          value={formData.opening_hours}
          onChange={handleChange}
        />
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

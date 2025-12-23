import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Slider,
  Typography,
  Box,
  Autocomplete,
  Chip,
} from "@mui/material";
import { useState, ChangeEvent } from "react";
import { NewCoffeeShop } from "../../../types.ts";
import { deleteCafe } from "./mapFns.tsx";
import useMapStore from "../../store/useMapStore.ts";

type UpdateCafeDialogProps = {
  open: boolean;
  onClose: () => void;
  cafe: NewCoffeeShop;
};

export default function UpdateCafeDialog({
  open,
  onClose,
  cafe,
}: UpdateCafeDialogProps) {
  const [formData, setFormData] = useState({ ...cafe });
  const map = useMapStore((state) => state.map);
  // TODO: figure out why popular_items in being converted to a str from the string[] in the db

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const name = e.target.name!;
    setFormData(prev => ({ ...prev, [name]: e.target.value }));
  };

  const handleSubmit = async () => {
    const updatedCafe = { ...formData };

    try {
        const res = await fetch(`http://localhost:3000/api/cafes/${formData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCafe),
        });

        if (!res.ok) {
            throw new Error("Failed to update cafe");
        }

        // const updatedCafe = await res.json();
        const result = await res.json();
        console.log("Cafe updated:", result);
        onClose();
    } catch (error) {
        console.error(error);
        alert("There was a problem updating the cafe");
    }
    };

  const handleDelete = async () => {
    if (!map) return alert("Map not initialized yet.");
    
    if (window.confirm(`Are you sure you want to delete ${formData.name}?`)) {
        try {
            await deleteCafe(map, formData.id);
            // close cafepopup too
            onClose();
        } catch (error) {
           console.error(error); 
           alert("Failed to delete cafe")
        }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth disableEnforceFocus disableRestoreFocus>
      <DialogTitle>Update Cafe</DialogTitle>
      <DialogContent>
        <TextField label="Cafe Name" name="name" fullWidth required margin="dense" value={formData.name} onChange={handleTextChange} />
        <TextField label="Address" name="address" fullWidth margin="dense" value={formData.address} onChange={handleTextChange} />

        <FormControlLabel control={<Checkbox name="wifi" checked={formData.wifi} onChange={handleCheckboxChange} />} label="Wifi" />
        <FormControlLabel control={<Checkbox name="bathroom" checked={formData.bathroom} onChange={handleCheckboxChange} />} label="Bathroom" />
        <FormControlLabel control={<Checkbox name="outlets" checked={formData.outlets} onChange={handleCheckboxChange} />} label="Outlets" />
        <FormControlLabel control={<Checkbox name="laptop_friendly" checked={formData.laptop_friendly} onChange={handleCheckboxChange} />} label="Laptop-friendly" />
        <FormControlLabel control={<Checkbox name="outdoor_seating" checked={formData.outdoor_seating} onChange={handleCheckboxChange} />} label="Outdoor seating" />
        <FormControlLabel control={<Checkbox name="indoor_seating" checked={formData.indoor_seating} onChange={handleCheckboxChange} />} label="Indoor seating" />
        <FormControlLabel control={<Checkbox name="specialty" checked={formData.specialty} onChange={handleCheckboxChange} />} label="Specialty Coffee" />
        <FormControlLabel control={<Checkbox name="in_house_roast" checked={formData.in_house_roast} onChange={handleCheckboxChange} />} label="In-house Roast" />
        <FormControlLabel control={<Checkbox name="matcha" checked={formData.matcha} onChange={handleCheckboxChange} />} label="Matcha" />

        <TextField label="Instagram" name="instagram" fullWidth margin="dense" value={formData.instagram || ""} onChange={handleTextChange} />
        <TextField label="Website" name="website" fullWidth margin="dense" value={formData.website || ""} onChange={handleTextChange} />
        <TextField label="Matcha Brand" name="matcha_brand" fullWidth margin="dense" value={formData.matcha_brand || ""} onChange={handleTextChange} />
        <TextField label="Alt Milks (comma-separated)" name="alt_milks" fullWidth margin="dense" value={formData.alt_milks?.join(", ")} onChange={(e) => setFormData(prev => ({ ...prev, alt_milks: e.target.value.split(",").map(s => s.trim()) }))} />
        <TextField label="Alt Milks Cost" name="alt_milks_cost" fullWidth margin="dense" value={formData.alt_milks_cost || ""} onChange={handleTextChange} />

        <Box sx={{ mt: 2, width: "75%", mx: "auto" }}>
          <Typography gutterBottom>Latte Price (${parseFloat(formData.latte_price || "0").toFixed(2)})</Typography>
          <Slider
            value={formData.latte_price ? parseFloat(formData.latte_price) : 3}
            min={3}
            max={10}
            step={0.25}
            valueLabelDisplay="auto"
            onChange={(_, value) => {
              if (typeof value === "number") setFormData(prev => ({ ...prev, latte_price: value.toFixed(2) }));
            }}
            sx={{ color: "#b23a48" }}
          />
        </Box>

        {/* <TextField
          label="Popular Items (comma-separated)"
          name="popular_items"
          fullWidth
          margin="dense"
          value={Array.isArray(formData.popular_items)
            ? formData.popular_items.map(item => item.replace(/_/g, " ")).join(", ")
            : ""}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              popular_items: e.target.value
                .split(",")
                .map(s => s.trim().replace(/\s+/g, " ").replace(/ /g, "_")),
            }))
          }
        /> */}
<Autocomplete
  multiple
  freeSolo
  options={[]} // no predefined options, or you can add suggestions
  value={
    Array.isArray(formData.popular_items)
      ? formData.popular_items.map(item => item.replace(/_/g, " "))
      : []
  }
  onChange={(_, newValue: string[]) => {
    // convert to snake_case for storage
    const formatted = newValue
      .map(s => s.trim())
      .map(s => s.replace(/\s+/g, " "))
      .map(s => s.replace(/ /g, "_"));
    setFormData(prev => ({ ...prev, popular_items: formatted }));
  }}
  filterOptions={(options, params) => {
    // split input by comma, enter, or space
    const input = params.inputValue;
    const lastChar = input.slice(-1);
    if (lastChar === " " || lastChar === "," || lastChar === "\n") {
      const trimmed = input.trim();
      if (trimmed) {
        return [...options, trimmed];
      }
    }
    return options;
  }}
  renderTags={(value: string[], getTagProps) =>
    value.map((option, index) => (
      <Chip variant="outlined" label={option} {...getTagProps({ index })} />
    ))
  }
  renderInput={(params) => (
    <TextField
      {...params}
      label="Popular Items"
      placeholder="Type an item and press comma, enter, or space"
      margin="dense"
      fullWidth
    />
  )}
/>

        <FormControl fullWidth margin="dense">
          <InputLabel id="parking-label">Parking</InputLabel>
          <Select labelId="parking-label" name="parking" value={formData.parking || ""} onChange={handleSelectChange}>
            <MenuItem value="">None</MenuItem>
            <MenuItem value="parking lot">Parking lot</MenuItem>
            <MenuItem value="street parking">Street parking</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel id="bathroom-access-label">Bathroom Access</InputLabel>
          <Select labelId="bathroom-access-label" name="bathroom_access" value={formData.bathroom_access || ""} onChange={handleSelectChange}>
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
          value={Array.isArray(formData.roaster) ? formData.roaster.join(", ") : ""}
          onChange={(e) =>
            setFormData(prev => ({
              ...prev,
              roaster: e.target.value.split(",").map(s => s.trim())
            }))
          }
        />
        <TextField label="Notes" name="notes" fullWidth margin="dense" multiline rows={3} value={formData.notes || ""} onChange={handleTextChange} />
      </DialogContent>

      <DialogActions>
        <Button color="error" onClick={handleDelete}>Delete</Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Update</Button>
      </DialogActions>
    </Dialog>
    // <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableEnforceFocus disableRestoreFocus>
    //   <DialogTitle>Update Cafe</DialogTitle>
    //   <DialogContent>
    //     <TextField
    //       label="Cafe Name"
    //       name="name"
    //       fullWidth
    //       required
    //       margin="dense"
    //       value={formData.name}
    //       onChange={handleTextChange}
    //     />

    //     <TextField
    //       label="Address"
    //       name="address"
    //       fullWidth
    //       margin="dense"
    //       value={formData.address}
    //       onChange={handleTextChange}
    //     />

    //     <FormControlLabel
    //       control={<Checkbox name="wifi" checked={formData.wifi} onChange={handleCheckboxChange} />}
    //       label="Wifi"
    //     />
    //     <FormControlLabel
    //       control={<Checkbox name="bathroom" checked={formData.bathroom} onChange={handleCheckboxChange} />}
    //       label="Bathroom"
    //     />
    //     <FormControlLabel
    //       control={<Checkbox name="outlets" checked={formData.outlets} onChange={handleCheckboxChange} />}
    //       label="Outlets"
    //     />
    //     <FormControlLabel
    //       control={<Checkbox name="laptop_friendly" checked={formData.laptop_friendly} onChange={handleCheckboxChange} />}
    //       label="Laptop-friendly"
    //     />
    //     <FormControlLabel
    //       control={<Checkbox name="outdoor_seating" checked={formData.outdoor_seating} onChange={handleCheckboxChange} />}
    //       label="Outdoor seating"
    //     />
    //     <FormControlLabel
    //       control={<Checkbox name="specialty" checked={formData.specialty} onChange={handleCheckboxChange} />}
    //       label="Specialty Coffee"
    //     />

    //     <TextField
    //       label="Instagram"
    //       name="instagram"
    //       fullWidth
    //       margin="dense"
    //       value={formData.instagram || ""}
    //       onChange={handleTextChange}
    //     />

    //     <TextField
    //       label="Website"
    //       name="website"
    //       fullWidth
    //       margin="dense"
    //       value={formData.website || ""}
    //       onChange={handleTextChange}
    //     />

    //     <FormControl fullWidth margin="dense">
    //       <InputLabel id="parking-label">Parking</InputLabel>
    //       <Select
    //         labelId="parking-label"
    //         name="parking"
    //         value={formData.parking || ""}
    //         onChange={handleSelectChange}
    //       >
    //         <MenuItem value="">None</MenuItem>
    //         <MenuItem value="parking lot">Parking lot</MenuItem>
    //         <MenuItem value="street parking">Street parking</MenuItem>
    //       </Select>
    //     </FormControl>

    //     {/* <TextField
    //       label="Roasters"
    //       name="roaster"
    //       fullWidth
    //       margin="dense"
    //       value={formData.roaster?.join(", ") || ""}
    //       onChange={(e) => setFormData(prev => ({ ...prev, roaster: e.target.value.split(",").map(s => s.trim()) }))}
    //     /> */}

    //     {/* <TextField
    //       label="Special Items"
    //       name="special_items"
    //       fullWidth
    //       margin="dense"
    //       value={formData.special_items?.join(", ") || ""}
    //       onChange={(e) => setFormData(prev => ({ ...prev, special_items: e.target.value.split(",").map(s => s.trim()) }))}
    //     /> */}

    //     {/* <TextField
    //       label="Notes"
    //       name="notes"
    //       fullWidth
    //       margin="dense"
    //       multiline
    //       rows={3}
    //       value={formData.notes || ""}
    //       onChange={handleTextChange}
    //     /> */}
    //   </DialogContent>

    //   <DialogActions>
    //     <Button color="error" onClick={handleDelete}>Delete</Button>
    //     <Button onClick={onClose}>Cancel</Button>
    //     <Button variant="contained" onClick={handleSubmit}>Update</Button>
    //   </DialogActions>
    // </Dialog>
  );
}

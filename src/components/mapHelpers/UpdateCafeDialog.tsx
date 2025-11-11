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
} from "@mui/material";
import { useState, ChangeEvent } from "react";
import { CoffeeShop } from "../../../types.ts";
import { deleteCafe } from "./mapFns.tsx";
import useMapStore from "../../store/useMapStore.ts";

type UpdateCafeDialogProps = {
  open: boolean;
  onClose: () => void;
  cafe: CoffeeShop;
};

export default function UpdateCafeDialog({
  open,
  onClose,
  cafe,
}: UpdateCafeDialogProps) {
  const [formData, setFormData] = useState({ ...cafe });

  const map = useMapStore((state) => state.map);


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
    try {
        const res = await fetch(`http://localhost:3000/api/cafes/${formData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (!res.ok) {
            throw new Error("Failed to update cafe");
        }

        const updatedCafe = await res.json();
        console.log("Cafe updated:", updatedCafe);

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth disableEnforceFocus disableRestoreFocus>
      <DialogTitle>Update Cafe</DialogTitle>
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
          label="Address"
          name="address"
          fullWidth
          margin="dense"
          value={formData.address}
          onChange={handleTextChange}
        />

        <FormControlLabel
          control={<Checkbox name="wifi" checked={formData.wifi} onChange={handleCheckboxChange} />}
          label="Wifi"
        />
        <FormControlLabel
          control={<Checkbox name="bathroom" checked={formData.bathroom} onChange={handleCheckboxChange} />}
          label="Bathroom"
        />
        <FormControlLabel
          control={<Checkbox name="outlets" checked={formData.outlets} onChange={handleCheckboxChange} />}
          label="Outlets"
        />
        <FormControlLabel
          control={<Checkbox name="laptop_friendly" checked={formData.laptop_friendly} onChange={handleCheckboxChange} />}
          label="Laptop-friendly"
        />
        <FormControlLabel
          control={<Checkbox name="outdoor_seating" checked={formData.outdoor_seating} onChange={handleCheckboxChange} />}
          label="Outdoor seating"
        />
        <FormControlLabel
          control={<Checkbox name="specialty" checked={formData.specialty} onChange={handleCheckboxChange} />}
          label="Specialty Coffee"
        />

        <TextField
          label="Instagram"
          name="instagram"
          fullWidth
          margin="dense"
          value={formData.instagram || ""}
          onChange={handleTextChange}
        />

        <TextField
          label="Website"
          name="website"
          fullWidth
          margin="dense"
          value={formData.website || ""}
          onChange={handleTextChange}
        />

        <FormControl fullWidth margin="dense">
          <InputLabel id="parking-label">Parking</InputLabel>
          <Select
            labelId="parking-label"
            name="parking"
            value={formData.parking || ""}
            onChange={handleSelectChange}
          >
            <MenuItem value="">None</MenuItem>
            <MenuItem value="parking lot">Parking lot</MenuItem>
            <MenuItem value="street parking">Street parking</MenuItem>
          </Select>
        </FormControl>

        {/* <TextField
          label="Roasters"
          name="roaster"
          fullWidth
          margin="dense"
          value={formData.roaster?.join(", ") || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, roaster: e.target.value.split(",").map(s => s.trim()) }))}
        /> */}

        {/* <TextField
          label="Special Items"
          name="special_items"
          fullWidth
          margin="dense"
          value={formData.special_items?.join(", ") || ""}
          onChange={(e) => setFormData(prev => ({ ...prev, special_items: e.target.value.split(",").map(s => s.trim()) }))}
        /> */}

        {/* <TextField
          label="Notes"
          name="notes"
          fullWidth
          margin="dense"
          multiline
          rows={3}
          value={formData.notes || ""}
          onChange={handleTextChange}
        /> */}
      </DialogContent>

      <DialogActions>
        <Button color="error" onClick={handleDelete}>Delete</Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit}>Update</Button>
      </DialogActions>
    </Dialog>
  );
}

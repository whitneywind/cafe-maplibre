import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Slider,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import { useState, ChangeEvent } from "react";
import { UpdateCafeDialogProps } from "../../../types.ts";
import { deleteCafe } from "./mapFns.tsx";
import useMapStore from "../../store/useMapStore.ts";
import { ALT_MILK_OPTIONS, AmenityCheckbox, Section } from "../NewCafeDialog.tsx";
import { normalizeCafe } from "../../utils/dataNormalization.ts";

export default function UpdateCafeDialog({
  open,
  onClose,
  cafe,
}: UpdateCafeDialogProps) {
  const [formData, setFormData] = useState(() => normalizeCafe(cafe));
  // const [popularItemsInput, setPopularItemsInput] = useState(
  //   Array.isArray(cafe.popular_items) 
  //     ? cafe.popular_items.map(i => i.replace(/_/g, " ")).join(", ") 
  //     : ""
  // );
  const [popularItemsInput, setPopularItemsInput] = useState(() =>
    formData.popular_items?.map(i => i.replace(/_/g, " ")).join(", ") || ""
  );
  const map = useMapStore((state) => state.map);

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async () => {
    const popularItemsArray = popularItemsInput
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.replace(/ /g, "_"));

    const updatedCafe = { ...formData, popular_items: popularItemsArray };

    try {
        const res = await fetch(`http://localhost:3000/api/cafes/${formData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedCafe),
        });

        if (!res.ok) {
            throw new Error("Failed to update cafe");
        }

        // const result = await res.json();
        onClose();
    } catch (error) {
        console.error(error);
        alert("There was a problem updating the cafe");
    }
  };

  const handleDelete = async () => {
    if (!map) return alert("Map not initialized yet.");

    if (!formData.id) {
      return alert("Cannot delete cafe: missing ID");
    }
    
    if (window.confirm(`Are you sure you want to delete ${formData.name}?`)) {
        try {
            await deleteCafe(map, formData.id);
            onClose();
        } catch (error) {
           console.error(error); 
           alert("Failed to delete cafe")
        }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogTitle
        sx={{
          textAlign: "center",
          pb: 1,
          typography: "h4",
          fontWeight: "bold",
          color: "#b23a48",
        }}
      >
        Update Cafe
      </DialogTitle>

      <DialogContent>
        <Section title="Cafe Info*">
          <TextField
            label="Cafe Name"
            name="name"
            fullWidth
            required
            value={formData.name}
            onChange={handleTextChange}
          />
        </Section>

        <Section title="Highlights">
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            <AmenityCheckbox
              label="Coffee Recommended"
              name="coffee_rec"
              checked={formData.coffee_rec || false}
              onChange={handleCheckboxChange}
            />
            <AmenityCheckbox
              label="Matcha Recommended"
              name="matcha_rec"
              checked={formData.coffee_rec || false}
              onChange={handleCheckboxChange}
            />
          </Box>
        </Section>

        <Section title="Details">
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            <AmenityCheckbox label="Specialty Coffee" name="specialty" checked={formData.specialty || false} onChange={handleCheckboxChange} />
            <AmenityCheckbox label="In-house Roast" name="in_house_roast" checked={formData.in_house_roast || false} onChange={handleCheckboxChange} />
            <AmenityCheckbox label="Matcha Available" name="matcha" checked={formData.matcha || false} onChange={handleCheckboxChange} />
            <AmenityCheckbox label="Wi-Fi" name="wifi" checked={formData.wifi || false} onChange={handleCheckboxChange} />
            <AmenityCheckbox label="Outlets" name="outlets" checked={formData.outlets || false} onChange={handleCheckboxChange} />
            <AmenityCheckbox label="Laptop Friendly" name="laptop_friendly" checked={formData.laptop_friendly || false} onChange={handleCheckboxChange} />
            <AmenityCheckbox label="Indoor Seating" name="indoor_seating" checked={formData.indoor_seating || false} onChange={handleCheckboxChange} />
            <AmenityCheckbox label="Outdoor Seating" name="outdoor_seating" checked={formData.outdoor_seating || false} onChange={handleCheckboxChange} />

            {formData.bathroom && (
              <TextField
                select
                size="small"
                label="Bathroom Access"
                name="bathroom_access"
                value={formData.bathroom_access ?? ""}
                onChange={handleTextChange}
                sx={{ minWidth: 180 }}
              >
                <MenuItem value="">Select</MenuItem>
                <MenuItem value="open">Open</MenuItem>
                <MenuItem value="needs-key-code">Requires Key / Code</MenuItem>
                <MenuItem value="unavailable">Unavailable</MenuItem>
              </TextField>
            )}
            <AmenityCheckbox label="Bathroom" name="bathroom" checked={formData.bathroom || false} onChange={handleCheckboxChange} />
          </Box>
        </Section>

        <Section title="Drinks & Menu">
          <Box sx={{ width: "75%", mx: "auto" }}>
            <Typography gutterBottom>Latte Price (${formData.latte_price || "—"})</Typography>
            <Slider
              min={3}
              max={10}
              step={0.25}
              value={Number(formData.latte_price) || 3}
              onChange={(_, value) => typeof value === "number" && setFormData(prev => ({ ...prev, latte_price: value.toFixed(2) }))}
              sx={{ color: "#b23a48" }}
            />
          </Box>

          <TextField label="Roaster" name="roaster" fullWidth margin="dense" value={formData.roaster || ""} onChange={handleTextChange} />
          <TextField label="Matcha Brand" name="matcha_brand" fullWidth margin="dense" value={formData.matcha_brand || ""} onChange={handleTextChange} />
          <TextField
            label="Popular Items (comma-separated)"
            fullWidth
            margin="dense"
            value={popularItemsInput}
            onChange={e => setPopularItemsInput(e.target.value)}
          />
        </Section>

        <Section title="Alternative Milks">
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {ALT_MILK_OPTIONS.map(milk => {
              const selected = formData.alt_milks?.includes(milk);
              return (
                <Chip
                  key={milk}
                  label={milk}
                  clickable
                  color={selected ? "primary" : "default"}
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      alt_milks: selected
                        ? (prev.alt_milks ?? []).filter(m => m !== milk)
                        : [...(prev.alt_milks ?? []), milk],
                    }));
                  }}
                  sx={{ textTransform: "capitalize", border: selected ? "none" : "1px solid #ccc" }}
                />
              );
            })}
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant={formData.alt_milks_cost === "free" ? "contained" : "outlined"}
              onClick={() => setFormData(prev => ({ ...prev, alt_milks_cost: "free" }))}
            >
              Free
            </Button>
            <Button
              variant={formData.alt_milks_cost === "extra" ? "contained" : "outlined"}
              onClick={() => setFormData(prev => ({ ...prev, alt_milks_cost: "extra" }))}
            >
              Extra
            </Button>
          </Box>
        </Section>

        <Section title="Contact & Hours">
          <TextField label="Opening Hours" name="opening_hours" fullWidth margin="dense" value={formData.opening_hours || ""} onChange={handleTextChange} />
          <TextField label="Phone" name="phone" fullWidth margin="dense" value={formData.phone || ""} onChange={handleTextChange} />
          <TextField label="Instagram" name="instagram" fullWidth margin="dense" value={formData.instagram || ""} onChange={handleTextChange} />
          <TextField label="Website" name="website" fullWidth margin="dense" value={formData.website || ""} onChange={handleTextChange} />
        </Section>

        <Section title="Extra Info">
          <TextField label="Notes" name="notes" fullWidth multiline minRows={3} value={formData.notes || ""} onChange={handleTextChange} />
        </Section>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button color="error" onClick={handleDelete}>Delete</Button>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none", borderColor: "#999", color: "#666" }}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: "#b23a48", "&:hover": { backgroundColor: "#942d39" }, textTransform: "none", fontWeight: "bold" }}>Update</Button>
      </DialogActions>
    </Dialog>
  );
}

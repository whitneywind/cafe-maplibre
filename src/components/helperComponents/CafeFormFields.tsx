import React, { ChangeEvent } from "react";
import {
  TextField,
  MenuItem,
  Slider,
  Typography,
  Box,
  Chip,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";
import { CafeFormFieldsProps } from "../../../types";

const ALT_MILK_OPTIONS = [
  "oat",
  "almond",
  "soy",
  "coconut",
  "rice",
  "pistachio",
  "cashew",
  "macadamia",
  "other",
];

export const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Box
    sx={{
      p: 2.5,
      bgcolor: "#f7f7f7",
      borderRadius: 2,
      border: "1px solid #eee",
      mb: 2,
    }}
  >
    <Typography
      variant="subtitle1"
      fontWeight={800}
      sx={{ color: "#444", mb: 1.5 }}
    >
      {title}
    </Typography>
    {children}
  </Box>
);

export const AmenityCheckbox = ({
  label,
  name,
  checked,
  onChange,
}: {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}) => (
  <FormControlLabel
    control={
      <Checkbox
        name={name}
        checked={checked}
        onChange={onChange}
        size="small"
        sx={{ pr: 0.5, pl: 1 }}
      />
    }
    label={
      <Typography variant="body2" fontWeight={500}>
        {label}
      </Typography>
    }
    sx={{
      bgcolor: "white",
      pr: 1.5,
      py: 0.2,
      borderRadius: 2,
      border: "2px solid #eaeaea",
      m: 0,
    }}
  />
);

export default function CafeFormFields({
  formData,
  setFormData,
  popularItemsInput,
  setPopularItemsInput,
  locationSlot,
}: CafeFormFieldsProps) {
  const handleTextChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: checked,
      ...(name === "bathroom" && !checked ? { bathroom_access: "" } : {}),
    }));
  };

  return (
    <>
      <Section title="Cafe Info*">
        <TextField
          label="Cafe Name"
          name="name"
          fullWidth
          required
          value={formData.name || ""}
          onChange={handleTextChange}
        />
      </Section>

      {locationSlot}

      <Section title="Highlights">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <AmenityCheckbox
            label="Coffee Recommended"
            name="coffee_rec"
            checked={!!formData.coffee_rec}
            onChange={handleCheckboxChange}
          />
          <AmenityCheckbox
            label="Matcha Recommended"
            name="matcha_rec"
            checked={!!formData.matcha_rec}
            onChange={handleCheckboxChange}
          />
        </Box>
      </Section>

      <Section title="Details">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
          <AmenityCheckbox label="Specialty Coffee" name="specialty" checked={!!formData.specialty} onChange={handleCheckboxChange} />
          <AmenityCheckbox label="In-house Roast" name="in_house_roast" checked={!!formData.in_house_roast} onChange={handleCheckboxChange} />
          <AmenityCheckbox label="Matcha Available" name="matcha" checked={!!formData.matcha} onChange={handleCheckboxChange} />
          <AmenityCheckbox label="Wi-Fi" name="wifi" checked={!!formData.wifi} onChange={handleCheckboxChange} />
          <AmenityCheckbox label="Outlets" name="outlets" checked={!!formData.outlets} onChange={handleCheckboxChange} />
          <AmenityCheckbox label="Laptop Friendly" name="laptop_friendly" checked={!!formData.laptop_friendly} onChange={handleCheckboxChange} />
          <AmenityCheckbox label="Indoor Seating" name="indoor_seating" checked={!!formData.indoor_seating} onChange={handleCheckboxChange} />
          <AmenityCheckbox label="Outdoor Seating" name="outdoor_seating" checked={!!formData.outdoor_seating} onChange={handleCheckboxChange} />

          <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
            <AmenityCheckbox label="Bathroom" name="bathroom" checked={!!formData.bathroom} onChange={handleCheckboxChange} />

            {formData.bathroom && (
              <TextField
                select
                size="small"
                label="Bathroom Access"
                name="bathroom_access"
                value={formData.bathroom_access ?? ""}
                onChange={handleTextChange}
                sx={{
                  minWidth: 180,
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "white",
                    borderRadius: 2,
                    "& fieldset": {
                      border: "2px solid #eaeaea",
                    },
                    "&:hover fieldset": {
                      border: "2px solid #eaeaea",
                    },
                    "&.Mui-focused fieldset": {
                      border: "2px solid #eaeaea",
                    },
                  },
                }}
              >
                <MenuItem sx={{ fontSize: "0.9rem" }} value="open">Free Access</MenuItem>
                <MenuItem sx={{ fontSize: "0.9rem" }} value="needs-key-code">Requires Key or Code</MenuItem>
                <MenuItem sx={{ fontSize: "0.9rem" }} value="unavailable">Unavailable</MenuItem>
              </TextField>
            )}
          </Box>
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
            onChange={(_, value) => typeof value === "number" && setFormData((prev: any) => ({ ...prev, latte_price: value.toFixed(2) }))}
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
          onChange={(e) => setPopularItemsInput(e.target.value)}
        />
      </Section>

      <Section title="Alternative Milks">
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
          {ALT_MILK_OPTIONS.map((milk) => {
            const selected = formData.alt_milks?.includes(milk);
            return (
              <Chip
                key={milk}
                label={milk}
                clickable
                color={selected ? "primary" : "default"}
                onClick={() => {
                  setFormData((prev: any) => ({
                    ...prev,
                    alt_milks: selected
                      ? (prev.alt_milks ?? []).filter((m: string) => m !== milk)
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
            onClick={() => setFormData((prev: any) => ({ ...prev, alt_milks_cost: "free" }))}
          >
            Free
          </Button>
          <Button
            variant={formData.alt_milks_cost === "extra" ? "contained" : "outlined"}
            onClick={() => setFormData((prev: any) => ({ ...prev, alt_milks_cost: "extra" }))}
          >
            Extra Cost
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
    </>
  );
}
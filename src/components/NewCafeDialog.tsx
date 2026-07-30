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
  Slider,
  Typography,
  MenuItem,
  Chip,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState, ChangeEvent } from "react";
import { NewCoffeeShop, BathroomAccess, NewCafeDialogProps } from "../../types.ts";
import { getNeighborhoodForCafe } from "./mapComponents/mapFns.tsx";
import useAuthStore from "../stores/useAuthStore.ts";

// TODO: make alt milk charge a boolean instead (fe, be, db)

export const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
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
      />
    }
    label={
      <Typography variant="body2" fontWeight={500}>
        {label}
      </Typography>
    }
    sx={{
      bgcolor: "white",
      px: 1.5,
      py: 0.5,
      borderRadius: 2,
      border: "1px solid #eaeaea",
      m: 0,
    }}
  />
);

export const ALT_MILK_OPTIONS = [
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
    bathroom_access: "",

    specialty: false,
    coffee_rec: false,
    matcha_rec: false,

    roaster: "",
    in_house_roast: false,
    matcha: false,
    matcha_brand: "",

    indoor_seating: false,
    outdoor_seating: false,
    wifi: false,
    outlets: false,
    laptop_friendly: false,

    alt_milks: [] as string[],
    alt_milks_cost: "",
    latte_price: "",
    popular_items: [] as string[],
    notes: "",
  });
  
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [popularItemsInput, setPopularItemsInput] = useState(""); // it is an arr in the form and db but a str for input here
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const { session, role, openAuthModal } = useAuthStore();
  const loggedIn = !!session;
  const isPrivileged = role === "admin" || role === "moderator";

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
      setFormData(prev => ({
      ...prev,
      [name]: checked,
      ...(name === "bathroom" && !checked ? { bathroom_access: undefined } : {}),
    }));
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
    if (!loggedIn) {
      openAuthModal("Log in to submit your cafe suggestion.");
      return;
    }
    const { name, address, latitude, longitude } = formData;

    if (!name || !address || !latitude || !longitude) {
      alert("Please fill out all required fields and select a location.");
      return;
    }

    const popularItemsArray = popularItemsInput
      .split(",")
      .map(s => s.trim())
      .map(s => s.replace(/\s+/g, " "))
      .map(s => s.replace(/ /g, "_")); // storing individual items using  snake case for now (TODO: come up with a better idea for this)

    const newCafe: NewCoffeeShop = {
      id: `cafe${Date.now()}`,
      name: formData.name,
      address: formData.address || undefined,
      coordinates: [parseFloat(formData.longitude), parseFloat(formData.latitude)],
      neighborhood: getNeighborhoodForCafe([parseFloat(formData.longitude), parseFloat(formData.latitude)]) || formData.neighborhood || undefined,
      website: formData.website || undefined,
      opening_hours: formData.opening_hours || undefined,
      phone: formData.phone || undefined,
      instagram: formData.instagram || undefined,
      parking: formData.parking || undefined,
      closest_metro: formData.closest_metro || undefined,
      bathroom: formData.bathroom ?? undefined,
      bathroom_access: (formData.bathroom && formData.bathroom_access) ? formData.bathroom_access as BathroomAccess : undefined,
      specialty: formData.specialty,
      coffee_rec: formData.coffee_rec,
      matcha_rec: formData.matcha_rec,
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
      popular_items: popularItemsArray || undefined,
      notes: formData.notes || undefined,
    };

    try {
      if (!session || !session.access_token) {
        throw new Error("no access to add cafe");
      }

      const endpoint = isPrivileged ? "/api/cafes" : "/api/cafes/suggest";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(newCafe),
      });

      if (res.status === 429) {
        const data = await res.json();
        setSubmittedMessage(data.error);
        console.log(submittedMessage);
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to add cafe");
      }

      setSubmittedMessage(
        isPrivileged ? null : "Cafe suggestion submitted for review." // TODO: make this show somewhere
      );

      if (isPrivileged) {
        // const result = await res.json();
        console.log("Cafe addded");
      }

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
        bathroom_access: "",
        specialty: false,
        coffee_rec: false,
        matcha_rec: false,
        in_house_roast: false,
        indoor_seating: false,
        outdoor_seating: false,
        wifi: false,
        outlets: false,
        laptop_friendly: false,
        roaster: "",
        matcha: false,
        matcha_brand: "",
        alt_milks: [],
        alt_milks_cost: "",
        latte_price: "",
        popular_items: [],
        notes: "",
      });
      setPopularItemsInput("");
    } catch (error) {
      console.error(error);
      alert("There was a problem adding the cafe. Try again.");
    }
  };


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1, color: "#b23a48", fontWeight: "bold", fontSize: "2rem",}}>
        Suggest a New Cafe
      </DialogTitle>

      <IconButton
        onClick={(e) => {
          e.currentTarget.blur();
          onClose();
        }}
        sx={{ position: "absolute", top: 12, right: 12 }}
      >
        <CloseIcon />
      </IconButton>

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
              checked={formData.coffee_rec}
              onChange={handleCheckboxChange}
            />
            <AmenityCheckbox
              label="Matcha Recommended"
              name="matcha_rec"
              checked={formData.matcha_rec}
              onChange={handleCheckboxChange}
            />
          </Box>
        </Section>

        <Section title="Location*">
          <TextField
            label="Search Address or Place"
            fullWidth
            required
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          />

          <Button
            onClick={handleSearch}
            size="small"
            variant="outlined"
            sx={{
              mt: 1,
              textTransform: "none",
              borderColor: "#999",
              color: "#666",
            }}
          >
            {loading ? <CircularProgress size={18} /> : "Search"}
          </Button>

          {searchResults.length > 0 && (
            <List
              dense
              sx={{
                mt: 1,
                maxHeight: 150,
                overflowY: "auto",
                border: "1px solid #ddd",
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
            fullWidth
            disabled
            value={formData.address}
            sx={{ mt: 1 }}
          />
        </Section>

        <Section title="Details">
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
            <AmenityCheckbox
              label="Specialty Coffee"
              name="specialty"
              checked={formData.specialty}
              onChange={handleCheckboxChange}
            />
            <AmenityCheckbox
              label="In-house Roast"
              name="in_house_roast"
              checked={formData.in_house_roast}
              onChange={handleCheckboxChange}
            />

            <AmenityCheckbox
              label="Matcha Available"
              name="matcha"
              checked={formData.matcha}
              onChange={handleCheckboxChange}
            />
            <AmenityCheckbox
              label="Wi-Fi"
              name="wifi"
              checked={formData.wifi}
              onChange={handleCheckboxChange}
            />
            <AmenityCheckbox
              label="Outlets"
              name="outlets"
              checked={formData.outlets}
              onChange={handleCheckboxChange}
            />
            <AmenityCheckbox
              label="Laptop Friendly"
              name="laptop_friendly"
              checked={formData.laptop_friendly}
              onChange={handleCheckboxChange}
            />
            <AmenityCheckbox
              label="Indoor Seating"
              name="indoor_seating"
              checked={formData.indoor_seating}
              onChange={handleCheckboxChange}
            />
            <AmenityCheckbox
              label="Outdoor Seating"
              name="outdoor_seating"
              checked={formData.outdoor_seating}
              onChange={handleCheckboxChange}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AmenityCheckbox
                label="Bathroom"
                name="bathroom"
                checked={formData.bathroom}
                onChange={handleCheckboxChange}
              />

              {formData.bathroom && (
                <TextField
                  select
                  size="small"
                  label="Access"
                  name="bathroom_access"
                  value={formData.bathroom_access}
                  onChange={handleTextChange}
                  sx={{ minWidth: 160 }}
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="key-required">Requires Key</MenuItem>
                  <MenuItem value="password-required">Requires Password</MenuItem>
                  <MenuItem value="unavailable">Unavailable</MenuItem>
                </TextField>
              )}
            </Box>
          </Box>
        </Section>

        <Section title="Drinks & Menu">
          <Box sx={{ width: "75%", mx: "auto" }}>
            <Typography gutterBottom>
              Latte Price (${formData.latte_price || "—"})
            </Typography>
            <Slider
              min={3}
              max={10}
              step={0.25}
              value={Number(formData.latte_price) || 3}
              onChange={(_, value) =>
                typeof value === "number" &&
                setFormData(prev => ({
                  ...prev,
                  latte_price: value.toFixed(2),
                }))
              }
              sx={{ color: "#b23a48" }}
            />
          </Box>

          <TextField
            label="Roaster"
            name="roaster"
            fullWidth
            margin="dense"
            value={formData.roaster}
            onChange={handleTextChange}
          />

          <TextField
            label="Matcha Brand"
            name="matcha_brand"
            fullWidth
            margin="dense"
            value={formData.matcha_brand}
            onChange={handleTextChange}
          />

          <TextField
            label="Popular Items (comma-separated)"
            fullWidth
            margin="dense"
            value={popularItemsInput}
            onChange={(e) => setPopularItemsInput(e.target.value)}
            placeholder="latte, matcha, hojicha"
          />

        </Section>

        <Section title="Alternative Milks">
          <Typography variant="body2" sx={{ mb: 1, color: "#555" }}>
            Select all alternative milks that are available at this cafe:
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {ALT_MILK_OPTIONS.map((milk) => {
              const selected = formData.alt_milks.includes(milk);
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
                        ? prev.alt_milks.filter(m => m !== milk) // remove
                        : [...prev.alt_milks, milk],            // add
                    }));
                  }}
                  sx={{
                    textTransform: "capitalize",
                    border: selected ? "none" : "1px solid #ccc",
                  }}
                />
              );
            })}
          </Box>

          <Typography variant="body2" sx={{ mb: 1, color: "#555" }}>
            Are alternative milks free or extra cost?
          </Typography>
          
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button
              variant={formData.alt_milks_cost === "free" ? "contained" : "outlined"}
              onClick={() =>
                setFormData(prev => ({ ...prev, alt_milks_cost: "free" }))
              }
            >
              Free
            </Button>
            <Button
              variant={formData.alt_milks_cost === "extra" ? "contained" : "outlined"}
              onClick={() =>
                setFormData(prev => ({ ...prev, alt_milks_cost: "extra" }))
              }
            >
              Extra
            </Button>
          </Box>
        </Section>

        <Section title="Contact & Hours">
          <TextField
            label="Opening Hours"
            name="opening_hours"
            fullWidth
            margin="dense"
            value={formData.opening_hours}
            onChange={handleTextChange}
          />
          <TextField
            label="Phone"
            name="phone"
            fullWidth
            margin="dense"
            value={formData.phone}
            onChange={handleTextChange}
          />
          <TextField
            label="Instagram"
            name="instagram"
            fullWidth
            margin="dense"
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
        </Section>


        <Section title="Extra Info">
          <TextField
            label="Share something else about this cafe"
            name="notes"
            fullWidth
            multiline
            minRows={3}
            value={formData.notes}
            onChange={handleTextChange}
          />
        </Section>

      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button
          onClick={(e) => {
            e.currentTarget.blur();
            onClose();
          }}
          variant="outlined"
          sx={{
            textTransform: "none",
            borderColor: "#999",
            color: "#666",
          }}
        >
          Cancel
        </Button>

        {loggedIn ? (
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              backgroundColor: "#b23a48",
              "&:hover": { backgroundColor: "#942d39" },
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Submit
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={() => openAuthModal("Log in to submit your cafe suggestion.")}
            sx={{
              backgroundColor: "#b23a48",
              "&:hover": { backgroundColor: "#942d39" },
              textTransform: "none",
              fontWeight: "bold",
            }}
          >
            Log in to Submit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

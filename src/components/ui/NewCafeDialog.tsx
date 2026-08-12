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
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { NewCoffeeShop, BathroomAccess, NewCafeDialogProps } from "../../../types.ts";
import { getNeighborhoodForCafe } from "../mapComponents/mapFns.tsx";
import useAuthStore from "../../stores/useAuthStore.ts";
import CafeFormFields, { Section } from "../helperComponents/CafeFormFields.tsx";

// TODO: make alt milk charge a boolean instead (fe, be, db)

const initialFormState = {
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
  notes: "",
};

export default function NewCafeDialog({ open, onClose }: NewCafeDialogProps) {
  const [formData, setFormData] = useState(initialFormState);
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ display_name: string; lat: string; lon: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [popularItemsInput, setPopularItemsInput] = useState(""); // it is an arr in the form and db but a str for input here
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const { session, role, openAuthModal } = useAuthStore();
  const loggedIn = !!session;
  const isPrivileged = role === "admin" || role === "moderator";

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

    const popularItemsArray = popularItemsInput === "" ? null : popularItemsInput // TODO: double check this works with sending and receiving
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
      setFormData(initialFormState);
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
      maxWidth="sm"

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
        <CafeFormFields
          formData={formData}
          setFormData={setFormData}
          popularItemsInput={popularItemsInput}
          setPopularItemsInput={setPopularItemsInput}
          locationSlot={
            <Section title="Location*">
              <TextField
                label="Search Address or Place"
                fullWidth
                required
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
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
                value={formData.address || ""}
                sx={{ mt: 1 }}
              />
            </Section>
          }
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, }}>
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

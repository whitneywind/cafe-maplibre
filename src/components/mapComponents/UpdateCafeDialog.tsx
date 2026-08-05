import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { useState } from "react";
import { NewCoffeeShop, UpdateCafeDialogProps } from "../../../types.ts";
import { deleteCafe } from "./mapFns.tsx";
import useMapStore from "../../stores/useMapStore.ts";
import { normalizeCafe } from "../../utils/dataNormalization.ts";
import useAuthStore from "../../stores/useAuthStore.ts";
import CafeFormFields from "../helperComponents/CafeFormFields.tsx";

export default function UpdateCafeDialog({
  open,
  onClose,
  cafe,
}: UpdateCafeDialogProps) {
  const [formData, setFormData] = useState(() => normalizeCafe(cafe));

  const [popularItemsInput, setPopularItemsInput] = useState(() =>
    formData.popular_items?.map(i => i.replace(/_/g, " ")).join(", ") || ""
  );
  const map = useMapStore((state) => state.map);
  const updateSelectedCafe = useMapStore((state) => state.updateSelectedCafe);

  const { session } = useAuthStore();

  const handleSubmit = async () => {
    const popularItemsArray = popularItemsInput
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map(s => s.replace(/ /g, "_"));

    const updatedCafe = { ...formData, popular_items: popularItemsArray };
    const { session, role } = useAuthStore.getState();

    try {
      if (!session || !session.access_token) {
        throw new Error("no access to update");
      }

      const isAdmin = role === "admin" || role === "moderator";
      const url = isAdmin
        ? `/api/cafes/${formData.id}`
        : `/api/cafes/${formData.id}/edit-requests`;
      const method = isAdmin ? "PUT" : "POST";

      let body: Record<string, unknown>;

      if (isAdmin) {
        body = updatedCafe;
      } else {
        // only include fields that actually changed vs the original cafe
        const original = normalizeCafe(cafe) as Record<string, unknown>;
        const changes: Record<string, unknown> = {};

        for (const key of Object.keys(updatedCafe)) {
          const newVal = (updatedCafe as Record<string, unknown>)[key];
          const oldVal = original?.[key];

          const changed = Array.isArray(newVal)
            ? JSON.stringify(newVal) !== JSON.stringify(oldVal)
            : newVal !== oldVal;

          if (changed) {
            changes[key] = newVal;
          }
        }

        if (Object.keys(changes).length === 0) {
          alert("No changes to submit.");
          return;
        }

        body = { changes };
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || "Failed to update cafe");
      }

      if (isAdmin) {
        updateSelectedCafe(updatedCafe as unknown as NewCoffeeShop);
      } else {
        alert("edit was submitted for review"); // TODO: make snackbar or something
      }

      onClose();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "There was a problem updating the cafe");
    }
  };

  const handleDelete = async () => {
    if (!map) return alert("Map not initialized yet.");

    if (!formData.id) {
      return alert("Cannot delete cafe: missing ID");
    }
    
    if (window.confirm(`Are you sure you want to delete ${formData.name}?`)) {
        try {
            await deleteCafe(map, formData.id, session?.access_token);
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
        Suggest Edit
      </DialogTitle>

      <DialogContent>
        <CafeFormFields
          formData={formData}
          setFormData={setFormData}
          popularItemsInput={popularItemsInput}
          setPopularItemsInput={setPopularItemsInput}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button color="error" onClick={handleDelete}>Delete</Button>
        <Button onClick={onClose} variant="outlined" sx={{ textTransform: "none", borderColor: "#999", color: "#666" }}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} sx={{ backgroundColor: "#b23a48", "&:hover": { backgroundColor: "#942d39" }, textTransform: "none", fontWeight: "bold" }}>Update</Button>
      </DialogActions>
    </Dialog>
  );
}
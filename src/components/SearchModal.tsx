import React, { useEffect, useMemo, useState } from "react";
import {
  Modal, Box, Typography, TextField, IconButton, Divider,
  Autocomplete, Chip, Button, List, ListItem, ListItemButton, ListItemText
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useMapStore from "../store/useMapStore";
import { applySearchFilters, flyToCafe, showCafePopup } from "./mapComponents/mapFns";
import { SearchModalProps } from "../../types";

const FILTERS = [
  { key: "specialty", label: "Specialty Coffee" },
  { key: "indoor_seating", label: "Indoor Seating" },
  { key: "outdoor_seating", label: "Outdoor Seating" },
  { key: "wifi", label: "Wi-Fi" },
  { key: "outlets", label: "Outlets" },
  { key: "parking", label: "Parking" },
];

const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const map = useMapStore((state) => state.map);
  const cafes = useMapStore((state) => state.cafes);
  const neighborhoods = useMapStore((state) => state.neighborhoods);
  const setVisibleCafes = useMapStore((state) => state.setVisibleCafes);
  const searchFiltersActive = useMapStore((state) => state.searchFiltersActive);
  const setSearchFiltersActive = useMapStore((state) => state.setSearchFiltersActive);

  const [nameQuery, setNameQuery] = useState("");
  const [selectedNeighborhoodOption, setSelectedNeighborhoodOption] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  const neighborhoodOptions = useMemo(() => {
    if (!neighborhoods?.features) return [];
    const neighborhoodsWithCafes = new Set(cafes.map((c) => c.neighborhood).filter(Boolean));
    return neighborhoods.features
        .filter((f) => f.properties?.name && neighborhoodsWithCafes.has(f.properties.name))
        .sort((a, b) => (a.properties.name > b.properties.name ? 1 : -1));
    }, [neighborhoods, cafes]);

    const results = useMemo(() => {
        return cafes.filter((cafe) => {
        if (nameQuery && !cafe.name?.toLowerCase().includes(nameQuery.toLowerCase())) return false;
        if (selectedNeighborhoodOption && cafe.neighborhood !== selectedNeighborhoodOption.properties.name) return false;
        for (const key of activeFilters) {
            if (!cafe[key as keyof typeof cafe]) return false;
        }
        return true;
        });
    }, [cafes, nameQuery, selectedNeighborhoodOption, activeFilters]);

    const toggleFilter = (key: string) => {
    setActiveFilters((prev) =>
        prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
    };

    const handleCafeClick = (cafe: any) => {
        if (!map) return;
        flyToCafe(map, cafe, 14);
        showCafePopup(map, cafe);
        onClose();
    };

    const handleApplyToMap = () => {
        let filtered = cafes;

        if (nameQuery) {
            filtered = filtered.filter((c) => c.name?.toLowerCase().includes(nameQuery.toLowerCase()));
        }
        if (selectedNeighborhoodOption) {
            filtered = filtered.filter((c) => c.neighborhood === selectedNeighborhoodOption.properties.name);
        }
        for (const key of activeFilters) {
            filtered = filtered.filter((c) => c[key as keyof typeof c]);
        }

        setVisibleCafes(filtered);

        if (map) {
            applySearchFilters(map, { filteredIds: filtered.map((c) => c.id) });

            if (selectedNeighborhoodOption) {
                const coords = selectedNeighborhoodOption.geometry.coordinates.flat(Infinity) as number[];
                const lats = coords.filter((_: number, i: number) => i % 2 === 1);
                const lngs = coords.filter((_: number, i: number) => i % 2 === 0);
                const mapHeight = map.getContainer().clientHeight;
                const yOffset = mapHeight * 0.05;

                map.fitBounds(
                [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
                { padding: 100, maxZoom: 16, pitch: 20, offset: [0, -yOffset] }
                );

                map.setLayoutProperty("polygon-layer", "visibility", "visible");
                map.setFilter("polygon-layer", ["==", ["get", "name"], selectedNeighborhoodOption.properties.name]);

            } else if (filtered.length > 0) {
                const lngs = filtered.map((c) => c.coordinates[0]);
                const lats = filtered.map((c) => c.coordinates[1]);
                const mapHeight = map.getContainer().clientHeight;
                const yOffset = mapHeight * 0.05;

                map.fitBounds(
                [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
                { padding: 100, maxZoom: 14, offset: [0, -yOffset] }
                );
            }
        }
        setSearchFiltersActive(true);
        onClose();
    };

    const handleClear = () => {
        setNameQuery("");
        setSelectedNeighborhoodOption(null);
        setActiveFilters([]);
        setVisibleCafes(cafes);
        if (map) applySearchFilters(map, {});
        setSearchFiltersActive(false);
    };

    useEffect(() => {
    if (open && !searchFiltersActive) {
        setNameQuery("");
        setSelectedNeighborhoodOption(null);
        setActiveFilters([]);
    }
    }, [open, searchFiltersActive]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      slotProps={{ backdrop: { sx: { backgroundColor: "rgba(0,0,0,0.2)" } } }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 480 },
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 24,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          maxHeight: "85vh",
        }}
      >
        <IconButton onClick={onClose} size="small" sx={{ position: "absolute", top: 10, right: 10 }}>
          <CloseIcon fontSize="small" />
        </IconButton>

        <Typography fontWeight="bold" fontSize="1.2rem" color="#b23a48">
          Find a Cafe
        </Typography>

        <Divider />

        {/* name search */}
        <TextField
          label="Search by name"
          size="small"
          fullWidth
          value={nameQuery}
          onChange={(e) => setNameQuery(e.target.value)}
        />

        {/* neighborhood */}
        <Autocomplete
          options={neighborhoodOptions}
          getOptionLabel={(o) => o?.properties?.name || ""}
          value={selectedNeighborhoodOption}
          onChange={(_, val) => setSelectedNeighborhoodOption(val)}
          size="small"
          renderInput={(params) => <TextField {...params} label="Neighborhood" />}
          slotProps={{
            paper: { sx: { fontSize: "0.8rem" } },
            listbox: { sx: { fontSize: "0.8rem", padding: 0 } },
          }}
        />

        {/* filter chips */}
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: "block" }}>
            Filters
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {FILTERS.map(({ key, label }) => {
              const active = activeFilters.includes(key);
              return (
                <Chip
                  key={key}
                  label={label}
                  clickable
                  onClick={() => toggleFilter(key)}
                  sx={{
                    fontWeight: 600,
                    bgcolor: active ? "#b23a48" : "transparent",
                    color: active ? "white" : "#555",
                    border: `1px solid ${active ? "#b23a48" : "#ccc"}`,
                    "&:hover": { bgcolor: active ? "#942d39" : "#f5f5f5" },
                  }}
                />
              );
            })}
          </Box>
        </Box>

        <Divider />

        {/* results */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            {results.length} cafe{results.length !== 1 ? "s" : ""} found
          </Typography>
          <Button
            size="small"
            onClick={handleClear}
            sx={{ textTransform: "none", color: "#888", fontSize: "0.75rem" }}
          >
            Clear all
          </Button>
        </Box>

        <List
          dense
          sx={{
            overflowY: "auto",
            overscrollBehavior: "contain",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
            maxHeight: 220,
            border: "1px solid #eee",
            borderRadius: 2,
          }}
        >
          {results.length === 0 ? (
            <ListItem>
              <ListItemText primary="No cafes match your search." primaryTypographyProps={{ fontSize: "0.85rem", color: "text.secondary" }} />
            </ListItem>
          ) : (
            results.map((cafe) => (
              <ListItem key={cafe.id} disablePadding>
                <ListItemButton onClick={() => handleCafeClick(cafe)}>
                  <ListItemText
                    primary={cafe.name}
                    secondary={cafe.neighborhood && cafe.neighborhood !== "unknown" ? cafe.neighborhood : undefined}
                    primaryTypographyProps={{ fontWeight: 600, fontSize: "0.9rem" }}
                    secondaryTypographyProps={{ fontSize: "0.75rem" }}
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>

        <Button
          variant="contained"
          onClick={handleApplyToMap}
          sx={{
            backgroundColor: "#b23a48",
            "&:hover": { backgroundColor: "#942d39" },
            textTransform: "none",
            fontWeight: "bold",
            borderRadius: 2,
          }}
        >
          Apply to Map
        </Button>
      </Box>
    </Modal>
  );
};

export default SearchModal;
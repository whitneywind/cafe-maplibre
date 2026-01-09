import {
  Modal,
  Box,
  IconButton,
  Typography,
  Button,
  Divider,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import CloseIcon from "@mui/icons-material/Close";
import LocalCafeIcon from "@mui/icons-material/LocalCafe";
import SpaIcon from "@mui/icons-material/Spa";
import WifiIcon from "@mui/icons-material/Wifi";
import OutletIcon from "@mui/icons-material/Power";
import LaptopMacIcon from "@mui/icons-material/LaptopMac";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import MapIcon from '@mui/icons-material/Map';
import useMapStore from "../store/useMapStore";
import { showUpdateCafeDialog } from "./mapHelpers/mapFns";
import WcIcon from "@mui/icons-material/Wc";
import ChairIcon from "@mui/icons-material/Chair";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import StarIcon from "@mui/icons-material/Star";
import { normalizeStringArray } from "../utils/dataNormalization";

const InfoItem = ({ icon, label, value }: { icon: any, label: string, value?: string }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, bgcolor: "white", px: 1.5, py: 0.5, borderRadius: 2, border: "1px solid #eaeaea" }}>
        {icon}
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {label}{value ? `: ${value}` : ""}
        </Typography>
    </Box>
);

const InfoLine = ({ 
    icon, 
    label, 
    value, 
    secondaryAction 
}: { 
    icon: any, 
    label: string, 
    value: string, 
    secondaryAction?: React.ReactNode 
}) => (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
        {icon}
        <Box>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", lineHeight: 1 }}>
                {label}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {value}
            </Typography>
            {secondaryAction} {/* Renders the "Suggest" link if provided */}
        </Box>
    </Box>
);


const CafeDetailsModal: React.FC = () => {
  const { cafeDetailsOpen, selectedCafe, closeCafeDetails } = useMapStore();
  if (!selectedCafe) return null;

  const {
    name,
    neighborhood,
    specialty,
    roaster,
    // in_house_roast,
    matcha,
    matcha_brand,
    alt_milks,
    alt_milks_cost,
    latte_price,
    popular_items,
    bathroom,
    bathroom_access,
    indoor_seating,
    outdoor_seating,
    wifi,
    outlets,
    laptop_friendly,
    parking,
    closest_metro,
    opening_hours,
    website,
    instagram,
    coffee_rec,
    matcha_rec,
    notes,
    coordinates,
  } = selectedCafe;

    //   normalize str arrs
    const normalizedAltMilks = normalizeStringArray(alt_milks, true); 
    // Results in: ["Oat Milk", "Almond Milk"] instead of ["oat_milk", "almond_milk"]
      console.log(normalizedAltMilks)


    const normalizedPopularItems = normalizeStringArray(popular_items, true);

    const handleUpdateClick = () => {
        const dialogContainer = document.createElement("div");
        document.body.appendChild(dialogContainer);
        showUpdateCafeDialog(dialogContainer, selectedCafe);
    };

    const [lng, lat] = coordinates || [0, 0];
    const googleMapsURL = name
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`
        : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    const addActionStyle = {
        cursor: "pointer",
        fontWeight: 400,
        display: "block",
        mt: 0.2,
        textDecoration: "underline",
        "&:hover": {
            opacity: 0.8
        }
    };

  return (
    <Modal
      open={cafeDetailsOpen}
      onClose={closeCafeDetails}
      aria-labelledby="cafe-details-modal"
      closeAfterTransition
    >
      <Box
        sx={{
          position: "absolute" as const,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "75%", md: "60%" },
          maxHeight: "90vh",
          bgcolor: "background.paper",
          borderRadius: 3,
          boxShadow: 24,
          p: 4,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* close button */}
        <IconButton
          onClick={closeCafeDetails}
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          <CloseIcon />
        </IconButton>

        {/* save button */}
        {/* <Button
          variant="contained"
          color="secondary"
          sx={{ position: "absolute", top: 12, left: 12, backgroundColor: "#b23a48", p: "5px 8px", minWidth: 0 }}
        >
            <FavoriteBorderIcon />
        </Button> */}



        {/* cafe name & recs */}
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" sx={{ color: "#b23a48" }}>
            {name || "Unnamed Cafe"}
          </Typography>
          <Box sx={{ mt: 1, display: "flex", justifyContent: "center", gap: 2 }}>
            {coffee_rec && (
              <Chip
                icon={<LocalCafeIcon />}
                label="Coffee Recommended"
                color="error"
                variant="outlined"
                sx={{ fontWeight: "bold" }}
              />
            )}
            {matcha_rec && matcha && (
              <Chip
                icon={<SpaIcon />}
                label="Matcha Recommended"
                color="info"
                variant="outlined"
                sx={{ fontWeight: "bold" }}
              />
            )}
            {specialty && (
              <Chip
                icon={<LocalCafeIcon />}
                label="Specialty Coffee"
                color="default"
                variant="outlined"
                sx={{ fontWeight: "bold" }}
              />
            )}
          </Box>
        </Box>

        {/* save/favorite button */}
        <Box sx={{ 
            display: "flex", 
            justifyContent: "center", 
            position: { xs: "relative", sm: "absolute" }, 
            top: { sm: 12 }, 
            left: { sm: 12 },
            mt: { xs: 2, sm: 0 } 
        }}>
            <Button
                variant="contained"
                startIcon={<FavoriteBorderIcon />}
                sx={{ 
                backgroundColor: "#b23a48", 
                borderRadius: { xs: 2, sm: 0.6 },
                minWidth: { xs: "200px", sm: 0 },
                p: { xs: "10px 24px", sm: "8px" },
                "&:hover": { backgroundColor: "#942d39" },
                // Hide text on desktop, show on mobile
                "& .MuiButton-startIcon": { 
                    margin: { xs: "0 8px 0 -4px", sm: 0 } 
                }
                }}
            >
                {/* hidden on screens larger than sm */}
                <Box component="span" sx={{ display: { xs: "inline", sm: "none" }, fontWeight: "bold" }}>
                Save
                </Box>
            </Button>
        </Box>

        <Divider />

        {/* main info section in grid */}
        <Grid container spacing={2} sx={{ alignItems: "stretch"}}>

            {/* amenities */}
            <Grid size={{ xs: 12, sm: 8 }} sx={{ order: { xs: 2, sm: 1 }, display: "flex", flexDirection: "column" }}>
                <Box sx={{ p: 2.5, bgcolor: "#f7f7f7", borderRadius: 3, flexGrow: 1, border: "1px solid #eee" }}>
                    <Typography fontWeight="800" variant="subtitle1" gutterBottom sx={{ color: "#444", mb: 2 }}>
                        Amenities
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                        {bathroom && <InfoItem icon={<WcIcon fontSize="small" />} label="Bathroom" value={bathroom_access ? `Yes (${bathroom_access})` : "Yes"} />}
                        {indoor_seating && <InfoItem icon={<ChairIcon fontSize="small" />} label="Indoor Seating" />}
                        {outdoor_seating && <InfoItem icon={<ChairIcon fontSize="small" />} label="Outdoor Seating" />}
                        {wifi && <InfoItem icon={<WifiIcon fontSize="small" />} label="Wi-Fi" />}
                        {outlets && <InfoItem icon={<OutletIcon fontSize="small" />} label="Outlets Available" />}
                        {laptop_friendly && <InfoItem icon={<LaptopMacIcon fontSize="small" />} label="Laptop Friendly" />}
                        {parking && <InfoItem icon={<LocalParkingIcon fontSize="small" />} label="Parking" value={parking} />}
                    </Box>
                </Box>
            </Grid>

            {/* right column: Location + Contact stacked */}
            <Grid size={{ xs: 12, sm: 4 }} container direction="column" spacing={2} sx={{ order: { xs: 3, sm: 2 } }}>

                {/* location */}
                <Grid size={{ xs: 12}}>
                    <Box sx={{ p: 2, bgcolor: "#f7f7f7", borderRadius: 2 }}>
                    <Typography fontWeight="bold">Location</Typography>
                    {neighborhood && <Typography>{neighborhood}</Typography>}
                    {closest_metro && <Typography>Closest Metro: {closest_metro}</Typography>}
                    {lat && lng && (
                        <Button
                                variant="outlined"
                                size="small"
                                fullWidth
                                startIcon={<MapIcon />}
                                href={googleMapsURL}
                                target="_blank"
                                sx={{
                                    mt: 2, // Added more top margin to separate from the text above
                                    textTransform: "none",
                                    borderColor: "#999", // Matching the "Suggest Edit" border
                                    color: "#666",      // Matching the "Suggest Edit" text
                                    "&:hover": {
                                        backgroundColor: "#eee",
                                        borderColor: "#999",
                                    },
                                }}
                            >
                                Google Maps
                            </Button>
                    )}
                    </Box>
                </Grid>

                {/* contact & notes */}
                <Grid size={{ xs: 12 }}>
                    <Box
                        sx={{
                            p: 2,
                            bgcolor: "#f3f0f0",
                            borderRadius: 2,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                        }}
                    >
                        {/* {phone && <Typography>Phone: {phone}</Typography>} */}
                        {notes && <Typography>Notes: {notes}</Typography>}
                        {instagram && <Typography>Instagram: {instagram}</Typography>}
                        {opening_hours && <Typography>Opening Hours: {opening_hours}</Typography>}


                        {website && (
                        <Button
                            variant="outlined"
                            size="small"
                            href={website}
                            target="_blank"
                            sx={{
                                textTransform: "none",
                            }}
                        >
                            Website
                        </Button>
                        )}

                        <Button
                            variant="outlined"
                            // startIcon={<EditIcon />}
                            onClick={handleUpdateClick}
                            size="small"
                            sx={{
                            textTransform: "none",
                            borderColor: "#999",
                            color: "#666",
                            "&:hover": {
                                backgroundColor: "#eee",
                                borderColor: "#999",
                            },
                            }}
                        >
                            Suggest Edit
                        </Button>
                    </Box>
                </Grid>

            </Grid>

            {/* drinks & specials */}
            <Grid size={{ xs: 12 }} sx={{ order: { xs: 1, sm: 3 } }}>
                <Box sx={{ p: 2.5, bgcolor: "#fdf8f4", borderRadius: 3, border: "1px solid #f3e5d8" }}>
                    <Typography fontWeight="800" variant="subtitle1" gutterBottom sx={{ color: "#8d5d46", mb: 2 }}>
                        Drinks & Specials
                    </Typography>
                    <Grid container spacing={3}>
                        {/* Left Column: Coffee & Matcha */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <InfoLine 
                                    icon={<LocalCafeIcon sx={{ color: "#8d5d46" }} />} 
                                    label="Coffee" 
                                    value={`${roaster || "Espresso-based"}`} 
                                />
                                <InfoLine 
                                    icon={<AttachMoneyIcon sx={{ color: "#2e7d32" }} />} 
                                    label="Latte Price" 
                                    value={latte_price || ""} 
                                    secondaryAction={!latte_price && (
                                        <Typography variant="caption" onClick={handleUpdateClick} sx={{ ...addActionStyle, color: "#2e7d32" }}
                                        >
                                            + Add price
                                        </Typography>
                                    )}
                                />
                                <InfoLine 
                                    icon={<SpaIcon sx={{ color: "#6b8e23" }} />} 
                                    label="Matcha Brand" 
                                    value={matcha_brand || "Various"} 
                                />
                            </Box>
                        </Grid>

                    {/* Right Column: Milks & Popular Items */}
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {specialty && (
                                 <InfoLine 
                                    icon={<LocalCafeIcon sx={{ color: "#b23a48" }} />} 
                                    label="Specialty Coffee Status" 
                                    value={" Specialty Coffee"} 
                            />
                            )}
                            
                            {/* Alt Milks - Always Visible */}
                            <InfoLine 
                                icon={<FavoriteBorderIcon sx={{ color: "#b23a48" }} />} 
                                label="Alt Milks" 
                                value={normalizedAltMilks.length > 0 
                                    ? `${normalizedAltMilks.join(", ")}${alt_milks_cost ? ` (${alt_milks_cost})` : ""}` 
                                    : ""
                                } 
                                // Optional: Add a small suggest action if empty
                                secondaryAction={normalizedAltMilks.length === 0 && (
                                    <Typography 
                                        variant="caption" 
                                        onClick={handleUpdateClick}
                                        sx={{ ...addActionStyle, color: "#b23a48" }}
                                    >
                                        + Add options
                                    </Typography>
                                )}
                            />

                            {/* Popular Items - Always Visible */}
                            <InfoLine 
                                icon={<StarIcon sx={{ color: "#ed6c02" }} />} 
                                label="Popular Items" 
                                value={normalizedPopularItems.length > 0 
                                    ? normalizedPopularItems.join(", ") 
                                    : ""
                                } 
                                secondaryAction={normalizedPopularItems.length === 0 && (
                                    <Typography 
                                        variant="caption" 
                                        onClick={handleUpdateClick}
                                        sx={{ ...addActionStyle, color: "#ed6c02" }}
                                    >
                                        + Suggest Item
                                    </Typography>
                                )}
                            />
                        </Box>
                    </Grid>
                    </Grid>
                </Box>
            </Grid>

        </Grid>
      </Box>
    </Modal>
  );
};

export default CafeDetailsModal;

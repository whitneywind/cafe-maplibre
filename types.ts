import { Map, Popup } from "maplibre-gl";

export interface NewCoffeeShop {
  id: string;
  name: string;
  address?: string;
  coordinates: [number, number]; // GeoJSON-style (lng, lat)
  neighborhood?: string;

  specialty: boolean;
  coffee_rec?: boolean,
  matcha_rec?: boolean,

  roaster?: string;
  in_house_roast?: boolean;
  matcha?: boolean;
  matcha_brand?: string;
  alt_milks?: string[];
  alt_milks_cost?: string;
  latte_price?: string;
  popular_items?: string[];

  bathroom?: boolean;
  bathroom_access?: BathroomAccess;
  indoor_seating?: boolean;
  outdoor_seating?: boolean;
  wifi?: boolean;
  outlets?: boolean;
  laptop_friendly?: boolean;

  parking?: string;
  closest_metro?: string;
  opening_hours?: string;
  website?: string;
  phone?: string;
  instagram?: string;

  notes?: string;
  source_tags?: Record<string, string>;
  status?: "approved" | "pending" | "rejected";

  created_at?: string;
}

export type BathroomAccess = "open" | "key-required" | "password-required" | "unavailable";

export type Coordinates = [number, number];

// neighborhood polygons
export interface Neighborhood {
  type: "Feature";
  id?: number | string;
  name?: string;
  typeFeature?: "Feature";
  geometry: {
    type: "MultiPolygon";
    coordinates: number[][][][]; 
    // Structure: [ [ [ [lng, lat], ... ] ] ] for multi-polygons
  };
  properties: {
    id: number;
    name: string;
  }
}

export interface NeighborhoodCollection {
  type: "FeatureCollection";
  features: Neighborhood[];
}

export interface User {
  id: string;              // UUID to match Supabase auth.users.id
  email: string;
  createdAt: string;       // ISO timestamp

  name?: string | null;
  homeNeighborhood?: string | null;
  bio?: string | null;
  role: 'user' | 'moderator' | 'admin';
}

export interface UserFavorite {
  userId: string;   // UUID that references User.id
  cafeId: string;   // matches Cafe.id (text)
  createdAt: string; // ISO timestamp
}

export interface CafeFormData {
  name: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  neighborhood?: string;
  website?: string;
  opening_hours?: string;
  phone?: string;
  instagram?: string;
  parking?: string;
  closest_metro?: string;
  bathroom?: boolean;
  bathroom_access?: string;
  specialty?: boolean;
  coffee_rec?: boolean;
  matcha_rec?: boolean;
  roaster?: string;
  in_house_roast?: boolean;
  matcha?: boolean;
  matcha_brand?: string;
  indoor_seating?: boolean;
  outdoor_seating?: boolean;
  wifi?: boolean;
  outlets?: boolean;
  laptop_friendly?: boolean;
  alt_milks?: string[];
  alt_milks_cost?: string;
  latte_price?: string;
  notes?: string;
}

export interface CafeFormFieldsProps {
  formData: CafeFormData;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  popularItemsInput: string;
  setPopularItemsInput: (val: string) => void;
  locationSlot?: React.ReactNode;
}

export type UpdateCafeDialogProps = {
  open: boolean;
  onClose: () => void;
  cafe: NewCoffeeShop;
};

export type NewCafeDialogProps = {
  open: boolean;
  onClose: () => void;
};

export interface FavoritesModalProps {
  open: boolean;
  onClose: () => void;
}

export interface CafePopupProps {
  cafe: NewCoffeeShop;
  coordinates: any;
}

export interface CafeScrollerProps {
  visibleCafes: NewCoffeeShop[];
  map: Map | null;
  popupRef: React.RefObject<Popup>;
};

export interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}
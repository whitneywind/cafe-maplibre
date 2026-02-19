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


export type BathroomAccess = "open" | "needs-key-code" | "unavailable";

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
}

export interface NeighborhoodCollection {
  type: "FeatureCollection";
  features: Neighborhood[];
}

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: string; // or Date if parse timestamps

  name?: string;
  homeNeighborhood?: string;
  bio?: string;
  lastLogin?: string; // or Date
  isAdmin: boolean;
}

export interface UserFavorite {
  userId: number;
  cafeId: string;
  createdAt: string;
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
export type VibeTag =
  | "quiet"
  | "natural-light"
  | "hipster"
  | "cozy"
  | "minimalist"
  | "plants"
  | "study-friendly"
  | "aesthetic"
  | "matcha-specialty"


export interface CoffeeShop {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number]; // [lng, lat]
  neighborhood?: string;

  roaster: string[];
  in_house_roast: boolean;

  vibe_tags?: VibeTag[];
  special_items?: string[];

  outdoor_seating: boolean;
  wifi?: boolean;
  outlets?: boolean;
  laptop_friendly?: boolean;

  parking?: string;
  closest_metro?: string;
  opening_hours?: string;
  website?: string;
  phone?: string;
  instagram?: string;

  specialty: boolean;
  notes?: string;
  source_tags?: Record<string, string>; // JSONB

  status?: "approved" | "pending" | "rejected";
}

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
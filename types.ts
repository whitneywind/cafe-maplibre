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
  inHouseRoast: boolean;

  vibeTags: VibeTag[];
  specialItems: string[];

  // Boolean filters
  outdoorSeating: boolean;
  wifi?: boolean;
  outlets?: boolean;
  laptopFriendly?: boolean;

  // Metadata / UX enhancements
  parking?: string; // e.g., "street", "lot behind shop", "limited"
  closestMetro?: string; 
  openingHours?: string;
  website?: string;
  phone?: string;
  instagram?: string;

  // Manual enrichment
  specialty: boolean; 
  notes?: string;
  sourceTags?: Record<string, string>;
}

export type Coordinates = [number, number];

// neighborhood polygons
export interface MultiPolygonFeature {
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

export interface MultiPolygonFeatureCollection {
  type: "FeatureCollection";
  features: MultiPolygonFeature[];
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
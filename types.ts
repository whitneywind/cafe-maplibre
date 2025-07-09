export type VibeTag =
  | "quiet"
  | "natural-light"
  | "hipster"
  | "cozy"
  | "minimalist"
  | "plants"
  | "study-friendly"
  | "aesthetic"


export interface CoffeeShop {
  id: string; // OSM ID or internal ID
  name: string;
  address: string;
  coordinates: [number, number]; // [lng, lat]

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
  openingHours?: string; // OSM-style format
  website?: string;
  phone?: string;
  instagram?: string;

  // Manual enrichment
  specialty: boolean; // manually flagged
  notes?: string;
  sourceTags?: Record<string, string>; // raw OSM props (optional for debugging)
}
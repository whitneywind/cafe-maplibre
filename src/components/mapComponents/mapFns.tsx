import useMapStore from "../../store/useMapStore";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import maplibregl from "maplibre-gl";
import { Map, LngLatLike, Popup } from "maplibre-gl";
import { createRoot } from "react-dom/client";
import { NewCoffeeShop, Coordinates } from "../../../types";
import { Feature, MultiPolygon, Point } from "geojson";
import CafePopup from "./CafePopup";
import UpdateCafeDialog from "./UpdateCafeDialog";

// todo: use this in showselectedneighborhood and in searchmodal
export function fitMapToBounds(
  map: Map,
  lngs: number[],
  lats: number[],
  options?: { maxZoom?: number; pitch?: number }
) {
  const mapHeight = map.getContainer().clientHeight;
  const yOffset = mapHeight * 0.05;

  map.fitBounds(
    [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
    {
      padding: 100,
      maxZoom: options?.maxZoom ?? 14,
      pitch: options?.pitch ?? 0,
      offset: [0, -yOffset],
    }
  );
}

// fn to determine the neighborhood for a given cafe
export const getNeighborhoodForCafe = (cafeCoordinates: Coordinates) => {
  const neighborhoods = useMapStore.getState().neighborhoods; // get neighborhoods from Zustand
  if (!neighborhoods) return null;

    // convert cafe coordinates to a Turf.js point
    const cafePoint: Feature<Point> = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: cafeCoordinates,
        },
    };

    for (const feature of neighborhoods.features) {
        const turfFeature = feature as Feature<MultiPolygon, { [key: string]: any }>;

        if (booleanPointInPolygon(cafePoint, turfFeature)) {
          return turfFeature.properties?.name ?? null;
        }
    }
    return null;
};

export function showSelectedNeighborhood(map: Map, neighborhoodFeature: any) {
  if (!map) return;

  if (!neighborhoodFeature) {
    // clear filter and hide polygons
    map.setFilter("polygon-layer", null);
    map.setLayoutProperty("polygon-layer", "visibility", "none");

    // clear cafe filters to show all cafes
    map.setFilter("regular-cafes", ["!=", ["get", "specialty"], true]);
    map.setFilter("specialty-cafes", ["==", ["get", "specialty"], true]);

    console.log("Cleared neighborhood filter");
    return;
  }

  const neighborhoodName = neighborhoodFeature.properties.name;

  // flatten and compute bounds
  const coordinates = neighborhoodFeature.geometry.coordinates.flat(Infinity) as number[];
  const lats = coordinates.filter((_, i) => i % 2 === 1);
  const lngs = coordinates.filter((_, i) => i % 2 === 0);
  const mapHeight = map.getContainer().clientHeight;
  const yOffset = mapHeight * 0.05;

  const bounds = [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ] as [[number, number], [number, number]];
  map.fitBounds(bounds, {
    padding: 100,
    maxZoom: 16,
    pitch: 0,
    offset: [0, -yOffset] // to account for cafe scroller on bottom
  });

  map.setLayoutProperty("polygon-layer", "visibility", "visible");

  // only show selected neighborhood
  map.setFilter("polygon-layer", ["==", ["get", "name"], neighborhoodFeature.properties.name]);

  // only show cafes in selected neighborhood
  map.setFilter("regular-cafes", [
    "all",
    ["==", ["get", "neighborhood"], neighborhoodName],
    ["!=", ["get", "specialty"], true]
  ]);

  // specialty cafes in this neighborhood
  map.setFilter("specialty-cafes", [
    "all",
    ["==", ["get", "neighborhood"], neighborhoodName],
    ["==", ["get", "specialty"], true]
  ]);
};

// center and zoom to the cafe
export function flyToCafe(map: Map, cafe: NewCoffeeShop, zoom = 14, popupRef?: Popup) {
  if (!map) return;

  const coordinates: LngLatLike = cafe.coordinates;

  // fly to the cafe
  map.flyTo({
    center: cafe.coordinates,
    zoom,
    pitch: 0,
    speed: 0.7,
    curve: 1.8,
    essential: true,
  });

  // create popup content
  const popupNode = document.createElement("div");
  let popupHTML = "<b>Cafe Details:</b><br>";
  for (const key in cafe) {
    if (["name", "cuisine", "address", "website"].includes(key)) {
      popupHTML += `${key}: ${cafe[key as keyof NewCoffeeShop]}<br>`;
    }
  }

  const googleMapsURL = cafe.name
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.name)}`
    : `https://www.google.com/maps/search/?api=1&query=${coordinates[1]},${coordinates[0]}`;

  popupHTML += `<a href="${googleMapsURL}" target="_blank" rel="noopener noreferrer" 
    style="display:inline-block;margin-top:8px;padding:4px 8px;background:#4285F4;color:white;
    border-radius:4px;text-decoration:none;font-size:0.85em;">View on Google Maps</a>`;

  popupNode.innerHTML = popupHTML;

  popupRef?.setLngLat(coordinates).setDOMContent(popupNode).addTo(map);
};

// recenter popup if needed
export function focusCafeIfNeeded(
  map: maplibregl.Map | null,
  cafe: NewCoffeeShop,
  targetZoom = 14
) {
  if (!map) return;

  const currentCenter = map.getCenter();
  const currentZoom = map.getZoom();
  const [lng, lat] = cafe.coordinates;

  const alreadyCentered =
    Math.abs(currentCenter.lng - lng) < 0.00001 &&
    Math.abs(currentCenter.lat - lat) < 0.00001 &&
    Math.abs(currentZoom - targetZoom) < 0.01;

  if (alreadyCentered) return;

  flyToCafe(map, cafe, targetZoom);
};

export async function deleteCafe(
  map: maplibregl.Map,
  id: string | number,
) {
  try {
    // delete from DB
    const res = await fetch(`http://localhost:3000/api/cafes/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(`Failed to delete cafe: ${res.statusText}`);
    }

    // update the source in the map
    const source = map.getSource("cafes") as any;
    if (!source || !source._data) return;

    const newData = {
      ...source._data,
      features: source._data.features.filter(
        (f: any) => f.properties.id !== id
      ),
    };

    source.setData(newData);
    
    useMapStore.getState().currentCafePopup?.remove();


    console.log(`Cafe ${id} removed from map + DB`);
  } catch (error) {
    console.error("Error deleting cafe:", error);
    alert("Failed to delete cafe.");
  }
};

// fn to show popup associated with cafe
export function showCafePopup(map: maplibregl.Map, cafe: any) {
  const popup = useMapStore.getState().currentCafePopup;
  if (!map || !cafe || !popup) return;

  const coordinates = cafe.coordinates.slice();
  const popupNode = document.createElement("div");
  const root = createRoot(popupNode);

  root.render(
    <CafePopup
      cafe={cafe}
      coordinates={coordinates}
    />
  );

  const zoom = map.getZoom();

  const minZoom = 10;
  const maxZoom = 14;
  const minOffset = 20;
  const maxOffset = 35;
  const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
  const yOffset = minOffset + ((clampedZoom - minZoom) / (maxZoom - minZoom)) * (maxOffset - minOffset);
  const offset: maplibregl.PointLike = [0, -yOffset];

  popup
    .setLngLat(coordinates)
    .setDOMContent(popupNode)
    .setOffset(offset)
    .addTo(map);
};

export function showUpdateCafeDialog(
  rootElement: HTMLElement,
  cafe: NewCoffeeShop,
) {
  if (!cafe) return;

  const root = createRoot(rootElement);

  root.render(
    <UpdateCafeDialog
      open={true}
      cafe={cafe}
      onClose={() => root.unmount()}
    />
  );
};

// fetches cafes from the backend (gets GeoJSON from /api/cafes (live from db)) and updates "cafes" GeoJSON source on map
export const fetchCafes = async (map: maplibregl.Map | null) => {
  if (!map) return;

  try {
    const response = await fetch("http://localhost:3000/api/cafes");
    if (!response.ok) {
      throw new Error(`Failed to fetch cafes: ${response.statusText}`);
    }
    const cafesGeoJSON = await response.json();
    const source = map.getSource("cafes") as maplibregl.GeoJSONSource;

    if (source) {
      source.setData(cafesGeoJSON);
    }

    // store in zustand
    useMapStore.getState().setCafes(cafesGeoJSON.features.map((f: any) => ({
      ...f.properties,
      coordinates: f.geometry.coordinates,
    })));

  } catch (error) {
    console.error("Error fetching cafes:", error);
  }
};

export const fetchNeighborhoods = async (map: maplibregl.Map | null) => {
  if (!map) return;

  const setNeighborhoods = useMapStore.getState().setNeighborhoods;

  try {
    const response = await fetch("http://localhost:3000/api/neighborhoods");
      if (!response.ok) {
      throw new Error(`Failed to fetch neighborhoods: ${response.statusText}`);
    }

    const neighborhoodsGeoJSON = await response.json();

    // set in zustand
    setNeighborhoods(neighborhoodsGeoJSON);

    // add to map
    const source = map.getSource("neighborhoods") as maplibregl.GeoJSONSource;

    if (source) {
      source.setData(neighborhoodsGeoJSON);
    }

  } catch (error) {
    console.error("Error fetching neighborhoods:", error);
  }
};

export function applySearchFilters(map: Map, filters: {
  name?: string;
  neighborhood?: any;
  activeFilters?: string[];
  filteredIds?: string[];  // ✅ add this
}) {
  if (!map) return;

  const { neighborhood, activeFilters = [], filteredIds } = filters;
  const hasFilters = filteredIds !== undefined;

  if (!hasFilters) {
    // reset
    map.setFilter("regular-cafes", ["!=", ["get", "specialty"], true]);
    map.setFilter("specialty-cafes", ["==", ["get", "specialty"], true]);
    map.setLayoutProperty("polygon-layer", "visibility", "none");
    return;
  }

  // filter by exact IDs from the search results
  const regularFilter = ["all",
    ["in", ["get", "id"], ["literal", filteredIds]],
    ["!=", ["get", "specialty"], true]
  ];
  const specialtyFilter = ["all",
    ["in", ["get", "id"], ["literal", filteredIds]],
    ["==", ["get", "specialty"], true]
  ];

  map.setFilter("regular-cafes", regularFilter as any);
  map.setFilter("specialty-cafes", specialtyFilter as any);
};
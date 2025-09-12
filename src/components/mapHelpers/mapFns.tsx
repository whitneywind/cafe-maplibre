import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import maplibregl from "maplibre-gl";
import neighborhoodPolygonsJson from "../../assets/neighborhoods/nbrs.json";
import { Map, LngLatLike, Popup } from "maplibre-gl";
import { createRoot } from "react-dom/client";
import { CoffeeShop, Coordinates, NeighborhoodCollection } from "../../../types";
import { Feature, MultiPolygon, Point } from "geojson";
import CafePopup from "./CafePopup";

const neighborhoodPolygons: NeighborhoodCollection = neighborhoodPolygonsJson as NeighborhoodCollection;


// fn to determine the neighborhood for a given cafe
export const getNeighborhoodForCafe = (cafeCoordinates: Coordinates) => {
    // convert cafe coordinates to a Turf.js point
    const cafePoint: Feature<Point> = {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: cafeCoordinates,
        },
    };

    for (const feature of neighborhoodPolygons.features) {
        const turfFeature = feature as Feature<MultiPolygon, { [key: string]: any }>;

        if (booleanPointInPolygon(cafePoint, turfFeature)) {
          return feature.name ?? null;
        }
    }
    return null;
};

export function showSelectedNeighborhood(map: Map, neighborhoodFeature: any) {
  if (!map) return;

  if (!neighborhoodFeature) {
    // clear filter and hide polygons
    map.setFilter("polygon-layer", null);
    map.setFilter("polygon-border", null);
    map.setLayoutProperty("polygon-layer", "visibility", "none");
    map.setLayoutProperty("polygon-border", "visibility", "none");
    console.log("Cleared neighborhood filter");
    return;
  }

  // flatten and compute bounds
  const coordinates = neighborhoodFeature.geometry.coordinates.flat(Infinity) as number[];
  const lats = coordinates.filter((_, i) => i % 2 === 1);
  const lngs = coordinates.filter((_, i) => i % 2 === 0);
  const bounds = [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ] as [[number, number], [number, number]];
  map.fitBounds(bounds, { padding: 60, maxZoom: 16 });

  map.setLayoutProperty("polygon-layer", "visibility", "visible");
  map.setLayoutProperty("polygon-border", "visibility", "visible");

  // only show the selected neighborhood
  map.setFilter("polygon-layer", ["==", ["id"], neighborhoodFeature.id]);
  map.setFilter("polygon-border", ["==", ["id"], neighborhoodFeature.id]);
}

// fn to center and zoom to the cafe
export function flyToCafe(map: Map, cafe: CoffeeShop, zoom = 14, popupRef?: Popup) {
  if (!map) return;

  const coordinates: LngLatLike = cafe.coordinates;

  // fly to the cafe
  map.flyTo({
    center: cafe.coordinates,
    zoom,
    speed: 0.6,
    curve: 1.8,
    essential: true,
  });

  // create popup content
  const popupNode = document.createElement("div");
  let popupHTML = "<b>Cafe Details:</b><br>";
  for (const key in cafe) {
    if (["name", "cuisine", "address", "website"].includes(key)) {
      popupHTML += `${key}: ${cafe[key as keyof CoffeeShop]}<br>`;
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
}

// fn to show popup associated with cafe
export function showCafePopup(map: maplibregl.Map, popupRef: React.RefObject<Popup>, cafe: any) {
  if (!map || !cafe) return;

  const coordinates = cafe.coordinates.slice();
  const properties = cafe;

  const popupNode = document.createElement("div");
  const root = createRoot(popupNode);
  root.render(
    <CafePopup
      name={properties.name}
      cuisine={properties.cuisine}
      address={properties.address}
      website={properties.website}
      coordinates={coordinates}
      specialty={properties.specialty}
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

  popupRef.current
    .setLngLat(coordinates)
    .setDOMContent(popupNode)
    .setOffset(offset)
    .addTo(map);
}

// fetch cafes from the backend and update the "cafes" GeoJSON source on the map
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
  } catch (error) {
    console.error("Error fetching cafes:", error);
  }
};

import { useEffect, useRef, useState } from "react";
import maplibregl, { NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import neighborhoodPolygons from "../assets/nbrhd22.json";
import coffeeshopPoints from "../assets/coffeeshops.json";
import coffeeIcon from "../assets/coffee2.svg";

export default function MapComponent() {
  const [markersLoaded, setMarkersLoaded] = useState(false);
  const mapContainer = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const style = {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "&copy; OpenStreetMap Contributors",
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: "osm",
          type: "raster",
          source: "osm",
        },
      ],
    };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json", // 'https://api.maptiler.com/maps/bright/style.json?key=insert_your_key_here',
      // style: style,
      center: [-118, 34],
      zoom: 8,
    });

    map.on("load", async () => {
      const icon = new Image();
      const svgString = await fetch(coffeeIcon) // Fetch your SVG
        .then((res) => res.text()) // Convert to text (SVG content)
        .then((svgContent) => svgContent); // Now you have the SVG string

      const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
      const svgURL = URL.createObjectURL(svgBlob);

      icon.onload = () => {
        map.addImage("cafe-icon", icon); // Add the image to the map
        URL.revokeObjectURL(svgURL); // Clean up URL object
      };

      icon.src = svgURL;

      map.addSource("point", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              geometry: {
                type: "Point",
                coordinates: [0, 0],
              },
            },
          ],
        },
      });

      map.addSource("polygons", {
        type: "geojson",
        data: neighborhoodPolygons,
      });

      map.addLayer({
        id: "polygon-layer",
        type: "fill",
        source: "polygons",
        paint: {
          "fill-color": "#dc559f",
          "fill-opacity": 0.2,
          "fill-outline-color": "#4622a7",
        },
      });

      map.addLayer({
        id: "polygon-border",
        type: "line",
        source: "polygons",
        paint: {
          "line-color": "#be4efb",
          "line-width": 1,
        },
      });

      map.addSource("cafes", {
        type: "geojson",
        data: coffeeshopPoints,
      });

      map.addLayer({
        id: "cafes",
        type: "symbol",
        source: "cafes",
        layout: {
          "icon-image": "cafe-icon",
          "icon-size": 0.14,
          "icon-allow-overlap": true,
        },
      });

      // map.addLayer({
      //   id: "cafes",
      //   type: "circle",
      //   source: "cafes",
      //   paint: {
      //     "circle-radius": 3,
      //     "circle-color": "#8800ff",
      //     "circle-stroke-width": 0.5,
      //     "circle-stroke-color": "#fff",
      //   },
      // });
    });

    let nav = new NavigationControl();
    map.addControl(nav, "top-right");

    return () => map.remove();
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100vw", height: "100vh" }}
      // interactive={true}
      // interactiveLayerIds={interactiveLayerIds}
      // onLoad={onLoad}
    />
  );
}

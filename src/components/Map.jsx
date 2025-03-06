import { useEffect, useRef } from "react";
import maplibregl, { NavigationControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import neighborhoodPolygons from "../assets/neighborhood_boundaries.json";

export default function MapComponent() {
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
      // style: "https://demotiles.maplibre.org/style.json", // 'https://api.maptiler.com/maps/bright/style.json?key=insert_your_key_here',
      style: style,
      center: [-118, 34],
      zoom: 8,
    });

    map.on("load", () => {
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
          "fill-outline-color": "#000000",
        },
      });
    });

    let nav = new NavigationControl();
    map.addControl(nav, "top-right");

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: "100vw", height: "100vh" }} />;
}

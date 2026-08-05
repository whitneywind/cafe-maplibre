import type { StyleSpecification } from "maplibre-gl";
import type { Map as MLMap } from "maplibre-gl";
import coffeeSVG from "../../assets/icons/coffee2.svg";
import specialtySVG from "../../assets/icons/specialty.svg";
import { fetchCafes, fetchNeighborhoods } from "./mapFns.js";

export async function loadCafeLayers(map: MLMap) {
  // icons
  const loadIcon = async (id: string, svgUrl: string) => {
    if (map.hasImage(id)) return; // avoid re-adding if it somehow persists
    const svgString = await fetch(svgUrl).then((res) => res.text());
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => {
        map.addImage(id, img);
        URL.revokeObjectURL(url);
        resolve();
      };
      img.src = url;
    });
  };

  await loadIcon("cafe-icon", coffeeSVG);
  await loadIcon("specialty-cafe-icon", specialtySVG);

  // cafes source + layers
  if (!map.getSource("cafes")) {
    map.addSource("cafes", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  }
  await fetchCafes(map);

  if (!map.getLayer("regular-cafes")) {
    map.addLayer({
      id: "regular-cafes",
      type: "symbol",
      source: "cafes",
      filter: ["!=", ["get", "specialty"], true],
      layout: {
        "icon-image": "cafe-icon",
        "icon-size": ["interpolate", ["linear"], ["zoom"], 0, 0.1, 12, 0.14, 16, 0.45],
        "icon-allow-overlap": true,
      },
    });
  }

  if (!map.getLayer("specialty-cafes")) {
    map.addLayer({
      id: "specialty-cafes",
      type: "symbol",
      source: "cafes",
      filter: ["==", ["get", "specialty"], true],
      layout: {
        "icon-image": "specialty-cafe-icon",
        "icon-size": ["interpolate", ["linear"], ["zoom"], 0, 0.2, 12, 0.34, 16, 1.1],
        "icon-allow-overlap": true,
      },
    });
  }

  // neighborhoods
  if (!map.getSource("neighborhoods")) {
    map.addSource("neighborhoods", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  }
  await fetchNeighborhoods(map);

  if (!map.getLayer("polygon-layer")) {
    map.addLayer({
      id: "polygon-layer",
      type: "fill",
      source: "neighborhoods",
      paint: { "fill-color": "#c97d5a", "fill-opacity": 0.135 },
    });
    map.setLayoutProperty("polygon-layer", "visibility", "none");
  }
}

// basemaps:
export type BasemapId = "voyager" | "positron" | "darkMatter";

const attribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

export const basemaps: Record<BasemapId, { label: string; swatch: string; style: StyleSpecification }> = {
  voyager: {
    label: "Voyager",
    swatch: "#e8dcc8",
    style: {
      version: 8,
      sources: {
        basemap: {
          type: "raster",
          tiles: [
            "https://cartodb-basemaps-a.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png",
            "https://cartodb-basemaps-b.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png",
            "https://cartodb-basemaps-c.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png",
            "https://cartodb-basemaps-d.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution,
          maxzoom: 18,
        },
      },
      layers: [{ id: "basemap", type: "raster", source: "basemap" }],
    },
  },

  positron: {
    label: "Light",
    swatch: "#f5f5f0",
    style: {
      version: 8,
      sources: {
        basemap: {
          type: "raster",
          tiles: [
            "https://cartodb-basemaps-a.global.ssl.fastly.net/rastertiles/light_all/{z}/{x}/{y}.png",
            "https://cartodb-basemaps-b.global.ssl.fastly.net/rastertiles/light_all/{z}/{x}/{y}.png",
            "https://cartodb-basemaps-c.global.ssl.fastly.net/rastertiles/light_all/{z}/{x}/{y}.png",
            "https://cartodb-basemaps-d.global.ssl.fastly.net/rastertiles/light_all/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution,
          maxzoom: 18,
        },
      },
      layers: [{ id: "basemap", type: "raster", source: "basemap" }],
    },
  },

  darkMatter: {
    label: "Dark",
    swatch: "#2b2b2b",
    style: {
      version: 8,
      sources: {
        basemap: {
          type: "raster",
          tiles: [
            "https://cartodb-basemaps-a.global.ssl.fastly.net/rastertiles/dark_all/{z}/{x}/{y}.png",
            "https://cartodb-basemaps-b.global.ssl.fastly.net/rastertiles/dark_all/{z}/{x}/{y}.png",
            "https://cartodb-basemaps-c.global.ssl.fastly.net/rastertiles/dark_all/{z}/{x}/{y}.png",
            "https://cartodb-basemaps-d.global.ssl.fastly.net/rastertiles/dark_all/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution,
          maxzoom: 18,
        },
      },
      layers: [
        { 
          id: "basemap", 
          type: "raster", 
          source: "basemap",
          paint: {
            "raster-brightness-min": 0.45, // Lightens the darkest blacks
            "raster-contrast": 0.4         // Slightly boosts contrast for features
          }
        }
      ],
    },
  },

  // osm: {
  //   label: "OSM Standard",
  //   style: {
  //     version: 8,
  //     sources: {
  //       basemap: {
  //         type: "raster",
  //         tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
  //         tileSize: 256,
  //         attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  //         maxzoom: 19,
  //       },
  //     },
  //     layers: [{ id: "basemap", type: "raster", source: "basemap" }],
  //   },
  // },

  // satellite: {
  //   label: "Satellite",
  //   style: {
  //     version: 8,
  //     sources: {
  //       basemap: {
  //         type: "raster",
  //         tiles: [
  //           "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  //         ],
  //         tileSize: 256,
  //         attribution: "Tiles &copy; Esri",
  //         maxzoom: 19,
  //       },
  //     },
  //     layers: [{ id: "basemap", type: "raster", source: "basemap" }],
  //   },
  // },
};
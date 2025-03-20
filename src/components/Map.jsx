import { useEffect, useRef } from "react";
// import maplibregl, { NavigationControl } from "maplibre-gl";
import { Map, Source, Layer, NavigationControl } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import neighborhoodPolygons from "../assets/nbrhd22.json";
import coffeeshopPoints from "../assets/coffeeshops.json";
// import cafeIcon from "../assets/cafe.png";

export default function MapComponent() {
  const mapRef = useRef(null);

  useEffect(() => {
    console.log("mapref: ", mapRef);
    if (!mapRef.current) return;

    const map = mapRef.current.getMap();
    console.log("hi");

    map.on("load", async () => {
      try {
        console.log("hi");

        const response = await fetch(cafeIconUrl);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        console.log("hi");

        // Check if the image is already added
        if (!map.hasImage("cafe-icon")) {
          map.addImage("cafe-icon", imageBitmap);
        }
      } catch (error) {
        console.error("error loading it", error);
      }
    });

    return () => map.off("load");
  }, [mapRef]);

  const mapStyle = {
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
    layers: [{ id: "osm", type: "raster", source: "osm" }],
  };

  const polygonLayer = {
    id: "polygon-layer",
    type: "fill",
    source: "polygons",
    paint: {
      "fill-color": "#dc559f",
      "fill-opacity": 0.2,
      "fill-outline-color": "#4622a7",
    },
  };

  const polygonBorderLayer = {
    id: "polygon-border",
    type: "line",
    source: "polygons",
    paint: {
      "line-color": "#be4efb",
      "line-width": 2,
    },
  };

  const coffeeShopLayer = {
    id: "cafes",
    type: "symbol",
    source: "cafes",
    layout: {
      "icon-image": "cafe-icon", // Use the loaded image as an icon
      "icon-size": 0.1, // Adjust the size of the icon
      "icon-allow-overlap": true, // Allow icons to overlap
    },
  };

  return (
    <Map
      ref={mapRef}
      initialViewState={{
        longitude: -118,
        latitude: 34,
        zoom: 8,
      }}
      mapStyle={mapStyle}
      style={{ width: "100vw", height: "100vh" }}
    >
      {/* Neighborhood polygons */}
      <Source id="polygons" type="geojson" data={neighborhoodPolygons}>
        <Layer {...polygonLayer} />
        <Layer {...polygonBorderLayer} />
      </Source>

      {/* Coffee shop points */}
      <Source id="cafes" type="geojson" data={coffeeshopPoints}>
        <Layer {...coffeeShopLayer} />
      </Source>

      {/* Navigation Controls */}
      <NavigationControl position="top-right" />
    </Map>
  );
}

// export default function MapComponent() {
//   const mapContainer = useRef(null);

//   useEffect(() => {
//     if (!mapContainer.current) return;

//     const style = {
//       version: 8,
//       sources: {
//         osm: {
//           type: "raster",
//           tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
//           tileSize: 256,
//           attribution: "&copy; OpenStreetMap Contributors",
//           maxzoom: 19,
//         },
//       },
//       layers: [
//         {
//           id: "osm",
//           type: "raster",
//           source: "osm",
//         },
//       ],
//     };

//     const map = new maplibregl.Map({
//       container: mapContainer.current,
//       // style: "https://demotiles.maplibre.org/style.json", // 'https://api.maptiler.com/maps/bright/style.json?key=insert_your_key_here',
//       style: style,
//       center: [-118, 34],
//       zoom: 8,
//     });

//     map.on("load", async () => {
//       // map.loadImage("../assets/cafe.png", (error, image) => {
//       //   if (error) throw error;
//       //   console.log(image);
//       //   map.addImage("coffeeshopImg", image);
//       // });

//       map.addSource("polygons", {
//         type: "geojson",
//         data: neighborhoodPolygons,
//       });

//       map.addLayer({
//         id: "polygon-layer",
//         type: "fill",
//         source: "polygons",
//         paint: {
//           "fill-color": "#dc559f",
//           "fill-opacity": 0.2,
//           "fill-outline-color": "#4622a7",
//         },
//       });

//       map.addLayer({
//         id: "polygon-border",
//         type: "line",
//         source: "polygons",
//         paint: {
//           "line-color": "#be4efb", // Blue border
//           "line-width": 4, // Adjust thickness
//         },
//       });

//       map.addSource("cafes", {
//         type: "geojson",
//         data: coffeeshopPoints,
//       });

//       // map.addLayer({
//       //   id: "cafes",
//       //   type: "circle",
//       //   source: "cafes",
//       //   paint: {
//       //     "circle-radius": 6,
//       //     "circle-color": "#ff6600",
//       //     "circle-stroke-width": 1,
//       //     "circle-stroke-color": "#fff",
//       //   },
//       // });
//     });

//     let nav = new NavigationControl();
//     map.addControl(nav, "top-right");

//     return () => map.remove();
//   }, []);

//   return (
//     // <Map ref={mapContainer} style={{ width: "100vw", height: "100vh" }} />
//     <Map
//       initialViewState={{
//         longitude: -100,
//         latitude: 40,
//         zoom: 3.5,
//       }}
//       style={style}
//       mapStyle="https://demotiles.maplibre.org/style.json"
//     />
//   );
// }

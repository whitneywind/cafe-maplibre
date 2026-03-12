import { useEffect, useRef, useState } from "react";
import maplibregl, { NavigationControl, GeolocateControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import CafeScroller from "./mapComponents/CafeScroller.tsx"
import coffeeSVG from "../assets/icons/coffee2.svg";
import specialtySVG from "../assets/icons/specialty.svg";
import useMapStore from "../store/useMapStore";
import { fetchCafes, fetchNeighborhoods, flyToCafe, showCafePopup, showSelectedNeighborhood } from "./mapComponents/mapFns.js";


export default function MapComponent() {
  const setMap = useMapStore((state) => state.setMap);
  const map = useMapStore((state) => state.map);
  const selectedNeighborhood = useMapStore((state) => state.selectedNeighborhood);
  const setSelectedNeighborhood = useMapStore((state) => state.setSelectedNeighborhood);
  const [visibleCafes, setVisibleCafes] = useState([]);
  const mapContainer = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
      const style = {
        version: 8,
        sources: {
          cartoVoyager: {
            type: "raster",
            tiles: [
              "https://cartodb-basemaps-a.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://cartodb-basemaps-b.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://cartodb-basemaps-c.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png",
              "https://cartodb-basemaps-d.global.ssl.fastly.net/rastertiles/voyager/{z}/{x}/{y}.png"
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
            maxzoom: 19
          }
        },
        layers: [
          {
            id: "cartoVoyager",
            type: "raster",
            source: "cartoVoyager"
          }
        ]
      };
      
      const newMap = new maplibregl.Map({
        container: mapContainer.current,
        style: style,
        center: [-118.3226, 34.0750],
        zoom: 12,
        minZoom: 5,
      });

      newMap.on("load", async () => {
        // load regular coffee icon
        const regularIcon = new Image();
        const regularSvgString = await fetch(coffeeSVG)
          .then((res) => res.text())
          .then((svgContent) => svgContent); // this is the SVG string
        const regularSvgBlob = new Blob([regularSvgString], { type: "image/svg+xml" });
        const regularSvgURL = URL.createObjectURL(regularSvgBlob);

        regularIcon.onload = () => {
          newMap.addImage("cafe-icon", regularIcon);
          URL.revokeObjectURL(regularSvgURL);
        };
        regularIcon.src = regularSvgURL;

        // load specialty coffee icon
        const specialtyIcon = new Image();
        const specialtySvgString = await fetch(specialtySVG)
          .then((res) => res.text())
          .then((svgContentS) => svgContentS); // this is the SVG string
        const specialtySvgBlob = new Blob([specialtySvgString], { type: "image/svg+xml" });
        const specialtySvgURL = URL.createObjectURL(specialtySvgBlob);

        specialtyIcon.onload = () => {
          newMap.addImage("specialty-cafe-icon", specialtyIcon); // add image to map
          URL.revokeObjectURL(specialtySvgURL); // clean up URL object
        };
        specialtyIcon.src = specialtySvgURL;

        newMap.addSource("cafes", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        await fetchCafes(newMap);

        // layer for regular cafes
        newMap.addLayer({
          id: "regular-cafes",
          type: "symbol",
          source: "cafes",
          filter: ["!=", ["get", "specialty"], true],
          layout: {
            "icon-image": "cafe-icon",
            "icon-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0, 0.1,
              12, 0.14,
              16, 0.45
            ],
            "icon-allow-overlap": true,
          },
        });

        // layer for specialty cafes
        newMap.addLayer({
          id: "specialty-cafes",
          type: "symbol",
          source: "cafes",
          filter: ["==", ["get", "specialty"], true],
          layout: {
            "icon-image": "specialty-cafe-icon",
            "icon-size": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0, 0.2,
              12, 0.34,
              16, 1.1
            ],
            "icon-allow-overlap": true,
          },
        });

        // neighborhood polygons
        newMap.addSource("neighborhoods", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        await fetchNeighborhoods(newMap);

        newMap.addLayer({
          id: "polygon-layer",
          type: "fill",
          source: "neighborhoods",
          paint: {
            "fill-color": "#c97d5a",
            "fill-opacity": 0.135,
            // "fill-outline-color": "#020202ff",
          },
        });

        newMap.setLayoutProperty("polygon-layer", "visibility", "none");

        setMap(newMap);

        // update cafes visible in bottom scroller when map moves
        const updateVisibleCafes = () => {
          const bounds = newMap.getBounds();
          const features = newMap.querySourceFeatures("cafes");

          const visible = features.filter((f) => {
            const [lng, lat] = f.geometry.coordinates;
            return bounds.contains([lng, lat]);
          });

          const processedCafes = Array.from(
            new Map(
              visible.map((f) => {
                const coordinates = f.geometry.coordinates;
                // const neighborhood = getNeighborhoodForCafe(coordinates); // calculates neighborhood
                const neighborhood = f.properties.neighborhood; // get neighborhood from cafe property

                return [
                  f.properties.id || f.properties.name,
                  {
                    ...f.properties,
                    coordinates: coordinates,
                    neighborhood: neighborhood,
                  },
                ];
              })
            ).values()
          );

          // Filter by selected neighborhood if one is chosen
        const filteredCafes = selectedNeighborhood
          ? processedCafes.filter((cafe) => cafe.neighborhood === selectedNeighborhood.name)
          : processedCafes;

          // setVisibleCafes(processedCafes);
          setVisibleCafes(filteredCafes);
        };

        setTimeout(updateVisibleCafes, 100); // initial load
        newMap.on("moveend", updateVisibleCafes); // update on map move

        // popup on click for cafes layer
        newMap.on("click", ["specialty-cafes", "regular-cafes"], (e) => {
          if (!e.features.length) return;

          const feature = e.features[0];
          const coordinates = e.features[0].geometry.coordinates.slice();

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          const cafe = {
            ...feature.properties,
            coordinates: feature.geometry.coordinates,
          };

          showCafePopup(newMap, cafe);
          flyToCafe(newMap, cafe, 14);
        });

        // change cursor to a pointer when entering a feature
        newMap.on("mouseenter", ["specialty-cafes", "regular-cafes"], () => {
          newMap.getCanvas().style.cursor = "pointer";
        });

        // change back to a grabber when leaving
        newMap.on("mouseleave", ["specialty-cafes", "regular-cafes"], () => {
          newMap.getCanvas().style.cursor = "";
        });

        newMap.on("click", (e) => {
          const features = newMap.queryRenderedFeatures(e.point, {
            layers: ["specialty-cafes", "regular-cafes"],
          });
          if (features.length === 0) {
            useMapStore.getState().currentCafePopup?.remove(); // ??
          }
        });
      });

      let nav = new NavigationControl();
      newMap.addControl(nav, "top-right");

      const geolocate = new GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: false, // we only want a one-time fly
        showAccuracyCircle: false,
        showUserLocation: true,
      });

      newMap.addControl(geolocate, "top-left");

      geolocate.on("geolocate", (e) => {
        const { longitude, latitude } = e.coords;
        newMap.flyTo({
          center: [longitude, latitude],
          zoom: 15,
          speed: 1.2,
        });
      });

      return () => newMap.remove();
    };

    initializeMap();
  }, []);

  useEffect(() => {
    if (map) {
      showSelectedNeighborhood(map, selectedNeighborhood);
    }
  }, [selectedNeighborhood]);

  return (
    <>
      <div
        ref={mapContainer}
        style={{ width: "100vw", height: "100vh" }}
        interactive="true"
        // interactiveLayerIds={interactiveLayerIds}
        // onLoad={onLoad}
      />

      {selectedNeighborhood && (
        <button
          onClick={() => setSelectedNeighborhood(null)}
          style={{
          position: "absolute",
          bottom: "150px",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "8px 16px",
          backgroundColor: "#b23a48",
          color: "#fff",
          border: "none",
          borderRadius: "20px",
          cursor: "pointer",
          fontSize: "0.9em",
          zIndex: 1000,
          boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          }}
        >
          Clear Neighborhood
        </button>
      )}
      
      <CafeScroller map={map} visibleCafes={visibleCafes} />
    </>
  );
}




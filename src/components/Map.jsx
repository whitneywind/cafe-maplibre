import { useEffect, useRef, useState } from "react";
import maplibregl, { NavigationControl, Popup, GeolocateControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import CafeScroller from "./mapHelpers/CafeScroller.tsx"
import neighborhoodPolygons from "../assets/neighborhoods/nbrs.json";
// import coffeeshopPoints from "../assets/json/ccafes.json";
import coffeeSVG from "../assets/icons/coffee2.svg";
import specialtySVG from "../assets/icons/specialty.svg";
import useMapStore from "../store/useMapStore";
import { flyToCafe, getNeighborhoodForCafe, showCafePopup } from "./mapHelpers/mapFns.jsx";


export default function MapComponent() {
  const setMap = useMapStore((state) => state.setMap);
  const map = useMapStore((state) => state.map);
  const [visibleCafes, setVisibleCafes] = useState([]);
  const [neighborhoodLayerVisible, setNeighborhoodLayerVisible] = useState(false);
  const mapContainer = useRef(null);
  const popupRef = useRef(
    new Popup({ closeButton: false, closeOnClick: false })
  );

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
      });

      newMap.on("load", async () => {
        // load regular coffee icon
        const regularIcon = new Image();
        const regularSvgString = await fetch(coffeeSVG) // fetch SVG
          .then((res) => res.text()) // convert to text (SVG content)
          .then((svgContent) => svgContent); // this is the SVG string
        const regularSvgBlob = new Blob([regularSvgString], { type: "image/svg+xml" });
        const regularSvgURL = URL.createObjectURL(regularSvgBlob);

        regularIcon.onload = () => {
          newMap.addImage("cafe-icon", regularIcon); // add image to map
          URL.revokeObjectURL(regularSvgURL); // clean up URL object
        };
        regularIcon.src = regularSvgURL;

        // load specialty coffee icon
        const specialtyIcon = new Image();
        const specialtySvgString = await fetch(specialtySVG) // fetch SVG
          .then((res) => res.text()) // convert to text (SVG content)
          .then((svgContentS) => svgContentS); // this is the SVG string
        const specialtySvgBlob = new Blob([specialtySvgString], { type: "image/svg+xml" });
        const specialtySvgURL = URL.createObjectURL(specialtySvgBlob);

        specialtyIcon.onload = () => {
          newMap.addImage("specialty-cafe-icon", specialtyIcon); // add image to map
          URL.revokeObjectURL(specialtySvgURL); // clean up URL object
        };
        specialtyIcon.src = specialtySvgURL;

        // testing pulling from db
        // const response = await fetch("/api/cafes.geojson");
        const response = await fetch("http://localhost:3000/api/cafes.geojson");
        const coffeeshopPoints = await response.json();

        newMap.addSource("cafes", {
          type: "geojson",
          data: coffeeshopPoints,
        });

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

        newMap.addSource("polygons", {
          type: "geojson",
          data: neighborhoodPolygons,
        });

        newMap.addLayer({
          id: "polygon-layer",
          type: "fill",
          source: "polygons",
          paint: {
            "fill-color": "#3fa977",
            "fill-opacity": 0.2,
            "fill-outline-color": "#3fa977",
          },
        });

        newMap.addLayer({
          id: "polygon-border",
          type: "line",
          source: "polygons",
          paint: {
            "line-color": "#3fa977",
            "line-width": 1,
          },
        });

        newMap.setLayoutProperty("polygon-layer", "visibility", "none");
        newMap.setLayoutProperty("polygon-border", "visibility", "none");

        setMap(newMap);

        // update visible cafes when map moves
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
                const neighborhood = getNeighborhoodForCafe(coordinates);

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
          setVisibleCafes(processedCafes);
        };

        setTimeout(updateVisibleCafes, 100); // initial load
        newMap.on("moveend", updateVisibleCafes); // update on map move


        // popup on click for cafes layer
        newMap.on("click", ["specialty-cafes", "regular-cafes"], (e) => {
          if (!e.features.length) return;

          const feature = e.features[0];
          const coordinates = e.features[0].geometry.coordinates.slice();
          const properties = e.features[0].properties;

          while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
          }

          const cafe = {
            ...feature.properties,
            coordinates: feature.geometry.coordinates,
          };

          showCafePopup(newMap, popupRef, cafe);
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
            popupRef.current.remove();
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

  const toggleNeighborhoodLayer = () => {
    if (map) {
      const visibility = neighborhoodLayerVisible ? "none" : "visible";
      map.setLayoutProperty("polygon-layer", "visibility", visibility);
      map.setLayoutProperty("polygon-border", "visibility", visibility);
      setNeighborhoodLayerVisible(!neighborhoodLayerVisible);
    }
  };

  return (
    <>
      <div
        ref={mapContainer}
        style={{ width: "100vw", height: "100vh" }}
        interactive="true"
        // interactiveLayerIds={interactiveLayerIds}
        // onLoad={onLoad}
      />
      <button
        onClick={toggleNeighborhoodLayer}
        style={{
          position: "absolute",
          bottom: "160px",
          right: "20px",
          padding: "6px 8px",
          backgroundColor: "rgb(255, 255, 255)",
          color: "#111",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "0.9em",
          zIndex: 1000,
        }}
      >
        {neighborhoodLayerVisible ? "Hide Neighborhoods" : "Show Neighborhoods"}
      </button>
      <CafeScroller map={map} visibleCafes={visibleCafes} popupRef={popupRef} />
    </>
  );
}




import { useEffect, useRef, useState } from "react";
import maplibregl, { NavigationControl, Popup, GeolocateControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Box, Card, CardContent, Typography, Link } from "@mui/material";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import neighborhoodPolygons from "../assets/neighborhoods/nbrs.json";
import coffeeshopPoints from "../assets/json/ccafes.json";
import coffeeIcon from "../assets/coffee2.svg";
import useMapStore from "../store/useMapStore";



export default function MapComponent() {
  // const [map, setMap] = useState(null);
  const setMap = useMapStore((state) => state.setMap);
  const map = useMapStore((state) => state.map);

  const [visibleCafes, setVisibleCafes] = useState([]);
  // const [markersLoaded, setMarkersLoaded] = useState(false);
  const [neighborhoodLayerVisible, setNeighborhoodLayerVisible] =
    useState(false);
  const mapContainer = useRef(null);
  const popupRef = useRef(
    new Popup({ closeButton: false, closeOnClick: false })
  );

  // fn to determine the neighborhood for a given cafe
  const getNeighborhoodForCafe = (cafeCoordinates) => {
    // convert cafe coordinates to a Turf.js point
    const cafePoint = {
      type: "Feature",
      properties: {},
      geometry: {
        type: "Point",
        coordinates: cafeCoordinates,
      },
    };

    // Iterate through each neighborhood polygon
    for (const feature of neighborhoodPolygons.features) {
      if (booleanPointInPolygon(cafePoint, feature)) {
        // Assuming your neighborhood GeoJSON features have a 'name' property
        return feature.name;
      }
    }
    return null; // Return null if no neighborhood is found
  };


  useEffect(() => {
    if (!mapContainer.current) return;

    const initializeMap = async () => {
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

      const newMap = new maplibregl.Map({
        container: mapContainer.current,
        // style: "https://demotiles.maplibre.org/style.json", // 'https://api.maptiler.com/maps/bright/style.json?key=insert_your_key_here',
        style: style,
        center: [-118.3226, 34.0750],
        zoom: 12,
      });

      newMap.on("load", async () => {
        const icon = new Image();
        const svgString = await fetch(coffeeIcon) // fetch SVG
          .then((res) => res.text()) // convert to text (SVG content)
          .then((svgContent) => svgContent); // this is the SVG string

        const svgBlob = new Blob([svgString], { type: "image/svg+xml" });
        const svgURL = URL.createObjectURL(svgBlob);

        icon.onload = () => {
          newMap.addImage("cafe-icon", icon); // add image to map
          URL.revokeObjectURL(svgURL); // clean up URL object
        };

        icon.src = svgURL;

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

        newMap.addSource("cafes", {
          type: "geojson",
          data: coffeeshopPoints,
        });

        newMap.addLayer({
          id: "cafes",
          type: "symbol",
          source: "cafes",
          layout: {
            "icon-image": "cafe-icon",
            "icon-size": 0.14,
            "icon-allow-overlap": true,
          },
        });

        setMap(newMap);

        // update visible cafes when map moves
        const updateVisibleCafes = () => {
          const bounds = newMap.getBounds();
          const features = newMap.querySourceFeatures("cafes");

          const visible = features.filter((f) => {
            const [lng, lat] = f.geometry.coordinates;
            return bounds.contains([lng, lat]);
          });

          // const unique = Array.from(
          //   new Map(
          //     visible.map((f) => [
          //       f.properties.id || f.properties.name,
          //       {
          //         ...f.properties,
          //         coordinates: f.geometry.coordinates,
          //       },
          //     ])
          //   ).values()
          // );
          // setVisibleCafes(unique);
                 // Process visible cafes to add neighborhood information
          const processedCafes = Array.from(
            new Map(
              visible.map((f) => {
                const coordinates = f.geometry.coordinates;
                const neighborhood = getNeighborhoodForCafe(coordinates); // Get neighborhood here

                return [
                  f.properties.id || f.properties.name,
                  {
                    ...f.properties,
                    coordinates: coordinates,
                    neighborhood: neighborhood, // Add neighborhood to cafe properties
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
        newMap.on("click", "cafes", (e) => {
          if (e.features.length > 0) {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const properties = e.features[0].properties;

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            const popupNode = document.createElement("div");
            let popupHTML = "<b>Cafe Details:</b><br>";
            for (const key in properties) {
              if (
                key === "name" ||
                key === "cuisine" ||
                key === "address" ||
                key === "website"
              ) {
                popupHTML += `${key}: ${properties[key]}<br>`;
              }
            }

            const cafeName = properties.name;
            const [lng, lat] = coordinates;
            let googleMapsURL = cafeName
              ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafeName)}`
              : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

            popupHTML += `<a href="${googleMapsURL}" target="_blank" rel="noopener noreferrer" 
              style="display:inline-block;margin-top:8px;padding:4px 8px;background:#4285F4;color:white;
              border-radius:4px;text-decoration:none;font-size:0.85em;">View on Google Maps</a>`;

            popupNode.innerHTML = popupHTML;

            popupRef.current
              .setLngLat(coordinates)
              .setDOMContent(popupNode)
              .addTo(newMap);
          }
        });

        // change cursor to a pointer when entering a feature
        newMap.on("mouseenter", "cafes", () => {
          newMap.getCanvas().style.cursor = "pointer";
        });

        // change back to a grabber when leaving
        newMap.on("mouseleave", "cafes", () => {
          newMap.getCanvas().style.cursor = "";
        });

        newMap.on("click", (e) => {
          const features = newMap.queryRenderedFeatures(e.point, {
            layers: ["cafes"],
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
      {/* <div
        style={{
          position: "absolute",
          bottom: "0",
          left: 0,
          right: 0,
          height: "120px",
          backgroundColor: "rgba(255,255,255,0.9)",
          overflowX: "auto",
          whiteSpace: "nowrap",
          zIndex: 999,
          padding: "10px",
          boxShadow: "0 -2px 5px rgba(0,0,0,0.2)",
        }}
      >
        {visibleCafes.map((cafe, index) => (
          <div
            key={index}
            style={{
              display: "inline-block",
              width: "250px",
              marginRight: "12px",
              background: "#fff",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "8px",
              boxSizing: "border-box",
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
            }}
            onClick={() => {
              map?.flyTo({ center: cafe.coordinates, zoom: 15 });
            }}
          >
            <strong>{cafe.name || "Unnamed Cafe"}</strong>
            <br />
            <span>{cafe.address || "No address"}</span>
            <br />
            {cafe.website && (
              <a href={cafe.website} target="_blank" rel="noopener noreferrer">
                Website
              </a>
            )}
          </div>
        ))}
      </div> */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 120,
          bgcolor: "rgba(255,255,255,0.9)",
          overflowX: "auto",
          whiteSpace: "nowrap",
          zIndex: 999,
          p: 1.25,
          boxShadow: "0 -2px 5px rgba(0,0,0,0.2)",
        }}
      >
        {visibleCafes.map((cafe, index) => (
          <Card
            key={index}
            onClick={() => {
              map?.flyTo({ center: cafe.coordinates, zoom: 15 });
            }}
            sx={{
              display: "inline-block",
              width: 250,
              mr: 1.5,
              cursor: "pointer",
              borderRadius: 2,
              boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
              ":hover": {
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                transform: "scale(1.02)",
                transition: "all 0.2s ease-in-out",
              },
            }}
            elevation={3}
          >
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {cafe.name || "Unnamed Cafe"}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {cafe.neighborhood ? `${cafe.neighborhood}` : cafe.address || ""}
              </Typography>
              {cafe.website && (
                <Link
                  href={cafe.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="body2"
                  underline="hover"
                  color="primary"
                >
                  Website
                </Link>
              )}
            </CardContent>
          </Card>
        ))}
      </Box>
    </>
  );
}

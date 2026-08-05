import { useEffect, useRef, useState } from "react";
import maplibregl, { NavigationControl, GeolocateControl } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import CafeScroller from "./CafeScroller.tsx"
import coffeeSVG from "../../assets/icons/coffee2.svg";
import specialtySVG from "../../assets/icons/specialty.svg";
import { loadCafeLayers, basemaps } from "./mapLayers.ts"; 
import BasemapSwitcher from "./BasemapSwitcher";
import useMapStore from "../../stores/useMapStore.ts";
import { fetchCafes, fetchNeighborhoods, flyToCafe, showCafePopup, showSelectedNeighborhood, applySearchFilters } from "./mapFns.js";


export default function MapComponent() {
  const setMap = useMapStore((state) => state.setMap);
  const map = useMapStore((state) => state.map);
  const selectedNeighborhood = useMapStore((state) => state.selectedNeighborhood);
  const setSelectedNeighborhood = useMapStore((state) => state.setSelectedNeighborhood);
  const setVisibleCafes = useMapStore((state) => state.setVisibleCafes);
  const searchFiltersActive = useMapStore((state) => state.searchFiltersActive);
  const setSearchFiltersActive = useMapStore((state) => state.setSearchFiltersActive);
  const cafes = useMapStore((state) => state.cafes);

  const mapContainer = useRef(null);
  const [basemapId, setBasemapId] = useState("voyager");

  useEffect(() => {
    if (!mapContainer.current) return;
      
    const newMap = new maplibregl.Map({
      container: mapContainer.current,
      style: basemaps.voyager.style,
      center: [-118.3226, 34.0750],
      zoom: 12,
      minZoom: 5,
    });

    newMap.on("load", async () => {
      await loadCafeLayers(newMap);
      setMap(newMap);

      // update cafes visible in bottom scroller when map moves
      const updateVisibleCafes = () => {
          const features = newMap.queryRenderedFeatures(undefined, {
            layers: ["regular-cafes", "specialty-cafes"],
          });

        const processedCafes = Array.from(
          new Map(
            features.map((f) => {
              const coordinates = f.geometry.coordinates;
              const neighborhood = f.properties.neighborhood;

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
      trackUserLocation: false, // only want a one-time fly
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

  }, []);

  useEffect(() => {
    if (map) {
      showSelectedNeighborhood(map, selectedNeighborhood);
    }
  }, [selectedNeighborhood]);

  const handleBasemapChange = (id) => {
    if (!map) return;
    setBasemapId(id);
    map.setStyle(basemaps[id].style, { diff: false });
    // style.load fires once the new style + its sources have finished loading
    map.once("style.load", () => {
      loadCafeLayers(map);
    });
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

      {(searchFiltersActive || selectedNeighborhood) && (
        <button
          onClick={() => {
            setVisibleCafes(cafes);
            setSelectedNeighborhood(null);
            if (map) applySearchFilters(map, {});
            setSearchFiltersActive(false);
          }}
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
          Clear Filters
        </button>
      )}

      <BasemapSwitcher current={basemapId} onChange={handleBasemapChange} />
      <CafeScroller map={map} />
    </>
  );
}
import { Map } from "maplibre-gl";
import { create } from "zustand";

interface MapStore {
  map: Map | null;
  setMap: (mapInstance: Map) => void;
}

const useMapStore = create<MapStore>((set) => ({
  map: null,
  setMap: (mapInstance: Map) => set({ map: mapInstance }),
}));

export default useMapStore;

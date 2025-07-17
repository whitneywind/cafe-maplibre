import { Map } from "maplibre-gl";
import { create } from "zustand";

// define the store type
interface MapStore {
  map: Map | null;
  setMap: (mapInstance: Map) => void;
}

// create the store
const useMapStore = create<MapStore>((set) => ({
  map: null,
  setMap: (mapInstance: Map) => set({ map: mapInstance }),
}));

export default useMapStore;

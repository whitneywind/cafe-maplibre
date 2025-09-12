import { Map } from "maplibre-gl";
import { create } from "zustand";

interface MapStore {
  map: Map | null;
  setMap: (mapInstance: Map) => void;
  selectedNeighborhood: any | null;
  setSelectedNeighborhood: (neighborhood: any | null) => void;
}

const useMapStore = create<MapStore>((set) => ({
  map: null,
  setMap: (mapInstance: Map) => set({ map: mapInstance }),
  selectedNeighborhood: null,
  setSelectedNeighborhood: (neighborhood) => set({ selectedNeighborhood: neighborhood }),
}));

export default useMapStore;

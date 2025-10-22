import { Map } from "maplibre-gl";
import { create } from "zustand";
import { Neighborhood, NeighborhoodCollection } from "../../types";


interface MapStore {
  map: Map | null;
  setMap: (mapInstance: Map) => void;
  neighborhoods: NeighborhoodCollection | null;
  setNeighborhoods: (data: NeighborhoodCollection | null) => void;
  selectedNeighborhood: any | null;
  setSelectedNeighborhood: (neighborhood: Neighborhood | null) => void;
}

const useMapStore = create<MapStore>((set) => ({
  map: null,
  setMap: (mapInstance: Map) => set({ map: mapInstance }),
  neighborhoods: null,
  setNeighborhoods: (data) => set({ neighborhoods: data }),
  selectedNeighborhood: null,
  setSelectedNeighborhood: (neighborhood) => set({ selectedNeighborhood: neighborhood }),
}));

export default useMapStore;

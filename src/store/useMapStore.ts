import { Map } from "maplibre-gl";
import { create } from "zustand";
import { Neighborhood, NeighborhoodCollection, NewCoffeeShop } from "../../types";


interface MapStore {
  map: Map | null;
  setMap: (mapInstance: Map) => void;

  cafeDetailsOpen: boolean;
  selectedCafe: NewCoffeeShop | null;
  openCafeDetails: (cafe: NewCoffeeShop) => void;
  closeCafeDetails: () => void;

  currentPopup: maplibregl.Popup | null;
  setCurrentPopup: (popup: maplibregl.Popup | null) => void;

  neighborhoods: NeighborhoodCollection | null;
  setNeighborhoods: (data: NeighborhoodCollection | null) => void;

  selectedNeighborhood: any | null;
  setSelectedNeighborhood: (neighborhood: Neighborhood | null) => void;



  scrollerOpen: boolean;
  openScroller: () => void;
  closeScroller: () => void;
  toggleScroller: () => void;
}

const useMapStore = create<MapStore>((set) => ({
  map: null,
  setMap: (mapInstance: Map) => set({ map: mapInstance }),

  cafeDetailsOpen: false,
  selectedCafe: null,

  openCafeDetails: (cafe) => set({ cafeDetailsOpen: true, selectedCafe: cafe }),
  closeCafeDetails: () => set({ cafeDetailsOpen: false, selectedCafe: null }),

  currentPopup: null,
  setCurrentPopup: (popup) => set({ currentPopup: popup }),

  neighborhoods: null,
  setNeighborhoods: (data) => set({ neighborhoods: data }),
  
  selectedNeighborhood: null,
  setSelectedNeighborhood: (neighborhood) => set({ selectedNeighborhood: neighborhood }),

  scrollerOpen: true,
  openScroller: () => set({ scrollerOpen: true }),
  closeScroller: () => set({ scrollerOpen: false }),
  toggleScroller: () =>
  set((state) => ({ scrollerOpen: !state.scrollerOpen })),
}));

export default useMapStore;

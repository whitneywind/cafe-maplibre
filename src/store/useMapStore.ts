import { Map, Popup } from "maplibre-gl";
import { create } from "zustand";
import { Neighborhood, NeighborhoodCollection, NewCoffeeShop } from "../../types";

interface MapStore {
  map: Map | null;
  setMap: (mapInstance: Map) => void;

  cafes: NewCoffeeShop[];
  setCafes: (cafes: NewCoffeeShop[]) => void;

  cafeDetailsOpen: boolean;
  selectedCafe: NewCoffeeShop | null;
  updateSelectedCafe: (cafe: NewCoffeeShop) => void;
  
  openCafeDetails: (cafe: NewCoffeeShop) => void;
  closeCafeDetails: () => void;

  currentCafePopup: Popup | null;
  setCurrentCafePopup: (popup: Popup | null) => void;

  neighborhoods: NeighborhoodCollection | null;
  setNeighborhoods: (data: NeighborhoodCollection | null) => void;

  selectedNeighborhood: any | null;
  setSelectedNeighborhood: (neighborhood: Neighborhood | null) => void;

  favorites: NewCoffeeShop[];
  addFavorite: (cafe: NewCoffeeShop) => void;
  removeFavorite: (cafeId: string) => void;
  isFavorite: (cafeId: string) => boolean;
  loadFavorites: () => void;

  scrollerOpen: boolean;
  openScroller: () => void;
  closeScroller: () => void;
  toggleScroller: () => void;
}

export const globalPopup = new Popup({ closeButton: false, closeOnClick: false, maxWidth: "90vw" });

const useMapStore = create<MapStore>((set, get) => ({
  map: null,
  setMap: (mapInstance: Map) => set({ map: mapInstance }),

  cafes: [],
  setCafes: (cafes) => set({ cafes }),

  cafeDetailsOpen: false,
  selectedCafe: null,
  updateSelectedCafe: (cafe: NewCoffeeShop) => set({ selectedCafe: cafe }),

  openCafeDetails: (cafe) => set({ cafeDetailsOpen: true, selectedCafe: cafe }),
  closeCafeDetails: () => set({ cafeDetailsOpen: false, selectedCafe: null }),

  currentCafePopup: globalPopup,
  setCurrentCafePopup: (popup) => set({ currentCafePopup: popup }),

  neighborhoods: null,
  setNeighborhoods: (data) => set({ neighborhoods: data }),
  
  selectedNeighborhood: null,
  setSelectedNeighborhood: (neighborhood) => set({ selectedNeighborhood: neighborhood }),

  favorites: [],
    addFavorite: (cafe) => {
    set((state) => {
      const updated = [...state.favorites, cafe];
      localStorage.setItem("favorites", JSON.stringify(updated));
      return { favorites: updated };
    });
  },

  removeFavorite: (cafeId) => {
    set((state) => {
      const updated = state.favorites.filter((c) => c.id !== cafeId);
      localStorage.setItem("favorites", JSON.stringify(updated));
      return { favorites: updated };
    });
  },

  isFavorite: (cafeId) => {
    return get().favorites.some((c) => c.id === cafeId);
  },

  loadFavorites: () => {
    const stored = localStorage.getItem("favorites");
    if (stored) {
      set({ favorites: JSON.parse(stored) });
    }
  },

  scrollerOpen: true,
  openScroller: () => set({ scrollerOpen: true }),
  closeScroller: () => set({ scrollerOpen: false }),
  toggleScroller: () =>
  set((state) => ({ scrollerOpen: !state.scrollerOpen })),
}));

export default useMapStore;

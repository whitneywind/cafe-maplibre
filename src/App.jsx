import { useEffect } from "react";
import "./App.css";
import CafeDetailsModal from "./components/ui/CafeDetailsModal";
import MapComponent from "./components/mapComponents/Map";
import TopMenu from "./components/ui/TopMenu";
import useMapStore from "./stores/useMapStore";
import useAuthStore from "./stores/useAuthStore";
import { AuthModal } from "./components/authComponents/AuthModal";

function App() {
    const cafeDetailsOpen = useMapStore((state) => state.cafeDetailsOpen);
    const loadFavorites = useMapStore((state) => state.loadFavorites);
    const authModalOpen = useAuthStore((state) => state.authModalOpen);

    useEffect(() => {
      loadFavorites();
    }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <TopMenu />
      <MapComponent />
      {cafeDetailsOpen && <CafeDetailsModal />}
      {authModalOpen && <AuthModal />}
    </div>
  );
}

export default App;

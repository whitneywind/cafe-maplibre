import { useEffect } from "react";
import "./App.css";
import CafeDetailsModal from "./components/CafeDetailsModal";
import MapComponent from "./components/Map";
import TopMenu from "./components/TopMenu";
import useMapStore from "./store/useMapStore";

function App() {
    const cafeDetailsOpen = useMapStore((state) => state.cafeDetailsOpen);
    const loadFavorites = useMapStore((state) => state.loadFavorites);

    useEffect(() => {
      loadFavorites();
    }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <TopMenu />
      <MapComponent />
      {cafeDetailsOpen && <CafeDetailsModal />}
    </div>
  );
}

export default App;

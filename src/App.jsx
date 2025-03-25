import "./App.css";
import MapComponent from "./components/Map";
import WavyMenu from "./components/WavyMenu";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <WavyMenu />
      <MapComponent />
    </div>
  );
}

export default App;

import "./App.css";
import MapComponent from "./components/Map";
import TopMenu from "./components/TopMenu";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <TopMenu />
      <MapComponent />
    </div>
  );
}

export default App;

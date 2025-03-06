import "./App.css";
import MapComponent from "./components/Map";

function App() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden" }}>
      <MapComponent />
      {/* <div
        style={{
          position: "absolute",
          top: 10,
          // zIndex: 10,
          width: 500,
          height: 500,
        }}
      >
        on top of map
      </div> */}
    </div>
  );
}

export default App;

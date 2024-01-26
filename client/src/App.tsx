import { useEffect, useRef } from "react";
import "./index.css";
import "ol/ol.css";
import { useMap } from "./map";

export default function App() {
  const mapRef = useRef<HTMLDivElement>(null);
  const map = useMap();
  useEffect(() => {
    if (mapRef.current) {
      map.setTarget(mapRef.current);
      map.updateSize();
    }
  }, [map]);
  return (
    <div className="App">
      <div className="map-container">
        <div id="map" ref={mapRef}></div>
      </div>
    </div>
  );
}

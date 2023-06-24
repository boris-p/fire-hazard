import * as React from "react";
import Map, { GeolocateControl } from "react-map-gl";

import "./App.css";

function App() {
  return (
    <>
      <h1>Fire-hazard App</h1>
      <Map
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14,
        }}
        mapboxAccessToken="pk.eyJ1IjoiYm9yLXBsIiwiYSI6ImNqangxenNvNTE1bWQzanAwNnRnOXU0ZWMifQ.xNWlg-CnhTvri40hwUlNdA"
        style={{ width: "80vw", height: "80vh" }}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
      >
        <GeolocateControl />
      </Map>
    </>
  );
}

export default App;

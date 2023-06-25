import * as React from "react";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import Map, {
  GeolocateControl,
  NavigationControl,
  ScaleControl,
  MapRef,
  Layer,
  LayerProps,
  Source,
} from "react-map-gl";

import { dataLayer } from "./mapStyle";
import { heatmapLayer } from "./heatMapStyle";

import { SearchBox } from "@mapbox/search-js-react";

import "./App.css";
import "mapbox-gl/dist/mapbox-gl.css";

const sendImageData = async (img: string, buildings: any, green: any) => {
  const response = await axios.post("http://127.0.0.1:5000/img", {
    image: img,
    buildings,
    green,
  });

  return response;
};

const ACCESS_TOKEN =
  "pk.eyJ1IjoiYm9yLXBsIiwiYSI6ImNqangxenNvNTE1bWQzanAwNnRnOXU0ZWMifQ.xNWlg-CnhTvri40hwUlNdA";
function App() {
  const [calculatedBuildingsData, setCalculatedData] =
    React.useState<any>(null);
  const mapRef: React.Ref<MapRef> = React.useRef() as React.Ref<MapRef>;
  let buildingsGeo = React.useRef<mapboxgl.MapboxGeoJSONFeature[]>([]);
  let greenlandGeo = React.useRef<mapboxgl.MapboxGeoJSONFeature[]>([]);
  let hoverInfo = React.useRef<any>();
  let tooltipRef = React.useRef<any>(null);

  const analyzeMap = async () => {
    const [building] = buildingsGeo.current;
    const [green] = greenlandGeo.current;
    const map = mapRef.current as mapboxgl.Map;
    const imageString = map.getCanvas().toDataURL();

    if (!imageString || !building || !green) {
      alert("Can't analyze image. Missing data");
      return;
    }

    console.log("buildingsGeo.current", buildingsGeo.current);
    console.log("buildingsGeo.current length", buildingsGeo.current.length);
    const response = await sendImageData(
      imageString,
      buildingsGeo.current,
      greenlandGeo.current
    );
    // console.log("response", response);

    const calculated_buildings_data = {
      type: "FeatureCollection",
      crs: {
        type: "calculated_buildings",
        // properties: { name: "urn:ogc:def:crs:OGC:1.3:CRS84" },
      },
      features: Object.values(response.data).map((building: any) => ({
        ...building,
        properties: {
          ...building.properties,
          normalizedDistance: building.normalizedDistance,
        },
      })),
    };

    console.log("response.data", response.data);
    console.log("response.data length", Object.keys(response.data).length);
    setCalculatedData(calculated_buildings_data);
    console.log("calculated_buildings_data", calculated_buildings_data);
  };

  const updateMapData = (map: mapboxgl.Map) => {
    const canvas = map.getCanvasContainer();
    // const rect = canvas.getBoundingClientRect();

    const rect = document
      .getElementsByClassName("mapboxgl-canvas")[0]
      .getBoundingClientRect();

    console.log("canvas.getClientRects", canvas.getClientRects());
    console.log("rect", rect);
    const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
      new mapboxgl.Point(0, rect.bottom + rect.top),
      new mapboxgl.Point(rect.right + rect.left, 0),
    ];

    console.log("bbox", bbox);
    const geo = map.queryRenderedFeatures(bbox);

    buildingsGeo.current = geo.filter((g) => g.sourceLayer === "building");
    greenlandGeo.current = geo.filter((g) => g.sourceLayer === "landuse");

    const uniqueClasses = new Set(
      greenlandGeo.current.map(
        (g) => `${g.properties?.class}_${g.properties?.type}`
      )
    );

    console.log(uniqueClasses);
  };

  const buildingsLayerProps: LayerProps = {
    id: "buildings",
    type: "fill",
    "source-layer": "building",
    paint: {
      "fill-color": "#4E3FC8",
      "fill-opacity": 0.2,
    },
  };

  const landuseLayerProps: LayerProps = {
    id: "landuse",
    type: "fill",
    "source-layer": "landuse",
    paint: {
      "fill-color": "#2e6930",
      "fill-opacity": 0.1,
    },
  };

  const waterLayerProps: LayerProps = {
    id: "water",
    type: "fill",
    "source-layer": "water",
    paint: {
      "fill-color": "#0000ff",
      "fill-opacity": 0,
    },
  };

  const onHover = (event: any) => {
    const {
      features,
      point: { x, y },
    } = event;
    console.log("features", features);
    const hoveredFeature = features && features[0];
    if (!hoveredFeature) {
      // tooltipRef.current.style.top = `-1000px`;
      // tooltipRef.current.style.left = `-1000px`;

      return;
    }
    hoverInfo.current = { feature: hoveredFeature, x, y };

    console.log("hoveredFeature", hoveredFeature);
    // tooltipRef.current.style.top = `-200px`;
    // tooltipRef.current.style.left = `0px`;
    // tooltipRef.current.style.top = `${y}px`;
    // tooltipRef.current.style.left = `${x}px`;
    // tooltipRef.current.backgroundColor = `white`;
    // tooltipRef.current.style.color = `gray`;
    // tooltipRef.current.style.position = `absolute`;
    // tooltipRef.current.innerHTML = `${hoveredFeature.properties?.class} - ${hoveredFeature.properties?.type}`;
    // tooltipRef.current.innerHTML = `${hoveredFeature.properties?.type}`;
    tooltipRef.current.innerHTML = `${
      hoveredFeature.properties ? JSON.stringify(hoveredFeature.properties) : ""
    }`;
  };

  const onMapLoad = React.useCallback((e: mapboxgl.MapboxEvent<undefined>) => {
    if (!mapRef) {
      return;
    }

    const map: mapboxgl.Map = mapRef.current;

    map.on("moveend", () => {
      updateMapData(e.target);
    });

    updateMapData(e.target);
  }, []);

  const handleRetrieve = (value) => {
    console.log(value.features[0].properties.coordinates);
    const map: mapboxgl.Map = mapRef.current;
    map.panTo([
      value.features[0].properties.coordinates.longitude,
      value.features[0].properties.coordinates.latitude,
    ]);
  };

  return (
    <>
      <h1>Fire-hazard App</h1>
      <button style={{ margin: 10 }} onClick={analyzeMap}>
        {" "}
        Analyze
      </button>

      <div ref={tooltipRef} className="tooltip"></div>
      <SearchBox
        map={mapRef?.current}
        onRetrieve={handleRetrieve}
        accessToken={ACCESS_TOKEN}
      />
      <Map
        preserveDrawingBuffer={true}
        ref={mapRef}
        onLoad={onMapLoad}
        onMouseMove={onHover}
        initialViewState={{
          longitude: -122.4,
          latitude: 37.8,
          zoom: 14,
        }}
        mapboxAccessToken="pk.eyJ1IjoiYm9yLXBsIiwiYSI6ImNqangxenNvNTE1bWQzanAwNnRnOXU0ZWMifQ.xNWlg-CnhTvri40hwUlNdA"
        style={{ width: "80vw", height: "80vh" }}
        mapStyle="mapbox://styles/mapbox/satellite-v9"
        interactiveLayerIds={["calculated-building"]}
      >
        <GeolocateControl />
        <NavigationControl />
        <ScaleControl />
        {calculatedBuildingsData && (
          <Source type="geojson" data={calculatedBuildingsData}>
            <Layer {...dataLayer} />
          </Source>
        )}
        <Source
          id="vector-source"
          type="vector"
          url="mapbox://mapbox.mapbox-streets-v6"
        >
          <Layer {...buildingsLayerProps} />
          <Layer {...landuseLayerProps} />
          <Layer {...waterLayerProps} />
        </Source>
      </Map>
    </>
  );
}

export default App;

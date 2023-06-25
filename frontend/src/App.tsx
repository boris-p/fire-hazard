import * as React from "react";
import axios from "axios";
import mapboxgl from "mapbox-gl";
import Map, {
    GeolocateControl,
    MapRef,
    Layer,
    LayerProps,
    Source,
} from "react-map-gl";

import "./App.css";

const sendImageData = async (img: string, buildings: any, green: any) => {
    const response = await axios.post("http://127.0.0.1:5000/img", {
        image: img,
        buildings,
        green,
    });

    return response;
};

function App() {
    const mapRef: React.Ref<MapRef> = React.useRef() as React.Ref<MapRef>;
    let buildingsGeo = React.useRef<mapboxgl.MapboxGeoJSONFeature[]>([]);
    let greenlandGeo = React.useRef<mapboxgl.MapboxGeoJSONFeature[]>([]);
    let hoverInfo = React.useRef<any>();
    let tooltipRef = React.useRef<any>(null);

    const applyFeatures = (buildings: Record<string, any> = {}) => {
        // debugger;
        const map = mapRef.current as mapboxgl.Map;

        Object.entries(buildings).forEach(([id, building]) => {
            map.setFeatureState(
                { id, source: "vector-source", sourceLayer: "building" },
                {
                    dist: building["normalizedDistance"], // * 255, //.toString(16),
                }
            );

            console.log(`setting color for id ${id}`);
        });
    };

    const analyzeMap = async () => {
        const [building] = buildingsGeo.current;
        const [green] = greenlandGeo.current;
        const map = mapRef.current as mapboxgl.Map;
        const imageString = map.getCanvas().toDataURL();

        if (!imageString || !building || !green) {
            alert("Can't analyze image. Missing data");
            return;
        }

        const response = await sendImageData(
            imageString,
            buildingsGeo.current,
            greenlandGeo.current
        );

        applyFeatures(response.data);
    };

    const updateMapData = (map: mapboxgl.Map) => {
        const canvas = map.getCanvasContainer();
        const rect = canvas.getBoundingClientRect();

        const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
            new mapboxgl.Point(rect.left, rect.bottom),
            new mapboxgl.Point(rect.right, rect.top),
        ];

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
        id: "building",
        type: "fill",
        "source-layer": "building",
        paint: {
            "fill-color": "#4E3FC8",
            // "fill-color": ["rgb", ["feature-state", "dist"], 0, 0],
            // "fill-opacity": 0.5,
            "fill-opacity": [
                "case",
                ["has", "dist"],
                ["feature-state", "dist"],
                0.5,
            ],
        },
    };

    const landuseLayerProps: LayerProps = {
        id: "landuse",
        type: "fill",
        "source-layer": "landuse",
        paint: {
            "fill-color": "#2e6930",
            "fill-opacity": 0.8,
        },
    };

    const waterLayerProps: LayerProps = {
        id: "water",
        type: "fill",
        "source-layer": "water",
        paint: {
            "fill-color": "#0000ff",
            "fill-opacity": 1,
        },
    };

    const onHover = (event: any) => {
        const {
            features,
            point: { x, y },
        } = event;
        const hoveredFeature = features && features[0];
        if (!hoveredFeature) {
            tooltipRef.current.style.top = `-1000px`;
            tooltipRef.current.style.left = `-1000px`;

            return;
        }
        hoverInfo.current = { feature: hoveredFeature, x, y };

        tooltipRef.current.style.top = `${y}px`;
        tooltipRef.current.style.left = `${x}px`;
        tooltipRef.current.backgroundColor = `white`;
        tooltipRef.current.style.color = `gray`;
        tooltipRef.current.style.position = `absolute`;
        // tooltipRef.current.innerHTML = `${hoveredFeature.properties?.class} - ${hoveredFeature.properties?.type}`;
        tooltipRef.current.innerHTML = `${hoveredFeature.properties?.type}`;
    };

    const onMapLoad = React.useCallback(
        (e: mapboxgl.MapboxEvent<undefined>) => {
            if (!mapRef) {
                return;
            }

            const map: mapboxgl.Map = mapRef.current;

            map.on("moveend", () => {
                updateMapData(e.target);
            });

            updateMapData(e.target);
        },
        []
    );

    return (
        <>
            <h1>Fire-hazard App</h1>
            <button style={{ margin: 10 }} onClick={analyzeMap}>
                {" "}
                Analyze
            </button>

            <Map
                preserveDrawingBuffer={true}
                ref={mapRef}
                onLoad={onMapLoad}
                // onMouseMove={onHover}
                initialViewState={{
                    longitude: -122.4,
                    latitude: 37.8,
                    zoom: 14,
                }}
                mapboxAccessToken="pk.eyJ1IjoiYm9yLXBsIiwiYSI6ImNqangxenNvNTE1bWQzanAwNnRnOXU0ZWMifQ.xNWlg-CnhTvri40hwUlNdA"
                style={{ width: "80vw", height: "80vh" }}
                mapStyle="mapbox://styles/mapbox/satellite-v9"
                interactiveLayerIds={["building", "landuse"]}
            >
                <GeolocateControl />
                <Source
                    id="vector-source"
                    type="vector"
                    url="mapbox://mapbox.mapbox-streets-v6"
                >
                    <Layer {...buildingsLayerProps} />
                    <Layer {...landuseLayerProps} />
                    <Layer {...waterLayerProps} />
                </Source>

                <div ref={tooltipRef} className="tooltip">
                    tooltip
                </div>
            </Map>
        </>
    );
}

export default App;

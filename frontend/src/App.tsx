import * as React from "react";
import Map, {
    GeolocateControl,
    MapRef,
    Layer,
    LayerProps,
    Source,
} from "react-map-gl";

import "./App.css";
import mapboxgl from "mapbox-gl";

function App() {
    const mapRef: React.Ref<MapRef> = React.useRef() as React.Ref<MapRef>;

    let buildingsGeo = React.useRef<mapboxgl.MapboxGeoJSONFeature[]>([]);

    const logData = () => {
        const [building] = buildingsGeo.current;

        if (!building) {
            return;
        }

        const { sourceLayer, type, layer, id } = building;

        console.log({
            sourceLayer,
            type,
            layer,
            id,
            goemetry: building.geometry,
        });
    };

    const updateMapData = (map: mapboxgl.Map) => {
        const canvas = map.getCanvasContainer();
        const rect = canvas.getBoundingClientRect();

        const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
            new mapboxgl.Point(rect.left, rect.bottom),
            new mapboxgl.Point(rect.right, rect.top),
        ];
        const geo = map.queryRenderedFeatures(bbox);

        buildingsGeo.current = geo;
    };

    const buildingsLayerProps: LayerProps = {
        id: "buildings",
        type: "fill",
        "source-layer": "building",
        paint: {
            "fill-color": "#4E3FC8",
            "fill-opacity": 0.5,
        },
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
        },
        []
    );

    return (
        <>
            <h1>Fire-hazard App</h1>
            <button style={{ margin: 10 }} onClick={logData}>
                {" "}
                LogData
            </button>
            <Map
                ref={mapRef}
                onLoad={onMapLoad}
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
                <Source
                    id="vector-source"
                    type="vector"
                    url="mapbox://mapbox.mapbox-streets-v6"
                >
                    <Layer {...buildingsLayerProps} />
                </Source>
            </Map>
        </>
    );
}

export default App;

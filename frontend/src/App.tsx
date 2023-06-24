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

    const [buildingsLayer, setBuildingLayer] = React.useState<
        mapboxgl.AnyLayer | undefined
    >();

    const updateMapData = (map: mapboxgl.Map) => {
        /* eslint-disable  @typescript-eslint/no-non-null-assertion */
        setBuildingLayer(map.getLayer(buildingsLayerProps.id!));

        const geo = map.querySourceFeatures("vector-source", {
            sourceLayer: "buildings",
        });
    };

    const buildingsLayerProps: LayerProps = {
        id: "buildings",
        type: "fill",
        "source-layer": "building",
        // filter: ["==", "class", "park"],
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

            mapRef.current.on("moveend", () => {
                updateMapData(e.target);
            });
        },
        []
    );

    return (
        <>
            <h1>Fire-hazard App</h1>
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
                // mapStyle="mapbox://styles/mapbox/streets-v9"
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

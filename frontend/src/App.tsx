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
    let greenland = React.useRef<mapboxgl.MapboxGeoJSONFeature[]>([]);
    let hoverInfo = React.useRef<any>();

    const logData = () => {
        const [building] = buildingsGeo.current;
        const [green] = greenland.current;

        if (building) {
            console.log({
                sourceLayer: building.sourceLayer,
                type: building.type,
                layer: building.layer,
                id: building.id,
                geometry: building.geometry,
            });
        }
        if (green) {
            console.log(green);
            // console.log({
            //     sourceLayer: green.sourceLayer,
            //     type: green.type,
            //     layer: green.layer,
            //     id: green.id,
            //     geometry: green.geometry,
            // });
        }
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
        greenland.current = geo.filter((g) => g.sourceLayer === "landuse");

        const uniqueClasses = new Set(
            greenland.current.map(
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
            "fill-opacity": 0.5,
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
        // filter: [
        //     "in",
        //     "type",
        //     ["literal", ["grass", "park", "national_park", "scrub", "wood"]],
        // ],
    };

    const onHover = React.useCallback((event: any) => {
        const {
            features,
            point: { x, y },
        } = event;
        const hoveredFeature = features && features[0];
        if (!hoveredFeature) {
            return;
        }
        hoverInfo.current = { feature: hoveredFeature, x, y };
        console.log(hoverInfo.current);
    }, []);

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
                onMouseMove={onHover}
                initialViewState={{
                    longitude: -122.4,
                    latitude: 37.8,
                    zoom: 14,
                }}
                mapboxAccessToken="pk.eyJ1IjoiYm9yLXBsIiwiYSI6ImNqangxenNvNTE1bWQzanAwNnRnOXU0ZWMifQ.xNWlg-CnhTvri40hwUlNdA"
                style={{ width: "80vw", height: "80vh" }}
                mapStyle="mapbox://styles/mapbox/satellite-v9"
                interactiveLayerIds={["buildings", "landuse"]}
            >
                <GeolocateControl />
                <Source
                    id="vector-source"
                    type="vector"
                    url="mapbox://mapbox.mapbox-streets-v6"
                >
                    <Layer {...buildingsLayerProps} />
                    <Layer {...landuseLayerProps} />
                </Source>
                
                {hoverInfo?.current && (
                    <div
                        className="tooltip"
                        style={{
                            left: hoverInfo.current.x,
                            top: hoverInfo.current.y,
                            position: "absolute"
                        }}
                    >
                        <div>
                            State: {hoverInfo.current.feature.properties.name}
                        </div>
                        <div>
                            Class: {hoverInfo.current.feature.properties.class}
                        </div>
                        <div>
                            Type: {hoverInfo.current.feature.properties.type}
                        </div>
                    </div>
                )}
            </Map>
        </>
    );
}

export default App;

import type { FillLayer } from "react-map-gl";

// For more information on data-driven styles, see https://www.mapbox.com/help/gl-dds-ref/
export const dataLayer: FillLayer = {
  id: "calculated-building",
  type: "fill",
  paint: {
    "fill-color": {
      property: "green_normalizedDistance",
      stops: [
        [0, "#3288bd"],
        [0.1, "#66c2a5"],
        [0.2, "#abdda4"],
        [0.3, "#e6f598"],
        [0.4, "#ffffbf"],
        [0.5, "#fee08b"],
        [0.6, "#fdae61"],
        [0.7, "#f46d43"],
        [0.8, "#d53e4f"],
      ],
    },
    "fill-opacity": 0.8,
  },
};

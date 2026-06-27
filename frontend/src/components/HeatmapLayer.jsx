import { useEffect } from "react";
import { useMap } from "react-leaflet";
import "leaflet.heat";
import L from "leaflet";

export default function HeatmapLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map || points.length === 0) return;

    const heatLayer = L.heatLayer(points, {
      radius: 30,
      blur: 22,
      maxZoom: 17,
      max: 1.0,
    }).addTo(map);

    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);

  return null;
}
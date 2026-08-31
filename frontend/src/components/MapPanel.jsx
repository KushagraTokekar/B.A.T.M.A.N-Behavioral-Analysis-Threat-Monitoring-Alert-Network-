import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";

import HeatmapLayer from "./HeatmapLayer";
import HotspotPopup from "./HotspotPopup";

export default function MapPanel({
  reports,
  hotspots,
  heatmapPoints,
  mapView,
  setMapView,
  isMapFullScreen,
  setIsMapFullScreen,
  getIcon,
}) {
  return (
    <div
      className={
        isMapFullScreen
          ? "map-fullscreen"
          : "panel map-panel"
      }
    >
      <div className="panel-header">
        <h3>LIVE RISK MAP</h3>

        <div className="map-controls">
          <select
            value={mapView}
            onChange={(e) => setMapView(e.target.value)}
          >
            <option value="markers">Markers</option>
            <option value="heatmap">Heatmap</option>
            <option value="both">Both</option>
          </select>

          <button
            onClick={() =>
              setIsMapFullScreen(!isMapFullScreen)
            }
          >
            {isMapFullScreen
              ? "Exit Fullscreen"
              : "Open Fullscreen"}
          </button>
        </div>
      </div>

      <div
        className={
          isMapFullScreen
            ? "fullscreen-map-box"
            : "dashboard-map"
        }
      >
        <MapContainer
          center={[22.7196, 75.8577]}
          zoom={12}
          style={{
            height: "100%",
            width: "100%",
          }}
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {(mapView === "heatmap" ||
            mapView === "both") && (
            <HeatmapLayer points={heatmapPoints} />
          )}

          {(mapView === "markers" ||
            mapView === "both") &&
            reports.map((report) => (
              <Marker
                key={report.id}
                position={[
                  Number(report.latitude),
                  Number(report.longitude),
                ]}
                icon={getIcon(report.threat_score)}
              >
                <Popup>
                  <h3>{report.incident_type}</h3>

                  <p>{report.description}</p>

                  <p>
                    <strong>Threat Score:</strong>{" "}
                    {report.threat_score}%
                  </p>

                  <p>
                    <strong>Severity:</strong>{" "}
                    {report.severity}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    {report.status}
                  </p>
                </Popup>
              </Marker>
            ))}

          {hotspots.map((hotspot, index) => (
            <Circle
              key={index}
              center={[
                hotspot.latitude,
                hotspot.longitude,
              ]}
              radius={500}
              pathOptions={{
                color:
                  hotspot.level === "high"
                    ? "red"
                    : hotspot.level === "medium"
                    ? "orange"
                    : "green",

                fillColor:
                  hotspot.level === "high"
                    ? "red"
                    : hotspot.level === "medium"
                    ? "orange"
                    : "green",

                fillOpacity: 0.25,
              }}
            >
              <Popup>
    <HotspotPopup hotspot={hotspot} />
</Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
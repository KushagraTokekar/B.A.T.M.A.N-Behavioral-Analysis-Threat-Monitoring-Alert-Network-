import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../services/api";
import "./PageStyle.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

export default function Report() {
  const navigate = useNavigate();

  const [incidentType, setIncidentType] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  const useCurrentLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        alert("Unable to get your location. Please select location on map.");
      }
    );
  };

  const submitReport = async () => {
    if (!incidentType || !description || !position) {
      alert("Please fill all fields and select location on map");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await api.post(
        "/reports",
        {
          incident_type: incidentType,
          description,
          latitude: position.lat,
          longitude: position.lng,
          severity,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Incident reported successfully");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Report failed");
    }
  };

  return (
    <div className="tactical-page">
      <div className="tactical-card">
        <h1 className="tactical-title">Report Incident</h1>

        <p className="tactical-subtitle">
          Select incident details and mark the exact location on the tactical map.
        </p>

        <select
          value={incidentType}
          onChange={(e) => setIncidentType(e.target.value)}
          className="tactical-select"
        >
          <option value="">Select Incident Type</option>
          <option value="Robbery">Robbery</option>
          <option value="Accident">Accident</option>
          <option value="Fire">Fire</option>
          <option value="Assault">Assault</option>
          <option value="Suspicious Activity">Suspicious Activity</option>
          <option value="Crowd Violence">Crowd Violence</option>
          <option value="Other">Other</option>
        </select>

        <textarea
          placeholder="Describe what happened"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="tactical-textarea"
        />

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="tactical-select"
        >
          <option value="low">Low Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="high">High Severity</option>
        </select>

        <button onClick={useCurrentLocation} className="tactical-location-btn">
          Use My Current Location
        </button>

        <p className="tactical-helper">
          Or click on the map to select incident location
        </p>

        <div className="tactical-map-box">
          <MapContainer
            center={[22.7196, 75.8577]}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <LocationPicker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        {position && (
          <div className="tactical-location-info">
            <p>Selected Latitude: {position.lat.toFixed(6)}</p>
            <p>Selected Longitude: {position.lng.toFixed(6)}</p>
          </div>
        )}

        <button onClick={submitReport} className="tactical-button">
          Submit Report
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="tactical-secondary"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
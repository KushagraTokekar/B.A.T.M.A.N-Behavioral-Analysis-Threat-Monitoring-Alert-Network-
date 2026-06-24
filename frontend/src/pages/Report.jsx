import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import api from "../services/api";

// Fix default marker icon issue in React Leaflet
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
    <div style={styles.page}>
      <div style={styles.card}>
        <h1>Report Incident</h1>

        <select
          value={incidentType}
          onChange={(e) => setIncidentType(e.target.value)}
          style={styles.input}
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
          style={styles.textarea}
        />

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          style={styles.input}
        >
          <option value="low">Low Severity</option>
          <option value="medium">Medium Severity</option>
          <option value="high">High Severity</option>
        </select>

        <button onClick={useCurrentLocation} style={styles.locationButton}>
          Use My Current Location
        </button>

        <p style={styles.helperText}>Or click on the map to select incident location</p>

        <div style={styles.mapBox}>
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
          <div style={styles.locationInfo}>
            <p>Selected Latitude: {position.lat.toFixed(6)}</p>
            <p>Selected Longitude: {position.lng.toFixed(6)}</p>
          </div>
        )}

        <button onClick={submitReport} style={styles.button}>
          Submit Report
        </button>

        <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "700px",
    background: "#020617",
    padding: "30px",
    borderRadius: "12px",
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "none",
  },
  textarea: {
    width: "100%",
    padding: "12px",
    height: "100px",
    marginBottom: "12px",
    borderRadius: "6px",
    border: "none",
  },
  locationButton: {
    width: "100%",
    padding: "12px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "10px",
    fontWeight: "bold",
  },
  helperText: {
    color: "#cbd5e1",
    fontSize: "14px",
  },
  mapBox: {
    height: "350px",
    width: "100%",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "15px",
  },
  locationInfo: {
    background: "#111827",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "12px",
    color: "#facc15",
  },
  button: {
    width: "100%",
    padding: "12px",
    background: "#facc15",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  backButton: {
    width: "100%",
    padding: "12px",
    marginTop: "10px",
    background: "#334155",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};
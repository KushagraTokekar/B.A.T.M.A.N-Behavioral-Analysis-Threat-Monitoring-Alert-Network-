import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { getDistance } from "geolib";
import L from "leaflet";
import api from "../services/api";
import "leaflet/dist/leaflet.css";
import "./Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyIncidents, setNearbyIncidents] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    getUserLocation();
    fetchReports();
  }, [navigate]);

  useEffect(() => {
    if (!userLocation || reports.length === 0) return;

    const nearby = reports
      .map((report) => {
        const distance = getDistance(
          {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          },
          {
            latitude: Number(report.latitude),
            longitude: Number(report.longitude),
          }
        );

        return {
          ...report,
          distance,
        };
      })
      .filter((report) => report.distance <= 3000)
      .sort((a, b) => a.distance - b.distance);

    setNearbyIncidents(nearby);
  }, [userLocation, reports]);

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.log("Location error:", error);
      }
    );
  };

  const fetchReports = async () => {
    try {
      const res = await api.get("/reports");
      setReports(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const getIcon = (severity) => {
    let color = "green";

    if (severity === "high") color = "red";
    if (severity === "medium") color = "gold";

    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
  };

  return (
    <div className="bat-page">
      <aside className="sidebar">
        <div className="brand">
          <div className="bat-logo">🦇</div>
          <div>
            <h2>BATMAN</h2>
            <p>Vigilance. Intelligence. Justice.</p>
          </div>
        </div>

        <nav className="menu">
          <button className="active">▦ Dashboard</button>
          <button onClick={() => navigate("/report")}>⊕ Report Incident</button>
          <button onClick={() => navigate("/my-reports")}>▣ My Reports</button>
          <button>⌁ Threat Analytics</button>
          <button>◉ Social Monitoring</button>
          <button>⚙ Settings</button>
        </nav>

        <div className="operator-card">
          <div className="avatar">👤</div>
          <div>
            <strong>KUSHAGRA</strong>
            <p>● ONLINE</p>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <h1>
              BATMAN <span>DASHBOARD</span>
            </h1>
            <p>Behavioral Analysis, Threat Monitoring & Alert Network</p>
          </div>

          <div className="top-actions">
            <div className="status">
              <small>SYSTEM STATUS</small>
              <strong>● ONLINE</strong>
            </div>

            <button onClick={logout}>Logout</button>
          </div>
        </header>

        {nearbyIncidents.length > 0 && (
          <div className="nearby-alert">
            <h2>⚠ Nearby Threat Alert</h2>
            <p>
              {nearbyIncidents.length} incident(s) detected within 3 km of your
              location.
            </p>

            {nearbyIncidents.slice(0, 3).map((incident) => (
              <div key={incident.id} className="nearby-item">
                <strong>{incident.incident_type}</strong>
                <p>
                  {incident.severity.toUpperCase()} severity •{" "}
                  {(incident.distance / 1000).toFixed(2)} km away
                </p>
              </div>
            ))}
          </div>
        )}

        <section className="stats-grid">
          <StatCard
            icon="📁"
            title="Total Incidents"
            value={reports.length}
            note="Live from database"
          />
          <StatCard
            icon="🎯"
            title="High Risk Reports"
            value={reports.filter((r) => r.severity === "high").length}
            note="High severity incidents"
            danger
          />
          <StatCard
            icon="🚨"
            title="Pending Reports"
            value={reports.filter((r) => r.status === "pending").length}
            note="Need verification"
            danger
          />
          <StatCard
            icon="🛡️"
            title="Verified Reports"
            value={reports.filter((r) => r.status === "verified").length}
            note="Confirmed incidents"
          />
        </section>

        <section className="content-grid">
          <div className="panel map-panel">
            <div className="panel-header">
              <h3>LIVE RISK MAP</h3>
            </div>

            <div className="dashboard-map">
              <MapContainer
                center={[22.7196, 75.8577]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="© OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {reports.map((report) => (
                  <Marker
                    key={report.id}
                    position={[
                      Number(report.latitude),
                      Number(report.longitude),
                    ]}
                    icon={getIcon(report.severity)}
                  >
                    <Popup>
                      <h3>{report.incident_type}</h3>
                      <p>{report.description}</p>
                      <p>
                        <strong>Severity:</strong> {report.severity}
                      </p>
                      <p>
                        <strong>Status:</strong> {report.status}
                      </p>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          <div className="panel alerts">
            <div className="panel-header">
              <h3>ACTIVE ALERTS</h3>
            </div>

            {reports.slice(0, 5).map((report) => (
              <Alert
                key={report.id}
                title={report.incident_type}
                place={report.description}
                level={report.severity.toUpperCase()}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, note, danger }) {
  return (
    <div className="stat-card">
      <div className={danger ? "stat-icon danger" : "stat-icon"}>{icon}</div>
      <div>
        <p>{title}</p>
        <h2>{value}</h2>
        <small className={danger ? "danger-text" : ""}>{note}</small>
      </div>
    </div>
  );
}

function Alert({ title, place, level }) {
  return (
    <div className="alert-row">
      <div>
        <strong>{title}</strong>
        <p>{place}</p>
      </div>
      <span>{level}</span>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { getDistance } from "geolib";
import L from "leaflet";
import api from "../services/api";
import "leaflet/dist/leaflet.css";
import "./Dashboard.css";
import HeatmapLayer from "../components/HeatmapLayer";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [reports, setReports] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyIncidents, setNearbyIncidents] = useState([]);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [mapView, setMapView] = useState("both");

  const heatmapPoints = reports.map((report) => [
    Number(report.latitude),
    Number(report.longitude),
    report.severity === "high" ? 1.0 : report.severity === "medium" ? 0.6 : 0.3,
  ]);

  const calculateHotspots = () => {
    const hotspots = [];

    reports.forEach((report) => {
      const nearbyReports = reports.filter((otherReport) => {
        const distance = getDistance(
          {
            latitude: Number(report.latitude),
            longitude: Number(report.longitude),
          },
          {
            latitude: Number(otherReport.latitude),
            longitude: Number(otherReport.longitude),
          }
        );

        return distance <= 500;
      });

      if (nearbyReports.length >= 3) {
        const riskScore = nearbyReports.reduce((score, item) => {
          if (item.severity === "high") return score + 3;
          if (item.severity === "medium") return score + 2;
          return score + 1;
        }, 0);

        const alreadyExists = hotspots.some((hotspot) => {
          const distance = getDistance(
            {
              latitude: hotspot.latitude,
              longitude: hotspot.longitude,
            },
            {
              latitude: Number(report.latitude),
              longitude: Number(report.longitude),
            }
          );

          return distance <= 500;
        });

        if (!alreadyExists) {
          const highCount = nearbyReports.filter((r) => r.severity === "high").length;
          const mediumCount = nearbyReports.filter((r) => r.severity === "medium").length;
          const lowCount = nearbyReports.filter((r) => r.severity === "low").length;

          hotspots.push({
            latitude: Number(report.latitude),
            longitude: Number(report.longitude),
            reports: nearbyReports.length,
            riskScore,
            level: riskScore >= 8 ? "high" : riskScore >= 5 ? "medium" : "low",
            highCount,
            mediumCount,
            lowCount,
            incidents: nearbyReports.slice(0, 5),
          });
        }
      }
    });

    return hotspots;
  };

  const hotspots = calculateHotspots();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    getUserLocation();
    fetchReports();

    const interval = setInterval(fetchReports, 10000);
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    if (!userLocation || reports.length === 0) return;

    const nearby = reports
      .map((report) => {
        const distance = getDistance(
          userLocation,
          {
            latitude: Number(report.latitude),
            longitude: Number(report.longitude),
          }
        );

        return { ...report, distance };
      })
      .filter((report) => report.distance <= 3000)
      .sort((a, b) => a.distance - b.distance);

    setNearbyIncidents(nearby);
  }, [userLocation, reports]);

  const getUserLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => console.log("Location error:", error)
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
    localStorage.removeItem("user");
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

          {user?.role === "admin" && (
            <button onClick={() => navigate("/admin")}>🛡 Admin Panel</button>
          )}

          <button onClick={() => navigate("/analytics")}>⌁ Threat Analytics</button>
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
              {nearbyIncidents.length} incident(s) detected within 3 km of your location.
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
          <StatCard icon="📁" title="Total Incidents" value={reports.length} note="Live from database" />
          <StatCard icon="🎯" title="High Risk Reports" value={reports.filter((r) => r.severity === "high").length} note="High severity incidents" danger />
          <StatCard icon="🚨" title="Pending Reports" value={reports.filter((r) => r.status === "pending").length} note="Need verification" danger />
          <StatCard icon="🛡️" title="Verified Reports" value={reports.filter((r) => r.status === "verified").length} note="Confirmed incidents" />
          <StatCard icon="🔥" title="Crime Hotspots" value={hotspots.length} note="Detected within 500m clusters" danger />
        </section>

        <section className="content-grid">
          <div className={isMapFullScreen ? "map-fullscreen" : "panel map-panel"}>
            <div className="panel-header">
              <h3>LIVE RISK MAP</h3>

              <div className="map-controls">
                <select value={mapView} onChange={(e) => setMapView(e.target.value)}>
                  <option value="markers">Markers</option>
                  <option value="heatmap">Heatmap</option>
                  <option value="both">Both</option>
                </select>

                <button onClick={() => setIsMapFullScreen(!isMapFullScreen)}>
                  {isMapFullScreen ? "Exit Fullscreen" : "Open Fullscreen"}
                </button>
              </div>
            </div>

            <div className={isMapFullScreen ? "fullscreen-map-box" : "dashboard-map"}>
              <MapContainer
                center={[22.7196, 75.8577]}
                zoom={12}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution="© OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {(mapView === "heatmap" || mapView === "both") && (
                  <HeatmapLayer points={heatmapPoints} />
                )}

                {(mapView === "markers" || mapView === "both") &&
                  reports.map((report) => (
                    <Marker
                      key={report.id}
                      position={[Number(report.latitude), Number(report.longitude)]}
                      icon={getIcon(report.severity)}
                    >
                      <Popup>
                        <h3>{report.incident_type}</h3>
                        <p>{report.description}</p>
                        <p><strong>Severity:</strong> {report.severity}</p>
                        <p><strong>Status:</strong> {report.status}</p>
                      </Popup>
                    </Marker>
                  ))}

                {hotspots.map((hotspot, index) => (
                  <Circle
                    key={index}
                    center={[hotspot.latitude, hotspot.longitude]}
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
                      <div className="hotspot-popup">
                        <h3>⚠ Hotspot Intelligence</h3>
                        <p><strong>Risk Level:</strong> {hotspot.level.toUpperCase()}</p>
                        <p><strong>Risk Score:</strong> {hotspot.riskScore}</p>
                        <p><strong>Total Reports:</strong> {hotspot.reports}</p>

                        <hr />

                        <p>🔴 High: {hotspot.highCount}</p>
                        <p>🟡 Medium: {hotspot.mediumCount}</p>
                        <p>🟢 Low: {hotspot.lowCount}</p>

                        <hr />

                        <strong>Recent Incidents</strong>

                        {hotspot.incidents.map((incident) => (
                          <p key={incident.id}>
                            • {incident.incident_type} — {incident.severity}
                          </p>
                        ))}

                        <hr />

                        <p>
                          <strong>Recommended Action:</strong>{" "}
                          {hotspot.level === "high"
                            ? "Increase patrols immediately"
                            : hotspot.level === "medium"
                            ? "Monitor area closely"
                            : "Keep under observation"}
                        </p>
                      </div>
                    </Popup>
                  </Circle>
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
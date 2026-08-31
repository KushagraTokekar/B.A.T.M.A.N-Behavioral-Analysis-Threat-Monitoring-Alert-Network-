import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MapPanel from "../components/MapPanel";
import { getDistance } from "geolib";
import L from "leaflet";
import api from "../services/api";
import "leaflet/dist/leaflet.css";
import "./Dashboard.css";
import DashboardStats from "../components/DashboardStats";
import ActiveAlerts from "../components/ActiveAlerts";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [reports, setReports] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [mapView, setMapView] = useState("both");

  const heatmapPoints = reports.map((report) => [
  Number(report.latitude),
  Number(report.longitude),
  (report.threat_score || 0) / 100,
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

  const nearbyIncidents = useMemo(() => {
    if (!userLocation) return [];
    return reports.map((report) => ({ ...report, distance: getDistance(userLocation, { latitude: Number(report.latitude), longitude: Number(report.longitude) }) })).filter((report) => report.distance <= 3000).sort((a, b) => a.distance - b.distance);
  }, [userLocation, reports]);

  function getUserLocation() {
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

  async function fetchReports() {
    try {
      const res = await api.get("/reports");
      setReports(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  }

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

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

        <DashboardStats
    reports={reports}
    hotspots={hotspots}
/>

        <section className="content-grid">
  <MapPanel
    reports={reports}
    hotspots={hotspots}
    heatmapPoints={heatmapPoints}
    mapView={mapView}
    setMapView={setMapView}
    isMapFullScreen={isMapFullScreen}
    setIsMapFullScreen={setIsMapFullScreen}
    getIcon={getIcon}
  />

  <ActiveAlerts reports={reports} />
</section>
      </main>
    </div>
  );
}

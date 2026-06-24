import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function MyReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/");
        return;
      }

      const res = await api.get("/reports/my", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReports(res.data);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>My Reports</h1>
          <button onClick={() => navigate("/dashboard")} style={styles.backButton}>
            Back to Dashboard
          </button>
        </div>

        {loading ? (
          <p>Loading reports...</p>
        ) : reports.length === 0 ? (
          <p>No reports submitted yet.</p>
        ) : (
          <div style={styles.grid}>
            {reports.map((report) => (
              <div key={report.id} style={styles.card}>
                <h2>{report.incident_type}</h2>

                <p>{report.description}</p>

                <div style={styles.info}>
                  <span>Severity: {report.severity}</span>
                  <span>Status: {report.status}</span>
                </div>

                <div style={styles.location}>
                  <small>Lat: {report.latitude}</small>
                  <small>Lng: {report.longitude}</small>
                </div>

                <small>
                  Reported: {new Date(report.created_at).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    color: "white",
    padding: "30px",
  },
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
  },
  backButton: {
    padding: "10px 15px",
    background: "#334155",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "18px",
  },
  card: {
    background: "#020617",
    border: "1px solid #334155",
    borderRadius: "12px",
    padding: "20px",
  },
  info: {
    display: "flex",
    justifyContent: "space-between",
    margin: "15px 0",
    color: "#facc15",
  },
  location: {
    display: "flex",
    justifyContent: "space-between",
    color: "#94a3b8",
    marginBottom: "10px",
  },
};
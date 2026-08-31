import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./PageStyle.css";

export default function MyReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReports();
  }, []);

  async function fetchMyReports() {
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

      setReports(res.data.data || []);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  const getStatusClass = (status) => {
    if (status === "verified") return "status-verified";
    if (status === "rejected") return "status-rejected";
    if (status === "resolved") return "status-resolved";
    return "status-submitted";
  };

  return (
    <div className="tactical-page">
      <div className="tactical-card tactical-wide">
        <h1 className="tactical-title">My Reports</h1>
        <p className="tactical-subtitle">
          Track all incidents submitted by your operator account.
        </p>

        {loading ? (
          <p className="tactical-empty">Loading reports...</p>
        ) : reports.length === 0 ? (
          <p className="tactical-empty">No reports submitted yet.</p>
        ) : (
          <div className="reports-grid">
            {reports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-card-header">
                  <h2>{report.incident_type}</h2>
                  <span className={getStatusClass(report.status)}>
                    {report.status}
                  </span>
                </div>

                <p className="report-desc">{report.description}</p>

                <div className="report-info">
                  <span>Severity</span>
                  <strong>{report.severity}</strong>
                </div>

                <div className="report-location">
                  <small>Lat: {report.latitude}</small>
                  <small>Lng: {report.longitude}</small>
                </div>

                <small className="report-time">
                  Reported: {new Date(report.created_at).toLocaleString()}
                </small>
              </div>
            ))}
          </div>
        )}

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
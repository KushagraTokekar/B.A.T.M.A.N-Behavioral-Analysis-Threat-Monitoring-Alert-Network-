import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./PageStyle.css";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || user.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    fetchReports();
  }, [navigate]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/admin/reports", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setReports(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateStatus = async (id, action) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/admin/reports/${id}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchReports();
    } catch (err) {
      console.log(err);
    }
  };

  const stats = {
    total: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    verified: reports.filter((r) => r.status === "verified").length,
    fake: reports.filter((r) => r.status === "fake").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
  };

  return (
    <div className="tactical-page">
      <div className="tactical-card tactical-wide">
        <h1 className="tactical-title">BATMAN Admin Command Center</h1>

        <p className="tactical-subtitle">
          Verify, reject, and resolve incident reports from the control panel.
        </p>

        <div className="admin-stats">
          <AdminStatCard title="Total" value={stats.total} />
          <AdminStatCard title="Pending" value={stats.pending} />
          <AdminStatCard title="Verified" value={stats.verified} />
          <AdminStatCard title="Fake" value={stats.fake} />
          <AdminStatCard title="Resolved" value={stats.resolved} />
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Incident</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Reporter</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.id}</td>
                  <td>{report.incident_type}</td>
                  <td>{report.severity}</td>
                  <td>
                    <span className={`admin-status ${report.status}`}>
                      {report.status}
                    </span>
                  </td>
                  <td>{report.reporter_name || "Unknown"}</td>

                  <td className="admin-actions">
                    <button
                      className="verify-btn"
                      onClick={() => updateStatus(report.id, "verify")}
                    >
                      Verify
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => updateStatus(report.id, "reject")}
                    >
                      Reject
                    </button>

                    <button
                      className="resolve-btn"
                      onClick={() => updateStatus(report.id, "resolve")}
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={() => navigate("/dashboard")}
          className="tactical-secondary"
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
}

function AdminStatCard({ title, value }) {
  return (
    <div className="admin-stat-card">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}
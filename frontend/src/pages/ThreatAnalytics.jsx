import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./PageStyle.css";

export default function ThreatAnalytics() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const res = await api.get("/reports");
      setReports(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  }

  const countBy = (key) => {
    return reports.reduce((acc, report) => {
      const value = report[key] || "Unknown";
      acc[value] = (acc[value] || 0) + 1;
      return acc;
    }, {});
  };

  const incidentCounts = countBy("incident_type");
  const severityCounts = countBy("severity");
  const statusCounts = countBy("status");

  const highRiskCount = reports.filter((r) => r.severity === "high").length;
  const pendingCount = reports.filter((r) => r.status === "submitted").length;

  const riskScore = Math.min(
    100,
    highRiskCount * 20 + pendingCount * 8 + reports.length * 3
  );

  const getRiskLabel = () => {
    if (riskScore >= 75) return "HIGH RISK";
    if (riskScore >= 40) return "MEDIUM RISK";
    return "LOW RISK";
  };

  return (
    <div className="tactical-page">
      <div className="tactical-card tactical-wide">
        <h1 className="tactical-title">Threat Analytics</h1>
        <p className="tactical-subtitle">
          Real-time intelligence summary generated from submitted incident data.
        </p>

        <div className="analytics-stats">
          <AnalyticsCard title="Total Reports" value={reports.length} />
          <AnalyticsCard title="High Risk" value={highRiskCount} />
          <AnalyticsCard title="Submitted" value={pendingCount} />
          <AnalyticsCard title="Risk Score" value={`${riskScore}/100`} />
        </div>

        <div className="analytics-grid">
          <AnalyticsBlock title="Incident Distribution" data={incidentCounts} />
          <AnalyticsBlock title="Severity Breakdown" data={severityCounts} />
          <AnalyticsBlock title="Status Breakdown" data={statusCounts} />

          <div className="analytics-panel">
            <h2>AI Risk Summary</h2>
            <div className="risk-score-box">
              <h1>{riskScore}</h1>
              <p>{getRiskLabel()}</p>
            </div>
            <p className="analytics-note">
              Score is calculated using number of reports, submitted reports, and
              high-severity incidents.
            </p>
          </div>
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

function AnalyticsCard({ title, value }) {
  return (
    <div className="analytics-card">
      <p>{title}</p>
      <h2>{value}</h2>
    </div>
  );
}

function AnalyticsBlock({ title, data }) {
  const entries = Object.entries(data);
  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  return (
    <div className="analytics-panel">
      <h2>{title}</h2>

      {entries.length === 0 ? (
        <p className="analytics-note">No data available</p>
      ) : (
        entries.map(([label, value]) => {
          const percent = total ? Math.round((value / total) * 100) : 0;

          return (
            <div key={label} className="analytics-row">
              <div>
                <strong>{label}</strong>
                <span>{value} report(s)</span>
              </div>

              <div className="analytics-bar">
                <span style={{ width: `${percent}%` }}></span>
              </div>

              <small>{percent}%</small>
            </div>
          );
        })
      )}
    </div>
  );
}
export default function DashboardStats({ reports, hotspots }) {
  return (
    <section className="stats-grid">
      <StatCard
        icon="📁"
        title="Total Incidents"
        value={reports.length}
        note="Live from database"
      />

      <StatCard
        icon="🎯"
        title="AI Critical Threats"
        value={reports.filter(r => (r.threat_score || 0) >= 80).length}
        note="Threat Score ≥ 80"
        danger
      />

      <StatCard
        icon="🚨"
        title="Pending Reports"
        value={reports.filter(r => r.status === "pending").length}
        note="Awaiting Verification"
        danger
      />

      <StatCard
        icon="🛡️"
        title="Verified Reports"
        value={reports.filter(r => r.status === "verified").length}
        note="Confirmed Incidents"
      />

      <StatCard
        icon="🔥"
        title="Crime Hotspots"
        value={hotspots.length}
        note="Detected Clusters"
        danger
      />
    </section>
  );
}

function StatCard({ icon, title, value, note, danger }) {
  return (
    <div className="stat-card">
      <div className={danger ? "stat-icon danger" : "stat-icon"}>
        {icon}
      </div>

      <div>
        <p>{title}</p>
        <h2>{value}</h2>
        <small className={danger ? "danger-text" : ""}>
          {note}
        </small>
      </div>
    </div>
  );
}
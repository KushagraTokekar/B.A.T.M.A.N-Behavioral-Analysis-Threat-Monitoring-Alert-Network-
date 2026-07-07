export default function ActiveAlerts({ reports }) {

  const alerts = [...reports]
    .sort((a, b) => (b.threat_score || 0) - (a.threat_score || 0))
    .slice(0, 5);

  return (
    <div className="panel alerts">

      <div className="panel-header">
        <h3>ACTIVE ALERTS</h3>
      </div>

      {alerts.length === 0 ? (
        <p>No active alerts.</p>
      ) : (
        alerts.map((report) => (
          <Alert
            key={report.id}
            title={report.incident_type}
            place={report.description}
            level={report.severity.toUpperCase()}
            threat={report.threat_score}
          />
        ))
      )}

    </div>
  );
}

function Alert({ title, place, level, threat }) {

  let color = "#22c55e";

  if (threat >= 80) color = "#ef4444";
  else if (threat >= 50) color = "#f59e0b";

  return (
    <div className="alert-row">

      <div>

        <strong>{title}</strong>

        <p>{place}</p>

      </div>

      <div style={{ textAlign: "right" }}>

        <span>{level}</span>

        <p
          style={{
            color,
            marginTop: 8,
            fontWeight: "bold"
          }}
        >
          AI: {threat || 0}%
        </p>

      </div>

    </div>
  );
}
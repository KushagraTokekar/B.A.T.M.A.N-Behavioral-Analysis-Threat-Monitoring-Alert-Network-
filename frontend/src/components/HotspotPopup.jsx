export default function HotspotPopup({ hotspot }) {
  return (
    <div className="hotspot-popup">

      <h3>⚠ HOTSPOT INTELLIGENCE</h3>

      <p>
        <strong>Risk Level:</strong>{" "}
        {hotspot.level.toUpperCase()}
      </p>

      <p>
        <strong>Risk Score:</strong>{" "}
        {hotspot.riskScore}
      </p>

      <p>
        <strong>Total Reports:</strong>{" "}
        {hotspot.reports}
      </p>

      <hr />

      <p>🔴 High Severity : {hotspot.highCount}</p>
      <p>🟡 Medium Severity : {hotspot.mediumCount}</p>
      <p>🟢 Low Severity : {hotspot.lowCount}</p>

      <hr />

      <strong>Recent Incidents</strong>

      {hotspot.incidents.map((incident) => (
        <p key={incident.id}>
          • {incident.incident_type} ({incident.severity})
        </p>
      ))}

      <hr />

      <p>
        <strong>Recommended Action</strong>
      </p>

      <p>
        {hotspot.level === "high"
          ? "Deploy patrol immediately."
          : hotspot.level === "medium"
          ? "Increase surveillance."
          : "Continue monitoring."}
      </p>

    </div>
  );
}
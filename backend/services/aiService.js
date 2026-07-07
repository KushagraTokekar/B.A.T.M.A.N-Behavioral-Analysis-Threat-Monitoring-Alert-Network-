exports.analyzeHotspot = (hotspot) => {
  let score = 0;
  const reasons = [];

  // Nearby reports
  score += hotspot.reports * 3;
  reasons.push(`${hotspot.reports} reports detected nearby`);

  // High severity incidents
  if (hotspot.highCount > 0) {
    score += hotspot.highCount * 10;
    reasons.push(`${hotspot.highCount} high severity incidents`);
  }

  // Medium severity incidents
  if (hotspot.mediumCount > 0) {
    score += hotspot.mediumCount * 5;
    reasons.push(`${hotspot.mediumCount} medium severity incidents`);
  }

  // Existing hotspot score
  score += hotspot.riskScore * 4;

  // Clamp score
  score = Math.min(score, 100);

  let riskLevel = "LOW";

  if (score >= 85)
    riskLevel = "CRITICAL";
  else if (score >= 65)
    riskLevel = "HIGH";
  else if (score >= 40)
    riskLevel = "MEDIUM";

  // AI confidence
  let confidence = 60;

  confidence += hotspot.highCount * 5;
  confidence += hotspot.mediumCount * 2;
  confidence += hotspot.reports;

  confidence = Math.min(confidence, 99);

  // Trend detection
  let trend = "Stable";

  if (hotspot.reports >= 5)
    trend = "Increasing";

  if (hotspot.reports >= 8)
    trend = "Rapid Increase";

  if (hotspot.highCount >= 4)
    trend = "Critical Escalation";

  // Estimated response time
  let responseTime = "30-45 mins";

  if (riskLevel === "MEDIUM")
    responseTime = "20-30 mins";

  if (riskLevel === "HIGH")
    responseTime = "10-15 mins";

  if (riskLevel === "CRITICAL")
    responseTime = "Immediate";

  // Recommended action
  let recommendation = "Continue Monitoring";

  switch (riskLevel) {
    case "MEDIUM":
      recommendation =
        "Increase patrol frequency and monitor CCTV feeds.";
      break;

    case "HIGH":
      recommendation =
        "Deploy police patrols and notify nearby units.";
      break;

    case "CRITICAL":
      recommendation =
        "Immediate tactical deployment. Notify control room and emergency response teams.";
      break;
  }

  // Threat color
  let color = "#22c55e";

  if (riskLevel === "MEDIUM")
    color = "#facc15";

  if (riskLevel === "HIGH")
    color = "#f97316";

  if (riskLevel === "CRITICAL")
    color = "#ef4444";

  return {
    prediction: score,
    confidence,
    riskLevel,
    recommendation,
    trend,
    responseTime,
    color,
    reasons,
  };
};
const HIGH_RISK_TERMS = /\b(gun|weapon|knife|blood|fire|bomb|explosion|shooting|robbery|assault|kidnap|terror|violence|riot)\b/gi;

function calculateThreatScore({ severity, description, nearbyCount = 0 }) {
  const severityScore = { low: 20, medium: 35, high: 50 }[severity] ?? 0;
  const length = description.trim().length;
  const detailScore = length > 150 ? 20 : length > 80 ? 15 : length > 40 ? 10 : 5;
  const keywordScore = Math.min((description.match(HIGH_RISK_TERMS) || []).length * 3, 15);
  return Math.max(0, Math.min(100, severityScore + detailScore + keywordScore + Math.min(nearbyCount * 5, 30)));
}

function assessAuthenticity({ description, duplicateCount = 0, recentUserCount = 0 }) {
  let score = 70;
  if (description.trim().length >= 80) score += 10;
  if (/[.!?]/.test(description)) score += 5;
  score -= Math.min(duplicateCount * 25, 50);
  score -= Math.min(Math.max(recentUserCount - 1, 0) * 8, 24);
  score = Math.max(0, Math.min(100, score));
  const falseReportRisk = score >= 75 ? "low" : score >= 45 ? "medium" : "high";
  return { authenticityScore: score, falseReportRisk, requiresHumanReview: duplicateCount > 0 || score < 45 };
}

module.exports = { calculateThreatScore, assessAuthenticity };

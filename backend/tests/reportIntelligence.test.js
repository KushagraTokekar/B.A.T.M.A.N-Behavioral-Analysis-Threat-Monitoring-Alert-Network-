const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateThreatScore, assessAuthenticity } = require("../services/reportIntelligence");
test("threat score increases with severity, detail, and nearby reports", () => {
  const low = calculateThreatScore({ severity: "low", description: "A detailed report with sufficient context.", nearbyCount: 0 });
  const high = calculateThreatScore({ severity: "high", description: "A gun robbery was reported with multiple witnesses and a clear description of events.", nearbyCount: 4 });
  assert.ok(high > low); assert.ok(high <= 100);
});
test("duplicate reports are flagged for human review and are never auto-rejected", () => {
  const assessment = assessAuthenticity({ description: "A witness provided a detailed account of the incident location.", duplicateCount: 1, recentUserCount: 1 });
  assert.equal(assessment.requiresHumanReview, true); assert.equal(assessment.falseReportRisk, "medium");
});
test("well-described non-duplicate report has a bounded authenticity score", () => {
  const assessment = assessAuthenticity({ description: "A witness observed an incident and provided location, timing, and distinguishing details.", duplicateCount: 0, recentUserCount: 0 });
  assert.ok(assessment.authenticityScore >= 0 && assessment.authenticityScore <= 100); assert.equal(assessment.falseReportRisk, "low");
});

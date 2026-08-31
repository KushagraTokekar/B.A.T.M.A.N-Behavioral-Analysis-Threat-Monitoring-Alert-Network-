const db = require("../db");
const { calculateThreatScore, assessAuthenticity } = require("../services/reportIntelligence");

const INCIDENT_TYPES = new Set(["Theft", "Robbery", "Assault", "Harassment", "Missing person", "Accident", "Fire", "Vandalism", "Cybercrime", "Suspicious activity", "Drug-related activity", "Other"]);
const SEVERITIES = new Set(["low", "medium", "high"]);

exports.createReport = async (req, res, next) => {
  try {
    const { incident_type, title, description, latitude, longitude, severity, occurred_at } = req.body;
    const type = typeof incident_type === "string" ? incident_type.trim() : "";
    const detail = typeof description === "string" ? description.trim() : "";
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!INCIDENT_TYPES.has(type) || !SEVERITIES.has(severity) || detail.length < 15 || detail.length > 5000 || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ message: "Provide a valid incident type, severity, detailed description, and location." });
    }
    if (title !== undefined && (typeof title !== "string" || title.trim().length > 160)) {
      return res.status(400).json({ message: "Title must be 160 characters or fewer." });
    }
    const [recent] = await db.query("SELECT COUNT(*) AS count FROM reports WHERE user_id = ? AND created_at >= NOW() - INTERVAL 10 MINUTE", [req.user.id]);
    if (recent[0].count >= 3) return res.status(429).json({ message: "Too many reports submitted in a short time. Please wait." });
    const [duplicates] = await db.query("SELECT id FROM reports WHERE user_id = ? AND incident_type = ? AND ABS(latitude - ?) <= 0.001 AND ABS(longitude - ?) <= 0.001 AND created_at >= NOW() - INTERVAL 30 MINUTE", [req.user.id, type, lat, lng]);
    const [nearby] = await db.query("SELECT id FROM reports WHERE ABS(latitude - ?) <= 0.01 AND ABS(longitude - ?) <= 0.01 AND status NOT IN ('rejected') AND created_at >= NOW() - INTERVAL 24 HOUR", [lat, lng]);
    const threatScore = calculateThreatScore({ severity, description: detail, nearbyCount: nearby.length });
    const authenticity = assessAuthenticity({ description: detail, duplicateCount: duplicates.length, recentUserCount: recent[0].count });
    const [result] = await db.query("INSERT INTO reports (user_id, incident_type, title, description, latitude, longitude, severity, status, threat_score, authenticity_score, ai_review_required, occurred_at) VALUES (?, ?, ?, ?, ?, ?, ?, 'submitted', ?, ?, ?, COALESCE(?, NOW()))", [req.user.id, type, title?.trim() || null, detail, lat, lng, severity, threatScore, authenticity.authenticityScore, authenticity.requiresHumanReview, occurred_at || null]);
    return res.status(201).json({ message: "Report submitted for human review.", reportId: result.insertId, threatScore, authenticity });
  } catch (error) { next(error); }
};

exports.getAllReports = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 250);
    const [reports] = await db.query("SELECT id, incident_type, title, description, latitude, longitude, severity, status, threat_score, authenticity_score, occurred_at, created_at FROM reports WHERE status IN ('verified', 'resolved') ORDER BY occurred_at DESC LIMIT ?", [limit]);
    res.json({ data: reports, pagination: { limit, count: reports.length } });
  } catch (error) { next(error); }
};

exports.getMyReports = async (req, res, next) => {
  try {
    const [reports] = await db.query("SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC", [req.user.id]);
    res.json({ data: reports });
  } catch (error) { next(error); }
};

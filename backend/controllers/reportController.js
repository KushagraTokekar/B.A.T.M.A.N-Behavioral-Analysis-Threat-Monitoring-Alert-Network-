const db = require("../db");

exports.createReport = async (req, res) => {
  try {
    const { incident_type, description, latitude, longitude, severity } = req.body;
    const user_id = req.user.id;

    if (!incident_type || !description || !latitude || !longitude || !severity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (description.trim().length < 15) {
      return res.status(400).json({
        message: "Description is too short. Please provide more details.",
      });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ message: "Invalid location selected" });
    }

    const [recentReports] = await db.query(
      `SELECT * FROM reports 
       WHERE user_id = ? 
       AND created_at >= NOW() - INTERVAL 10 MINUTE`,
      [user_id]
    );

    if (recentReports.length >= 3) {
      return res.status(429).json({
        message: "Too many reports submitted in a short time. Please wait.",
      });
    }

    const [duplicates] = await db.query(
      `SELECT * FROM reports
       WHERE user_id = ?
       AND incident_type = ?
       AND ABS(latitude - ?) < 0.001
       AND ABS(longitude - ?) < 0.001
       AND created_at >= NOW() - INTERVAL 30 MINUTE`,
      [user_id, incident_type, latitude, longitude]
    );

    let status = "pending";

    if (duplicates.length > 0) {
      status = "fake";
    }

    await db.query(
      `INSERT INTO reports 
      (user_id, incident_type, description, latitude, longitude, severity, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user_id, incident_type, description, latitude, longitude, severity, status]
    );

    if (status === "fake") {
      return res.status(201).json({
        message: "Report submitted but marked suspicious due to duplicate activity.",
      });
    }

    res.status(201).json({ message: "Incident reported successfully" });
  } catch (error) {
    res.status(500).json({ message: "Report failed", error: error.message });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const [reports] = await db.query(`
      SELECT reports.*, users.name 
      FROM reports 
      LEFT JOIN users ON reports.user_id = users.id
      ORDER BY reports.created_at DESC
    `);

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch reports", error: error.message });
  }
};

exports.getMyReports = async (req, res) => {
  try {
    const [reports] = await db.query(
      "SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );

    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch your reports", error: error.message });
  }
};
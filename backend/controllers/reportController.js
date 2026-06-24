const db = require("../db");

exports.createReport = async (req, res) => {
  try {
    const { incident_type, description, latitude, longitude, severity } = req.body;
    const user_id = req.user.id;

    await db.query(
      `INSERT INTO reports 
      (user_id, incident_type, description, latitude, longitude, severity) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, incident_type, description, latitude, longitude, severity]
    );

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
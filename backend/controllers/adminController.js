const db = require("../db");

exports.getAllReportsAdmin = async (req, res) => {
  try {
    const [reports] = await db.query(`
      SELECT 
        reports.*,
        users.name AS reporter_name,
        users.email AS reporter_email
      FROM reports
      LEFT JOIN users ON reports.user_id = users.id
      ORDER BY reports.created_at DESC
    `);

    res.json(reports);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch admin reports",
      error: error.message,
    });
  }
};

exports.verifyReport = async (req, res) => {
  try {
    await db.query("UPDATE reports SET status = 'verified' WHERE id = ?", [
      req.params.id,
    ]);

    res.json({ message: "Report verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to verify report", error: error.message });
  }
};

exports.rejectReport = async (req, res) => {
  try {
    await db.query("UPDATE reports SET status = 'fake' WHERE id = ?", [
      req.params.id,
    ]);

    res.json({ message: "Report rejected as fake" });
  } catch (error) {
    res.status(500).json({ message: "Failed to reject report", error: error.message });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    await db.query("UPDATE reports SET status = 'resolved' WHERE id = ?", [
      req.params.id,
    ]);

    res.json({ message: "Report resolved successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to resolve report", error: error.message });
  }
};
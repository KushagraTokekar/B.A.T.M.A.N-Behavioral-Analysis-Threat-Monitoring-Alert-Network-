const db = require("../db");
const transitions = { verify: "verified", reject: "rejected", resolve: "resolved", review: "under_review" };

exports.getAllReportsAdmin = async (req, res, next) => {
  try {
    const [reports] = await db.query("SELECT reports.*, users.name AS reporter_name, users.email AS reporter_email FROM reports LEFT JOIN users ON reports.user_id = users.id ORDER BY reports.created_at DESC LIMIT 500");
    res.json({ data: reports });
  } catch (error) { next(error); }
};

exports.updateReportStatus = async (req, res, next) => {
  try {
    const status = transitions[req.params.action];
    if (!status) return res.status(400).json({ message: "Invalid report action." });
    const [result] = await db.query("UPDATE reports SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?", [status, req.user.id, req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: "Report not found." });
    res.json({ message: `Report marked ${status.replace("_", " ")}.`, status });
  } catch (error) { next(error); }
};

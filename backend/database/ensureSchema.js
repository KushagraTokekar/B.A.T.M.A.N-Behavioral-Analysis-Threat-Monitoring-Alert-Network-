const db = require("../db");

const reportColumns = {
  title: "VARCHAR(160) NULL AFTER incident_type",
  threat_score: "TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER status",
  authenticity_score: "TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER threat_score",
  ai_review_required: "BOOLEAN NOT NULL DEFAULT FALSE AFTER authenticity_score",
  occurred_at: "DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER ai_review_required",
  reviewed_by: "INT NULL AFTER occurred_at",
  reviewed_at: "DATETIME NULL AFTER reviewed_by",
};

async function hasColumn(name) {
  const [rows] = await db.query(
    "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reports' AND COLUMN_NAME = ?",
    [name],
  );
  return rows.length > 0;
}

async function hasIndex(name) {
  const [rows] = await db.query(
    "SELECT 1 FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reports' AND INDEX_NAME = ?",
    [name],
  );
  return rows.length > 0;
}

async function ensureReportSchema() {
  for (const [name, definition] of Object.entries(reportColumns)) {
    if (!(await hasColumn(name))) await db.query(`ALTER TABLE reports ADD COLUMN ${name} ${definition}`);
  }

  // Expand the enum before translating legacy values; assigning a new enum value
  // before this step would fail on databases created from the original schema.
  await db.query("ALTER TABLE reports MODIFY status ENUM('pending', 'fake', 'submitted', 'under_review', 'verified', 'rejected', 'resolved') NOT NULL DEFAULT 'submitted'");
  await db.query("UPDATE reports SET status = 'submitted' WHERE status = 'pending'");
  await db.query("UPDATE reports SET status = 'rejected' WHERE status = 'fake'");
  await db.query("ALTER TABLE reports MODIFY status ENUM('submitted', 'under_review', 'verified', 'rejected', 'resolved') NOT NULL DEFAULT 'submitted'");

  if (!(await hasIndex("idx_reports_map"))) await db.query("ALTER TABLE reports ADD INDEX idx_reports_map (status, occurred_at, severity)");
  if (!(await hasIndex("idx_reports_reporter_created"))) await db.query("ALTER TABLE reports ADD INDEX idx_reports_reporter_created (user_id, created_at)");
}

module.exports = { ensureReportSchema };

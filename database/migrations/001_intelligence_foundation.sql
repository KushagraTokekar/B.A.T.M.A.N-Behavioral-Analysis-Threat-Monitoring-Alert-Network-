-- Apply after database/batman.sql. This migration preserves existing report records.
ALTER TABLE reports
  ADD COLUMN title VARCHAR(160) NULL AFTER incident_type,
  ADD COLUMN threat_score TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER status,
  ADD COLUMN authenticity_score TINYINT UNSIGNED NOT NULL DEFAULT 0 AFTER threat_score,
  ADD COLUMN ai_review_required BOOLEAN NOT NULL DEFAULT FALSE AFTER authenticity_score,
  ADD COLUMN occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER ai_review_required,
  ADD COLUMN reviewed_by INT NULL AFTER occurred_at,
  ADD COLUMN reviewed_at DATETIME NULL AFTER reviewed_by,
  ADD INDEX idx_reports_map (status, occurred_at, severity),
  ADD INDEX idx_reports_reporter_created (user_id, created_at),
  ADD CONSTRAINT fk_reports_reviewer FOREIGN KEY (reviewed_by) REFERENCES users(id);
-- MySQL enum changes require explicit alteration on installations created from the legacy schema.
ALTER TABLE reports MODIFY status ENUM('submitted','under_review','verified','rejected','resolved') NOT NULL DEFAULT 'submitted';

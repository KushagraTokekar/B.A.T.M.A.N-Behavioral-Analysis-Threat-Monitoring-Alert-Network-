CREATE DATABASE batman_db;
USE batman_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    incident_type VARCHAR(100),
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    severity ENUM('low', 'medium', 'high') DEFAULT 'medium',
    status ENUM('submitted', 'under_review', 'verified', 'rejected', 'resolved') NOT NULL DEFAULT 'submitted',
    threat_score TINYINT UNSIGNED NOT NULL DEFAULT 0,
    authenticity_score TINYINT UNSIGNED NOT NULL DEFAULT 0,
    ai_review_required BOOLEAN NOT NULL DEFAULT FALSE,
    occurred_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INT NULL,
    reviewed_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reviewed_by) REFERENCES users(id),
    INDEX idx_reports_map (status, occurred_at, severity),
    INDEX idx_reports_reporter_created (user_id, created_at)
);
const db = require("../db");

exports.createReport = async (req, res) => {
  try {
    const {
      incident_type,
      description,
      latitude,
      longitude,
      severity,
    } = req.body;

    const user_id = req.user.id;

    // ---------------- Validation ----------------

    if (
      !incident_type ||
      !description ||
      latitude === undefined ||
      longitude === undefined ||
      !severity
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (description.trim().length < 15) {
      return res.status(400).json({
        message:
          "Description is too short. Please provide more details.",
      });
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        message: "Invalid location selected",
      });
    }

    // ---------------- Spam Protection ----------------

    const [recentReports] = await db.query(
      `
      SELECT *
      FROM reports
      WHERE user_id = ?
      AND created_at >= NOW() - INTERVAL 10 MINUTE
      `,
      [user_id]
    );

    if (recentReports.length >= 3) {
      return res.status(429).json({
        message:
          "Too many reports submitted in a short time. Please wait.",
      });
    }

    // ---------------- Duplicate Detection ----------------

    const [duplicates] = await db.query(
      `
      SELECT *
      FROM reports
      WHERE user_id = ?
      AND incident_type = ?
      AND ABS(latitude - ?) <= 0.001
      AND ABS(longitude - ?) <= 0.001
      AND created_at >= NOW() - INTERVAL 30 MINUTE
      `,
      [user_id, incident_type, latitude, longitude]
    );

    let status = "pending";
    let threatScore = 0;

    // ---------------- Severity Score ----------------

    switch (severity) {
      case "high":
        threatScore += 50;
        break;

      case "medium":
        threatScore += 35;
        break;

      default:
        threatScore += 20;
    }

    // ---------------- Description Length ----------------

    const len = description.trim().length;

    if (len > 150)
      threatScore += 20;
    else if (len > 80)
      threatScore += 15;
    else if (len > 40)
      threatScore += 10;
    else
      threatScore += 5;

    // ---------------- AI Keyword Detection ----------------

    const keywords = [
      "gun",
      "weapon",
      "knife",
      "blood",
      "fire",
      "bomb",
      "explosion",
      "shooting",
      "robbery",
      "assault",
      "kidnap",
      "fight",
      "terror",
      "accident",
      "violence",
      "riot",
    ];

    const text = description.toLowerCase();

    let keywordScore = 0;

    keywords.forEach((word) => {
      if (text.includes(word)) {
        keywordScore += 3;
      }
    });

    threatScore += Math.min(keywordScore, 15);

    // ---------------- Nearby Reports ----------------

    const [nearbyReports] = await db.query(
      `
      SELECT *
      FROM reports
      WHERE
      ABS(latitude - ?) <= 0.01
      AND ABS(longitude - ?) <= 0.01
      AND status != 'fake'
      AND created_at >= NOW() - INTERVAL 24 HOUR
      `,
      [latitude, longitude]
    );

    threatScore += Math.min(nearbyReports.length * 5, 30);

    // ---------------- Duplicate Penalty ----------------

    if (duplicates.length > 0) {
      status = "fake";
      threatScore -= 40;
    }

    // ---------------- Clamp Score ----------------

    threatScore = Math.max(0, Math.min(100, threatScore));

    // ---------------- Save Report ----------------

    await db.query(
      `
      INSERT INTO reports
      (
        user_id,
        incident_type,
        description,
        latitude,
        longitude,
        severity,
        status,
        threat_score
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        incident_type,
        description,
        latitude,
        longitude,
        severity,
        status,
        threatScore,
      ]
    );

    // ---------------- Response ----------------

    if (status === "fake") {
      return res.status(201).json({
        message:
          "Report submitted but marked suspicious due to duplicate activity.",
        threatScore,
      });
    }

    return res.status(201).json({
      message: "Incident reported successfully.",
      threatScore,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Report failed",
      error: error.message,
    });
  }
};



// ------------------------------------------------------------
// GET ALL REPORTS
// ------------------------------------------------------------

exports.getAllReports = async (req, res) => {
  try {

    const [reports] = await db.query(`
      SELECT
        reports.*,
        users.name
      FROM reports
      LEFT JOIN users
      ON reports.user_id = users.id
      ORDER BY reports.created_at DESC
    `);

    res.json(reports);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch reports",
      error: error.message,
    });

  }
};



// ------------------------------------------------------------
// GET MY REPORTS
// ------------------------------------------------------------

exports.getMyReports = async (req, res) => {
  try {

    const [reports] = await db.query(
      `
      SELECT *
      FROM reports
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [req.user.id]
    );

    res.json(reports);

  } catch (error) {

    res.status(500).json({
      message: "Failed to fetch your reports",
      error: error.message,
    });

  }
};
const db = require("../db");
const { analyzeHotspot } = require("../services/aiService");

exports.getHotspotsAnalysis = async (req, res) => {
  try {
    const [reports] = await db.query(`
      SELECT *
      FROM reports
      WHERE status != 'rejected'
      ORDER BY created_at DESC
    `);

    const hotspots = [];

    reports.forEach((report) => {
      const nearby = reports.filter((other) => {
        const latDiff = Math.abs(
          Number(report.latitude) - Number(other.latitude)
        );

        const lngDiff = Math.abs(
          Number(report.longitude) - Number(other.longitude)
        );

        return latDiff < 0.005 && lngDiff < 0.005;
      });

      if (nearby.length < 3) return;

      const alreadyExists = hotspots.some((hotspot) => {
        return (
          Math.abs(hotspot.latitude - Number(report.latitude)) < 0.005 &&
          Math.abs(hotspot.longitude - Number(report.longitude)) < 0.005
        );
      });

      if (alreadyExists) return;

      const highCount = nearby.filter(
        (r) => r.severity === "high"
      ).length;

      const mediumCount = nearby.filter(
        (r) => r.severity === "medium"
      ).length;

      const lowCount = nearby.filter(
        (r) => r.severity === "low"
      ).length;

      const riskScore = nearby.reduce(
        (sum, r) => sum + (r.threat_score || 0),
        0
      );

      const hotspot = {
        latitude: Number(report.latitude),
        longitude: Number(report.longitude),

        reports: nearby.length,

        riskScore,

        highCount,

        mediumCount,

        lowCount,
      };

      hotspot.ai = analyzeHotspot(hotspot);

      hotspots.push(hotspot);
    });

    res.json(hotspots);

  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "AI Analysis Failed",
    });
  }
};
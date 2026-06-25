const db = require("../db");

module.exports = async function adminMiddleware(req, res, next) {
  try {
    const userId = req.user.id;

    const [users] = await db.query("SELECT role FROM users WHERE id = ?", [userId]);

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    if (users[0].role !== "admin") {
      return res.status(403).json({ message: "Admin access denied" });
    }

    next();
  } catch (error) {
    res.status(500).json({ message: "Admin verification failed", error: error.message });
  }
};
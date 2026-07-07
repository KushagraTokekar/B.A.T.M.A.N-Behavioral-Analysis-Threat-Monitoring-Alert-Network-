const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const aiRoutes = require("./routes/aiRoutes"); // <-- NEW

const app = express();

// Check MySQL Connection
db.getConnection()
  .then(() => {
    console.log("✅ MySQL Connected");
  })
  .catch((err) => {
    console.log("❌ Database Error:", err);
  });

// Middleware
app.use(cors());
app.use(express.json());

// Root Route
app.get("/", (req, res) => {
  res.send("🦇 BATMAN API is running");
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes); // <-- NEW

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🦇 BATMAN backend running on port ${PORT}`);
});
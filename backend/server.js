require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map((origin) => origin.trim());
app.disable("x-powered-by");
app.use(cors({ origin(origin, callback) { if (!origin || allowedOrigins.includes(origin)) return callback(null, true); return callback(new Error("Origin not allowed by CORS")); }, methods: ["GET", "POST", "PATCH"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json({ limit: "1mb" }));
app.get("/health", async (_req, res) => { try { await db.query("SELECT 1"); res.json({ status: "ok" }); } catch { res.status(503).json({ status: "unavailable" }); } });
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/reports", require("./routes/reportRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use((req, res) => res.status(404).json({ message: "Route not found." }));
app.use((err, _req, res, _next) => { console.error(err); res.status(err.status || 500).json({ message: err.status ? err.message : "An unexpected server error occurred." }); });
if (require.main === module) { const port = Number(process.env.PORT) || 5000; app.listen(port, () => console.log(`BATMAN API listening on ${port}`)); }
module.exports = app;

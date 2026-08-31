const mysql = require("mysql2/promise");
const required = ["DB_HOST", "DB_USER", "DB_NAME"];
if (required.some((key) => !process.env[key])) console.warn("Database environment variables are incomplete; database requests will fail until configured.");
module.exports = mysql.createPool({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT) || 3306, user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME, waitForConnections: true, connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10, queueLimit: 0, charset: "utf8mb4" });

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.signup = async (req, res, next) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const { password } = req.body;
    if (name.length < 2 || name.length > 100 || !EMAIL.test(email) || typeof password !== "string" || password.length < 12 || password.length > 128) return res.status(400).json({ message: "Provide a name, valid email, and a password of at least 12 characters." });
    const [existing] = await db.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) return res.status(409).json({ message: "Unable to register this account." });
    const hashedPassword = await bcrypt.hash(password, 12);
    await db.query("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [name, email, hashedPassword]);
    res.status(201).json({ message: "Account registered successfully. Please sign in." });
  } catch (error) { next(error); }
};

exports.login = async (req, res, next) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const { password } = req.body;
    if (!EMAIL.test(email) || typeof password !== "string") return res.status(400).json({ message: "Provide a valid email and password." });
    const [users] = await db.query("SELECT id, name, email, password, role FROM users WHERE email = ?", [email]);
    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "Invalid email or password." });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "8h", issuer: "batman-api", audience: "batman-web" });
    res.json({ message: "Login successful", token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) { next(error); }
};

const jwt = require("jsonwebtoken");
module.exports = function authMiddleware(req, res, next) {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ message: "Authentication is required." });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET, { issuer: "batman-api", audience: "batman-web" }); next(); }
  catch { return res.status(401).json({ message: "Your session is invalid or has expired." }); }
};

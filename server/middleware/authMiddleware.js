// server/middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

// Verify JWT token
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Expect header format: "Bearer <token>"
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // decoded contains { id, role } if included when signing
    next();
  } catch (err) {
    console.error("JWT verification error:", err);
    return res.status(401).json({ message: "Token expired or invalid" });
  }
};

// Middleware for nutrenist-only routes
exports.nutrenistOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "nutrenist") {
    return res.status(403).json({ message: "Nutrenist access only" });
  }
  next();
};

// Middleware for admin-only routes
exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

// Alias for clearer admin middleware usage
exports.verifyAdmin = exports.adminOnly;


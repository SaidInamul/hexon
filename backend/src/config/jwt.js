const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (userId, email) => {
  return jwt.sign(
    {
      userId,
      email,
      iat: Math.floor(Date.now() / 1000), // Issued at
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "1d", // Added fallback default
      algorithm: "HS256",
    },
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("JWT verification error:", error.message);
    return null;
  }
};

// FIX: Removed the extra () => {} wrapper
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }

  req.userId = decoded.userId;
  req.userEmail = decoded.email;

  // Proceed to the next middleware (multer, then controller)
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
};

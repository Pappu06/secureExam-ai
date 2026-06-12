const jwt = require("jsonwebtoken");
const User = require("../models/User");


// PROTECT ROUTES
const protect = async (req, res, next) => {
  let token;

  try {

    // Check token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {

      token = req.headers.authorization.split(" ")[1];

      // Verify token signature and expiry
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // Find user and verify they still exist
      const user = await User.findById(decoded.id).select("-password");

      if (!user) {
        return res.status(401).json({
          message: "User belonging to this token no longer exists",
        });
      }

      // Check tokenVersion — if the user has logged out globally
      // or changed their password, their tokenVersion will have
      // been incremented and this token is now invalid.
      if (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion) {
        return res.status(401).json({
          message: "Session has been revoked. Please log in again.",
        });
      }

      req.user = user;
      next();

    } else {
      return res.status(401).json({
        message: "Not authorized, no token provided",
      });
    }

  } catch (error) {

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token. Please log in again.",
      });
    }

    return res.status(401).json({
      message: "Authentication failed",
    });
  }
};


// ADMIN ONLY
const adminOnly = (req, res, next) => {

  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Access denied. Admin privileges required.",
    });
  }
};

module.exports = {
  protect,
  adminOnly,
};
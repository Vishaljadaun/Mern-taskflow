const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const tokenHeader = req.headers.authorization;

    if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = tokenHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;

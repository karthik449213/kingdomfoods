import jwt from "jsonwebtoken";

export default function (req, res, next) {
  let authHeader = req.header("Authorization") || req.header("authorization");

  if (!authHeader)
    return res.status(401).json({ message: "Access denied. No token provided." });

  // support both 'Bearer <token>' and raw token formats
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // store admin id inside req
    next();
  } catch (error) {
    // invalid token -> unauthorized
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

// middleware/adminAuthMiddleware.js
const jwt = require("jsonwebtoken");

function adminAuthMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ 
      error: "Token tidak ditemukan" 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user is admin
    if (!decoded.is_admin) {
      return res.status(403).json({ 
        error: "Akses ditolak. Hanya admin yang dapat mengakses." 
      });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ 
      error: "Token tidak valid" 
    });
  }
}

module.exports = adminAuthMiddleware;
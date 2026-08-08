const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

module.exports = function authMiddleware(req, res, next) {
  // Read token from cookies (requires cookie-parser)
  const token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access Denied: No Admin Token provided.' 
    });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access Denied: Invalid or expired token.' 
    });
  }
};

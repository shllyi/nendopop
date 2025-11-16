const jwt = require('jsonwebtoken');
const User = require('../models/user');

const isAuthenticated = async (req, res, next) => {
  let token;
  // Prefer Authorization header, fallback to cookie
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach minimal user info to request. Fetch isAdmin flag and check deactivation status
    const user = await User.findById(decoded.id).select('isAdmin isActive');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Your account has been deactivated. Please contact support.' });
    }
    req.user = { id: decoded.id, isAdmin: user.isAdmin };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user?.id) return res.status(401).json({ success: false, message: 'Unauthorized' });
    // If isAdmin was attached by isAuthenticated, use it. Otherwise fallback to DB.
    if (req.user.isAdmin) return next();
    const user = await User.findById(req.user.id).select('isAdmin');
    if (!user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!user.isAdmin) return res.status(403).json({ success: false, message: 'Admin access required' });
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { isAuthenticated, isAdmin };

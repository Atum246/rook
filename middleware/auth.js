const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'rook-secret-change-this';

/**
 * Generate JWT token for a user
 */
function generateToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '30d' });
}

/**
 * Verify JWT token middleware
 */
async function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No token provided 🔑' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User not found 👤' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token 🔐' });
  }
}

/**
 * Check plan limits
 */
function checkPlanLimit(req, res, next) {
  const limits = {
    free: 1,
    pro: 5,
    team: Infinity
  };

  req.agentLimit = limits[req.user.plan] || 1;
  next();
}

module.exports = { generateToken, authMiddleware, checkPlanLimit };

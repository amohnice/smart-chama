const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.error('No token provided');
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded); // Debug log

      if (!decoded.userId) {
        console.error('No userId in token');
        return res.status(401).json({ error: 'Invalid token format' });
      }

      // Find user by ID without excluding any fields
      const user = await User.findById(decoded.userId);
      console.log('Found user:', user ? {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status
      } : 'No'); // Debug log

      if (!user) {
        console.error('User not found for ID:', decoded.userId);
        return res.status(401).json({ error: 'User not found' });
      }

      if (user.status !== 'active') {
        console.error('User account not active:', user.status);
        return res.status(403).json({ error: 'Account is not active' });
      }

      req.token = token;
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Authentication error' });
  }
};

// Role-based authorization middleware
const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Unauthorized access' });
    }

    next();
  };
};

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
};

// Member middleware
const member = async (req, res, next) => {
  try {
    if (req.user.role !== 'member') {
      return res.status(403).json({ error: 'Member access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Optional authentication middleware
const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);

      if (user && user.status === 'active') {
        req.token = token;
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  auth,
  authorize,
  admin,
  member,
  optionalAuth
}; 
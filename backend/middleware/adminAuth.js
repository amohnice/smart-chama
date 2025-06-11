const User = require('../models/User');

const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error checking admin status', error: error.message });
  }
};

module.exports = { adminAuth }; 
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Setting = require('../models/Setting');

// Get all settings
router.get('/', auth, async (req, res) => {
  try {
    const settings = await Setting.find();
    const formattedSettings = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    res.json(formattedSettings);
  } catch (error) {
    console.error('Settings fetch error:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// Update settings
router.put('/', auth, authorize('admin'), async (req, res) => {
  try {
    const updates = req.body;
    const settings = await Promise.all(
      Object.entries(updates).map(async ([key, value]) => {
        const setting = await Setting.findOneAndUpdate(
          { key },
          { value },
          { new: true, upsert: true }
        );
        return setting;
      })
    );
    res.json(settings);
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
});

module.exports = router; 
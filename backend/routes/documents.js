const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const Document = require('../models/Document');

// Get all documents
router.get('/', auth, async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json(documents);
  } catch (error) {
    console.error('Documents fetch error:', error);
    res.status(500).json({ message: 'Error fetching documents' });
  }
});

// Upload new document
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, fileUrl, category } = req.body;
    const document = await Document.create({
      title,
      description,
      fileUrl,
      category,
      uploadedBy: req.user.id
    });
    res.status(201).json(document);
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ message: 'Error uploading document' });
  }
});

// Delete document
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Document deletion error:', error);
    res.status(500).json({ message: 'Error deleting document' });
  }
});

module.exports = router; 
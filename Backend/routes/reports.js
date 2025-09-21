const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- DATABASE CONNECTION ---
// Make sure your database connection details are correct.
const connection = mysql.createConnection({
  user: 'root',
  password: '@dityAsingh',
  database: 'civicsync',
  socketPath: '/tmp/mysql.sock'
});

// --- MULTER CONFIGURATION ---
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'reportImages-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage }).array('reportImages', 5);


// --- ROUTES ---

// @route   GET /api/reports
// @desc    Get all reports with dynamic and corrected filtering
router.get('/', (req, res) => {
  const { category, status, startDate, endDate } = req.query;

  let sql = 'SELECT * FROM reports WHERE 1=1';
  const params = [];

  // Dynamically build the query based on the filters provided
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (startDate) {
    sql += ' AND created_at >= ?';
    params.push(startDate);
  }
  // **FIXED LOGIC**: Use <= which works correctly for DATE and DATETIME columns.
  if (endDate) {
    sql += ' AND created_at <= ?';
    params.push(endDate);
  }

  sql += ' ORDER BY created_at DESC';

  console.log('Executing SQL:', sql, params); // For debugging purposes

  connection.query(sql, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ msg: 'Database error', error: err });
    }
    res.json(results);
  });
});


// @route   POST /api/reports
// @desc    Create a new report
router.post('/', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ msg: err });
    }

    const { category, name, phone, location, description, latitude, longitude, map_url, details } = req.body;
    
    // Store image paths as a JSON string in the database
    const imageUrls = req.files && req.files.length > 0 
      ? JSON.stringify(req.files.map(file => `/uploads/${file.filename}`))
      : null;

    if (!category || !name || !phone || !location || !description) {
      return res.status(400).json({ msg: 'All required fields were not provided.' });
    }

    const insertQuery = 'INSERT INTO reports (category, name, phone, location, description, latitude, longitude, map_url, details, image_urls) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    
    connection.query(insertQuery, [category, name, phone, location, description, latitude, longitude, map_url, details, imageUrls], (err, result) => {
      if (err) {
        console.error("Database insert error:", err);
        return res.status(500).json({ msg: 'Database insert error', error: err });
      }
      res.status(201).json({ msg: 'Report submitted successfully!', reportId: result.insertId });
    });
  });
});

// @route   GET /api/reports/:id
// @desc    Get a single report by its ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM reports WHERE id = ?';

  connection.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ msg: 'Database error', error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ msg: 'Report not found' });
    }
    res.json(results[0]);
  });
});

// @route   GET /api/reports/:id/comments
// @desc    Get all comments for a specific report
router.get('/:id/comments', (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM comments WHERE report_id = ? ORDER BY created_at DESC';
  connection.query(query, [id], (err, results) => {
    if (err) return res.status(500).json({ msg: 'Database error' });
    res.json(results);
  });
});

// @route   POST /api/reports/:id/comments
// @desc    Add a new comment to a report
router.post('/:id/comments', (req, res) => {
  const { id } = req.params;
  const { userName, commentText } = req.body;

  if (!userName || !commentText) {
    return res.status(400).json({ msg: 'All fields are required' });
  }

  const query = 'INSERT INTO comments (report_id, user_name, comment_text) VALUES (?, ?, ?)';
  connection.query(query, [id, userName, commentText], (err, result) => {
    if (err) return res.status(500).json({ msg: 'Database error' });
    res.status(201).json({ msg: 'Comment added successfully' });
  });
});

module.exports = router;
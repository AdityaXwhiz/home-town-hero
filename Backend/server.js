const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
// --- ADDED FOR REAL-TIME ---
const http = require('http');
const { Server } = require('socket.io');

const app = express();
// --- ADDED FOR REAL-TIME: Create HTTP server and integrate Socket.IO ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // In production, restrict this to your frontend's domain
    methods: ["GET", "POST", "PUT"]
  }
});

const PORT = 5001;
const saltRounds = 10;

// --- MULTER CONFIGURATION ---
const uploadsDir = path.join(__dirname, 'uploads');
const audioDir = path.join(uploadsDir, 'audio');
const imagesDir = path.join(uploadsDir, 'images');
const postImagesDir = path.join(uploadsDir, 'postImages');

// Ensure upload directories exist
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
if (!fs.existsSync(postImagesDir)) fs.mkdirSync(postImagesDir);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'reportImages') {
      cb(null, imagesDir);
    } else if (file.fieldname === 'voice_note') {
      cb(null, audioDir);
    } else if (file.fieldname === 'postImage') {
      cb(null, postImagesDir);
    } else {
      cb(new Error('Invalid fieldname'), null);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const imageTypes = /jpeg|jpg|png|gif/;
  const audioTypes = /webm|mp3|wav|ogg|mpeg/;

  if (file.fieldname === 'reportImages' || file.fieldname === 'postImage') {
    const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = imageTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    return cb(new Error('Only image files are allowed!'));
  }

  if (file.fieldname === 'voice_note') {
    const extname = audioTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = audioTypes.test(file.mimetype);
    if (mimetype && extname) return cb(null, true);
    return cb(new Error('Only audio files are allowed!'));
  }
  cb(new Error('Invalid file type!'));
};

const upload = multer({ storage, limits: { fileSize: 20000000 }, fileFilter });

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// --- MYSQL CONNECTION ---
const connection = mysql.createConnection({
  user: 'root',
  password: '@dityAsingh',
  database: 'civicsync',
  socketPath: '/tmp/mysql.sock'
});

connection.connect(err => {
  if (err) return console.error('❌ MySQL connection failed:', err);
  console.log('✅ MySQL connected!');
});


// --- REAL-TIME CONNECTION HANDLER ---
io.on('connection', (socket) => {
  console.log('✅ Real-time client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('❌ Real-time client disconnected:', socket.id);
  });
});


// --- AUTH ROUTES ---
app.post('/signup', async (req, res) => {
    const { f_name, l_name, email, username, password } = req.body;
    if (!f_name || !l_name || !email || !username || !password) {
        return res.status(400).json({ msg: 'All fields are required' });
    }
    try {
        const checkQuery = 'SELECT * FROM users WHERE email = ? OR name = ? LIMIT 1';
        connection.query(checkQuery, [email, username], async (err, results) => {
            if (err) return res.status(500).json({ msg: 'Database error', error: err });
            if (results.length > 0) return res.status(409).json({ msg: 'User with this email or username already exists' });
            
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const fullName = `${f_name} ${l_name}`;
            const insertQuery = 'INSERT INTO users (email, password, name) VALUES (?, ?, ?)';
            
            connection.query(insertQuery, [email, hashedPassword, fullName], (err, result) => {
                if (err) return res.status(500).json({ msg: 'Database insert error', error: err });
                res.json({ msg: 'Signup successful! You can now log in.' });
            });
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Server error' });
    }
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ msg: 'Email and password are required' });
    }
    const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
    connection.query(query, [email], async (err, results) => {
        if (err) return res.status(500).json({ msg: 'Database error', error: err });
        if (results.length === 0) return res.status(401).json({ msg: 'Invalid credentials' });
        
        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ msg: 'Invalid credentials' });
        
        res.json({ msg: 'Login successful', user });
    });
});


// --- REPORT MANAGEMENT ROUTES ---
const reportUpload = upload.fields([
  { name: 'reportImages', maxCount: 5 },
  { name: 'voice_note', maxCount: 1 }
]);

app.post('/api/reports', reportUpload, (req, res) => {
  const { category, name, phone, location, description, latitude, longitude, map_url, details } = req.body;
  if (!category || !name || !phone || !location || !description) {
    if (req.files) {
      if (req.files.reportImages) req.files.reportImages.forEach(file => fs.unlinkSync(file.path));
      if (req.files.voice_note) fs.unlinkSync(req.files.voice_note[0].path);
    }
    return res.status(400).json({ msg: 'All required text fields were not provided.' });
  }
  const imageFiles = req.files['reportImages'] || [];
  const voiceNoteFile = req.files['voice_note'] ? req.files.voice_note[0] : null;
  const imageUrls = imageFiles.map(file => `/uploads/images/${file.filename}`);
  const voiceNoteUrl = voiceNoteFile ? `/uploads/audio/${voiceNoteFile.filename}` : null;
  const insertQuery = `INSERT INTO reports (
    category, name, phone, location, description, latitude, longitude, map_url, details, image_urls, voice_note_url
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  connection.query(insertQuery, [
    category, name, phone, location, description, latitude, longitude, map_url, details, JSON.stringify(imageUrls), voiceNoteUrl
  ], (err, result) => {
    if (err) {
      console.error('Database insert error:', err);
      return res.status(500).json({ msg: 'Database insert error', error: err.sqlMessage || err });
    }
    
    const newReportId = result.insertId;
    connection.query('SELECT * FROM reports WHERE id = ?', [newReportId], (fetchErr, newReport) => {
        if (fetchErr) {
            console.error('Error fetching new report for broadcast:', fetchErr);
        } else if (newReport.length > 0) {
            console.log('📢 Broadcasting new report...');
            io.emit('new_report', newReport[0]);
        }
    });

    res.status(201).json({ msg: 'Report submitted successfully!', reportId: newReportId });
  });
});

app.get('/api/reports', (req, res) => {
    const { category, status, startDate, endDate } = req.query;
    let sql = 'SELECT * FROM reports WHERE 1=1';
    const params = [];
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
    if (endDate) {
        sql += ' AND created_at <= ?';
        params.push(endDate);
    }
    sql += ' ORDER BY created_at DESC';
    connection.query(sql, params, (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ msg: 'Database error', error: err });
        }
        res.json(results);
    });
});

app.put('/api/reports/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['Pending', 'In Progress', 'Resolved', 'Rejected'].includes(status)) {
        return res.status(400).json({ msg: 'Invalid status provided.' });
    }

    const updateQuery = 'UPDATE reports SET status = ? WHERE id = ?';
    connection.query(updateQuery, [status, id], (err, result) => {
        if (err) {
            console.error('Database update error:', err);
            return res.status(500).json({ msg: 'Database error updating status' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Report not found' });
        }

        connection.query('SELECT * FROM reports WHERE id = ?', [id], (fetchErr, updatedReport) => {
            if (fetchErr) {
                console.error('Error fetching updated report for broadcast:', fetchErr);
            } else if (updatedReport.length > 0) {
                console.log('📢 Broadcasting updated report (status change)...');
                io.emit('report_updated', updatedReport[0]);
            }
        });

        res.json({ msg: 'Report status updated successfully!' });
    });
});

app.put('/api/reports/:id/deadline', (req, res) => {
    const { id } = req.params;
    const { deadline } = req.body; 

    const updateQuery = 'UPDATE reports SET deadline = ? WHERE id = ?';
    connection.query(updateQuery, [deadline, id], (err, result) => {
        if (err) {
            console.error('Database update error:', err);
            return res.status(500).json({ msg: 'Database error updating deadline' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Report not found' });
        }

        connection.query('SELECT * FROM reports WHERE id = ?', [id], (fetchErr, updatedReport) => {
            if (fetchErr) {
                console.error('Error fetching updated report for broadcast:', fetchErr);
            } else if (updatedReport.length > 0) {
                console.log('📢 Broadcasting updated report (deadline change)...');
                io.emit('report_updated', updatedReport[0]);
            }
        });

        res.json({ msg: 'Report deadline updated successfully!' });
    });
});

app.get('/api/reports/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM reports WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ msg: 'Database error', error: err });
        if (results.length === 0) return res.status(404).json({ msg: 'Report not found' });
        res.json(results[0]);
    });
});

// --- COMMENTS ROUTES ---
app.get('/api/reports/:id/comments', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT * FROM comments WHERE report_id = ? ORDER BY created_at DESC';
    connection.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ msg: 'Database error' });
        res.json(results);
    });
});

app.post('/api/reports/:id/comments', (req, res) => {
    const { id } = req.params;
    const { userName, commentText } = req.body;
    if (!userName || !commentText) {
        return res.status(400).json({ msg: 'Username and comment text are required' });
    }
    const query = 'INSERT INTO comments (report_id, user_name, comment_text) VALUES (?, ?, ?)';
    connection.query(query, [id, userName, commentText], (err, result) => {
        if (err) return res.status(500).json({ msg: 'Database error' });
        res.status(201).json({ msg: 'Comment added successfully' });
    });
});

// --- NGO ROUTES ---
app.get('/api/ngos', (req, res) => {
    const query = 'SELECT * FROM ngos ORDER BY name ASC';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ msg: 'Database error fetching NGOs' });
        }
        res.json(results);
    });
});

app.post('/api/ngos', (req, res) => {
    const { name, regNumber, presidentName, secretaryName, focus, address, email, phone, website, description } = req.body;
    if (!name || !regNumber || !presidentName || !secretaryName || !focus || !address || !email || !description) {
        return res.status(400).json({ msg: 'Please fill out all required fields.' });
    }
    const query = `INSERT INTO ngos (name, reg_number, president_name, secretary_name, focus_area, address, email, phone, website, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [name, regNumber, presidentName, secretaryName, focus, address, email, phone, website, description];
    connection.query(query, values, (err, result) => {
        if (err) {
            console.error('Database insert error:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ msg: 'An NGO with this registration number or email already exists.' });
            }
            return res.status(500).json({ msg: 'Database error during registration.' });
        }
        res.status(201).json({ msg: 'NGO registered successfully!' });
    });
});

// --- ANALYTICS & STATS ROUTES ---
app.get('/api/alerts/actionable', (req, res) => {
    const query = `
        SELECT id, category, location, deadline, final_deadline, map_url, status 
        FROM reports 
        WHERE status IN ('Pending', 'In Progress') AND deadline IS NOT NULL
        ORDER BY deadline ASC`;
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Database query error:', err);
            return res.status(500).json({ msg: 'Database error fetching actionable alerts' });
        }
        res.json(results);
    });
});

app.get('/api/analytics', (req, res) => {
    const queries = {
        totalReports: 'SELECT COUNT(*) as count FROM reports',
        statusCounts: 'SELECT status, COUNT(*) as count FROM reports GROUP BY status',
        categoryCounts: 'SELECT category, COUNT(*) as count FROM reports GROUP BY category',
        recentReports: 'SELECT * FROM reports ORDER BY created_at DESC LIMIT 15' // Increased limit for better trends
    };
    const results = {};
    const queryKeys = Object.keys(queries);
    let completedQueries = 0;
    let errorOccurred = false;
    queryKeys.forEach(key => {
        connection.query(queries[key], (err, queryResult) => {
            if (errorOccurred) return;
            if (err) {
                errorOccurred = true;
                return res.status(500).json({ msg: 'Database error fetching analytics' });
            }
            results[key] = queryResult;
            completedQueries++;
            if (completedQueries === queryKeys.length) {
                const statusCounts = results.statusCounts.reduce((acc, row) => {
                    acc[row.status] = row.count;
                    return acc;
                }, {});
                res.json({
                    totalReports: results.totalReports[0].count,
                    resolvedReports: statusCounts['Resolved'] || 0,
                    pendingReports: statusCounts['Pending'] || 0,
                    inProgressReports: statusCounts['In Progress'] || 0,
                    categoryCounts: results.categoryCounts.map(row => ({
                        name: row.category,
                        value: row.count
                    })),
                    recentReports: results.recentReports
                });
            }
        });
    });
});

app.get('/api/hero-stats', (req, res) => {
    const queries = {
        issuesResolved: "SELECT COUNT(*) as count FROM reports WHERE status = 'Resolved'",
        activeCitizens: "SELECT COUNT(*) as count FROM users",
        ngoPartners: "SELECT COUNT(*) as count FROM ngos"
    };
    const results = {};
    const queryKeys = Object.keys(queries);
    let completedQueries = 0;
    queryKeys.forEach(key => {
        connection.query(queries[key], (err, queryResult) => {
            if (err) return res.status(500).json({ msg: 'Database error fetching hero stats' });
            results[key] = queryResult[0].count;
            completedQueries++;
            if (completedQueries === queryKeys.length) res.json(results);
        });
    });
});

// --- COMMUNITY POST ROUTES ---
const postUpload = upload.single('postImage');

app.get('/api/posts', (req, res) => {
    const query = 'SELECT * FROM community_posts ORDER BY created_at DESC';
    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ msg: 'Database error' });
        res.json(results);
    });
});

app.post('/api/posts', postUpload, (req, res) => {
    const { title, content, author_name, author_avatar } = req.body;
    if (!title || !content || !author_name) {
        if (req.file) fs.unlinkSync(req.file.path);
        return res.status(400).json({ msg: 'Title, content, and author name are required' });
    }
    const imageUrl = req.file ? `/uploads/postImages/${req.file.filename}` : null;
    const insertQuery = `INSERT INTO community_posts (title, content, author_name, author_avatar, image_url) VALUES (?, ?, ?, ?, ?)`;
    connection.query(insertQuery, [title, content, author_name, author_avatar, imageUrl], (err, result) => {
        if (err) return res.status(500).json({ msg: 'Database error' });
        res.status(201).json({ msg: 'Post created successfully!', postId: result.insertId });
    });
});

app.put('/api/posts/:id/like', (req, res) => {
    const { id } = req.params;
    const query = 'UPDATE community_posts SET likes = likes + 1 WHERE id = ?';
    connection.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ msg: 'Database error' });
        if (result.affectedRows === 0) return res.status(404).json({ msg: 'Post not found' });
        res.json({ msg: 'Post liked successfully!' });
    });
});

// --- START SERVER ---
server.listen(PORT, () => console.log(`✅ Server with real-time support started on port ${PORT}`));
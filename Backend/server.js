const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5001;
const saltRounds = 10;

// --- MULTER CONFIGURATION ---
const uploadsDir = path.join(__dirname, 'uploads');
const audioDir = path.join(uploadsDir, 'audio');
const imagesDir = path.join(uploadsDir, 'images');
const postImagesDir = path.join(uploadsDir, 'postImages'); // <-- 1. ADDED: Directory for post images

// Ensure upload directories exist
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir);
if (!fs.existsSync(imagesDir)) fs.mkdirSync(imagesDir);
if (!fs.existsSync(postImagesDir)) fs.mkdirSync(postImagesDir); // <-- 2. ADDED: Create the new directory

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.fieldname === 'reportImages') {
            cb(null, imagesDir);
        } else if (file.fieldname === 'voice_note') {
            cb(null, audioDir);
        } else if (file.fieldname === 'postImage') { // <-- 3. ADDED: Handle post images
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

    if (file.fieldname === 'reportImages' || file.fieldname === 'postImage') { // <-- 4. ADDED: Check for postImage
        const extname = imageTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = imageTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb(new Error('Only image files are allowed!'));
    }

    if (file.fieldname === 'voice_note') {
        const extname = audioTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = audioTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        return cb(new Error('Only audio files are allowed!'));
    }

    cb(new Error('Invalid file type!'));
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 20000000 },
    fileFilter: fileFilter
});


// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadsDir));

// --- MYSQL CONNECTION ---
const connection = mysql.createConnection({
  user: 'root',
  password: '@dityAsingh',   // replace with your MySQL root password
  database: 'civicsync',   // replace with your DB name
  socketPath: '/tmp/mysql.sock'
    
});

connection.connect(err => {
    if (err) return console.error('❌ MySQL connection failed:', err);
    console.log('✅ MySQL connected!');
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

// --- UPDATED REPORT ROUTES ---
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
        res.status(201).json({ msg: 'Report submitted successfully!', reportId: result.insertId });
    });
});

app.get('/api/reports', (req, res) => {
    let query = 'SELECT * FROM reports ORDER BY created_at DESC';
    connection.query(query, (err, results) => {
        if (err) return res.status(500).json({ msg: 'Database error', error: err });
        res.json(results);
    });
});

// --- ROUTES FOR SINGLE REPORT & COMMENTS ---
app.get('/api/reports/:id', (req, res) => {
    const { id } = req.params;
    const query = 'SELECT *, image_urls, voice_note_url FROM reports WHERE id = ?';
    connection.query(query, [id], (err, results) => {
        if (err) return res.status(500).json({ msg: 'Database error', error: err });
        if (results.length === 0) return res.status(404).json({ msg: 'Report not found' });
        res.json(results[0]);
    });
});

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

// --- NGO API ROUTES ---
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
    const query = `INSERT INTO ngos (
        name, reg_number, president_name, secretary_name, focus_area, address, email, phone, website, description
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [ name, regNumber, presidentName, secretaryName, focus, address, email, phone, website, description ];
    connection.query(query, values, (err, result) => {
        if (err) {
            console.error('Database insert error:', err);
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ msg: 'An NGO with this registration number or email already exists.' });
            }
            return res.status(500).json({ msg: 'Database error during registration.' });
        }
        res.status(201).json({ msg: 'NGO registered successfully! Your application is pending review.' });
    });
});


// --- ✨ ADDED: COMMUNITY POST ROUTES ✨ ---
const postUpload = upload.single('postImage');

// GET all community posts
app.get('/api/posts', (req, res) => {
    const query = 'SELECT * FROM community_posts ORDER BY created_at DESC';
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching posts:', err);
            return res.status(500).json({ msg: 'Database error' });
        }
        res.json(results);
    });
});

// POST a new community post
app.post('/api/posts', postUpload, (req, res) => {
    const { title, content, author_name, author_avatar } = req.body;
    if (!title || !content || !author_name || !author_avatar) {
        if (req.file) fs.unlinkSync(req.file.path); // Clean up uploaded file
        return res.status(400).json({ msg: 'Title, content, and author details are required' });
    }
    
    const imageUrl = req.file ? `/uploads/postImages/${req.file.filename}` : null;
    
    const insertQuery = `INSERT INTO community_posts (title, content, author_name, author_avatar, image_url) VALUES (?, ?, ?, ?, ?)`;
    connection.query(insertQuery, [title, content, author_name, author_avatar, imageUrl], (err, result) => {
        if (err) {
            console.error('Error creating post:', err);
            return res.status(500).json({ msg: 'Database error' });
        }
        res.status(201).json({ msg: 'Post created successfully!', postId: result.insertId });
    });
});

// PUT to like a post
app.put('/api/posts/:id/like', (req, res) => {
    const { id } = req.params;
    // This is a simplified "like" that just increments the count.
    const query = 'UPDATE community_posts SET likes = likes + 1 WHERE id = ?';
    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error liking post:', err);
            return res.status(500).json({ msg: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ msg: 'Post not found' });
        }
        res.json({ msg: 'Post liked successfully!' });
    });
});


// --- START SERVER ---
app.listen(PORT, () => console.log(`✅ Server started on port ${PORT}`));


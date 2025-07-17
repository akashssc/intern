const express = require('express');
const multer = require('multer');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve static files from the project root
app.use(express.static(__dirname));

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

// SQLite setup
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) throw err;
    console.log('Connected to SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password TEXT
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        filename TEXT,
        originalname TEXT,
        upload_time DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

// Password strength validation (Google Drive-like)
function isStrongPassword(password) {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 symbol
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/.test(password);
}

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Helper: authenticate user
function authenticate(req, res, next) {
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) return res.status(400).json({ error: 'Missing credentials' });
    const query = username ? 'SELECT * FROM users WHERE username = ?' : 'SELECT * FROM users WHERE email = ?';
    const value = username ? username : email;
    db.get(query, [value], (err, user) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                req.user = user;
                next();
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        });
    });
}

// 1. User Registration (with email, strong password)
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: 'Missing credentials' });
    if (!isStrongPassword(password)) return res.status(400).json({ error: 'Password too weak. Must be at least 8 characters, include uppercase, lowercase, number, and symbol.' });
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) return res.status(500).json({ error: 'Hash error' });
        db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hash], function(err) {
            if (err) {
                if (err.message && err.message.includes('UNIQUE constraint failed: users.username')) {
                    return res.status(400).json({ error: 'Username already exists' });
                } else if (err.message && err.message.includes('UNIQUE constraint failed: users.email')) {
                    return res.status(400).json({ error: 'Email already exists' });
                }
                return res.status(400).json({ error: 'Registration error' });
            }
            res.json({ message: 'User registered' });
        });
    });
});

// 2. User Login (by username or email)
app.post('/login', (req, res) => {
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) return res.status(400).json({ error: 'Missing credentials' });
    const query = username ? 'SELECT * FROM users WHERE username = ?' : 'SELECT * FROM users WHERE email = ?';
    const value = username ? username : email;
    db.get(query, [value], (err, user) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });
        bcrypt.compare(password, user.password, (err, result) => {
            if (result) {
                res.json({ message: 'Login successful', username: user.username, email: user.email });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        });
    });
});

// 3. File Upload (requires authentication)
app.post('/upload', upload.single('file'), authenticate, (req, res) => {
    const user = req.user;
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });
    db.run('INSERT INTO files (user_id, filename, originalname) VALUES (?, ?, ?)', [user.id, file.filename, file.originalname], function(err) {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json({ message: 'File uploaded', filename: file.filename });
    });
});

// 4. List User Files (requires authentication)
app.post('/myfiles', authenticate, (req, res) => {
    const user = req.user;
    db.all('SELECT id, filename, originalname, upload_time FROM files WHERE user_id = ?', [user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json({ files: rows });
    });
});

// 5. Download File (admin can download any, user only their own)
app.post('/download', (req, res) => {
    const { username, password, fileId } = req.body;
    // Check if admin
    if (username === 'Admin_1' && password === 'Admin@1234') {
        db.get('SELECT * FROM files WHERE id = ?', [fileId], (err, file) => {
            if (err) return res.status(500).json({ error: 'DB error' });
            if (!file) return res.status(404).json({ error: 'File not found' });
            const filePath = path.join(__dirname, 'uploads', file.filename);
            res.download(filePath, file.originalname);
        });
    } else {
        // Regular user: only allow download of their own files
        authenticate(req, res, () => {
            const user = req.user;
            db.get('SELECT * FROM files WHERE id = ? AND user_id = ?', [fileId, user.id], (err, file) => {
                if (err) return res.status(500).json({ error: 'DB error' });
                if (!file) return res.status(404).json({ error: 'File not found' });
                const filePath = path.join(__dirname, 'uploads', file.filename);
                res.download(filePath, file.originalname);
            });
        });
    }
});

// Hardcoded admin login
app.post('/admin-login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'Admin_1' && password === 'Admin@1234') {
        res.json({ message: 'Admin login successful', admin: true });
    } else {
        res.status(401).json({ error: 'Invalid admin credentials' });
    }
});

// Admin: List all files with user info
app.post('/admin-files', (req, res) => {
    const { username, password } = req.body;
    if (username !== 'Admin_1' || password !== 'Admin@1234') {
        return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    db.all(`SELECT files.id, files.filename, files.originalname, files.upload_time, users.username
            FROM files JOIN users ON files.user_id = users.id
            ORDER BY files.upload_time DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: 'DB error' });
        res.json({ files: rows });
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
}); 
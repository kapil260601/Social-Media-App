// Import required modules
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;
const SECRET_KEY = 'your_secret_key';

const cors = require('cors');
app.use(cors());


// Middleware
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root@12345',
    database: 'student'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Connected...');

    // Create Database
    db.query('CREATE DATABASE IF NOT EXISTS social_media', (err) => {
        if (err) throw err;
        console.log('Database Created');
    });

    // Create Tables
    const userTable = `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    
    const postTable = `CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`;
    
    const likeTable = `CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_like (user_id, post_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    )`;
    
    const followTable = `CREATE TABLE IF NOT EXISTS follows (
        id INT AUTO_INCREMENT PRIMARY KEY,
        follower_id INT NOT NULL,
        following_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_follow (follower_id, following_id),
        FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    )`;

    db.query(userTable);
    db.query(postTable);
    db.query(likeTable);
    db.query(followTable);
});

// Authentication Middleware
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });
        req.user = user;
        next();
    });
}

// User Registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err) => {
        if (err) return res.status(400).json({ message: 'User already exists' });
        res.status(201).json({ message: 'User registered successfully' });
    });
});

// User Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ message: 'Invalid credentials' });
        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY);
        res.json({ token });
    });
});

// Create Post
app.post('/posts', authenticateToken, (req, res) => {
    const { content } = req.body;
    db.query('INSERT INTO posts (user_id, content) VALUES (?, ?)', [req.user.id, content], (err) => {
        if (err) return res.status(500).json({ message: 'Error creating post' });
        res.status(201).json({ message: 'Post created' });
    });
});

// Get All Posts
app.get('/posts', (req, res) => {
    db.query('SELECT posts.*, users.username FROM posts JOIN users ON posts.user_id = users.id ORDER BY posts.created_at DESC', (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching posts' });
        res.json(results);
    });
});

// Like a Post
app.post('/posts/:id/like', authenticateToken, (req, res) => {
    const postId = req.params.id;
    db.query('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [req.user.id, postId], (err) => {
        if (err) return res.status(400).json({ message: 'Already liked' });
        res.status(201).json({ message: 'Post liked' });
    });
});

// Follow a User
app.post('/users/:id/follow', authenticateToken, (req, res) => {
    try{
    const followingId = req.params.id;
    db.query('INSERT INTO follows (follower_id, following_id) VALUES (?, ?)', [req.user.id, followingId], (err) => {
        if (err) return res.status(400).json({ message: 'Already following' });
        res.status(201).json({ message: 'User followed' });
    });
}catch(err){
   res.status(500).json({ message: 'Error following user' });
}
});

// Start the Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

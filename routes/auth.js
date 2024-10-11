const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); // Import the jsonwebtoken library
const db = require('../db'); // Adjust the path as necessary

const JWT_SECRET = 'your_secret_key'; // Replace with your secret key for signing the JWT

// Route to check if the auth router works
router.get('/', (req, res) => {
    res.send('Auth router is working');
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body; // Changed to username

    try {
        // Check if the user exists
        const checkQuery = 'SELECT * FROM users WHERE username = ?';
        db.query(checkQuery, [username], async (error, results) => {
            if (error) {
                console.error('Database query failed:', error);
                return res.status(500).json({ message: "Server error" });
            }

            if (results.length === 0) {
                return res.status(401).json({ message: "Invalid username or password" });
            }

            const user = results[0];

            // Compare the provided password with the hashed password in the database
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid username or password" });
            }

            // Create a JWT token
            const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });

            res.json({ message: "Login Successful", user: { username: user.username, id: user.id }, token });
        });
    } catch (e) {
        res.status(500).json({ message: "Server error" });
    }
});

// Register route
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, password, and email are required' });
    }

    try {
        // Check if username already exists
        const checkQuery = 'SELECT * FROM users WHERE username = ?';
        
        db.query(checkQuery, [username], async (error, results) => {
            if (error) {
                console.error('Database query failed:', error);
                return res.status(500).json({ error: 'Database query failed' });
            }

            if (results.length > 0) {
                return res.status(409).json({ error: 'Username already exists' });
            }

            // Check if email already exists
            const emailCheckQuery = 'SELECT * FROM users WHERE email = ?';
            db.query(emailCheckQuery, [email], async (error, results) => {
                if (error) {
                    console.error('Database query failed:', error);
                    return res.status(500).json({ error: 'Database query failed' });
                }

                if (results.length > 0) {
                    return res.status(409).json({ error: 'Email already exists' });
                }

                // Hash the password
                const hashedPassword = await bcrypt.hash(password, 10);

                // Insert new user into users table
                const insertQuery = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
                
                db.query(insertQuery, [username, hashedPassword, email], (error, results) => {
                    if (error) {
                        console.error('Failed to insert data:', error);
                        return res.status(500).json({ error: 'Failed to insert data' });
                    }

                    res.status(201).json({ message: 'Signup successful', id: results.insertId });
                });
            });
        });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ error: 'Signup failed' });
    }
});

module.exports = router;

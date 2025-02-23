const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Importing the PostgreSQL pool connection

const JWT_SECRET = 'your_secret_key'; // Replace with your secret key for signing the JWT

// Function to create the users table if it doesn't exist
const createUsersTable = () => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    db.query(createTableQuery, (error) => {
        if (error) {
            console.error('Failed to create users table:', error);
        } else {
            console.log('Users table is ready.');
        }
    });
};

// Call the createUsersTable function when the app starts
createUsersTable();

// Route to check if the auth router works
router.get('/', (req, res) => {
    res.send('Auth router is working');
});

// Route to display all users
router.get('/users', (req, res) => {
    const getAllUsersQuery = 'SELECT id, username, email, created_at FROM users';

    db.query(getAllUsersQuery, (error, results) => {
        if (error) {
            console.error('Failed to fetch users:', error);
            return res.status(500).json({ message: "Server error" });
        }

        res.status(200).json(results.rows);
    });
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const checkQuery = 'SELECT * FROM users WHERE username = $1';
        db.query(checkQuery, [username], async (error, results) => {
            if (error) {
                console.error('Database query failed:', error);
                return res.status(500).json({ message: "Server error" });
            }

            if (results.rows.length === 0) {
                return res.status(401).json({ message: "Invalid username or password" });
            }

            const user = results.rows[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid username or password" });
            }

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
        const checkQuery = 'SELECT * FROM users WHERE username = $1';
        db.query(checkQuery, [username], async (error, results) => {
            if (error) {
                console.error('Database query failed:', error);
                return res.status(500).json({ error: 'Database query failed' });
            }

            if (results.rows.length > 0) {
                return res.status(409).json({ error: 'Username already exists' });
            }

            const emailCheckQuery = 'SELECT * FROM users WHERE email = $1';
            db.query(emailCheckQuery, [email], async (error, results) => {
                if (error) {
                    console.error('Database query failed:', error);
                    return res.status(500).json({ error: 'Database query failed' });
                }

                if (results.rows.length > 0) {
                    return res.status(409).json({ error: 'Email already exists' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                const insertQuery = 'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING id';

                db.query(insertQuery, [username, hashedPassword, email], (error, results) => {
                    if (error) {
                        console.error('Failed to insert data:', error);
                        return res.status(500).json({ error: 'Failed to insert data' });
                    }

                    res.status(201).json({ message: 'Signup successful', id: results.rows[0].id });
                });
            });
        });
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).json({ error: 'Signup failed' });
    }
});

module.exports = router;

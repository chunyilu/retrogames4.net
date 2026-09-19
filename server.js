const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json()); // Middleware to parse JSON request bodies

// 1. Initialize SQLite database (creates auth.db file if it doesn't exist)
const db = new Database('auth.db');

// 2. Create 'users' table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  )
`);

// -----------------------------------------------------------------------------
// REGISTER ROUTE
// -----------------------------------------------------------------------------
app.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Hash password with a salt cost factor of 10
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user into SQLite database
    const stmt = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)');
    const result = stmt.run(email, passwordHash);

    res.status(201).json({ message: 'User registered successfully!', userId: result.lastInsertRowid });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Email already exists.' });
    }
    res.status(500).json({ error: 'Database error.' });
  }
});

// -----------------------------------------------------------------------------
// LOGIN ROUTE
// -----------------------------------------------------------------------------
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  // Find user by email
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Compare input password with stored bcrypt hash
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Login successful
  res.json({ message: 'Login successful!', user: { id: user.id, email: user.email } });
});

// Start Server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const app = express();

// Serve static files
app.use(express.static('public'));

// SQLite database connection
const db = new sqlite3.Database('./hanzi.db', (err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    return;
  }
  console.log('Connected to SQLite database');
});

// API endpoint to get data
app.get('/api/data', (req, res) => {
  db.all('SELECT * FROM characters', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.get('/api/data/random', (req, res) => {
  db.get('SELECT * FROM characters ORDER BY RAND( ) LIMIT 1', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.get('/api/data/character/:character', (req, res) => {
  const character = req.params.character;
  db.get('SELECT * FROM characters WHERE character = ? limit 1', [character], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// Close database connection on exit
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
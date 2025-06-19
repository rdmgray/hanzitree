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
  db.get('SELECT * FROM characters WHERE unicode BETWEEN "U+4E00" AND "U+9FFF" ORDER BY RANDOM() LIMIT 1', (err, results) => {
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

// API endpoint to get top characters
app.get('/api/data/top-characters', (req, res) => {
  db.all('SELECT * FROM characters where good_start', (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// API endpoint to get character by unicode
app.get('/api/data/unicode/:unicode', (req, res) => {
    const unicode = req.params.unicode;
    
    db.get('SELECT * FROM characters WHERE unicode = ?', [unicode], (err, row) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        
        if (!row) {
            res.status(404).json({ error: 'Character not found' });
            return;
        }
        
        res.json(row);
    });
});


// API endpoint to get components
app.get('/api/data/components', (req, res) => {
    const { character, component, target, structure } = req.query;
    
    console.log('Components request:', { character, component, target, structure });
    
    // Validate parameters
    const validComponents = ['component_1', 'component_2'];
    const validStructures = ['left-right', 'top-bottom', 'surround', 'overlay'];
    
    if (!validComponents.includes(component) || !validStructures.includes(structure)) {
        console.log('Invalid parameters:', { component, structure });
        return res.status(400).json({ error: 'Invalid parameters' });
    }

    let query;
    let params = [character];

    if (structure === 'surround') {
        // For surround, match any structure containing 'surround'
        query = `
            SELECT DISTINCT c.character, c.${target} as ${target}
            FROM characters c
            WHERE c.${component} = ?
            AND c.structure LIKE '%surround%'
            ORDER BY c.frequency_score DESC
            LIMIT 16
        `;
    } else if (structure === 'overlay') {
        // For overlay, match either way around
        query = `
            SELECT DISTINCT c.character,
            case when c.component_1 = ? then c.component_2
            when c.component_2 = ? then c.component_1 
            end as ${target} 
            FROM characters c
            WHERE (c.component_1 = ? OR c.component_2 = ?)
            AND c.structure = 'overlaid'
            ORDER BY c.frequency_score DESC
            LIMIT 16
        `;
        params = [character, character, character, character]
    } else {
        // For other structures, match exactly
        query = `
            SELECT DISTINCT c.character, c.${target} as ${target}
            FROM characters c
            WHERE c.${component} = ?
            AND c.structure = ?
            ORDER BY c.frequency_score DESC
            LIMIT 16
        `;
        params.push(structure);
    }

    console.log('Query:', query);
    console.log('Parameters:', params);

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        console.log('Results count:', rows.length);
        res.json(rows);
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
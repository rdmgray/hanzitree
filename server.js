const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// Create database connection
const db = new sqlite3.Database(path.join(__dirname, 'hanzi.db'), (err) => {
    if (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
    console.log('Connected to database');
});

// Helper function to run queries as promises
function dbGet(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function dbAll(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

// Format character data
function formatCharacterData(row) {
    if (!row) return null;
    
    return {
        character: row.character,
        unicode: row.unicode,
        radical: row.radical,
        strokes: row.stroke_count,
        decomposition: {
            primary: {
                components: JSON.parse(row.direct_components || '[]'),
                structure: row.ids_sequence,
                description: row.structure_type,
            }
        }
    };
}

// API endpoints
app.get('/api/character/random', async (req, res) => {
    console.log('Random character request received');
    try {
        const row = await dbGet('SELECT * FROM characters ORDER BY RANDOM() LIMIT 1');
        console.log('Random query result:', row);
        
        if (!row) {
            console.log('No random character found');
            res.status(404).json({ error: 'No characters found' });
            return;
        }
        
        const formattedData = formatCharacterData(row);
        console.log('Formatted random character:', formattedData);
        res.json(formattedData);
    } catch (error) {
        console.error('Error getting random character:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.get('/api/character/:char', async (req, res) => {
    console.log('Character request received for:', req.params.char);
    try {
        const row = await dbGet('SELECT * FROM characters WHERE character = ?', [req.params.char]);
        console.log('Query result:', row);
        
        if (!row) {
            console.log('Character not found:', req.params.char);
            res.status(404).json({ error: 'Character not found' });
            return;
        }
        
        const formattedData = formatCharacterData(row);
        console.log('Formatted character data:', formattedData);
        res.json(formattedData);
    } catch (error) {
        console.error('Error getting character:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

app.get('/api/search', async (req, res) => {
    try {
        const query = `%${req.query.q}%`;
        const rows = await dbAll(
            'SELECT * FROM characters WHERE character LIKE ? OR unicode LIKE ? OR structure_type LIKE ? LIMIT 50',
            [query, query, query]
        );
        res.json(rows.map(formatCharacterData));
    } catch (error) {
        console.error('Error searching characters:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Serve static files
app.use(express.static('.'));

// Test database connection on startup
dbGet('SELECT COUNT(*) as count FROM characters')
    .then(result => {
        console.log('Database connection test successful');
        console.log('Total characters in database:', result.count);
        
        // Start server after successful database test
        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    })
    .catch(error => {
        console.error('Database connection test failed:', error);
        process.exit(1);
    }); 
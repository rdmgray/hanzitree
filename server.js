const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const rateLimit = require('express-rate-limit');
const app = express();

// Load environment variables
require('dotenv').config();

// Constants
const PORT = process.env.PORT || 3000;
const DB_PATH = process.env.DB_PATH || './hanzi.db';
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_SQL_QUERIES = process.env.LOG_SQL_QUERIES === 'true';
const UNICODE_RANGE = {
  START: 'U+4E00',
  END: 'U+9FFF'
};
const VALID_COMPONENTS = ['component_1', 'component_2'];
const VALID_STRUCTURES = ['left-right', 'top-bottom', 'surround', 'overlay'];
const QUERY_LIMITS = {
  COMPONENTS: 16
};

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(limiter);
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Serve static files
app.use(express.static('public'));

// Helper function for SQL query logging
const logQuery = (query, params = []) => {
  if (LOG_SQL_QUERIES || NODE_ENV === 'development') {
    console.log(`[SQL] ${query}`);
    if (params.length > 0) {
      console.log(`[SQL PARAMS] ${JSON.stringify(params)}`);
    }
  }
};

// SQLite database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  console.log(`Connected to SQLite database at ${DB_PATH}`);
});

// API endpoint to get data
app.get('/api/data', (req, res) => {
  const query = 'SELECT * FROM characters';
  logQuery(query);
  db.all(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.get('/api/data/random', (req, res) => {
  const query = `SELECT * FROM characters WHERE unicode BETWEEN "${UNICODE_RANGE.START}" AND "${UNICODE_RANGE.END}" ORDER BY RANDOM() LIMIT 1`;
  logQuery(query);
  db.get(query, (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

app.get('/api/data/character/:character', (req, res) => {
  const character = req.params.character;
  
  if (!character || character.length !== 1) {
    return res.status(400).json({ error: 'Invalid character parameter' });
  }
  
  const query = 'SELECT * FROM characters WHERE character = ? LIMIT 1';
  logQuery(query, [character]);
  db.get(query, [character], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(results);
  });
});

// API endpoint to get top characters
app.get('/api/data/top-characters', (req, res) => {
  const query = 'SELECT * FROM characters WHERE good_start = 1';
  logQuery(query);
  db.all(query, (err, results) => {
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
    
    if (!unicode || !/^U\+[0-9A-F]{4,5}$/i.test(unicode)) {
        return res.status(400).json({ error: 'Invalid unicode format. Expected format: U+XXXX' });
    }
    
    const query = 'SELECT * FROM characters WHERE unicode = ?';
    logQuery(query, [unicode]);
    db.get(query, [unicode], (err, row) => {
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
    
    
    // Validate parameters
    if (!character || character.length !== 1) {
        return res.status(400).json({ error: 'Invalid character parameter' });
    }
    
    if (!VALID_COMPONENTS.includes(component)) {
        return res.status(400).json({ error: `Invalid component. Must be one of: ${VALID_COMPONENTS.join(', ')}` });
    }
    
    if (!VALID_STRUCTURES.includes(structure)) {
        return res.status(400).json({ error: `Invalid structure. Must be one of: ${VALID_STRUCTURES.join(', ')}` });
    }
    
    if (!['component_1', 'component_2'].includes(target)) {
        return res.status(400).json({ error: 'Invalid target. Must be component_1 or component_2' });
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
            LIMIT ?
        `;
        params.push(QUERY_LIMITS.COMPONENTS);
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
            LIMIT ?
        `;
        params = [character, character, character, character, QUERY_LIMITS.COMPONENTS]
    } else {
        // For other structures, match exactly
        query = `
            SELECT DISTINCT c.character, c.${target} as ${target}
            FROM characters c
            WHERE c.${component} = ?
            AND c.structure = ?
            ORDER BY c.frequency_score DESC
            LIMIT ?
        `;
        params.push(structure, QUERY_LIMITS.COMPONENTS);
    }


    logQuery(query, params);
    db.all(query, params, (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        res.json(rows);
    });
});

// API endpoint to check component availability (for button state)
app.get('/api/data/components/available', (req, res) => {
    const { character } = req.query;
    
    // Validate parameters
    if (!character || character.length !== 1) {
        return res.status(400).json({ error: 'Invalid character parameter' });
    }

    // Define the same grow directions as frontend
    const growDirections = [
        { id: 'grow-right', component: 'component_1', target: 'component_2', structure: 'left-right' },
        { id: 'grow-left', component: 'component_2', target: 'component_1', structure: 'left-right' },
        { id: 'grow-above', component: 'component_2', target: 'component_1', structure: 'top-bottom' },
        { id: 'grow-below', component: 'component_1', target: 'component_2', structure: 'top-bottom' },
        { id: 'grow-surround', component: 'component_1', target: 'component_2', structure: 'surround' },
        { id: 'grow-overlay', component: 'component_1', target: 'component_2', structure: 'overlay' }
    ];

    const availabilityResults = {};
    let completedChecks = 0;

    growDirections.forEach(direction => {
        let query;
        let params = [character];

        if (direction.structure === 'surround') {
            query = `
                SELECT 1 FROM characters c
                WHERE c.${direction.component} = ?
                AND c.structure LIKE '%surround%'
                LIMIT 1
            `;
        } else if (direction.structure === 'overlay') {
            query = `
                SELECT 1 FROM characters c
                WHERE (c.component_1 = ? OR c.component_2 = ?)
                AND c.structure = 'overlaid'
                LIMIT 1
            `;
            params = [character, character];
        } else {
            query = `
                SELECT 1 FROM characters c
                WHERE c.${direction.component} = ?
                AND c.structure = ?
                LIMIT 1
            `;
            params.push(direction.structure);
        }

        logQuery(query, params);
        db.get(query, params, (err, row) => {
            if (err) {
                console.error('Database error checking availability:', err);
                availabilityResults[direction.id] = false;
            } else {
                availabilityResults[direction.id] = !!row;
            }

            completedChecks++;
            if (completedChecks === growDirections.length) {
                res.json(availabilityResults);
            }
        });
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
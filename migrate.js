const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create/connect to SQLite database
const db = new sqlite3.Database('hanzi.db');

// Helper function to run queries as promises
function dbRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

async function migrate() {
    try {
        console.log('Starting migration...');
        
        // Read schema file and create table
        const schema = fs.readFileSync('schema.sql', 'utf8');
        await dbRun(schema);
        
        // Read the JSON file
        const jsonData = JSON.parse(fs.readFileSync(path.join(__dirname, 'character_decomposition.json'), 'utf8'));
        
        // Begin transaction
        await dbRun('BEGIN TRANSACTION');
        
        // Insert data
        const stmt = db.prepare(`
            INSERT INTO characters (
                character,
                unicode,
                radical,
                stroke_count,
                ids_sequence,
                structure_type,
                direct_components,
                all_components,
                source
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);
        
        for (const char of jsonData) {
            await new Promise((resolve, reject) => {
                stmt.run(
                    char.character,
                    char.unicode,
                    char.radical,
                    char.stroke_count,
                    char.ids_sequence,
                    char.structure_type,
                    JSON.stringify(char.direct_components),
                    JSON.stringify(char.all_components),
                    char.source,
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });
        }
        
        // Finalize statement and commit transaction
        await new Promise((resolve, reject) => {
            stmt.finalize(err => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        await dbRun('COMMIT');
        
        console.log('Migration complete!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        await dbRun('ROLLBACK');
        process.exit(1);
    }
}

migrate(); 
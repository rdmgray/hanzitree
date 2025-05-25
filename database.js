const sqlite3 = require('better-sqlite3');
const path = require('path');

class Database {
    constructor() {
        this.db = new sqlite3(path.join(__dirname, 'hanzi.db'));
        
        // Prepare statements
        this.getCharacterStmt = this.db.prepare('SELECT * FROM characters WHERE character = ?');
        this.searchCharactersStmt = this.db.prepare(`
            SELECT * FROM characters 
            WHERE character LIKE ? 
            OR unicode LIKE ? 
            OR structure_type LIKE ?
            LIMIT 50
        `);
        this.randomCharacterStmt = this.db.prepare('SELECT * FROM characters ORDER BY RANDOM() LIMIT 1');
    }

    _formatCharacterData(row) {
        if (!row) return null;
        
        return {
            character: row.character,
            unicode: row.unicode,
            radical: row.radical,
            strokes: row.stroke_count,
            decomposition: {
                primary: {
                    components: JSON.parse(row.direct_components),
                    structure: row.ids_sequence,
                    description: row.structure_type,
                }
            }
        };
    }
}

// Browser-compatible database implementation
window.DatabaseAPI = {
    async loadCharacter(character) {
        try {
            console.log('Fetching character:', character);
            const response = await fetch(`/api/character/${encodeURIComponent(character)}`);
            console.log('Response status:', response.status);
            const text = await response.text();
            console.log('Raw response:', text);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
            }
            
            const data = JSON.parse(text);
            console.log('Parsed character data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching character:', error);
            throw error;
        }
    },

    async loadRandomCharacter() {
        try {
            console.log('Fetching random character');
            const response = await fetch('/api/character/random');
            console.log('Random character response status:', response.status);
            const text = await response.text();
            console.log('Raw response:', text);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
            }
            
            const data = JSON.parse(text);
            console.log('Parsed random character data:', data);
            return data;
        } catch (error) {
            console.error('Error fetching random character:', error);
            throw error;
        }
    },

    async searchCharacters(query) {
        try {
            console.log('Searching for:', query);
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            console.log('Search response status:', response.status);
            const text = await response.text();
            console.log('Raw response:', text);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, response: ${text}`);
            }
            
            const data = JSON.parse(text);
            console.log('Parsed search results:', data);
            return data;
        } catch (error) {
            console.error('Error searching characters:', error);
            throw error;
        }
    }
};
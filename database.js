// Mock database for Chinese characters
const CharacterDatabase = {
    characters: {
        '安': {
            character: '安',
            unicode: 'U+5B89',
            radical: '宀 (40)',
            strokes: 6,
            hskLevel: 1,
            decomposition: {
                primary: {
                    components: ['宀', '女'],
                    structure: '⿱',
                    description: 'Top-Bottom composition',
                    meanings: ['roof, shelter', 'woman']
                },
                semantic: {
                    description: 'A woman (女) under a roof (宀) represents safety and peace. The character suggests the security found in having shelter and family.',
                    concepts: ['peace', 'safety', 'security', 'calm']
                },
                atomic: {
                    components: ['宀', '女'],
                    description: 'Both components are atomic radicals that cannot be further decomposed meaningfully.'
                }
            },
            meanings: ['peace', 'safe', 'secure', 'calm', 'quiet'],
            pronunciation: {
                pinyin: 'ān',
                tone: 1
            }
        },
        '宀': {
            character: '宀',
            unicode: 'U+5B80',
            radical: '宀 (40)',
            strokes: 3,
            hskLevel: null,
            decomposition: {
                primary: {
                    components: ['宀'],
                    structure: 'atomic',
                    description: 'Atomic radical - roof/shelter',
                    meanings: ['roof', 'shelter', 'house']
                }
            },
            meanings: ['roof', 'shelter', 'house', 'dwelling'],
            pronunciation: {
                pinyin: 'mián',
                tone: 2
            }
        },
        '女': {
            character: '女',
            unicode: 'U+5973',
            radical: '女 (38)',
            strokes: 3,
            hskLevel: 1,
            decomposition: {
                primary: {
                    components: ['女'],
                    structure: 'atomic',
                    description: 'Atomic radical - woman',
                    meanings: ['woman', 'female']
                }
            },
            meanings: ['woman', 'female', 'girl'],
            pronunciation: {
                pinyin: 'nǚ',
                tone: 3
            }
        },
        '木': {
            character: '木',
            unicode: 'U+6728',
            radical: '木 (75)',
            strokes: 4,
            hskLevel: 1,
            decomposition: {
                primary: {
                    components: ['木'],
                    structure: 'atomic',
                    description: 'Atomic radical - tree/wood',
                    meanings: ['tree', 'wood']
                }
            },
            meanings: ['tree', 'wood', 'timber'],
            pronunciation: {
                pinyin: 'mù',
                tone: 4
            }
        },
        '林': {
            character: '林',
            unicode: 'U+6797',
            radical: '木 (75)',
            strokes: 8,
            hskLevel: 2,
            decomposition: {
                primary: {
                    components: ['木', '木'],
                    structure: '⿰',
                    description: 'Left-Right composition',
                    meanings: ['tree', 'tree']
                },
                semantic: {
                    description: 'Two trees (木木) together represent a forest or grove.',
                    concepts: ['forest', 'grove', 'woods', 'many trees']
                },
                atomic: {
                    components: ['木', '木'],
                    description: 'Composed of two identical tree radicals.'
                }
            },
            meanings: ['forest', 'grove', 'woods'],
            pronunciation: {
                pinyin: 'lín',
                tone: 2
            }
        },
        '森': {
            character: '森',
            unicode: 'U+68EE',
            radical: '木 (75)',
            strokes: 12,
            hskLevel: 2,
            decomposition: {
                primary: {
                    components: ['林', '木'],
                    structure: '⿱',
                    description: 'Top-Bottom composition',
                    meanings: ['forest', 'tree']
                },
                secondary: {
                    components: ['木', '木', '木'],
                    structure: 'triple',
                    description: 'Three trees stacked',
                    meanings: ['tree', 'tree', 'tree']
                },
                semantic: {
                    description: 'Three trees (木木木) represent a dense forest, emphasizing abundance and density.',
                    concepts: ['dense forest', 'jungle', 'wilderness', 'abundance of trees']
                },
                atomic: {
                    components: ['木', '木', '木'],
                    description: 'Composed of three tree radicals arranged in a triangular pattern.'
                }
            },
            meanings: ['dense forest', 'jungle', 'wilderness'],
            pronunciation: {
                pinyin: 'sēn',
                tone: 1
            }
        }
    },

    // Get character data by character
    getCharacter(char) {
        return this.characters[char] || null;
    },

    // Get random character
    getRandomCharacter() {
        const chars = Object.keys(this.characters);
        const randomIndex = Math.floor(Math.random() * chars.length);
        const randomChar = chars[randomIndex];
        return this.characters[randomChar];
    },

    // Check if character exists
    hasCharacter(char) {
        return char in this.characters;
    },

    // Get all characters (for search/browse)
    getAllCharacters() {
        return Object.values(this.characters);
    },

    // Search characters by meaning or pronunciation
    searchCharacters(query) {
        query = query.toLowerCase();
        return Object.values(this.characters).filter(char => {
            return char.meanings.some(meaning => meaning.includes(query)) ||
                   char.pronunciation.pinyin.includes(query) ||
                   char.character.includes(query);
        });
    }
};

// Simulate async database operations
const DatabaseAPI = {
    async loadCharacter(character) {
        // Simulate network delay
        await this.delay(300 + Math.random() * 500);
        
        const data = CharacterDatabase.getCharacter(character);
        if (!data) {
            throw new Error(`Character '${character}' not found`);
        }
        return data;
    },

    async loadRandomCharacter() {
        await this.delay(200 + Math.random() * 300);
        return CharacterDatabase.getRandomCharacter();
    },

    async searchCharacters(query) {
        await this.delay(100 + Math.random() * 200);
        return CharacterDatabase.searchCharacters(query);
    },

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};
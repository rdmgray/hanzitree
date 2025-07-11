// Database API client
const DatabaseClient = {

    async loadCharacter(character) {
        const response = await fetch(`/api/data/character/${encodeURIComponent(character)}`);
        if (!response.ok) {
            throw new Error('Failed to load character');
        }
        return response.json();
    },

    async loadRandomCharacter() {
        const response = await fetch('/api/data/random');
        if (!response.ok) {
            throw new Error('Failed to load random character');
        }
        return response.json();
    },

    async loadCharacterByUnicode(unicode) {
        const response = await fetch(`/api/data/unicode/${encodeURIComponent(unicode)}`);
        if (!response.ok) {
            throw new Error('Failed to load character by unicode');
        }
        return response.json();
    },

    async loadComponents({ character, component, target, structure }) {
        
        const params = new URLSearchParams({
            character,
            component,
            target,
            structure
        });
        const response = await fetch(`/api/data/components?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to load components');
        }
        return response.json();
    },

    async loadTopStartCharacters() {
        const response = await fetch('/api/data/top-characters');
        if (!response.ok) {
            throw new Error('Failed to load top start characters');
        }
        return response.json();
    },

    async checkComponentAvailability(character) {
        const params = new URLSearchParams({ character });
        const response = await fetch(`/api/data/components/available?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to check component availability');
        }
        return response.json();
    },

    async searchCharacters(query, limit = 10) {
        const params = new URLSearchParams({ q: query, limit });
        const response = await fetch(`/api/data/search?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to search characters');
        }
        return response.json();
    }

};
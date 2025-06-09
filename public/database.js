const DatabaseAPI = {

    async loadCharacter(character) {
        const response = await fetch(`/api/data/character/${character}`);
        if (!response.ok) {
            throw new Error(`Character '${character}' not found`);
        }
        const record = await response.json();
        return record;
    },

    async loadRandomCharacter() {
        const response = await fetch(`/api/data/random`);
        if (!response.ok) {
            throw new Error('Failed to load random character');
        }
        const record = await response.json();
        return record;
    },

};
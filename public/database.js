const DatabaseAPI = {

    async loadCharacter(character) {
        
        const response = await fetch(`/api/data/random`)
        if (!response) {
            throw new Error(`Character '${character}' not found`);
        }
        const record = await response.json();
        return record;
    },

    async loadRandomCharacter() {
        
        const response = await fetch(`/api/data/random`)
        const record = await response.json();
        return response
    },

};
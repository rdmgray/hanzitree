// Main application class
class HanziTreeApp {
    constructor() {
        this.currentCharacter = null;
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.mainCharacterEl = document.getElementById('main-character');
        this.characterMetaEl = document.getElementById('character-meta');
        this.decompLevelsEl = document.getElementById('decomp-levels');
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadCharacter('安'); // Load default character
    }

    setupEventListeners() {
        // Header button functionality
        document.querySelectorAll('.header-btn').forEach(btn => {
            btn.addEventListener('click', this.handleHeaderAction.bind(this));
        });

        // Main character click for random
        this.mainCharacterEl.addEventListener('click', () => {
            this.loadRandomCharacter();
        });
    }

    async handleHeaderAction(event) {
        const action = event.target.dataset.action;
        
        switch (action) {
            case 'search':
                this.showSearchDialog();
                break;
            case 'random':
                await this.loadRandomCharacter();
                break;
            case 'favorites':
                this.showFavorites();
                break;
            case 'settings':
                this.showSettings();
                break;
        }
    }

    showLoading(show = true) {
        this.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    async loadCharacter(character) {
        try {
            this.showLoading(true);
            
            const data = await DatabaseAPI.loadCharacter(character);
            this.currentCharacter = data;
            this.renderCharacter(data);
            
            // Update URL without page reload
            if (history.pushState) {
                const newUrl = `${window.location.pathname}?char=${encodeURIComponent(character)}`;
                history.pushState({ character }, '', newUrl);
            }
            
        } catch (error) {
            console.error('Error loading character:', error);
            this.showError('Failed to load character data');
        } finally {
            this.showLoading(false);
        }
    }

    async loadRandomCharacter() {
        try {
            this.showLoading(true);
            
            const data = await DatabaseAPI.loadRandomCharacter();
            this.currentCharacter = data;
            this.renderCharacter(data);
            
        } catch (error) {
            console.error('Error loading random character:', error);
            this.showError('Failed to load random character');
        } finally {
            this.showLoading(false);
        }
    }

    renderCharacter(data) {
        // Render main character
        this.mainCharacterEl.textContent = data.character;
        this.mainCharacterEl.classList.add('fade-in');
        
        // Render meta information
        this.renderCharacterMeta(data);
        
        // Render decomposition
        this.renderDecomposition(data);
        
        // Update page title
        document.title = `${data.character} - HanziTree`;
    }

    renderCharacterMeta(data) {
        const metaItems = [
            data.unicode,
            `Radical: ${data.radical}`,
            `${data.strokes} strokes`,
            data.hskLevel ? `HSK Level ${data.hskLevel}` : 'Not in HSK'
        ];

        this.characterMetaEl.innerHTML = metaItems
            .map(item => `<div class="meta-item">${item}</div>`)
            .join('');
        
        this.characterMetaEl.classList.add('fade-in');
    }

    renderDecomposition(data) {
        const decomp = data.decomposition;
        let html = '';

        // Primary structure
        if (decomp.primary) {
            html += this.createDecompLevel(
                'Primary Structure',
                decomp.primary.components,
                decomp.primary.structure,
                decomp.primary.description,
                decomp.primary.meanings
            );
        }

        // Secondary structure (if exists)
        if (decomp.secondary) {
            html += this.createDecompLevel(
                'Secondary Structure',
                decomp.secondary.components,
                decomp.secondary.structure,
                decomp.secondary.description,
                decomp.secondary.meanings
            );
        }

        // Semantic analysis
        if (decomp.semantic) {
            html += this.createSemanticLevel(
                'Semantic Analysis',
                decomp.semantic.description,
                decomp.semantic.concepts
            );
        }

        // Atomic components
        if (decomp.atomic) {
            html += this.createAtomicLevel(
                'Atomic Components',
                decomp.atomic.components,
                decomp.atomic.description
            );
        }

        this.decompLevelsEl.innerHTML = html;
        this.decompLevelsEl.classList.add('fade-in');
        
        // Add click handlers for components
        this.setupComponentClickHandlers();
    }

    createDecompLevel(label, components, structure, description, meanings) {
        const formula = this.createDecompFormula(components, this.currentCharacter.character);
        const meaningTags = meanings ? meanings.map(m => `<div class="meaning-tag">${m}</div>`).join('') : '';
        
        return `
            <div class="decomp-level">
                <div class="level-label">${label}</div>
                <div class="decomp-formula">${formula}</div>
                <div class="structure-info">${structure} - ${description}</div>
                <div class="component-meanings">${meaningTags}</div>
            </div>
        `;
    }

    createSemanticLevel(label, description, concepts) {
        const conceptTags = concepts.map(c => `<div class="meaning-tag">${c}</div>`).join('');
        
        return `
            <div class="decomp-level">
                <div class="level-label">${label}</div>
                <div class="structure-info">${description}</div>
                <div class="component-meanings">${conceptTags}</div>
            </div>
        `;
    }

    createAtomicLevel(label, components, description) {
        const componentHtml = components.map(c => `<div class="component" data-char="${c}">${c}</div>`).join('');
        
        return `
            <div class="decomp-level">
                <div class="level-label">${label}</div>
                <div class="decomp-formula">${componentHtml}</div>
                <div class="structure-info">${description}</div>
            </div>
        `;
    }

    createDecompFormula(components, targetChar) {
        let html = '';
        
        components.forEach((component, index) => {
            html += `<div class="component" data-char="${component}">${component}</div>`;
            if (index < components.length - 1) {
                html += '<div class="plus-sign">+</div>';
            }
        });
        
        if (components.length > 1) {
            html += '<div class="equals-sign">=</div>';
            html += `<div class="component" data-char="${targetChar}">${targetChar}</div>`;
        }
        
        return html;
    }

    setupComponentClickHandlers() {
        const components = document.querySelectorAll('.component[data-char]');
        components.forEach(component => {
            component.addEventListener('click', () => {
                const char = component.dataset.char;
                if (char && char !== this.currentCharacter.character) {
                    this.loadCharacter(char);
                }
            });
        });
    }

    showSearchDialog() {
        const query = prompt('Enter a character, pinyin, or meaning to search:');
        if (query && query.trim()) {
            this.performSearch(query.trim());
        }
    }

    async performSearch(query) {
        try {
            this.showLoading(true);
            
            const results = await DatabaseAPI.searchCharacters(query);
            
            if (results.length === 0) {
                alert('No characters found matching your search.');
                return;
            }
            
            if (results.length === 1) {
                await this.loadCharacter(results[0].character);
            } else {
                this.showSearchResults(results);
            }
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Search failed');
        } finally {
            this.showLoading(false);
        }
    }

    showSearchResults(results) {
        const resultList = results.map(r => 
            `${r.character} (${r.pronunciation.pinyin}) - ${r.meanings.slice(0, 3).join(', ')}`
        ).join('\n');
        
        const selection = prompt(`Multiple results found:\n\n${resultList}\n\nEnter the character you want to view:`);
        
        if (selection && selection.trim()) {
            const selected = results.find(r => r.character === selection.trim());
            if (selected) {
                this.loadCharacter(selected.character);
            } else {
                alert('Invalid selection.');
            }
        }
    }

    showFavorites() {
        alert('Favorites feature coming soon!');
    }

    showSettings() {
        alert('Settings feature coming soon!');
    }

    showError(message) {
        alert(`Error: ${message}`);
    }

    // Handle browser back/forward
    handlePopState(event) {
        if (event.state && event.state.character) {
            this.loadCharacter(event.state.character);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new HanziTreeApp();
    
    // Handle browser navigation
    window.addEventListener('popstate', (event) => {
        app.handlePopState(event);
    });
    
    // Check URL for initial character
    const urlParams = new URLSearchParams(window.location.search);
    const charParam = urlParams.get('char');
    if (charParam && charParam !== '安') {
        app.loadCharacter(charParam);
    }
});

// Remove fade-in classes after animation
document.addEventListener('animationend', (event) => {
    if (event.target.classList.contains('fade-in')) {
        event.target.classList.remove('fade-in');
    }
});
// Main application class
class HanziTree {
    constructor() {
        this.currentCharacter = null;
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.mainCharacterEl = document.getElementById('main-character');
        this.characterMetaEl = document.getElementById('character-meta');
        
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
            
            const data = await DatabaseClient.loadCharacter(character);
            this.currentCharacter = data;
            this.renderCharacter(data);
            
            // Update URL without page reload
            if (history.pushState) {
                const newUrl = `${window.location.pathname}?unicode=${encodeURIComponent(data.unicode)}`;
                history.pushState({ unicode: data.unicode }, '', newUrl);
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
            
            const data = await DatabaseClient.loadRandomCharacter();
            this.currentCharacter = data;
            this.renderCharacter(data);
            
            // Update URL without page reload
            if (history.pushState) {
                const newUrl = `${window.location.pathname}?unicode=${encodeURIComponent(data.unicode)}`;
                history.pushState({ unicode: data.unicode }, '', newUrl);
            }
            
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
            `Structure: ${data.structure}`
        ];

        this.characterMetaEl.innerHTML = metaItems
            .map(item => `<div class="meta-item">${item}</div>`)
            .join('');
        
        this.characterMetaEl.classList.add('fade-in');
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
        alert('Search feature coming soon!');
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
        if (event.state && event.state.unicode) {
            // Find the character for this unicode value
            DatabaseClient.loadCharacterByUnicode(event.state.unicode)
                .then(data => {
                    this.currentCharacter = data;
                    this.renderCharacter(data);
                })
                .catch(error => {
                    console.error('Error loading character by unicode:', error);
                    this.showError('Failed to load character data');
                });
        }
    }

    renderDecomposition(data) {
        const decompLevelsEl = document.getElementById('decomp-levels');
        // Clear previous content
        decompLevelsEl.innerHTML = '';

        // Only show if at least one component exists
        if (data.component_1 || data.component_2 || data.component_3) {
            const components = [data.component_1, data.component_2, data.component_3].filter(Boolean);
            
            decompLevelsEl.innerHTML = `
                <div class="decomp-level">
                    <div class="level-label">Components</div>
                    <div class="components-list">
                        ${components.map(char => 
                            `<span class="component" data-char="${char}">${char}</span>`
                        ).join('')}
                    </div>
                    <div class="structure-info">Structure: ${data.structure || ''}</div>
                </div>
            `;

            // Add click handlers for components
            this.setupComponentClickHandlers();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new HanziTree();
    
    // Handle browser navigation
    window.addEventListener('popstate', (event) => {
        app.handlePopState(event);
    });
    
    // Check URL for initial unicode
    const urlParams = new URLSearchParams(window.location.search);
    const unicodeParam = urlParams.get('unicode');
    if (unicodeParam) {
        DatabaseClient.loadCharacterByUnicode(unicodeParam)
            .then(data => {
                app.currentCharacter = data;
                app.renderCharacter(data);
            })
            .catch(error => {
                console.error('Error loading initial character:', error);
                app.showError('Failed to load character data');
            });
    }
});

// Remove fade-in classes after animation
document.addEventListener('animationend', (event) => {
    if (event.target.classList.contains('fade-in')) {
        event.target.classList.remove('fade-in');
    }
});
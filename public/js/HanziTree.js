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
        await this.loadCharacter('木'); // Load default character
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

        // Logo and name click for home
        const logo = document.querySelector('.logo');
        if (logo) {
            logo.addEventListener('click', () => {
                this.loadCharacter('木');
            });
        }
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
        
        // Add grow buttons if they don't exist
        this.setupGrowButtons(data);
        
        // Render character information
        this.renderCharacterInfo(data);
        
        // Render decomposition
        this.renderDecomposition(data);
                
        // Update page title
        document.title = `${data.character} - HanziTree`;
    }

    setupGrowButtons(data) {
        const growDirections = [
            { id: 'grow-right', label: 'Grow right', component: 'component_1', target: 'component_2', structure: 'left-right' },
            { id: 'grow-left', label: 'Grow left', component: 'component_2', target: 'component_1', structure: 'left-right' },
            { id: 'grow-above', label: 'Grow above', component: 'component_2', target: 'component_1', structure: 'top-bottom' },
            { id: 'grow-below', label: 'Grow below', component: 'component_1', target: 'component_2', structure: 'top-bottom' }
        ];

        growDirections.forEach(direction => {
            if (!document.getElementById(direction.id)) {
                const button = document.createElement('button');
                button.id = direction.id;
                button.className = 'grow-btn';
                button.textContent = direction.label;
                button.dataset.direction = JSON.stringify(direction);
                button.addEventListener('click', () => this.handleGrow(direction, data));
                this.mainCharacterEl.parentNode.appendChild(button);
            }
        });
    }

    async handleGrow(direction, data) {
        try {
            this.showLoading(true);
            
            const currentChar = this.currentCharacter.character;
            console.log('Handling grow:', { direction, character: currentChar });
            
            // Query database for components
            const results = await DatabaseClient.loadComponents({
                character: currentChar,
                component: direction.component,
                target: direction.target,
                structure: direction.structure
            });

            console.log('Got results:', results);
            
            // Replace button with results
            this.displayGrowResults(results, direction);
            
        } catch (error) {
            console.error('Error loading components:', error);
            this.showError('Failed to load components');
        } finally {
            this.showLoading(false);
        }
    }

    displayGrowResults(results, direction) {
        const growBtn = document.getElementById(direction.id);
        if (!growBtn) return;

        // Remove any existing result containers
        document.querySelectorAll('.grow-results').forEach(container => {
            container.remove();
        });

        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'grow-results';
        resultsContainer.id = `${direction.id}-results`;
        
        // Create grid of results
        resultsContainer.innerHTML = `
            <div class="results-grid">
                ${results.map(result => `
                    <div class="result-item">
                        ${result[direction.target]}
                    </div>
                `).join('')}
            </div>
            <button class="back-btn">Back</button>
        `;

        // Add click handlers for results
        const resultItems = resultsContainer.querySelectorAll('.result-item');
        resultItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                const result = results[index];
                if (result && result.character) {
                    // Remove all result containers before loading new character
                    document.querySelectorAll('.grow-results').forEach(container => {
                        container.remove();
                    });
                    this.loadCharacter(result.character);
                }
            });
        });

        // Add click handler for back button
        resultsContainer.querySelector('.back-btn').addEventListener('click', () => {
            this.restoreGrowButton(direction.id);
        });

        // Replace button with results
        growBtn.replaceWith(resultsContainer);
    }

    restoreGrowButton(buttonId) {
        const resultsContainer = document.getElementById(`${buttonId}-results`);
        if (!resultsContainer) return;

        // Remove all result containers
        document.querySelectorAll('.grow-results').forEach(container => {
            container.remove();
        });

        // Re-render the main character view
        this.renderCharacter(this.currentCharacter);
    }

    renderCharacterInfo(data) {
        // Remove existing info section if it exists
        const existingInfoSection = document.getElementById('character-info');
        if (existingInfoSection) {
            existingInfoSection.remove();
        }

        const infoSection = document.createElement('div');
        infoSection.id = 'character-info';
        infoSection.className = 'info-section fade-in';
        
        const infoItems = [
            { label: 'Pronunciation', value: data.pronunciation || 'N/A' },
            { label: 'Meaning', value: data.meaning || 'N/A' },
            { label: 'Frequency Score', value: data.frequency_score || 'N/A' },
            { label: 'Stroke Count', value: data.stroke_count || 'N/A' }
        ];

        infoSection.innerHTML = `
            <div class="section-title">Character Information</div>
            <div class="info-grid">
                ${infoItems.map(item => `
                    <div class="info-item">
                        <div class="info-label">${item.label}</div>
                        <div class="info-value">${item.value}</div>
                    </div>
                `).join('')}
            </div>
        `;

        // Insert after character display and before decomposition section
        const characterSection = document.querySelector('.character-section');
        const decompositionSection = document.querySelector('.decomposition-section');
        characterSection.insertBefore(infoSection, decompositionSection);
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

        // Show base components if they exist
        if (data.lowest_components) {
            try {
                // Parse the Python list string into an array
                // Remove the square brackets and split by comma
                const componentsStr = data.lowest_components
                const allComponents = componentsStr
                    .split(',')
                    .map(c => c.trim().replace(/['"]/g, '')) // Remove quotes and trim
                    .filter(c => c); // Remove empty strings

                if (allComponents.length > 0) {
                    const allComponentsSection = document.createElement('div');
                    allComponentsSection.className = 'decomp-level';
                    allComponentsSection.innerHTML = `
                        <div class="level-label">All Components</div>
                        <div class="components-list">
                            ${allComponents.map(char => 
                                `<span class="component" data-char="${char}">${char}</span>`
                            ).join('')}
                        </div>
                    `;
                    
                    decompLevelsEl.appendChild(allComponentsSection);
                    
                    // Add click handlers for all components
                    this.setupComponentClickHandlers();
                }
            } catch (error) {
                console.error('Error parsing all_components:', error);
            }
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
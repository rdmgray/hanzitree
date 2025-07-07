// toolbar.js: Centralized toolbar management for HanziTree

const Toolbar = {
    // Toolbar HTML template
    template: `
        <div class="header">
            <div class="header-content">
                <a href="index.html" class="logo" style="text-decoration: none; color: inherit;">
                    <div class="logo-icon">木</div>
                    <h1>HanziTree</h1>
                </a>
                <div class="header-buttons">
                    <button class="header-btn" data-action="search">Search</button>
                    <button class="header-btn" data-action="random">Random</button>
                    <a class="header-btn" href="top-starts.html">Top starts</a>
                    <a class="header-btn" href="index.html#settings">Settings</a>
                </div>
            </div>
        </div>
    `,

    // Initialize toolbar
    init() {
        this.render();
        this.setupEventListeners();
    },

    // Render toolbar HTML
    render() {
        const toolbarContainer = document.getElementById('toolbar');
        if (toolbarContainer) {
            toolbarContainer.innerHTML = this.template;
        }
    },

    // Set up centralized event listeners
    setupEventListeners() {
        // Use event delegation for all toolbar interactions
        document.addEventListener('click', (event) => {
            // Handle header button clicks
            if (event.target.matches('.header-btn[data-action]')) {
                event.preventDefault();
                const action = event.target.getAttribute('data-action');
                this.handleAction(action);
                return;
            }
            
            // Handle logo clicks
            if (event.target.closest('.logo')) {
                event.preventDefault();
                this.handleAction('home');
                return;
            }
        });
    },

    // Centralized action handler
    async handleAction(action) {
        switch (action) {
            case 'search':
                this.handleSearch();
                break;
            case 'random':
                await this.handleRandom();
                break;
            case 'home':
                this.handleHome();
                break;
            case 'favorites':
                this.handleFavorites();
                break;
            case 'settings':
                this.handleSettings();
                break;
            default:
                console.warn(`Unknown toolbar action: ${action}`);
        }
    },

    // Action handlers
    handleSearch() {
        if (window.SearchModal) {
            window.SearchModal.open();
        } else {
            window.location.href = 'index.html';
        }
    },

    async handleRandom() {
        if (window.HanziTree && window.HanziTree.loadRandomCharacter) {
            // Use HanziTree instance if available
            await window.HanziTree.loadRandomCharacter();
        } else {
            // Fallback to URL navigation
            window.location.href = 'index.html#random';
        }
    },

    handleHome() {
        if (window.HanziTree && window.HanziTree.loadCharacter) {
            // Use HanziTree instance if available
            window.HanziTree.loadCharacter('木');
        } else {
            // Fallback to URL navigation
            window.location.href = 'index.html';
        }
    },

    handleFavorites() {
        alert('Favorites feature coming soon!');
    },

    handleSettings() {
        alert('Settings feature coming soon!');
    }
};

// Initialize toolbar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Toolbar.init();
});

// Make Toolbar globally available
window.Toolbar = Toolbar; 
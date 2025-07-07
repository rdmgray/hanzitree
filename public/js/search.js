// Search functionality
const SearchModal = {
    modal: null,
    input: null,
    resultsContainer: null,
    isOpen: false,
    debounceTimer: null,

    init() {
        this.createModal();
        this.setupEventListeners();
    },

    createModal() {
        this.modal = document.createElement('div');
        this.modal.className = 'search-modal';
        this.modal.innerHTML = `
            <div class="search-modal-overlay"></div>
            <div class="search-modal-content">
                <div class="search-modal-header">
                    <h2>Search Characters</h2>
                    <button class="search-close-btn" type="button">×</button>
                </div>
                <div class="search-input-container">
                    <input type="text" class="search-input" placeholder="Enter character, pinyin, or meaning..." maxlength="50">
                    <div class="search-help">
                        Search by character (木), pinyin (mu), or meaning (wood)
                    </div>
                </div>
                <div class="search-results-container">
                    <div class="search-results"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.modal);
        
        this.input = this.modal.querySelector('.search-input');
        this.resultsContainer = this.modal.querySelector('.search-results');
    },

    setupEventListeners() {
        const overlay = this.modal.querySelector('.search-modal-overlay');
        const closeBtn = this.modal.querySelector('.search-close-btn');
        
        overlay.addEventListener('click', () => this.close());
        closeBtn.addEventListener('click', () => this.close());
        
        this.input.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });
        
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    },

    async performSearch(query) {
        if (!query.trim()) {
            this.resultsContainer.innerHTML = '';
            return;
        }

        try {
            this.resultsContainer.innerHTML = '<div class="search-loading">Searching...</div>';
            
            const results = await DatabaseClient.searchCharacters(query, 15);
            
            if (results.length === 0) {
                this.resultsContainer.innerHTML = '<div class="search-no-results">No characters found</div>';
                return;
            }
            
            this.displayResults(results);
        } catch (error) {
            console.error('Search error:', error);
            this.resultsContainer.innerHTML = '<div class="search-error">Search failed. Please try again.</div>';
        }
    },

    displayResults(results) {
        const resultsHTML = results.map(char => `
            <div class="search-result-item" data-unicode="${char.unicode}">
                <div class="search-result-char">${char.character}</div>
                <div class="search-result-info">
                    <div class="search-result-pronunciation">${char.pronunciation || 'N/A'}</div>
                    <div class="search-result-meaning">${char.meaning || 'N/A'}</div>
                    <div class="search-result-meta">
                        <span class="search-result-unicode">${char.unicode}</span>
                        <span class="search-result-strokes">${char.stroke_count || 0} strokes</span>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.resultsContainer.innerHTML = resultsHTML;
        
        // Add click handlers to results
        this.resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const unicode = item.getAttribute('data-unicode');
                this.navigateToCharacter(unicode);
            });
        });
    },

    navigateToCharacter(unicode) {
        this.close();
        
        // Navigate to character page
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            // On main page, load the character directly
            if (window.HanziTree && window.HanziTree.loadCharacterByUnicode) {
                window.HanziTree.loadCharacterByUnicode(unicode);
            } else {
                // Fallback: update URL and reload
                const newUrl = `${window.location.origin}${window.location.pathname}?unicode=${unicode}`;
                window.location.href = newUrl;
            }
        } else {
            // On other pages, navigate to main page with character
            window.location.href = `index.html?unicode=${unicode}`;
        }
    },

    open() {
        if (this.isOpen) return;
        
        this.isOpen = true;
        this.modal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Focus the input after the modal is visible
        setTimeout(() => {
            this.input.focus();
        }, 100);
    },

    close() {
        if (!this.isOpen) return;
        
        this.isOpen = false;
        this.modal.classList.remove('active');
        document.body.classList.remove('modal-open');
        
        // Clear search
        this.input.value = '';
        this.resultsContainer.innerHTML = '';
        clearTimeout(this.debounceTimer);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    SearchModal.init();
});

// Make SearchModal globally available
window.SearchModal = SearchModal;
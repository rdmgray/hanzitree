// toolbar.js: Injects the shared HanziTree toolbar into the page

const toolbarHTML = `
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
`;

const toolbarContainer = document.getElementById('toolbar');
if (toolbarContainer) {
    toolbarContainer.innerHTML = toolbarHTML;
}

// Optional: Add navigation logic for Search/Random buttons
if (toolbarContainer) {
    toolbarContainer.querySelector('[data-action="search"]').onclick = () => {
        window.location.href = 'index.html';
    };
    toolbarContainer.querySelector('[data-action="random"]').onclick = () => {
        window.location.href = 'index.html#random';
    };
} 
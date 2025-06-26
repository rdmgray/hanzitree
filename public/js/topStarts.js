// topStarts.js: Populate the Top Start Characters grid

document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('top-starts-grid');
    if (!grid) return;

    // Show loading state
    grid.innerHTML = '<div style="grid-column: span 4; text-align:center; padding:2rem; color:#aaa;">Loading...</div>';

    try {
        const results = await DatabaseClient.loadTopStartCharacters();
        grid.innerHTML = '';
        // Show up to 20 items (5 rows of 4)
        results.slice(0, 20).forEach(item => {
            const div = document.createElement('div');
            div.className = 'top-start-item';
            div.innerHTML = `
                <div class=\"top-char\">${item.character}</div>
                <div class=\"top-divider\"></div>
                <div class=\"top-info-row\">
                    <span class=\"top-info-box pron\" title=\"${item.pronunciation || ''}\">${item.pronunciation || ''}</span>
                    <span class=\"top-info-box meaning\" title=\"${item.meaning ? item.meaning.replace(/&/g, '&amp;').replace(/\"/g, '&quot;') : ''}\">${item.meaning || ''}</span>
                </div>
            `;
            div.style.cursor = 'pointer';
            div.onclick = () => {
                window.location.href = `index.html?character=${encodeURIComponent(item.character)}`;
            };
            grid.appendChild(div);
        });
    } catch (err) {
        grid.innerHTML = '<div style="grid-column: span 4; text-align:center; padding:2rem; color:#e11d48;">Failed to load top start characters.</div>';
    }
}); 
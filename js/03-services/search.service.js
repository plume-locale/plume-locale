/**
 * Global Search Service
 * Recherche globale dans tout le projet
 */

const SearchService = (() => {
    'use strict';

    let searchTimeout = null;

    function getPreview(text, matchIndex, queryLength) {
        const start = Math.max(0, matchIndex - 60);
        const end = Math.min(text.length, matchIndex + queryLength + 90);
        let preview = text.substring(start, end);

        if (start > 0) preview = '...' + preview;
        if (end < text.length) preview = preview + '...';

        return preview;
    }

    function searchEverywhere(query) {
        const state = StateManager.getState();
        const project = state.project;
        const results = [];
        const lowerQuery = query.toLowerCase();

        // Search in scenes
        project.acts?.forEach(act => {
            act.chapters?.forEach(chapter => {
                chapter.scenes?.forEach(scene => {
                    const temp = document.createElement('div');
                    temp.innerHTML = scene.content || '';
                    const textContent = temp.textContent || temp.innerText || '';

                    if (scene.title.toLowerCase().includes(lowerQuery) ||
                        textContent.toLowerCase().includes(lowerQuery)) {

                        const matchIndex = textContent.toLowerCase().indexOf(lowerQuery);
                        const preview = matchIndex >= 0
                            ? getPreview(textContent, matchIndex, query.length)
                            : textContent.substring(0, 150);

                        results.push({
                            type: 'Scène',
                            title: scene.title,
                            path: act.title + ' > ' + chapter.title,
                            preview: preview,
                            action: () => typeof openScene === 'function' && openScene(act.id, chapter.id, scene.id)
                        });
                    }
                });
            });
        });

        // Search in characters
        project.characters?.forEach(char => {
            const searchText = (char.name + ' ' + (char.role || '') + ' ' + (char.description || '') + ' ' + (char.personality || '') + ' ' + (char.background || '')).toLowerCase();
            if (searchText.includes(lowerQuery)) {
                results.push({
                    type: 'Personnage',
                    title: char.name,
                    path: char.role || 'Personnage',
                    preview: char.description || 'Aucune description',
                    action: () => {
                        if (typeof switchView === 'function') switchView('characters');
                        if (typeof openCharacterDetail === 'function') openCharacterDetail(char.id);
                    }
                });
            }
        });

        // Search in world elements
        project.world?.forEach(element => {
            const searchText = (element.name + ' ' + (element.description || '') + ' ' + (element.details || '')).toLowerCase();
            if (searchText.includes(lowerQuery)) {
                results.push({
                    type: 'Univers',
                    title: element.name,
                    path: element.type,
                    preview: element.description || 'Aucune description',
                    action: () => {
                        if (typeof switchView === 'function') switchView('world');
                        if (typeof openWorldDetail === 'function') openWorldDetail(element.id);
                    }
                });
            }
        });

        // Search in notes
        project.notes?.forEach(note => {
            const searchText = (note.title + ' ' + note.content).toLowerCase();
            if (searchText.includes(lowerQuery)) {
                const matchIndex = note.content.toLowerCase().indexOf(lowerQuery);
                const preview = matchIndex >= 0
                    ? getPreview(note.content, matchIndex, query.length)
                    : note.content.substring(0, 150);

                results.push({
                    type: 'Note',
                    title: note.title,
                    path: note.category,
                    preview: preview,
                    action: () => {
                        if (typeof switchView === 'function') switchView('notes');
                        if (typeof openNoteDetail === 'function') openNoteDetail(note.id);
                    }
                });
            }
        });

        return results;
    }

    function performSearch(query, debounceMs) {
        if (debounceMs === undefined) debounceMs = 300;
        clearTimeout(searchTimeout);

        const resultsContainer = document.getElementById('searchResults');

        if (!query || query.trim().length < 2) {
            if (resultsContainer) resultsContainer.classList.remove('active');
            return;
        }

        searchTimeout = setTimeout(() => {
            const results = searchEverywhere(query.trim());
            displayResults(results, query.trim());
        }, debounceMs);
    }

    function displayResults(results, query) {
        const container = document.getElementById('searchResults');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = '<div class="search-no-results">Aucun résultat trouvé</div>';
            container.classList.add('active');
            return;
        }

        const highlightQuery = (text) => {
            const regex = new RegExp('(' + query + ')', 'gi');
            return text.replace(regex, '<span class="search-highlight">$1</span>');
        };

        container.innerHTML = results.map((result, index) => {
            return '<div class="search-result-item" onclick="executeSearchAction(' + index + '); closeSearchResults();">' +
                '<div class="search-result-type">' + result.type + '</div>' +
                '<div class="search-result-title">' + highlightQuery(result.title) + '</div>' +
                '<div class="search-result-path">' + result.path + '</div>' +
                '<div class="search-result-preview">' + highlightQuery(result.preview) + '</div>' +
                '</div>';
        }).join('');

        window.searchResultActions = results.map(r => r.action);
        container.classList.add('active');
    }

    function close() {
        const container = document.getElementById('searchResults');
        const input = document.getElementById('globalSearch');
        if (container) container.classList.remove('active');
        if (input) input.value = '';
    }

    function init() {
        document.addEventListener('click', (e) => {
            const searchContainer = document.querySelector('.search-container');
            if (searchContainer && !searchContainer.contains(e.target)) {
                close();
            }
        });
    }

    return { performSearch, searchEverywhere, displayResults, close, init };
})();

window.SearchService = SearchService;
window.performGlobalSearch = (query) => SearchService.performSearch(query);
window.closeSearchResults = () => SearchService.close();
window.executeSearchAction = (index) => {
    if (window.searchResultActions && window.searchResultActions[index]) {
        window.searchResultActions[index]();
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SearchService.init());
} else {
    SearchService.init();
}

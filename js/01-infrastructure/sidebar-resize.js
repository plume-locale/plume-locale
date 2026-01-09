/**
 * Sidebar Resize Service
 * Gestion du redimensionnement de la sidebar
 */

const SidebarResizeService = (() => {
    'use strict';

    // Configuration
    const MIN_WIDTH = 200;
    const MAX_WIDTH = 600;
    const STORAGE_KEY = 'sidebarWidth';

    // État
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    /**
     * Gère le début du redimensionnement
     * @param {MouseEvent} e - Événement souris
     */
    function handleMouseDown(e) {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        isResizing = true;
        startX = e.clientX;
        startWidth = sidebar.offsetWidth;

        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';

        e.preventDefault();
    }

    /**
     * Gère le mouvement de la souris pendant le redimensionnement
     * @param {MouseEvent} e - Événement souris
     */
    function handleMouseMove(e) {
        if (!isResizing) return;

        const sidebar = document.querySelector('.sidebar');
        const appContainer = document.querySelector('.app-container');

        if (!sidebar || !appContainer) return;

        const diff = e.clientX - startX;
        const newWidth = startWidth + diff;

        // Respecter min et max width
        if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
            sidebar.style.width = newWidth + 'px';
            appContainer.style.gridTemplateColumns = `${newWidth}px 1fr`;
        }
    }

    /**
     * Gère la fin du redimensionnement
     */
    function handleMouseUp() {
        if (!isResizing) return;

        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';

        // Sauvegarder la largeur dans localStorage
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) {
            localStorage.setItem(STORAGE_KEY, sidebar.offsetWidth.toString());
            console.log('[SidebarResize] Largeur sauvegardée:', sidebar.offsetWidth);

            // Émettre un événement
            if (window.EventBus) {
                EventBus.emit('sidebar:resized', { width: sidebar.offsetWidth });
            }
        }
    }

    /**
     * Charge la largeur sauvegardée
     */
    function loadSavedWidth() {
        const savedWidth = localStorage.getItem(STORAGE_KEY);
        if (!savedWidth) return;

        const width = parseInt(savedWidth);
        if (isNaN(width) || width < MIN_WIDTH || width > MAX_WIDTH) {
            return;
        }

        const sidebar = document.querySelector('.sidebar');
        const appContainer = document.querySelector('.app-container');

        if (sidebar && appContainer) {
            sidebar.style.width = width + 'px';
            appContainer.style.gridTemplateColumns = `${width}px 1fr`;
            console.log('[SidebarResize] Largeur restaurée:', width);
        }
    }

    /**
     * Initialise le service de redimensionnement
     */
    function init() {
        const resizeHandle = document.getElementById('sidebarResizeHandle');
        if (!resizeHandle) {
            console.warn('[SidebarResize] Handle de redimensionnement introuvable');
            return;
        }

        // Écouter les événements souris
        resizeHandle.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        // Charger la largeur sauvegardée
        loadSavedWidth();

        console.log('[SidebarResize] Service initialisé');
    }

    /**
     * Nettoie les écouteurs d'événements
     */
    function destroy() {
        const resizeHandle = document.getElementById('sidebarResizeHandle');
        if (resizeHandle) {
            resizeHandle.removeEventListener('mousedown', handleMouseDown);
        }
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    // API publique
    return {
        init,
        destroy,
        loadSavedWidth
    };
})();

// Exposer globalement pour compatibilité
window.initSidebarResize = () => SidebarResizeService.init();

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SidebarResizeService.init());
} else {
    SidebarResizeService.init();
}

// ============================================
// COMPATIBILITY BRIDGE - Pont de compatibilité
// ============================================

/**
 * Ce fichier assure la compatibilité entre:
 * - L'ancien HTML (html/body.html) qui utilise des fonctions globales
 * - La nouvelle architecture MVC
 *
 * Il réimplémente les fonctions globales appelées par onclick="..."
 * en utilisant la nouvelle architecture quand possible.
 */

(function() {
    'use strict';

    // Variables globales nécessaires à l'ancien code
    window.currentView = window.currentView || 'editor';
    window.currentActId = window.currentActId || null;
    window.currentChapterId = window.currentChapterId || null;
    window.currentSceneId = window.currentSceneId || null;
    window.splitViewActive = window.splitViewActive || false;

    /**
     * switchView - Fonction principale de changement de vue
     * Appelée par les boutons de navigation onclick="switchView('...')"
     *
     * @param {string} view - Nom de la vue (editor, characters, notes, etc.)
     */
    window.switchView = function(view) {
        console.log(`[Bridge] switchView('${view}')`);

        // Mettre à jour la variable globale
        window.currentView = view;

        // Mapping ancien nom → nouveau nom de vue
        const viewMapping = {
            'editor': 'structure',      // Vue structure (anciennement editor)
            'characters': 'characters',  // Vue personnages
            'world': 'locations',        // Vue lieux (anciennement world)
            'notes': 'notes',            // Vue notes
            'arcs': 'arc-board',         // Vue arcs (tableau)
            'storygrid': 'story-grid'    // Vue grille
        };

        // Mettre à jour les boutons de navigation (visual)
        document.querySelectorAll('[id^="header-tab-"]').forEach(btn => {
            btn.classList.remove('active');
        });
        const headerBtn = document.getElementById(`header-tab-${view}`);
        if (headerBtn) {
            headerBtn.classList.add('active');
        }

        // Éléments UI spécifiques (sidebar, etc.)
        _updateUIElements(view);

        // Si la vue est migrée vers v2, utiliser le Router
        const newViewName = viewMapping[view];
        if (newViewName && window.Router && window[_getViewName(newViewName)]) {
            console.log(`[Bridge] Navigation vers nouvelle vue: ${newViewName}`);

            // Masquer toutes les vues
            document.querySelectorAll('.view-container, .editor-view, #editorView').forEach(el => {
                el.style.display = 'none';
            });

            // Afficher le container de la nouvelle vue
            const viewContainer = document.getElementById(`${newViewName}-view`);
            if (viewContainer) {
                viewContainer.style.display = 'block';
            }

            // Naviguer avec le Router
            Router.navigate(newViewName).catch(err => {
                console.error(`[Bridge] Erreur navigation vers ${newViewName}:`, err);
            });
        } else {
            // Vue non migrée, utiliser l'ancien code
            console.log(`[Bridge] Vue non migrée: ${view}, utilisation ancien code`);

            // L'ancien code gère ces vues via renderViewContent()
            // qui est dans 03.project.js (conservé dans build-v2)
            if (typeof renderViewContent === 'function') {
                renderViewContent(view);
            } else {
                console.warn(`[Bridge] renderViewContent non disponible pour ${view}`);
            }
        }
    };

    /**
     * switchViewMobile - Version mobile de switchView
     * Appelée par les boutons de navigation mobile
     */
    window.switchViewMobile = function(view) {
        console.log(`[Bridge] switchViewMobile('${view}')`);

        // Fermer le menu mobile
        if (typeof toggleMobileNav === 'function') {
            toggleMobileNav();
        }

        // Appeler switchView normale
        switchView(view);
    };

    /**
     * openProjectsModal - Ouvre le modal de gestion des projets
     */
    window.openProjectsModal = function() {
        console.log('[Bridge] openProjectsModal()');

        // Si ModalUI existe (nouvelle architecture)
        if (window.ModalUI) {
            ModalUI.alert(
                'Gestion des Projets',
                'La gestion des projets sera bientôt disponible dans la nouvelle architecture.'
            );
        } else {
            // Utiliser l'ancien code
            alert('Gestion des projets (à implémenter)');
        }
    };

    /**
     * Fonction helper pour obtenir le nom de la classe de vue
     */
    function _getViewName(viewId) {
        // Ex: 'characters' → 'CharactersView'
        return viewId.split('-').map(part =>
            part.charAt(0).toUpperCase() + part.slice(1)
        ).join('') + 'View';
    }

    /**
     * Met à jour les éléments UI en fonction de la vue active
     */
    function _updateUIElements(view) {
        // Éléments spécifiques à la vue Structure
        const structureOnlyElements = [
            'projectProgressBar',
            'statusFilters',
            'sceneTools'
        ];

        structureOnlyElements.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.style.display = (view === 'editor') ? '' : 'none';
            }
        });

        // Tree collapse toolbar
        const treeCollapseToolbar = document.getElementById('treeCollapseToolbar');
        const viewsWithGroups = ['editor', 'world', 'notes', 'codex'];
        if (treeCollapseToolbar) {
            treeCollapseToolbar.style.display = viewsWithGroups.includes(view) ? '' : 'none';
        }

        // Sidebar lists
        const sidebarLists = [
            'chaptersList', 'charactersList', 'worldList', 'timelineList',
            'notesList', 'codexList', 'arcsList', 'statsList', 'versionsList',
            'analysisList', 'todosList', 'corkboardList', 'mindmapList',
            'plotList', 'relationsList', 'mapList', 'timelineVizList',
            'storyGridList', 'noSidebarMessage'
        ];

        sidebarLists.forEach(listId => {
            const el = document.getElementById(listId);
            if (el) el.style.display = 'none';
        });

        // Mapping vue → sidebar
        const sidebarViews = {
            'editor': 'chaptersList',
            'characters': 'charactersList',
            'world': 'worldList',
            'notes': 'notesList',
            'codex': 'codexList',
            'arcs': 'arcsList',
            'mindmap': 'mindmapList',
            'timelineviz': 'timelineVizList'
        };

        // Afficher la sidebar appropriée
        if (sidebarViews[view]) {
            const listEl = document.getElementById(sidebarViews[view]);
            if (listEl) listEl.style.display = 'block';
        }
    }

    // Log de chargement
    console.log('[Bridge] Compatibility bridge chargé');
    console.log('[Bridge] Fonctions exposées: switchView, switchViewMobile, openProjectsModal');

})();

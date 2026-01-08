// ============================================
// SCENES VIEW - Vue Scènes
// ============================================

/**
 * ScenesView - Contrôleur pour la vue des scènes
 *
 * Responsabilités :
 * - Gérer le cycle de vie de la vue
 * - Orchestrer l'affichage et les interactions
 * - Coordonner render et handlers
 */

const ScenesView = (function() {
    'use strict';

    // État local de la vue
    let _container = null;
    let _currentFilter = 'all'; // all, draft, revision, final
    let _currentSort = 'created'; // created, updated, title, tension
    let _searchQuery = '';

    /**
     * Initialise la vue
     * @param {Object} params - Paramètres d'initialisation
     */
    async function init(params = {}) {
        _container = DOMUtils.query('#scenes-view');

        if (!_container) {
            console.error('Container #scenes-view not found');
            return;
        }

        // Récupérer les paramètres
        _currentFilter = params.filter || 'all';
        _currentSort = params.sort || 'created';
        _searchQuery = params.search || '';

        // S'abonner aux événements
        _bindEvents();

        // Rendu initial
        await render();
    }

    /**
     * S'abonner aux événements
     */
    function _bindEvents() {
        // Événements du SceneService
        EventBus.on('scene:created', () => render());
        EventBus.on('scene:updated', () => render());
        EventBus.on('scene:deleted', () => render());

        // Événements du projet
        EventBus.on('project:loaded', () => render());
    }

    /**
     * Se désabonner des événements
     */
    function _unbindEvents() {
        EventBus.off('scene:created', render);
        EventBus.off('scene:updated', render);
        EventBus.off('scene:deleted', render);
        EventBus.off('project:loaded', render);
    }

    /**
     * Rendu de la vue
     */
    async function render() {
        if (!_container) return;

        // Récupérer les scènes
        let scenes = SceneService.findAll();

        // Appliquer le filtre
        if (_currentFilter !== 'all') {
            scenes = scenes.filter(scene => scene.status === _currentFilter);
        }

        // Appliquer la recherche
        if (_searchQuery) {
            const query = _searchQuery.toLowerCase();
            scenes = scenes.filter(scene =>
                scene.title.toLowerCase().includes(query) ||
                scene.summary.toLowerCase().includes(query) ||
                scene.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Appliquer le tri
        scenes = _sortScenes(scenes, _currentSort);

        // Générer le HTML
        const html = ScenesRender.renderView({
            scenes,
            filter: _currentFilter,
            sort: _currentSort,
            searchQuery: _searchQuery
        });

        _container.innerHTML = html;

        // Attacher les handlers
        ScenesHandlers.attachHandlers(_container);
    }

    /**
     * Trie les scènes
     * @param {Array} scenes - Liste des scènes
     * @param {string} sortBy - Critère de tri
     * @returns {Array}
     */
    function _sortScenes(scenes, sortBy) {
        const sorted = [...scenes];

        switch (sortBy) {
            case 'title':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'updated':
                sorted.sort((a, b) => b.updatedAt - a.updatedAt);
                break;
            case 'tension':
                sorted.sort((a, b) => b.tension - a.tension);
                break;
            case 'created':
            default:
                sorted.sort((a, b) => b.createdAt - a.createdAt);
                break;
        }

        return sorted;
    }

    /**
     * Ouvre le modal d'ajout
     */
    async function openAddModal() {
        const formHtml = ScenesRender.renderForm();

        const modal = await ModalUI.open('add-scene', formHtml, {
            title: 'Nouvelle scène',
            size: 'large',
            closeOnBackdrop: false
        });

        // Attacher les handlers du formulaire
        ScenesHandlers.attachFormHandlers(modal, 'add');
    }

    /**
     * Ouvre le modal d'édition
     * @param {number} sceneId - ID de la scène
     */
    async function openEditModal(sceneId) {
        const scene = SceneService.findById(sceneId);

        if (!scene) {
            ToastUI.error('Scène introuvable', 'La scène demandée n\'existe pas.');
            return;
        }

        const formHtml = ScenesRender.renderForm(scene);

        const modal = await ModalUI.open('edit-scene', formHtml, {
            title: 'Modifier la scène',
            size: 'large',
            closeOnBackdrop: false
        });

        // Attacher les handlers du formulaire
        ScenesHandlers.attachFormHandlers(modal, 'edit', scene);
    }

    /**
     * Ouvre le modal de détail
     * @param {number} sceneId - ID de la scène
     */
    async function openDetailModal(sceneId) {
        const scene = SceneService.findById(sceneId);

        if (!scene) {
            ToastUI.error('Scène introuvable', 'La scène demandée n\'existe pas.');
            return;
        }

        const detailHtml = ScenesRender.renderDetail(scene);

        await ModalUI.open('scene-detail', detailHtml, {
            title: scene.title,
            size: 'large'
        });
    }

    /**
     * Supprime une scène
     * @param {number} sceneId - ID de la scène
     */
    async function deleteScene(sceneId) {
        const scene = SceneService.findById(sceneId);

        if (!scene) return;

        const confirmed = await ModalUI.confirm(
            'Supprimer la scène ?',
            `Êtes-vous sûr de vouloir supprimer "${scene.title}" ? Cette action est irréversible.`,
            {
                confirmText: 'Supprimer',
                confirmStyle: 'danger'
            }
        );

        if (confirmed) {
            try {
                SceneService.delete(sceneId);
                ToastUI.success('Scène supprimée', `"${scene.title}" a été supprimée.`);
            } catch (error) {
                ToastUI.error('Erreur', error.message);
            }
        }
    }

    /**
     * Duplique une scène
     * @param {number} sceneId - ID de la scène
     */
    function duplicateScene(sceneId) {
        try {
            const newScene = SceneService.duplicate(sceneId);
            ToastUI.success('Scène dupliquée', `"${newScene.title}" a été créée.`);
        } catch (error) {
            ToastUI.error('Erreur', error.message);
        }
    }

    /**
     * Change le filtre
     * @param {string} filter - Nouveau filtre
     */
    function setFilter(filter) {
        _currentFilter = filter;
        render();
    }

    /**
     * Change le tri
     * @param {string} sort - Nouveau tri
     */
    function setSort(sort) {
        _currentSort = sort;
        render();
    }

    /**
     * Change la recherche
     * @param {string} query - Requête de recherche
     */
    function setSearch(query) {
        _searchQuery = query;
        render();
    }

    /**
     * Détruit la vue
     */
    async function destroy() {
        _unbindEvents();

        if (_container) {
            _container.innerHTML = '';
        }

        _container = null;
        _currentFilter = 'all';
        _currentSort = 'created';
        _searchQuery = '';
    }

    // API publique
    return {
        init,
        render,
        destroy,
        openAddModal,
        openEditModal,
        openDetailModal,
        deleteScene,
        duplicateScene,
        setFilter,
        setSort,
        setSearch
    };
})();

// Exposer globalement
window.ScenesView = ScenesView;

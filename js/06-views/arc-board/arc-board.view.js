// ============================================
// ARC BOARD VIEW - Vue Tableau des Arcs
// ============================================

/**
 * ArcBoardView - Contrôleur pour la vue du tableau des arcs narratifs
 *
 * Responsabilités :
 * - Afficher les arcs narratifs en colonnes (planned, in-progress, completed)
 * - Gérer les opérations CRUD sur les arcs
 */

const ArcBoardView = (function() {
    'use strict';

    // État local
    let _container = null;
    let _filterCategory = 'all'; // all, plot, character, theme, subplot

    /**
     * Initialise la vue
     */
    async function init(params = {}) {
        _container = DOMUtils.query('#arc-board-view');

        if (!_container) {
            console.error('Container #arc-board-view not found');
            return;
        }

        _filterCategory = params.category || 'all';

        _bindEvents();
        await render();
    }

    /**
     * S'abonner aux événements
     */
    function _bindEvents() {
        EventBus.on('project:loaded', () => render());
        EventBus.on('project:updated', () => render());
    }

    /**
     * Se désabonner des événements
     */
    function _unbindEvents() {
        EventBus.off('project:loaded', render);
        EventBus.off('project:updated', render);
    }

    /**
     * Rendu de la vue
     */
    async function render() {
        if (!_container) return;

        const state = StateManager.getState();
        const project = state.project;

        if (!project) {
            _container.innerHTML = ArcBoardRender.renderEmpty();
            return;
        }

        const arcs = project.arcs || [];

        // Filtrer par catégorie
        const filteredArcs = _filterCategory === 'all'
            ? arcs
            : arcs.filter(arc => arc.category === _filterCategory);

        // Organiser par statut
        const arcsByStatus = {
            planned: filteredArcs.filter(arc => arc.status === 'planned'),
            'in-progress': filteredArcs.filter(arc => arc.status === 'in-progress'),
            completed: filteredArcs.filter(arc => arc.status === 'completed')
        };

        const html = ArcBoardRender.renderView({
            arcsByStatus,
            filterCategory: _filterCategory
        });

        _container.innerHTML = html;
        ArcBoardHandlers.attachHandlers(_container);
    }

    /**
     * Change le filtre de catégorie
     */
    function setFilter(category) {
        _filterCategory = category;
        render();
    }

    /**
     * Ouvre le modal d'ajout d'arc
     */
    async function openAddModal() {
        const formHtml = ArcBoardRender.renderForm();

        const modal = await ModalUI.open('add-arc', formHtml, {
            title: 'Nouvel arc narratif',
            size: 'large'
        });

        ArcBoardHandlers.attachFormHandlers(modal, 'add');
    }

    /**
     * Ouvre le modal d'édition d'arc
     */
    async function openEditModal(arcId) {
        const state = StateManager.getState();
        const arc = state.project?.arcs?.find(a => a.id === arcId);

        if (!arc) {
            ToastUI.error('Arc introuvable');
            return;
        }

        const formHtml = ArcBoardRender.renderForm(arc);

        const modal = await ModalUI.open('edit-arc', formHtml, {
            title: 'Modifier l\'arc',
            size: 'large'
        });

        ArcBoardHandlers.attachFormHandlers(modal, 'edit', arc);
    }

    /**
     * Supprime un arc
     */
    async function deleteArc(arcId) {
        const state = StateManager.getState();
        const project = state.project;
        const arc = project?.arcs?.find(a => a.id === arcId);

        if (!arc) return;

        const confirmed = await ModalUI.confirm(
            'Supprimer l\'arc ?',
            `Êtes-vous sûr de vouloir supprimer "${arc.title}" ?`,
            { confirmText: 'Supprimer', confirmStyle: 'danger' }
        );

        if (confirmed) {
            project.arcs = project.arcs.filter(a => a.id !== arcId);
            StateManager.setState({ project });
            await StorageService.saveProject(project);
            ToastUI.success('Arc supprimé', `"${arc.title}" a été supprimé.`);
            render();
        }
    }

    /**
     * Détruit la vue
     */
    async function destroy() {
        _unbindEvents();
        if (_container) _container.innerHTML = '';
        _container = null;
        _filterCategory = 'all';
    }

    return {
        init,
        render,
        destroy,
        setFilter,
        openAddModal,
        openEditModal,
        deleteArc
    };
})();

window.ArcBoardView = ArcBoardView;

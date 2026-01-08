// ============================================
// STRUCTURE VIEW - Vue Structure (Acts/Chapters/Scenes)
// ============================================

/**
 * StructureView - Contrôleur pour la vue de structure narrative
 *
 * Responsabilités :
 * - Afficher la hiérarchie Acts > Chapters > Scenes
 * - Gérer l'expansion/collapse des niveaux
 * - Orchestrer les opérations CRUD sur la structure
 */

const StructureView = (function() {
    'use strict';

    // État local de la vue
    let _container = null;
    let _expandedActs = new Set();
    let _expandedChapters = new Set();

    /**
     * Initialise la vue
     * @param {Object} params - Paramètres d'initialisation
     */
    async function init(params = {}) {
        _container = DOMUtils.query('#structure-view');

        if (!_container) {
            console.error('Container #structure-view not found');
            return;
        }

        // Charger l'état d'expansion sauvegardé
        await _loadTreeState();

        // S'abonner aux événements
        _bindEvents();

        // Rendu initial
        await render();
    }

    /**
     * S'abonner aux événements
     */
    function _bindEvents() {
        // Événements du projet
        EventBus.on('project:loaded', () => render());
        EventBus.on('project:updated', () => render());

        // Événements des scènes (car la structure contient des scènes)
        EventBus.on('scene:created', () => render());
        EventBus.on('scene:updated', () => render());
        EventBus.on('scene:deleted', () => render());
    }

    /**
     * Se désabonner des événements
     */
    function _unbindEvents() {
        EventBus.off('project:loaded', render);
        EventBus.off('project:updated', render);
        EventBus.off('scene:created', render);
        EventBus.off('scene:updated', render);
        EventBus.off('scene:deleted', render);
    }

    /**
     * Charge l'état d'expansion depuis le state
     */
    async function _loadTreeState() {
        const state = StateManager.getState();
        if (state.ui.expandedActs) {
            _expandedActs = new Set(state.ui.expandedActs);
        }
        if (state.ui.expandedChapters) {
            _expandedChapters = new Set(state.ui.expandedChapters);
        }
    }

    /**
     * Sauvegarde l'état d'expansion
     */
    function _saveTreeState() {
        StateManager.setState({
            ui: {
                expandedActs: Array.from(_expandedActs),
                expandedChapters: Array.from(_expandedChapters)
            }
        });
    }

    /**
     * Rendu de la vue
     */
    async function render() {
        if (!_container) return;

        const state = StateManager.getState();
        const project = state.project;

        if (!project) {
            _container.innerHTML = StructureRender.renderEmpty();
            return;
        }

        // Générer le HTML
        const html = StructureRender.renderView({
            acts: project.acts || [],
            expandedActs: _expandedActs,
            expandedChapters: _expandedChapters
        });

        _container.innerHTML = html;

        // Attacher les handlers
        StructureHandlers.attachHandlers(_container);
    }

    /**
     * Toggle l'expansion d'un acte
     * @param {number} actId
     */
    function toggleAct(actId) {
        if (_expandedActs.has(actId)) {
            _expandedActs.delete(actId);
        } else {
            _expandedActs.add(actId);
        }
        _saveTreeState();
        render();
    }

    /**
     * Toggle l'expansion d'un chapitre
     * @param {number} chapterId
     */
    function toggleChapter(chapterId) {
        if (_expandedChapters.has(chapterId)) {
            _expandedChapters.delete(chapterId);
        } else {
            _expandedChapters.add(chapterId);
        }
        _saveTreeState();
        render();
    }

    /**
     * Expand tout l'arbre
     */
    function expandAll() {
        const state = StateManager.getState();
        const project = state.project;

        if (!project || !project.acts) return;

        // Expand tous les actes
        project.acts.forEach(act => {
            _expandedActs.add(act.id);
            // Expand tous les chapitres
            if (act.chapters) {
                act.chapters.forEach(chapter => {
                    _expandedChapters.add(chapter.id);
                });
            }
        });

        _saveTreeState();
        render();
    }

    /**
     * Collapse tout l'arbre
     */
    function collapseAll() {
        _expandedActs.clear();
        _expandedChapters.clear();
        _saveTreeState();
        render();
    }

    /**
     * Ouvre le modal d'ajout d'acte
     */
    async function openAddActModal() {
        const formHtml = StructureRender.renderActForm();

        const modal = await ModalUI.open('add-act', formHtml, {
            title: 'Nouvel acte',
            size: 'medium'
        });

        StructureHandlers.attachActFormHandlers(modal, 'add');
    }

    /**
     * Ouvre le modal d'ajout de chapitre
     * @param {number} actId
     */
    async function openAddChapterModal(actId) {
        const formHtml = StructureRender.renderChapterForm();

        const modal = await ModalUI.open('add-chapter', formHtml, {
            title: 'Nouveau chapitre',
            size: 'medium'
        });

        StructureHandlers.attachChapterFormHandlers(modal, 'add', actId);
    }

    /**
     * Ouvre le modal d'ajout de scène
     * @param {number} actId
     * @param {number} chapterId
     */
    async function openAddSceneModal(actId, chapterId) {
        const formHtml = StructureRender.renderSceneForm();

        const modal = await ModalUI.open('add-scene-structure', formHtml, {
            title: 'Nouvelle scène',
            size: 'medium'
        });

        StructureHandlers.attachSceneFormHandlers(modal, 'add', actId, chapterId);
    }

    /**
     * Supprime un acte
     * @param {number} actId
     */
    async function deleteAct(actId) {
        const state = StateManager.getState();
        const project = state.project;

        if (!project) return;

        const act = project.acts?.find(a => a.id === actId);
        if (!act) return;

        const confirmed = await ModalUI.confirm(
            'Supprimer l\'acte ?',
            `Êtes-vous sûr de vouloir supprimer "${act.title}" et tous ses chapitres ? Cette action est irréversible.`,
            {
                confirmText: 'Supprimer',
                confirmStyle: 'danger'
            }
        );

        if (confirmed) {
            project.acts = project.acts.filter(a => a.id !== actId);
            StateManager.setState({ project });
            await StorageService.saveProject(project);
            ToastUI.success('Acte supprimé', `"${act.title}" a été supprimé.`);
            render();
        }
    }

    /**
     * Supprime un chapitre
     * @param {number} actId
     * @param {number} chapterId
     */
    async function deleteChapter(actId, chapterId) {
        const state = StateManager.getState();
        const project = state.project;

        if (!project) return;

        const act = project.acts?.find(a => a.id === actId);
        if (!act) return;

        const chapter = act.chapters?.find(c => c.id === chapterId);
        if (!chapter) return;

        const confirmed = await ModalUI.confirm(
            'Supprimer le chapitre ?',
            `Êtes-vous sûr de vouloir supprimer "${chapter.title}" et toutes ses scènes ? Cette action est irréversible.`,
            {
                confirmText: 'Supprimer',
                confirmStyle: 'danger'
            }
        );

        if (confirmed) {
            act.chapters = act.chapters.filter(c => c.id !== chapterId);
            StateManager.setState({ project });
            await StorageService.saveProject(project);
            ToastUI.success('Chapitre supprimé', `"${chapter.title}" a été supprimé.`);
            render();
        }
    }

    /**
     * Ouvre une scène dans la vue Scenes
     * @param {number} actId
     * @param {number} chapterId
     * @param {number} sceneId
     */
    function openScene(actId, chapterId, sceneId) {
        // Naviguer vers la vue scenes avec la scène sélectionnée
        Router.navigate('scenes', { sceneId });
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
        _expandedActs.clear();
        _expandedChapters.clear();
    }

    // API publique
    return {
        init,
        render,
        destroy,
        toggleAct,
        toggleChapter,
        expandAll,
        collapseAll,
        openAddActModal,
        openAddChapterModal,
        openAddSceneModal,
        deleteAct,
        deleteChapter,
        openScene
    };
})();

// Exposer globalement
window.StructureView = StructureView;

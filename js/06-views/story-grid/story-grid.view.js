// ============================================
// STORY GRID VIEW - Vue Grille d'Histoire
// ============================================

/**
 * StoryGridView - Vue grille pour analyser toutes les scènes
 *
 * Responsabilités :
 * - Afficher toutes les scènes dans une grille/tableau
 * - Permettre le tri et le filtrage
 * - Fournir une vue d'ensemble de l'histoire
 */

const StoryGridView = (function() {
    'use strict';

    let _container = null;
    let _sortBy = 'order'; // order, title, wordcount, status, tension
    let _sortDirection = 'asc';
    let _filterStatus = 'all';

    async function init(params = {}) {
        _container = DOMUtils.query('#story-grid-view');

        if (!_container) {
            console.error('Container #story-grid-view not found');
            return;
        }

        _sortBy = params.sortBy || 'order';
        _sortDirection = params.sortDirection || 'asc';
        _filterStatus = params.filterStatus || 'all';

        _bindEvents();
        await render();
    }

    function _bindEvents() {
        EventBus.on('project:loaded', () => render());
        EventBus.on('project:updated', () => render());
        EventBus.on('scene:created', () => render());
        EventBus.on('scene:updated', () => render());
        EventBus.on('scene:deleted', () => render());
    }

    function _unbindEvents() {
        EventBus.off('project:loaded', render);
        EventBus.off('project:updated', render);
        EventBus.off('scene:created', render);
        EventBus.off('scene:updated', render);
        EventBus.off('scene:deleted', render);
    }

    async function render() {
        if (!_container) return;

        const state = StateManager.getState();
        const project = state.project;

        if (!project) {
            _container.innerHTML = StoryGridRender.renderEmpty();
            return;
        }

        // Extraire toutes les scènes avec leur contexte (act, chapter)
        const allScenes = _extractAllScenes(project);

        // Filtrer
        const filteredScenes = _filterStatus === 'all'
            ? allScenes
            : allScenes.filter(s => s.scene.status === _filterStatus);

        // Trier
        const sortedScenes = _sortScenes(filteredScenes);

        const html = StoryGridRender.renderView({
            scenes: sortedScenes,
            sortBy: _sortBy,
            sortDirection: _sortDirection,
            filterStatus: _filterStatus
        });

        _container.innerHTML = html;
        StoryGridHandlers.attachHandlers(_container);
    }

    function _extractAllScenes(project) {
        const scenes = [];
        let order = 1;

        if (!project.acts) return scenes;

        project.acts.forEach(act => {
            if (!act.chapters) return;

            act.chapters.forEach(chapter => {
                if (!chapter.scenes) return;

                chapter.scenes.forEach(scene => {
                    scenes.push({
                        order: order++,
                        actId: act.id,
                        actTitle: act.title,
                        chapterId: chapter.id,
                        chapterTitle: chapter.title,
                        scene: scene
                    });
                });
            });
        });

        return scenes;
    }

    function _sortScenes(scenes) {
        const sorted = [...scenes];

        sorted.sort((a, b) => {
            let valA, valB;

            switch (_sortBy) {
                case 'title':
                    valA = a.scene.title.toLowerCase();
                    valB = b.scene.title.toLowerCase();
                    break;
                case 'wordcount':
                    valA = TextUtils.countWords(a.scene.content || '');
                    valB = TextUtils.countWords(b.scene.content || '');
                    break;
                case 'status':
                    valA = a.scene.status || 'draft';
                    valB = b.scene.status || 'draft';
                    break;
                case 'tension':
                    valA = a.scene.tension || 0;
                    valB = b.scene.tension || 0;
                    break;
                case 'order':
                default:
                    valA = a.order;
                    valB = b.order;
                    break;
            }

            if (valA < valB) return _sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return _sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }

    function setSort(sortBy) {
        if (_sortBy === sortBy) {
            _sortDirection = _sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            _sortBy = sortBy;
            _sortDirection = 'asc';
        }
        render();
    }

    function setFilter(status) {
        _filterStatus = status;
        render();
    }

    function openScene(actId, chapterId, sceneId) {
        Router.navigate('scenes', { sceneId });
    }

    async function destroy() {
        _unbindEvents();
        if (_container) _container.innerHTML = '';
        _container = null;
    }

    return {
        init,
        render,
        destroy,
        setSort,
        setFilter,
        openScene
    };
})();

window.StoryGridView = StoryGridView;

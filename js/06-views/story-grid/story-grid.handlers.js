// ============================================
// STORY GRID HANDLERS - Gestionnaires Story Grid
// ============================================

const StoryGridHandlers = (function() {
    'use strict';

    function attachHandlers(container) {
        if (!container) return;
        DOMUtils.delegate(container, 'click', '[data-action]', _handleAction);
        DOMUtils.delegate(container, 'change', '[data-action]', _handleChange);
    }

    function _handleAction(e) {
        const target = e.target.closest('[data-action]');
        const action = target?.dataset.action;

        if (action === 'sort') {
            const sortBy = target.dataset.sortBy;
            if (sortBy) StoryGridView.setSort(sortBy);
        }

        if (action === 'open-scene') {
            const actId = parseInt(target.dataset.actId);
            const chapterId = parseInt(target.dataset.chapterId);
            const sceneId = parseInt(target.dataset.sceneId);

            if (actId && chapterId && sceneId) {
                StoryGridView.openScene(actId, chapterId, sceneId);
            }
        }
    }

    function _handleChange(e) {
        const target = e.target;
        const action = target.dataset.action;

        if (action === 'filter') {
            StoryGridView.setFilter(target.value);
        }
    }

    return { attachHandlers };
})();

window.StoryGridHandlers = StoryGridHandlers;

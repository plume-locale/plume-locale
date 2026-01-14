/**
 * Timeline View
 * Orchestrates the timeline view lifecycle and state management
 */

const TimelineView = (() => {
    let container = null;

    function init() {
        container = document.getElementById('view-timeline');
        if (!container) return;

        loadProject();
        render();
        bindEvents();
    }

    function render() {
        if (!container) return;

        const events = getAllEvents();
        const html = TimelineRender.renderTimelineList(events);

        container.innerHTML = `
            <div class="view-header">
                <h2>Timeline</h2>
                <button class="btn" onclick="TimelineHandlers.openAddTimelineModal()">+ Nouvel événement</button>
            </div>
            <div class="view-content">
                ${html}
            </div>
        `;

        // Re-attach handlers
        TimelineHandlers.attachListHandlers();
        lucide.createIcons();
    }

    function bindEvents() {
        EventBus.on('timeline:created', () => render());
        EventBus.on('timeline:updated', () => render());
        EventBus.on('timeline:deleted', () => render());
        EventBus.on('project:updated', () => render());
    }

    function destroy() {
        if (container) {
            container.innerHTML = '';
        }
    }

    function loadProject() {
        const project = StorageService.loadProject();
        if (project) {
            StateManager.setState({ project });
        }
    }

    function getAllEvents() {
        const project = StateManager.getState().project;
        return project.timeline || [];
    }

    function getEvent(eventId) {
        const project = StateManager.getState().project;
        return project.timeline?.find(e => e.id === eventId);
    }

    return {
        init,
        render,
        bindEvents,
        destroy,
        loadProject,
        getAllEvents,
        getEvent
    };
})();

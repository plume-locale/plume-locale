/**
 * Locations View (Refactored MVVM)
 * Orchestrates the locations view by delegating to render and handler modules
 * Manages view lifecycle, state synchronization, and event binding
 */

const LocationsView = (() => {
    let collapsedGroups = {};

    /**
     * Initialize the locations view
     */
    function init() {
        loadCollapsedGroups();
        render();
        bindEvents();
    }

    /**
     * Render the locations list
     */
    function render() {
        const container = document.getElementById('locationsList');
        if (!container) return;

        const state = StateManager.get('project');
        if (!state || !state.locations) {
            container.innerHTML = LocationsRender.renderEmptyLocations();
            return;
        }

        // Render locations list grouped by type
        const html = LocationsRender.renderLocationsList(state.locations, collapsedGroups);
        container.innerHTML = html;

        // Attach handlers to all interactive elements
        LocationsHandlers.attachListHandlers();
    }

    /**
     * Bind events to state changes
     */
    function bindEvents() {
        if (typeof EventBus !== 'undefined') {
            EventBus.on('project:updated', () => render());
            EventBus.on('location:created', () => render());
            EventBus.on('location:updated', () => render());
            EventBus.on('location:deleted', () => render());
        }
    }

    /**
     * Load collapsed groups state from localStorage
     */
    function loadCollapsedGroups() {
        collapsedGroups = JSON.parse(localStorage.getItem('plume_treeview_collapsed') || '{}');
    }

    /**
     * Save collapsed groups state to localStorage
     */
    function saveCollapsedGroups() {
        localStorage.setItem('plume_treeview_collapsed', JSON.stringify(collapsedGroups));
    }

    /**
     * Open location detail view
     * @param {number} locationId - Location ID
     */
    function openDetail(locationId) {
        LocationsHandlers.openLocationDetail(locationId);
    }

    /**
     * Show empty state
     */
    function showEmptyState() {
        const container = document.getElementById('editorView');
        if (container) {
            container.innerHTML = '<div class="empty-state">Sélectionnez un lieu pour voir les détails</div>';
        }
    }

    /**
     * Load project and synchronize state
     */
    function loadProject() {
        const saved = localStorage.getItem('plume_locale_project');
        if (!saved) {
            const newProject = {
                title: "Mon Roman",
                author: "Auteur",
                acts: [],
                characters: [],
                locations: [],
                arcs: [],
                world: {
                    name: "Monde",
                    description: ""
                }
            };
            StateManager.set('project', newProject);
            return;
        }

        const loadedProject = JSON.parse(saved);

        // Ensure locations array exists with defaults
        const project = {
            title: loadedProject.title || "Mon Roman",
            author: loadedProject.author || "Auteur",
            acts: loadedProject.acts || [],
            characters: loadedProject.characters || [],
            locations: loadedProject.locations || loadedProject.world || [],
            arcs: loadedProject.arcs || [],
            world: loadedProject.world || { name: "Monde", description: "" },
            timeline: loadedProject.timeline || [],
            notes: loadedProject.notes || [],
            codex: loadedProject.codex || [],
            stats: loadedProject.stats || {
                dailyGoal: 500,
                totalGoal: 80000,
                writingSessions: []
            }
        };

        // Ensure all locations have linked arrays
        if (project.locations) {
            project.locations.forEach(location => {
                if (!location.linkedScenes) location.linkedScenes = [];
                if (!location.linkedElements) location.linkedElements = [];
            });
        }

        StateManager.set('project', project);
    }

    /**
     * Get locations sorted by type
     * @returns {Object} Locations grouped by type
     */
    function getLocationsByType() {
        const state = StateManager.get('project');
        if (!state.locations) return {};

        const groups = {};
        state.locations.forEach(location => {
            const type = location.type || 'Autre';
            if (!groups[type]) groups[type] = [];
            groups[type].push(location);
        });

        return groups;
    }

    /**
     * Get all locations
     * @returns {Array} All locations
     */
    function getAllLocations() {
        const state = StateManager.get('project');
        return state.locations || [];
    }

    /**
     * Get location by ID
     * @param {number} locationId - Location ID
     * @returns {Object} Location object or null
     */
    function getLocation(locationId) {
        const state = StateManager.get('project');
        return state.locations?.find(l => l.id === locationId) || null;
    }

    /**
     * Destroy the view and clean up event listeners
     */
    function destroy() {
        saveCollapsedGroups();
    }

    // Public API
    return {
        init,
        render,
        bindEvents,
        loadCollapsedGroups,
        saveCollapsedGroups,
        openDetail,
        showEmptyState,
        loadProject,
        getLocationsByType,
        getAllLocations,
        getLocation,
        destroy
    };
})();

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LocationsView;
}

/**
 * Structure View (Refactored MVVM)
 * Orchestrates the structure view by delegating to render and handler modules
 * Manages view lifecycle, state synchronization, and event binding
 */

const StructureView = (() => {
    // State for tracking expansion
    let expandedActs = [];
    let currentActId = null;
    let currentChapterId = null;
    let currentSceneId = null;

    /**
     * Initialize the structure view
     */
    function init() {
        loadExpandedActs();
        render();
        bindEvents();
        setupKeyboardShortcuts();
    }

    /**
     * Render the structure list
     */
    function render() {
        const container = document.getElementById('structureList');
        if (!container) return;

        const state = StateManager.get('project');
        if (!state || !state.acts) {
            container.innerHTML = StructureRender.renderEmptyStructure();
            return;
        }

        // Render acts list with expanded state
        const html = StructureRender.renderActsList(state.acts, expandedActs);
        container.innerHTML = html;

        // Attach handlers to all interactive elements
        StructureHandlers.attachListHandlers();
    }

    /**
     * Bind events to state changes
     */
    function bindEvents() {
        if (typeof EventBus !== 'undefined') {
            EventBus.on('project:updated', () => render());
            EventBus.on('history:undo', refreshAllViews);
            EventBus.on('history:redo', refreshAllViews);
        }
    }

    /**
     * Refresh all views after undo/redo
     */
    function refreshAllViews() {
        render();
        
        // Restore expansion state after render
        setTimeout(() => loadExpandedActs(), 100);
        
        // Update stats if available
        if (typeof updateStats === 'function') {
            updateStats();
        }

        // Refresh the current view content
        if (typeof refreshCurrentViewContent === 'function') {
            refreshCurrentViewContent();
        }
    }

    /**
     * Setup keyboard shortcuts for undo/redo
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Z or Cmd+Z for undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('history:undo');
                } else if (typeof undo === 'function') {
                    undo();
                }
            }
            // Ctrl+Y or Cmd+Shift+Z for redo
            else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('history:redo');
                } else if (typeof redo === 'function') {
                    redo();
                }
            }
        });
    }

    /**
     * Save expansion state to localStorage
     */
    function saveExpandedActs() {
        localStorage.setItem('plume_expanded_acts', JSON.stringify(expandedActs));
    }

    /**
     * Load expansion state from localStorage
     */
    function loadExpandedActs() {
        expandedActs = JSON.parse(localStorage.getItem('plume_expanded_acts') || '[]');
    }

    /**
     * Open detail view for a scene
     * @param {number} actId - Act ID
     * @param {number} chapterId - Chapter ID
     * @param {number} sceneId - Scene ID
     */
    function openDetail(actId, chapterId, sceneId) {
        currentActId = actId;
        currentChapterId = chapterId;
        currentSceneId = sceneId;
        StructureHandlers.openScene(actId, chapterId, sceneId);
    }

    /**
     * Show empty state
     */
    function showEmptyState() {
        const container = document.getElementById('editorView');
        if (container) {
            container.innerHTML = '<div class="empty-state">Sélectionnez une scène pour commencer à écrire</div>';
        }
    }

    /**
     * Load project and synchronize state
     * Migration support for old structure (chapters) to new (acts)
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

        // Migration: Convert old structure (chapters array) to new structure (acts array)
        if (loadedProject.chapters && !loadedProject.acts) {
            console.log('Migrating old project structure to acts-based structure...');
            const migratedProject = {
                title: loadedProject.title || "Mon Roman",
                author: loadedProject.author || "Auteur",
                acts: [
                    {
                        id: Date.now(),
                        title: "Acte I",
                        chapters: loadedProject.chapters || []
                    }
                ],
                characters: loadedProject.characters || [],
                locations: loadedProject.locations || [],
                arcs: loadedProject.arcs || [],
                world: loadedProject.world || { name: "Monde", description: "" }
            };
            StateManager.set('project', migratedProject);

            // Save migrated structure
            if (typeof StorageService !== 'undefined') {
                StorageService.saveProject(migratedProject);
            } else if (typeof saveProject === 'function') {
                saveProject();
            }
            console.log('Migration complete!');
        } else {
            // Ensure all data structures exist with defaults
            const project = {
                title: loadedProject.title || "Mon Roman",
                author: loadedProject.author || "Auteur",
                acts: loadedProject.acts || [],
                characters: loadedProject.characters || [],
                locations: loadedProject.locations || [],
                arcs: loadedProject.arcs || [],
                world: loadedProject.world || { name: "Monde", description: "" },
                timeline: loadedProject.timeline || [],
                notes: loadedProject.notes || [],
                codex: loadedProject.codex || [],
                stats: loadedProject.stats || {
                    dailyGoal: 500,
                    totalGoal: 80000,
                    writingSessions: []
                },
                versions: loadedProject.versions || [],
                relationships: loadedProject.relationships || [],
                metroTimeline: loadedProject.metroTimeline || [],
                characterColors: loadedProject.characterColors || {}
            };

            // Ensure all scenes have linked arrays
            project.acts.forEach(act => {
                act.chapters = act.chapters || [];
                act.chapters.forEach(chapter => {
                    chapter.scenes = chapter.scenes || [];
                    chapter.scenes.forEach(scene => {
                        if (!scene.linkedCharacters) scene.linkedCharacters = [];
                        if (!scene.linkedElements) scene.linkedElements = [];
                    });
                });
            });

            // Ensure all characters have linked arrays
            project.characters.forEach(char => {
                if (!char.linkedScenes) char.linkedScenes = [];
                if (!char.linkedElements) char.linkedElements = [];
            });

            StateManager.set('project', project);
        }
    }

    /**
     * Destroy the view and clean up event listeners
     */
    function destroy() {
        // Remove EventBus subscriptions if needed
        // Clear any timers
    }

    // Public API
    return {
        init,
        render,
        bindEvents,
        refreshAllViews,
        setupKeyboardShortcuts,
        saveExpandedActs,
        loadExpandedActs,
        openDetail,
        showEmptyState,
        loadProject,
        destroy
    };
})();

// Export for external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StructureView;
}
*** End File
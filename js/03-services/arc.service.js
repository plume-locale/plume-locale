/**
 * Arc Service
 * Handles all business logic related to narrative arcs
 */

const ArcService = (() => {
    /**
     * Create a new arc
     * @param {Object} arcData - Arc data
     * @returns {Arc} Created arc
     */
    async function create(arcData) {
        const arc = new Arc(arcData);
        arc.validate();

        const state = StateManager.get('project');
        if (!state.arcs) state.arcs = [];
        
        state.arcs.push(arc);
        StateManager.set('project', state);
        
        // Persist to storage
        await StorageService.saveProject(state);
        
        // Emit event
        if (window.EventBus) {
            EventBus.emit('arc:created', arc);
        }

        return arc;
    }

    /**
     * Get arc by ID
     * @param {number} arcId - Arc ID
     * @returns {Arc|null} Arc or null
     */
    function findById(arcId) {
        const state = StateManager.get('project');
        if (!state.arcs) return null;
        return state.arcs.find(a => a.id === arcId) || null;
    }

    /**
     * Get all arcs
     * @returns {Arc[]} Array of arcs
     */
    function findAll() {
        const state = StateManager.get('project');
        return state.arcs || [];
    }

    /**
     * Search arcs by name
     * @param {string} searchTerm - Search term
     * @returns {Arc[]} Matching arcs
     */
    function findByName(searchTerm) {
        const normalizedTerm = searchTerm.toLowerCase().trim();
        return findAll().filter(a =>
            a.name.toLowerCase().includes(normalizedTerm)
        );
    }

    /**
     * Get arcs by type
     * @param {string} type - Arc type (main, sub, character, location)
     * @returns {Arc[]} Arcs of type
     */
    function findByType(type) {
        return findAll().filter(a => a.type === type);
    }

    /**
     * Get arcs by status
     * @param {string} status - Arc status
     * @returns {Arc[]} Arcs with status
     */
    function findByStatus(status) {
        return findAll().filter(a => a.status === status);
    }

    /**
     * Update an arc
     * @param {number} arcId - Arc ID
     * @param {Object} updates - Updates to apply
     * @returns {Arc} Updated arc
     */
    async function update(arcId, updates) {
        const arc = findById(arcId);
        if (!arc) throw new Error('Arc introuvable');

        Object.assign(arc, updates);
        arc.updatedAt = Date.now();
        arc.validate();

        const state = StateManager.get('project');
        StateManager.set('project', state);
        
        // Persist to storage
        await StorageService.saveProject(state);
        
        // Emit event
        if (window.EventBus) {
            EventBus.emit('arc:updated', arc);
        }

        return arc;
    }

    /**
     * Delete an arc
     * @param {number} arcId - Arc ID
     * @returns {Arc} Deleted arc
     */
    async function remove(arcId) {
        const state = StateManager.get('project');
        if (!state.arcs) return null;

        const index = state.arcs.findIndex(a => a.id === arcId);
        if (index === -1) throw new Error('Arc introuvable');

        const arc = state.arcs.splice(index, 1)[0];

        // Remove references from scenes
        removeReferences(arcId);

        StateManager.set('project', state);
        
        // Persist to storage
        await StorageService.saveProject(state);
        
        // Emit event
        if (window.EventBus) {
            EventBus.emit('arc:deleted', arcId);
        }

        return arc;
    }

    /**
     * Get scenes in an arc
     * @param {number} arcId - Arc ID
     * @returns {Scene[]} Scenes in arc
     */
    function getArcScenes(arcId) {
        const state = StateManager.get('project');
        if (!state.scenes) return [];
        
        return state.scenes.filter(scene =>
            scene.arcs && scene.arcs.includes(arcId)
        );
    }

    /**
     * Get arcs featuring a character
     * @param {number} characterId - Character ID
     * @returns {Arc[]} Arcs with character
     */
    function getCharacterArcs(characterId) {
        return findAll().filter(arc =>
            arc.mainCharacters?.includes(characterId) ||
            arc.supportingCharacters?.includes(characterId)
        );
    }

    /**
     * Get arcs set in a location
     * @param {number} locationId - Location ID
     * @returns {Arc[]} Arcs in location
     */
    function getLocationArcs(locationId) {
        return findAll().filter(arc =>
            arc.locations && arc.locations.includes(locationId)
        );
    }

    /**
     * Get arc statistics
     * @param {number} arcId - Arc ID
     * @returns {Object} Arc statistics
     */
    function getArcStats(arcId) {
        const scenes = getArcScenes(arcId);
        const totalWords = scenes.reduce((sum, scene) =>
            sum + (scene.wordCount || 0), 0
        );

        const arc = findById(arcId);
        const avgTension = scenes.length > 0 
            ? Math.round(scenes.reduce((sum, s) => sum + (s.tension || 50), 0) / scenes.length)
            : 0;

        return {
            sceneCount: scenes.length,
            wordCount: totalWords,
            averageTension: avgTension,
            mainCharacterCount: arc?.mainCharacters?.length || 0,
            supportingCharacterCount: arc?.supportingCharacters?.length || 0,
            locationCount: arc?.locations?.length || 0
        };
    }

    /**
     * Add a scene to an arc
     * @param {number} arcId - Arc ID
     * @param {number} sceneId - Scene ID
     */
    async function addScene(arcId, sceneId) {
        const arc = findById(arcId);
        if (!arc) throw new Error('Arc introuvable');

        if (!arc.scenes) arc.scenes = [];
        if (!arc.scenes.includes(sceneId)) {
            arc.scenes.push(sceneId);
            await update(arcId, { scenes: arc.scenes });
        }
    }

    /**
     * Remove a scene from an arc
     * @param {number} arcId - Arc ID
     * @param {number} sceneId - Scene ID
     */
    async function removeScene(arcId, sceneId) {
        const arc = findById(arcId);
        if (!arc) throw new Error('Arc introuvable');

        if (arc.scenes) {
            arc.scenes = arc.scenes.filter(id => id !== sceneId);
            await update(arcId, { scenes: arc.scenes });
        }
    }

    /**
     * Remove arc references from other entities
     * @param {number} arcId - Arc ID
     */
    function removeReferences(arcId) {
        const state = StateManager.get('project');

        // Remove from scenes
        if (state.scenes) {
            state.scenes.forEach(scene => {
                if (scene.arcs) {
                    scene.arcs = scene.arcs.filter(id => id !== arcId);
                }
            });
        }
    }

    /**
     * Export arcs as JSON
     * @returns {Array} Arcs as JSON
     */
    function exportAsJSON() {
        return findAll().map(a => a.toJSON());
    }

    // Public API
    return {
        create,
        findById,
        findAll,
        findByName,
        findByType,
        findByStatus,
        update,
        remove,
        getArcScenes,
        getCharacterArcs,
        getLocationArcs,
        getArcStats,
        addScene,
        removeScene,
        removeReferences,
        exportAsJSON
    };
})();

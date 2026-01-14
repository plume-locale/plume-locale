/**
 * Scene Service
 * Handles all business logic related to scenes
 */

const SceneService = (() => {
    /**
     * Create a new scene
     * @param {Object} sceneData - Scene data
     * @returns {Scene} Created scene
     */
    async function create(sceneData) {
        const scene = new Scene(sceneData);
        scene.validate();

        const state = StateManager.get('project');
        if (!state.scenes) state.scenes = [];
        
        // Set scene number
        if (!scene.number) {
            scene.number = state.scenes.length + 1;
        }
        
        state.scenes.push(scene);
        StateManager.set('project', state);
        
        // Persist to storage
        await StorageService.saveProject(state);
        
        // Emit event
        if (window.EventBus) {
            EventBus.emit('scene:created', scene);
        }

        return scene;
    }

    /**
     * Get scene by ID
     * @param {number} sceneId - Scene ID
     * @returns {Scene|null} Scene or null
     */
    function findById(sceneId) {
        const state = StateManager.get('project');
        if (!state.scenes) return null;
        return state.scenes.find(s => s.id === sceneId) || null;
    }

    /**
     * Get all scenes
     * @returns {Scene[]} Array of scenes
     */
    function findAll() {
        const state = StateManager.get('project');
        return state.scenes || [];
    }

    /**
     * Search scenes by name
     * @param {string} searchTerm - Search term
     * @returns {Scene[]} Matching scenes
     */
    function findByName(searchTerm) {
        const normalizedTerm = searchTerm.toLowerCase().trim();
        return findAll().filter(s =>
            s.name.toLowerCase().includes(normalizedTerm)
        );
    }

    /**
     * Get scenes by chapter
     * @param {number} chapterNumber - Chapter number
     * @returns {Scene[]} Scenes in chapter
     */
    function findByChapter(chapterNumber) {
        return findAll().filter(s => s.chapterNumber === chapterNumber);
    }

    /**
     * Update a scene
     * @param {number} sceneId - Scene ID
     * @param {Object} updates - Updates to apply
     * @returns {Scene} Updated scene
     */
    async function update(sceneId, updates) {
        const scene = findById(sceneId);
        if (!scene) throw new Error('Scène introuvable');

        Object.assign(scene, updates);
        scene.updatedAt = Date.now();
        
        // Update word count if content changed
        if (updates.content) {
            scene.updateWordCount();
        }
        
        scene.validate();

        const state = StateManager.get('project');
        StateManager.set('project', state);
        
        // Persist to storage
        await StorageService.saveProject(state);
        
        // Emit event
        if (window.EventBus) {
            EventBus.emit('scene:updated', scene);
        }

        return scene;
    }

    /**
     * Delete a scene
     * @param {number} sceneId - Scene ID
     * @returns {Scene} Deleted scene
     */
    async function remove(sceneId) {
        const state = StateManager.get('project');
        if (!state.scenes) return null;

        const index = state.scenes.findIndex(s => s.id === sceneId);
        if (index === -1) throw new Error('Scène introuvable');

        const scene = state.scenes.splice(index, 1)[0];

        // Remove references from arcs, locations, characters
        removeReferences(sceneId);

        // Renumber remaining scenes
        state.scenes.forEach((s, i) => {
            s.number = i + 1;
        });

        StateManager.set('project', state);
        
        // Persist to storage
        await StorageService.saveProject(state);
        
        // Emit event
        if (window.EventBus) {
            EventBus.emit('scene:deleted', sceneId);
        }

        return scene;
    }

    /**
     * Reorder scenes
     * @param {number} fromIndex - Source index
     * @param {number} toIndex - Destination index
     */
    async function reorderScenes(fromIndex, toIndex) {
        const state = StateManager.get('project');
        if (!state.scenes) return;

        const scenes = state.scenes;
        const [scene] = scenes.splice(fromIndex, 1);
        scenes.splice(toIndex, 0, scene);

        // Renumber scenes
        scenes.forEach((s, i) => {
            s.number = i + 1;
        });

        StateManager.set('project', state);
        await StorageService.saveProject(state);
        
        if (window.EventBus) {
            EventBus.emit('scenes:reordered', { fromIndex, toIndex });
        }
    }

    /**
     * Get scenes with a specific character
     * @param {number} characterId - Character ID
     * @returns {Scene[]} Scenes with character
     */
    function getScenesByCharacter(characterId) {
        return findAll().filter(s =>
            s.characters && s.characters.includes(characterId)
        );
    }

    /**
     * Get scenes in a specific location
     * @param {number} locationId - Location ID
     * @returns {Scene[]} Scenes at location
     */
    function getScenesByLocation(locationId) {
        return findAll().filter(s =>
            s.locations && s.locations.includes(locationId)
        );
    }

    /**
     * Get scenes in an arc
     * @param {number} arcId - Arc ID
     * @returns {Scene[]} Scenes in arc
     */
    function getScenesByArc(arcId) {
        return findAll().filter(s =>
            s.arcs && s.arcs.includes(arcId)
        );
    }

    /**
     * Get scene statistics
     * @returns {Object} Scene statistics
     */
    function getStats() {
        const scenes = findAll();
        const totalWords = scenes.reduce((sum, s) => sum + (s.wordCount || 0), 0);
        
        return {
            totalScenes: scenes.length,
            totalWords,
            averageWordsPerScene: scenes.length > 0 ? Math.round(totalWords / scenes.length) : 0,
            averageTension: scenes.length > 0 ? Math.round(scenes.reduce((sum, s) => sum + (s.tension || 50), 0) / scenes.length) : 0
        };
    }

    /**
     * Remove scene references from other entities
     * @param {number} sceneId - Scene ID
     */
    function removeReferences(sceneId) {
        const state = StateManager.get('project');

        // Remove from arcs
        if (state.arcs) {
            state.arcs.forEach(arc => {
                if (arc.scenes) {
                    arc.scenes = arc.scenes.filter(id => id !== sceneId);
                }
            });
        }

        // Remove from timeline
        if (state.timeline) {
            state.timeline.forEach(point => {
                if (point.scenes) {
                    point.scenes = point.scenes.filter(id => id !== sceneId);
                }
            });
        }
    }

    /**
     * Export scenes as JSON
     * @returns {Array} Scenes as JSON
     */
    function exportAsJSON() {
        return findAll().map(s => s.toJSON());
    }

    // Public API
    return {
        create,
        findById,
        findAll,
        findByName,
        findByChapter,
        update,
        remove,
        reorderScenes,
        getScenesByCharacter,
        getScenesByLocation,
        getScenesByArc,
        getStats,
        removeReferences,
        exportAsJSON
    };
})();

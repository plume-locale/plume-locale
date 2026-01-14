/**
 * Location Service
 * Handles all business logic related to locations
 */

const LocationService = (() => {
    /**
     * Create a new location
     * @param {Object} locationData - Location data
     * @returns {Location} Created location
     */
    async function create(locationData) {
        const location = new Location(locationData);
        location.validate();

        const state = StateManager.get('project');
        if (!state.locations) state.locations = [];
        
        state.locations.push(location);
        StateManager.set('project', state);
        
        // Persist to storage
        await StorageService.saveProject(state);
        
        // Emit event
        if (window.EventBus) {
            EventBus.emit('location:created', location);
        }

        return location;
    }

    /**
     * Get location by ID
     * @param {number} locationId - Location ID
     * @returns {Location|null} Location or null
     */
    function findById(locationId) {
        const state = StateManager.get('project');
        if (!state.locations) return null;
        return state.locations.find(l => l.id === locationId) || null;
    }

    /**
     * Get all locations
     * @returns {Location[]} Array of locations
     */
    function findAll() {
        const state = StateManager.get('project');
        return state.locations || [];
    }

    /**
     * Search locations by name
     * @param {string} searchTerm - Search term
     * @returns {Location[]} Matching locations
     */
    function findByName(searchTerm) {
        const normalizedTerm = searchTerm.toLowerCase().trim();
        return findAll().filter(l =>
            l.name.toLowerCase().includes(normalizedTerm) ||
            l.aliases.some(alias => alias.toLowerCase().includes(normalizedTerm))
        );
    }

    /**
     * Get locations by type
     * @param {string} type - Location type
     * @returns {Location[]} Locations of type
     */
    function findByType(type) {
        return findAll().filter(l => l.type === type);
    }

    /**
     * Get locations in a region
     * @param {string} region - Region name
     * @returns {Location[]} Locations in region
     */
    function findByRegion(region) {
        return findAll().filter(l => l.region === region);
    }

    /**
     * Update a location
     * @param {number} locationId - Location ID
     * @param {Object} updates - Updates to apply
     * @returns {Location} Updated location
     */
    async function update(locationId, updates) {
        const location = findById(locationId);
        if (!location) throw new Error('Lieu introuvable');

        Object.assign(location, updates);
        location.updatedAt = Date.now();
        location.validate();

        const state = StateManager.get('project');
        StateManager.set('project', state);
        
        // Persist to storage
        await StorageService.saveProject(state);
        
        // Emit event
        if (window.EventBus) {
            EventBus.emit('location:updated', location);
        }

        return location;
    }

    /**
     * Delete a location
     * @param {number} locationId - Location ID
     * @returns {Location} Deleted location
     */
    async function remove(locationId) {
        const state = StateManager.get('project');
        if (!state.locations) return null;

        const index = state.locations.findIndex(l => l.id === locationId);
        if (index === -1) throw new Error('Lieu introuvable');

        const location = state.locations.splice(index, 1)[0];

        // Remove references from scenes, characters, arcs
        removeReferences(locationId);

        StateManager.set('project', state);
        
        // Persist to storage
        await StorageService.saveProject(state);
        
        // Emit event
        if (window.EventBus) {
            EventBus.emit('location:deleted', locationId);
        }

        return location;
    }

    /**
     * Get locations with a specific character
     * @param {number} characterId - Character ID
     * @returns {Location[]} Locations with character
     */
    function getLocationsByCharacter(characterId) {
        return findAll().filter(l =>
            l.characters && l.characters.includes(characterId)
        );
    }

    /**
     * Get scenes at a location
     * @param {number} locationId - Location ID
     * @returns {Scene[]} Scenes at location
     */
    function getLocationScenes(locationId) {
        const state = StateManager.get('project');
        if (!state.scenes) return [];
        
        return state.scenes.filter(scene =>
            scene.locations && scene.locations.includes(locationId)
        );
    }

    /**
     * Get location statistics
     * @param {number} locationId - Location ID
     * @returns {Object} Location statistics
     */
    function getLocationStats(locationId) {
        const scenes = getLocationScenes(locationId);
        const totalWords = scenes.reduce((sum, scene) =>
            sum + (scene.wordCount || 0), 0
        );

        return {
            sceneCount: scenes.length,
            wordCount: totalWords,
            characterCount: findById(locationId)?.characters.length || 0
        };
    }

    /**
     * Get sub-locations of a location
     * @param {number} locationId - Parent location ID
     * @returns {Location[]} Sub-locations
     */
    function getSubLocations(locationId) {
        return findAll().filter(l => l.parentLocationId === locationId);
    }

    /**
     * Get related locations
     * @param {number} locationId - Location ID
     * @returns {Location[]} Related locations
     */
    function getRelatedLocations(locationId) {
        const location = findById(locationId);
        if (!location) return [];
        
        return location.relatedLocations
            .map(id => findById(id))
            .filter(l => l !== null);
    }

    /**
     * Remove location references from other entities
     * @param {number} locationId - Location ID
     */
    function removeReferences(locationId) {
        const state = StateManager.get('project');

        // Remove from scenes
        if (state.scenes) {
            state.scenes.forEach(scene => {
                if (scene.locations) {
                    scene.locations = scene.locations.filter(id => id !== locationId);
                }
            });
        }

        // Remove from other locations' related locations
        if (state.locations) {
            state.locations.forEach(location => {
                if (location.relatedLocations) {
                    location.relatedLocations = location.relatedLocations.filter(id => id !== locationId);
                }
            });
        }

        // Remove from arcs
        if (state.arcs) {
            state.arcs.forEach(arc => {
                if (arc.locations) {
                    arc.locations = arc.locations.filter(id => id !== locationId);
                }
            });
        }
    }

    /**
     * Export locations as JSON
     * @returns {Array} Locations as JSON
     */
    function exportAsJSON() {
        return findAll().map(l => l.toJSON());
    }

    // Public API
    return {
        create,
        findById,
        findAll,
        findByName,
        findByType,
        findByRegion,
        update,
        remove,
        getLocationsByCharacter,
        getLocationScenes,
        getLocationStats,
        getSubLocations,
        getRelatedLocations,
        removeReferences,
        exportAsJSON
    };
})();

/**
 * Character Service
 * Handles all business logic related to characters
 */

const CharacterService = (() => {
    /**
     * Create a new character
     * @param {Object} characterData - Character data
     * @returns {Character} Created character
     */
    async function create(characterData) {
        const character = new Character(characterData);
        character.validate();

        const state = StateManager.get('project');
        if (!state.characters) state.characters = [];
        
        state.characters.push(character);
        StateManager.set('project', state);
        
        // Persist to storage
        await StorageService.saveProject(state);
        
        // Emit event
        if (window.EventBus) {
            EventBus.emit('character:created', character);
        }

        return character;
    }

    /**
     * Get character by ID
     * @param {number} characterId - Character ID
     * @returns {Character|null} Character or null
     */
    function findById(characterId) {
        const state = StateManager.get('project');
        if (!state.characters) return null;
        return state.characters.find(c => c.id === characterId) || null;
    }

    /**
     * Get all characters
     * @returns {Character[]} Array of characters
     */
    function findAll() {
        const state = StateManager.get('project');
        return state.characters || [];
    }

    /**
     * Search characters by name
     * @param {string} searchTerm - Search term
     * @returns {Character[]} Matching characters
     */
    function findByName(searchTerm) {
        const normalizedTerm = searchTerm.toLowerCase().trim();
        return findAll().filter(c =>
            c.name.toLowerCase().includes(normalizedTerm) ||
            c.aliases.some(alias => alias.toLowerCase().includes(normalizedTerm))
        );
    }

    /**
     * Update a character
     * @param {number} characterId - Character ID
     * @param {Object} updates - Updates to apply
     * @returns {Character} Updated character
     */
    async function update(characterId, updates) {
        const character = findById(characterId);
        if (!character) throw new Error('Personnage introuvable');

        Object.assign(character, updates);
        character.updatedAt = Date.now();
        character.validate();

        const state = StateManager.get('project');
        StateManager.set('project', state);
        
        // Persist to storage
        await StorageService.saveProject(state);
        
        // Emit event
        if (window.EventBus) {
            EventBus.emit('character:updated', character);
        }

        return character;
    }

    /**
     * Delete a character
     * @param {number} characterId - Character ID
     * @returns {Character} Deleted character
     */
    async function remove(characterId) {
        const state = StateManager.get('project');
        if (!state.characters) return null;

        const index = state.characters.findIndex(c => c.id === characterId);
        if (index === -1) throw new Error('Personnage introuvable');

        const character = state.characters.splice(index, 1)[0];

        // Remove references from scenes and other characters
        removeReferences(characterId);

        StateManager.set('project', state);
        
        // Persist to storage
        await StorageService.saveProject(state);
        
        // Emit event
        if (window.EventBus) {
            EventBus.emit('character:deleted', characterId);
        }

        return character;
    }

    /**
     * Get all scenes featuring a character
     * @param {number} characterId - Character ID
     * @returns {Scene[]} Scenes with character
     */
    function getCharacterScenes(characterId) {
        const state = StateManager.get('project');
        if (!state.scenes) return [];
        
        return state.scenes.filter(scene =>
            scene.characters && scene.characters.includes(characterId)
        );
    }

    /**
     * Get statistics for a character
     * @param {number} characterId - Character ID
     * @returns {Object} Character statistics
     */
    function getCharacterStats(characterId) {
        const scenes = getCharacterScenes(characterId);
        const totalWords = scenes.reduce((sum, scene) =>
            sum + (scene.wordCount || 0), 0
        );

        return {
            sceneCount: scenes.length,
            wordCount: totalWords,
            firstAppearance: scenes[0]?.id || null,
            lastAppearance: scenes[scenes.length - 1]?.id || null,
            firstSceneIndex: scenes[0]?.number || null,
            lastSceneIndex: scenes[scenes.length - 1]?.number || null
        };
    }

    /**
     * Remove character references from other entities
     * @param {number} characterId - Character ID
     */
    function removeReferences(characterId) {
        const state = StateManager.get('project');

        // Remove from scenes
        if (state.scenes) {
            state.scenes.forEach(scene => {
                if (scene.characters) {
                    scene.characters = scene.characters.filter(id => id !== characterId);
                }
            });
        }

        // Remove from character relations
        if (state.characters) {
            state.characters.forEach(char => {
                if (char.relations) {
                    char.relations = char.relations.filter(r => r.characterId !== characterId);
                }
            });
        }

        // Remove from arcs
        if (state.arcs) {
            state.arcs.forEach(arc => {
                if (arc.mainCharacters) {
                    arc.mainCharacters = arc.mainCharacters.filter(id => id !== characterId);
                }
                if (arc.supportingCharacters) {
                    arc.supportingCharacters = arc.supportingCharacters.filter(id => id !== characterId);
                }
            });
        }

        // Remove from locations
        if (state.locations) {
            state.locations.forEach(location => {
                if (location.characters) {
                    location.characters = location.characters.filter(id => id !== characterId);
                }
            });
        }
    }

    /**
     * Get character relationships
     * @param {number} characterId - Character ID
     * @returns {Array} Character relationships
     */
    function getRelationships(characterId) {
        const character = findById(characterId);
        if (!character) return [];
        return character.relations || [];
    }

    /**
     * Add a relationship between characters
     * @param {number} characterId - Character ID
     * @param {number} relatedCharacterId - Related character ID
     * @param {Object} relationshipData - Relationship data
     * @returns {Object} Created relationship
     */
    async function addRelationship(characterId, relatedCharacterId, relationshipData = {}) {
        const character = findById(characterId);
        const relatedCharacter = findById(relatedCharacterId);
        
        if (!character || !relatedCharacter) {
            throw new Error('Un ou plusieurs personnages introuvables');
        }

        const relationship = {
            characterId: relatedCharacterId,
            type: relationshipData.type || 'unknown',
            description: relationshipData.description || '',
            strength: relationshipData.strength || 50, // 0-100
            createdAt: Date.now()
        };

        if (!character.relations) character.relations = [];
        character.relations.push(relationship);

        await update(characterId, { relations: character.relations });
        return relationship;
    }

    /**
     * Export characters as JSON
     * @returns {Array} Characters as JSON
     */
    function exportAsJSON() {
        return findAll().map(c => c.toJSON());
    }

    // Public API
    return {
        create,
        findById,
        findAll,
        findByName,
        update,
        remove,
        getCharacterScenes,
        getCharacterStats,
        removeReferences,
        getRelationships,
        addRelationship,
        exportAsJSON
    };
})();

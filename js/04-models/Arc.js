/**
 * Arc Model
 * Represents a narrative arc in the story
 */

class Arc {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.name = data.name || '';
        this.description = data.description || '';
        this.type = data.type || 'main'; // main, sub, character, location
        
        // Arc progression
        this.scenes = data.scenes || []; // Array of scene IDs in order
        this.status = data.status || 'planning'; // planning, writing, edited, complete
        
        // Visual
        this.color = data.color || '#3498db';
        this.emoji = data.emoji || '📖';
        
        // Arc Structure
        this.act1 = data.act1 || {
            setup: '',
            inciting: '',
            sceneIds: []
        };
        this.act2 = data.act2 || {
            risingAction: '',
            midpoint: '',
            sceneIds: []
        };
        this.act3 = data.act3 || {
            climax: '',
            resolution: '',
            sceneIds: []
        };
        
        // Characters & Locations
        this.mainCharacters = data.mainCharacters || [];
        this.supportingCharacters = data.supportingCharacters || [];
        this.locations = data.locations || [];
        
        // Tension Progression
        this.tensionProgression = data.tensionProgression || []; // Array of { sceneId, tension }
        
        // Metadata
        this.notes = data.notes || '';
        this.tags = data.tags || [];
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
    }

    /**
     * Validates the arc data
     * @throws {Error} If validation fails
     */
    validate() {
        if (!this.name || this.name.trim() === '') {
            throw new Error('Le nom de l\'arc est requis');
        }
        return true;
    }

    /**
     * Returns a clean JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            type: this.type,
            scenes: this.scenes,
            status: this.status,
            color: this.color,
            emoji: this.emoji,
            act1: this.act1,
            act2: this.act2,
            act3: this.act3,
            mainCharacters: this.mainCharacters,
            supportingCharacters: this.supportingCharacters,
            locations: this.locations,
            tensionProgression: this.tensionProgression,
            notes: this.notes,
            tags: this.tags,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Gets a summary for quick display
     */
    getSummary() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            sceneCount: this.scenes.length,
            status: this.status,
            color: this.color,
            emoji: this.emoji
        };
    }
}

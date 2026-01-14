/**
 * Project Model
 * Represents the entire story project
 */

class Project {
    constructor(data = {}) {
        // Basic Info
        this.id = data.id || Date.now();
        this.title = data.title || 'Untitled Project';
        this.author = data.author || '';
        this.description = data.description || '';
        this.genre = data.genre || '';
        this.targetAudience = data.targetAudience || '';
        this.status = data.status || 'planning'; // planning, writing, editing, published
        
        // Story Elements
        this.characters = data.characters || [];
        this.scenes = data.scenes || [];
        this.locations = data.locations || [];
        this.arcs = data.arcs || [];
        this.notes = data.notes || [];
        this.todos = data.todos || [];
        this.snapshots = data.snapshots || []; // Version history
        
        // World Building
        this.world = data.world || {
            setting: '',
            timeperiod: '',
            magic: '',
            technology: '',
            culture: ''
        };
        
        // Project Settings
        this.races = data.races || ['Humain', 'Elfe', 'Nain', 'Orc', 'Autre'];
        this.tags = data.tags || [];
        this.customFields = data.customFields || {};
        
        // Statistics
        this.stats = data.stats || {
            totalWords: 0,
            totalScenes: 0,
            totalCharacters: 0,
            lastUpdated: Date.now()
        };
        
        // Metadata
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
        this.language = data.language || 'fr';
        this.colorScheme = data.colorScheme || 'light';
    }

    /**
     * Validates the project data
     * @throws {Error} If validation fails
     */
    validate() {
        if (!this.title || this.title.trim() === '') {
            throw new Error('Le titre du projet est requis');
        }
        return true;
    }

    /**
     * Returns a clean JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            author: this.author,
            description: this.description,
            genre: this.genre,
            targetAudience: this.targetAudience,
            status: this.status,
            characters: this.characters,
            scenes: this.scenes,
            locations: this.locations,
            arcs: this.arcs,
            notes: this.notes,
            todos: this.todos,
            snapshots: this.snapshots,
            world: this.world,
            races: this.races,
            tags: this.tags,
            customFields: this.customFields,
            stats: this.stats,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            language: this.language,
            colorScheme: this.colorScheme
        };
    }

    /**
     * Gets a summary for quick display
     */
    getSummary() {
        return {
            id: this.id,
            title: this.title,
            author: this.author,
            status: this.status,
            characterCount: this.characters.length,
            sceneCount: this.scenes.length
        };
    }

    /**
     * Updates statistics
     */
    updateStats() {
        this.stats = {
            totalWords: this.scenes.reduce((sum, scene) => sum + (scene.wordCount || 0), 0),
            totalScenes: this.scenes.length,
            totalCharacters: this.characters.length,
            lastUpdated: Date.now()
        };
        return this.stats;
    }
}

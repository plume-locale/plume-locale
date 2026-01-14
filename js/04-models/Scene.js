/**
 * Scene Model
 * Represents a scene in the story structure
 */

class Scene {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.name = data.name || '';
        this.number = data.number || 0;
        this.chapterNumber = data.chapterNumber || 0;
        
        // Content
        this.content = data.content || '';
        this.summary = data.summary || '';
        this.notes = data.notes || '';
        
        // Metadata
        this.status = data.status || 'draft'; // draft, writing, edited, finalized
        this.wordCount = data.wordCount || 0;
        this.timeOfDay = data.timeOfDay || '';
        this.duration = data.duration || '';
        
        // Story Elements
        this.characters = data.characters || []; // Array of character IDs
        this.locations = data.locations || []; // Array of location IDs
        this.arcs = data.arcs || []; // Array of arc IDs
        this.timelinePoints = data.timelinePoints || []; // Array of timeline point IDs
        
        // Relationships
        this.previousSceneId = data.previousSceneId || null;
        this.nextSceneId = data.nextSceneId || null;
        
        // Tension & Pacing
        this.tension = data.tension || 50; // 0-100
        this.pacing = data.pacing || 'normal'; // slow, normal, fast
        
        // Tags
        this.tags = data.tags || [];
        this.color = data.color || '#3498db';
        
        // Metadata
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
    }

    /**
     * Validates the scene data
     * @throws {Error} If validation fails
     */
    validate() {
        if (!this.name || this.name.trim() === '') {
            throw new Error('Le nom de la scène est requis');
        }
        if (this.tension < 0 || this.tension > 100) {
            throw new Error('La tension doit être entre 0 et 100');
        }
        return true;
    }

    /**
     * Updates word count based on content
     */
    updateWordCount() {
        this.wordCount = (this.content || '').split(/\s+/).filter(w => w.length > 0).length;
        return this.wordCount;
    }

    /**
     * Returns a clean JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            number: this.number,
            chapterNumber: this.chapterNumber,
            content: this.content,
            summary: this.summary,
            notes: this.notes,
            status: this.status,
            wordCount: this.wordCount,
            timeOfDay: this.timeOfDay,
            duration: this.duration,
            characters: this.characters,
            locations: this.locations,
            arcs: this.arcs,
            timelinePoints: this.timelinePoints,
            previousSceneId: this.previousSceneId,
            nextSceneId: this.nextSceneId,
            tension: this.tension,
            pacing: this.pacing,
            tags: this.tags,
            color: this.color,
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
            number: this.number,
            wordCount: this.wordCount,
            status: this.status,
            color: this.color
        };
    }
}

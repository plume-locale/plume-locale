/**
 * Location Model
 * Represents a location in the story world
 */

class Location {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.name = data.name || '';
        this.type = data.type || ''; // city, village, building, room, etc.
        this.description = data.description || '';
        this.aliases = data.aliases || [];
        
        // Geography
        this.region = data.region || '';
        this.country = data.country || '';
        this.coordinates = data.coordinates || null; // { latitude, longitude }
        
        // Visual
        this.color = data.color || '#3498db';
        this.emoji = data.emoji || '📍';
        this.image = data.image || '';
        
        // Details
        this.population = data.population || '';
        this.government = data.government || '';
        this.climate = data.climate || '';
        this.economy = data.economy || '';
        this.culture = data.culture || '';
        this.landmarks = data.landmarks || [];
        
        // Story Elements
        this.scenes = data.scenes || []; // Array of scene IDs
        this.characters = data.characters || []; // Array of character IDs
        this.tags = data.tags || [];
        this.notes = data.notes || '';
        
        // Relationships
        this.parentLocationId = data.parentLocationId || null; // Parent location if it's a sub-location
        this.relatedLocations = data.relatedLocations || []; // Array of related location IDs
        
        // Map position (if used in map view)
        this.mapX = data.mapX || 0;
        this.mapY = data.mapY || 0;
        
        // Metadata
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();
    }

    /**
     * Validates the location data
     * @throws {Error} If validation fails
     */
    validate() {
        if (!this.name || this.name.trim() === '') {
            throw new Error('Le nom du lieu est requis');
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
            type: this.type,
            description: this.description,
            aliases: this.aliases,
            region: this.region,
            country: this.country,
            coordinates: this.coordinates,
            color: this.color,
            emoji: this.emoji,
            image: this.image,
            population: this.population,
            government: this.government,
            climate: this.climate,
            economy: this.economy,
            culture: this.culture,
            landmarks: this.landmarks,
            scenes: this.scenes,
            characters: this.characters,
            tags: this.tags,
            notes: this.notes,
            parentLocationId: this.parentLocationId,
            relatedLocations: this.relatedLocations,
            mapX: this.mapX,
            mapY: this.mapY,
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
            color: this.color,
            emoji: this.emoji
        };
    }
}

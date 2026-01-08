// ============================================
// LOCATION MODEL - Modèle de données Lieu
// ============================================

/**
 * Location - Modèle représentant un lieu
 */

class Location {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.name = data.name || '';
        this.type = data.type || 'place'; // place, country, city, building, room, other
        this.description = data.description || '';
        this.notes = data.notes || '';

        // Hiérarchie (ex: Salle du trône > Château > Royaume)
        this.parentId = data.parentId || null;
        this.children = data.children || [];

        // Métadonnées
        this.color = data.color || '#95a5a6';
        this.icon = data.icon || 'map-pin';
        this.image = data.image || null;

        // Carte géographique
        this.mapPosition = data.mapPosition || null; // {x, y} sur la carte

        // Scènes
        this.scenes = data.scenes || [];

        // Timestamps
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();

        // Custom fields
        this.customFields = data.customFields || {};
    }

    validate() {
        if (!Validators.required(this.name)) {
            throw new Error('Le nom du lieu est requis');
        }
        if (!Validators.maxLength(this.name, 200)) {
            throw new Error('Le nom ne peut pas dépasser 200 caractères');
        }
        return true;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            description: this.description,
            notes: this.notes,
            parentId: this.parentId,
            children: this.children,
            color: this.color,
            icon: this.icon,
            image: this.image,
            mapPosition: this.mapPosition,
            scenes: this.scenes,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            customFields: this.customFields
        };
    }

    clone() {
        return new Location(JSON.parse(JSON.stringify(this.toJSON())));
    }

    touch() {
        this.updatedAt = Date.now();
    }

    addScene(sceneId) {
        if (!this.scenes.includes(sceneId)) {
            this.scenes.push(sceneId);
            this.touch();
        }
    }

    removeScene(sceneId) {
        this.scenes = ArrayUtils.removeId(this.scenes, sceneId);
        this.touch();
    }

    getStats() {
        return {
            sceneCount: this.scenes.length,
            hasParent: !!this.parentId,
            childrenCount: this.children.length,
            hasMapPosition: !!this.mapPosition
        };
    }
}

window.Location = Location;

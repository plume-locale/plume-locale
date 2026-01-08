// ============================================
// CHARACTER MODEL - Modèle de données Personnage
// ============================================

/**
 * Character - Modèle représentant un personnage
 *
 * Responsabilités :
 * - Définir la structure d'un personnage
 * - Valider les données du personnage
 * - Gérer les relations entre personnages
 */

class Character {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.name = data.name || '';
        this.aliases = data.aliases || []; // Surnoms, pseudonymes
        this.description = data.description || '';
        this.role = data.role || 'secondary'; // protagonist, antagonist, secondary, minor

        // Apparence
        this.appearance = {
            age: data.appearance?.age || null,
            gender: data.appearance?.gender || '',
            height: data.appearance?.height || '',
            physicalDescription: data.appearance?.physicalDescription || '',
            distinguishingFeatures: data.appearance?.distinguishingFeatures || ''
        };

        // Personnalité
        this.personality = {
            traits: data.personality?.traits || [],
            strengths: data.personality?.strengths || [],
            weaknesses: data.personality?.weaknesses || [],
            fears: data.personality?.fears || [],
            desires: data.personality?.desires || [],
            motivations: data.personality?.motivations || ''
        };

        // Background
        this.background = {
            birthplace: data.background?.birthplace || '',
            family: data.background?.family || '',
            occupation: data.background?.occupation || '',
            education: data.background?.education || '',
            history: data.background?.history || ''
        };

        // Relations
        this.relations = data.relations || []; // Relations avec autres personnages

        // Métadonnées
        this.color = data.color || this._generateColor();
        this.image = data.image || null;
        this.icon = data.icon || 'user';

        // Scènes
        this.scenes = data.scenes || []; // IDs des scènes où le personnage apparaît

        // Arc narratif
        this.arc = {
            introduction: data.arc?.introduction || '',
            development: data.arc?.development || '',
            climax: data.arc?.climax || '',
            resolution: data.arc?.resolution || ''
        };

        // Notes et recherche
        this.notes = data.notes || '';
        this.references = data.references || []; // Inspirations, références

        // Timestamps
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();

        // Custom fields
        this.customFields = data.customFields || {};
    }

    /**
     * Génère une couleur aléatoire pour le personnage
     * @private
     * @returns {string}
     */
    _generateColor() {
        const colors = [
            '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
            '#1abc9c', '#e67e22', '#34495e', '#16a085', '#27ae60',
            '#d35400', '#c0392b', '#8e44ad', '#2980b9'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Valide le personnage
     * @throws {Error} Si le personnage est invalide
     * @returns {boolean}
     */
    validate() {
        const validation = Validators.characterName(this.name);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        if (this.color && !Validators.hexColor(this.color)) {
            throw new Error('Couleur hexadécimale invalide');
        }

        return true;
    }

    /**
     * Convertit le personnage en objet sérialisable
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            aliases: this.aliases,
            description: this.description,
            role: this.role,
            appearance: this.appearance,
            personality: this.personality,
            background: this.background,
            relations: this.relations,
            color: this.color,
            image: this.image,
            icon: this.icon,
            scenes: this.scenes,
            arc: this.arc,
            notes: this.notes,
            references: this.references,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            customFields: this.customFields
        };
    }

    /**
     * Clone le personnage
     * @returns {Character}
     */
    clone() {
        return new Character(JSON.parse(JSON.stringify(this.toJSON())));
    }

    /**
     * Met à jour le timestamp de modification
     */
    touch() {
        this.updatedAt = Date.now();
    }

    /**
     * Ajoute un alias
     * @param {string} alias
     */
    addAlias(alias) {
        const normalized = alias.trim();
        if (normalized && !this.aliases.includes(normalized)) {
            this.aliases.push(normalized);
            this.touch();
        }
    }

    /**
     * Retire un alias
     * @param {string} alias
     */
    removeAlias(alias) {
        this.aliases = ArrayUtils.remove(this.aliases, alias);
        this.touch();
    }

    /**
     * Ajoute une relation avec un autre personnage
     * @param {Object} relation
     */
    addRelation(relation) {
        // Vérifier si la relation existe déjà
        const exists = this.relations.some(r => r.characterId === relation.characterId);

        if (!exists) {
            this.relations.push({
                characterId: relation.characterId,
                type: relation.type || 'other', // family, friend, enemy, romantic, colleague, other
                description: relation.description || '',
                intensity: relation.intensity || 5, // 1-10
                color: relation.color || this.color,
                createdAt: Date.now()
            });
            this.touch();
        }
    }

    /**
     * Met à jour une relation
     * @param {number} characterId
     * @param {Object} updates
     */
    updateRelation(characterId, updates) {
        const relation = this.relations.find(r => r.characterId === characterId);
        if (relation) {
            Object.assign(relation, updates);
            this.touch();
        }
    }

    /**
     * Retire une relation
     * @param {number} characterId
     */
    removeRelation(characterId) {
        this.relations = this.relations.filter(r => r.characterId !== characterId);
        this.touch();
    }

    /**
     * Récupère une relation spécifique
     * @param {number} characterId
     * @returns {Object|null}
     */
    getRelation(characterId) {
        return this.relations.find(r => r.characterId === characterId) || null;
    }

    /**
     * Ajoute une scène
     * @param {number} sceneId
     */
    addScene(sceneId) {
        if (!this.scenes.includes(sceneId)) {
            this.scenes.push(sceneId);
            this.touch();
        }
    }

    /**
     * Retire une scène
     * @param {number} sceneId
     */
    removeScene(sceneId) {
        this.scenes = ArrayUtils.removeId(this.scenes, sceneId);
        this.touch();
    }

    /**
     * Ajoute un trait de personnalité
     * @param {string} trait
     */
    addTrait(trait) {
        const normalized = trait.trim();
        if (normalized && !this.personality.traits.includes(normalized)) {
            this.personality.traits.push(normalized);
            this.touch();
        }
    }

    /**
     * Retire un trait
     * @param {string} trait
     */
    removeTrait(trait) {
        this.personality.traits = ArrayUtils.remove(this.personality.traits, trait);
        this.touch();
    }

    /**
     * Vérifie si le personnage a un alias
     * @param {string} name
     * @returns {boolean}
     */
    hasAlias(name) {
        const normalized = TextUtils.normalize(name);
        return this.aliases.some(alias => TextUtils.normalize(alias) === normalized);
    }

    /**
     * Vérifie si le nom ou un alias correspond
     * @param {string} name
     * @returns {boolean}
     */
    matchesName(name) {
        const normalized = TextUtils.normalize(name);
        return TextUtils.normalize(this.name) === normalized || this.hasAlias(name);
    }

    /**
     * Récupère tous les noms (nom principal + aliases)
     * @returns {Array<string>}
     */
    getAllNames() {
        return [this.name, ...this.aliases];
    }

    /**
     * Statistiques du personnage
     * @returns {Object}
     */
    getStats() {
        return {
            sceneCount: this.scenes.length,
            relationCount: this.relations.length,
            aliasCount: this.aliases.length,
            traits: this.personality.traits.length,
            age: this.appearance.age,
            role: this.role,
            hasImage: !!this.image,
            hasArc: !!(this.arc.introduction || this.arc.development ||
                      this.arc.climax || this.arc.resolution)
        };
    }

    /**
     * Recherche dans le personnage
     * @param {string} query
     * @returns {boolean}
     */
    matches(query) {
        return TextUtils.contains(this.name, query) ||
               TextUtils.contains(this.description, query) ||
               TextUtils.contains(this.notes, query) ||
               this.aliases.some(alias => TextUtils.contains(alias, query)) ||
               this.personality.traits.some(trait => TextUtils.contains(trait, query));
    }

    /**
     * Génère une carte de personnage (résumé)
     * @returns {Object}
     */
    getCharacterCard() {
        return {
            id: this.id,
            name: this.name,
            role: this.role,
            description: this.description,
            age: this.appearance.age,
            occupation: this.background.occupation,
            traits: this.personality.traits.slice(0, 5),
            sceneCount: this.scenes.length,
            color: this.color
        };
    }
}

// Exposer globalement
window.Character = Character;

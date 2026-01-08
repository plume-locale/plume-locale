// ============================================
// SCENE MODEL - Modèle de données Scène
// ============================================

/**
 * Scene - Modèle représentant une scène
 *
 * Responsabilités :
 * - Définir la structure d'une scène
 * - Valider les données de la scène
 * - Calculer les statistiques
 */

class Scene {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.title = data.title || 'Nouvelle scène';
        this.content = data.content || '';
        this.summary = data.summary || '';
        this.notes = data.notes || '';

        // Métadonnées
        this.color = data.color || '#95a5a6';
        this.icon = data.icon || null;
        this.status = data.status || 'draft'; // draft, revision, final
        this.pov = data.pov || null; // Point de vue (character ID)

        // Liens
        this.characters = data.characters || []; // IDs des personnages présents
        this.locations = data.locations || []; // IDs des lieux
        this.tags = data.tags || []; // Tags libres

        // Timeline
        this.timelineDate = data.timelineDate || null;
        this.timelineDuration = data.timelineDuration || null; // en minutes

        // Timestamps
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();

        // Versions
        this.versions = data.versions || [];
        this.currentVersion = data.currentVersion || 0;

        // Révisions
        this.annotations = data.annotations || [];
        this.highlights = data.highlights || [];

        // Tension dramatique
        this.tension = data.tension || 5; // 1-10

        // Custom data
        this.customFields = data.customFields || {};
    }

    /**
     * Valide la scène
     * @throws {Error} Si la scène est invalide
     * @returns {boolean}
     */
    validate() {
        const validation = Validators.sceneTitle(this.title);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        if (this.tension < 1 || this.tension > 10) {
            throw new Error('La tension doit être entre 1 et 10');
        }

        return true;
    }

    /**
     * Convertit la scène en objet sérialisable
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            content: this.content,
            summary: this.summary,
            notes: this.notes,
            color: this.color,
            icon: this.icon,
            status: this.status,
            pov: this.pov,
            characters: this.characters,
            locations: this.locations,
            tags: this.tags,
            timelineDate: this.timelineDate,
            timelineDuration: this.timelineDuration,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            versions: this.versions,
            currentVersion: this.currentVersion,
            annotations: this.annotations,
            highlights: this.highlights,
            tension: this.tension,
            customFields: this.customFields
        };
    }

    /**
     * Clone la scène
     * @returns {Scene}
     */
    clone() {
        return new Scene(JSON.parse(JSON.stringify(this.toJSON())));
    }

    /**
     * Compte les mots dans le contenu
     * @returns {number}
     */
    getWordCount() {
        return TextUtils.countWords(this.content);
    }

    /**
     * Compte les caractères (sans espaces)
     * @returns {number}
     */
    getCharacterCount() {
        return TextUtils.countCharacters(this.content);
    }

    /**
     * Calcule le temps de lecture
     * @param {number} wordsPerMinute - Vitesse de lecture
     * @returns {Object}
     */
    getReadingTime(wordsPerMinute = 200) {
        return TextUtils.readingTime(this.content, wordsPerMinute);
    }

    /**
     * Extrait un résumé automatique
     * @param {number} wordCount - Nombre de mots
     * @returns {string}
     */
    getAutoSummary(wordCount = 50) {
        if (this.summary) return this.summary;
        return TextUtils.excerpt(this.content, wordCount);
    }

    /**
     * Met à jour le timestamp de modification
     */
    touch() {
        this.updatedAt = Date.now();
    }

    /**
     * Ajoute un personnage
     * @param {number} characterId
     */
    addCharacter(characterId) {
        if (!this.characters.includes(characterId)) {
            this.characters.push(characterId);
            this.touch();
        }
    }

    /**
     * Retire un personnage
     * @param {number} characterId
     */
    removeCharacter(characterId) {
        this.characters = ArrayUtils.removeId(this.characters, characterId);
        this.touch();
    }

    /**
     * Ajoute un lieu
     * @param {number} locationId
     */
    addLocation(locationId) {
        if (!this.locations.includes(locationId)) {
            this.locations.push(locationId);
            this.touch();
        }
    }

    /**
     * Retire un lieu
     * @param {number} locationId
     */
    removeLocation(locationId) {
        this.locations = ArrayUtils.removeId(this.locations, locationId);
        this.touch();
    }

    /**
     * Ajoute un tag
     * @param {string} tag
     */
    addTag(tag) {
        const normalizedTag = tag.trim().toLowerCase();
        if (!this.tags.includes(normalizedTag)) {
            this.tags.push(normalizedTag);
            this.touch();
        }
    }

    /**
     * Retire un tag
     * @param {string} tag
     */
    removeTag(tag) {
        this.tags = ArrayUtils.remove(this.tags, tag.toLowerCase());
        this.touch();
    }

    /**
     * Crée une version de la scène
     * @param {string} description - Description de la version
     * @returns {Object}
     */
    createVersion(description = '') {
        const version = {
            id: Date.now(),
            versionNumber: this.versions.length + 1,
            description,
            content: this.content,
            createdAt: Date.now(),
            wordCount: this.getWordCount()
        };

        this.versions.push(version);
        this.currentVersion = this.versions.length - 1;
        this.touch();

        return version;
    }

    /**
     * Restaure une version
     * @param {number} versionIndex
     * @returns {boolean}
     */
    restoreVersion(versionIndex) {
        if (versionIndex < 0 || versionIndex >= this.versions.length) {
            return false;
        }

        const version = this.versions[versionIndex];
        this.content = version.content;
        this.currentVersion = versionIndex;
        this.touch();

        return true;
    }

    /**
     * Ajoute une annotation
     * @param {Object} annotation
     */
    addAnnotation(annotation) {
        this.annotations.push({
            id: Date.now(),
            type: annotation.type || 'comment',
            text: annotation.text || '',
            position: annotation.position || 0,
            length: annotation.length || 0,
            color: annotation.color || 'yellow',
            createdAt: Date.now(),
            author: annotation.author || null
        });
        this.touch();
    }

    /**
     * Retire une annotation
     * @param {number} annotationId
     */
    removeAnnotation(annotationId) {
        this.annotations = this.annotations.filter(a => a.id !== annotationId);
        this.touch();
    }

    /**
     * Ajoute un surlignage
     * @param {Object} highlight
     */
    addHighlight(highlight) {
        this.highlights.push({
            id: Date.now(),
            start: highlight.start || 0,
            end: highlight.end || 0,
            color: highlight.color || 'yellow',
            text: highlight.text || '',
            createdAt: Date.now()
        });
        this.touch();
    }

    /**
     * Retire un surlignage
     * @param {number} highlightId
     */
    removeHighlight(highlightId) {
        this.highlights = this.highlights.filter(h => h.id !== highlightId);
        this.touch();
    }

    /**
     * Vérifie si la scène contient un personnage
     * @param {number} characterId
     * @returns {boolean}
     */
    hasCharacter(characterId) {
        return this.characters.includes(characterId);
    }

    /**
     * Vérifie si la scène contient un lieu
     * @param {number} locationId
     * @returns {boolean}
     */
    hasLocation(locationId) {
        return this.locations.includes(locationId);
    }

    /**
     * Vérifie si la scène est vide
     * @returns {boolean}
     */
    isEmpty() {
        return TextUtils.isEmpty(this.content);
    }

    /**
     * Statistiques de la scène
     * @returns {Object}
     */
    getStats() {
        return {
            words: this.getWordCount(),
            characters: this.getCharacterCount(),
            charactersWithSpaces: TextUtils.countCharactersWithSpaces(this.content),
            readingTime: this.getReadingTime(),
            characters: this.characters.length,
            locations: this.locations.length,
            tags: this.tags.length,
            annotations: this.annotations.length,
            versions: this.versions.length
        };
    }
}

// Exposer globalement
window.Scene = Scene;

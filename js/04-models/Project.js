// ============================================
// PROJECT MODEL - Modèle de données Projet
// ============================================

/**
 * Project - Modèle représentant un projet d'écriture
 *
 * Responsabilités :
 * - Définir la structure d'un projet
 * - Valider les données du projet
 * - Fournir des méthodes utilitaires
 */

class Project {
    constructor(data = {}) {
        this.id = data.id || Date.now();
        this.title = data.title || 'Mon Roman';
        this.description = data.description || '';
        this.genre = data.genre || '';
        this.author = data.author || '';

        // Timestamps
        this.createdAt = data.createdAt || Date.now();
        this.updatedAt = data.updatedAt || Date.now();

        // Structure narrative
        this.acts = data.acts || [];

        // Base de données
        this.characters = data.characters || [];
        this.world = data.world || [];
        this.notes = data.notes || [];
        this.codex = data.codex || [];

        // Timeline
        this.timeline = data.timeline || [];
        this.visualTimeline = data.visualTimeline || [];
        this.metroTimeline = data.metroTimeline || [];

        // Relations
        this.relations = data.relations || [];
        this.relationships = data.relationships || [];
        this.characterPositions = data.characterPositions || {};
        this.characterColors = data.characterColors || {};

        // Carte
        this.mapLocations = data.mapLocations || [];
        this.mapImage = data.mapImage || null;

        // Mindmaps
        this.mindmaps = data.mindmaps || [];

        // Statistiques
        this.stats = {
            dailyGoal: data.stats?.dailyGoal || 500,
            totalGoal: data.stats?.totalGoal || 80000,
            writingSessions: data.stats?.writingSessions || []
        };

        // Versions
        this.versions = data.versions || [];

        // Métadonnées
        this.metadata = data.metadata || {
            version: '2.0.0',
            lastBackup: null,
            autoSaveEnabled: true
        };
    }

    /**
     * Valide le projet
     * @throws {Error} Si le projet est invalide
     * @returns {boolean}
     */
    validate() {
        const validation = Validators.projectName(this.title);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        if (this.stats.dailyGoal < 0) {
            throw new Error('L\'objectif quotidien doit être positif');
        }

        if (this.stats.totalGoal < 0) {
            throw new Error('L\'objectif total doit être positif');
        }

        return true;
    }

    /**
     * Convertit le projet en objet sérialisable
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            genre: this.genre,
            author: this.author,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            acts: this.acts,
            characters: this.characters,
            world: this.world,
            notes: this.notes,
            codex: this.codex,
            timeline: this.timeline,
            visualTimeline: this.visualTimeline,
            metroTimeline: this.metroTimeline,
            relations: this.relations,
            relationships: this.relationships,
            characterPositions: this.characterPositions,
            characterColors: this.characterColors,
            mapLocations: this.mapLocations,
            mapImage: this.mapImage,
            mindmaps: this.mindmaps,
            stats: this.stats,
            versions: this.versions,
            metadata: this.metadata
        };
    }

    /**
     * Clone le projet
     * @returns {Project}
     */
    clone() {
        return new Project(JSON.parse(JSON.stringify(this.toJSON())));
    }

    /**
     * Compte le nombre total de mots
     * @returns {number}
     */
    getTotalWordCount() {
        let total = 0;

        this.acts.forEach(act => {
            act.chapters?.forEach(chapter => {
                chapter.scenes?.forEach(scene => {
                    total += TextUtils.countWords(scene.content || '');
                });
            });
        });

        return total;
    }

    /**
     * Récupère toutes les scènes du projet
     * @returns {Array<Object>}
     */
    getAllScenes() {
        const scenes = [];

        this.acts.forEach(act => {
            act.chapters?.forEach(chapter => {
                chapter.scenes?.forEach(scene => {
                    scenes.push(scene);
                });
            });
        });

        return scenes;
    }

    /**
     * Récupère tous les chapitres du projet
     * @returns {Array<Object>}
     */
    getAllChapters() {
        const chapters = [];

        this.acts.forEach(act => {
            act.chapters?.forEach(chapter => {
                chapters.push(chapter);
            });
        });

        return chapters;
    }

    /**
     * Trouve une scène par ID
     * @param {number} sceneId
     * @returns {Object|null}
     */
    findScene(sceneId) {
        for (const act of this.acts) {
            for (const chapter of act.chapters || []) {
                for (const scene of chapter.scenes || []) {
                    if (scene.id === sceneId) {
                        return scene;
                    }
                }
            }
        }
        return null;
    }

    /**
     * Trouve un chapitre par ID
     * @param {number} chapterId
     * @returns {Object|null}
     */
    findChapter(chapterId) {
        for (const act of this.acts) {
            for (const chapter of act.chapters || []) {
                if (chapter.id === chapterId) {
                    return chapter;
                }
            }
        }
        return null;
    }

    /**
     * Trouve un acte par ID
     * @param {number} actId
     * @returns {Object|null}
     */
    findAct(actId) {
        return ArrayUtils.findById(this.acts, actId);
    }

    /**
     * Trouve un personnage par ID
     * @param {number} characterId
     * @returns {Object|null}
     */
    findCharacter(characterId) {
        return ArrayUtils.findById(this.characters, characterId);
    }

    /**
     * Trouve un lieu par ID
     * @param {number} locationId
     * @returns {Object|null}
     */
    findLocation(locationId) {
        return ArrayUtils.findById(this.world, locationId);
    }

    /**
     * Trouve une note par ID
     * @param {number} noteId
     * @returns {Object|null}
     */
    findNote(noteId) {
        return ArrayUtils.findById(this.notes, noteId);
    }

    /**
     * Met à jour le timestamp de modification
     */
    touch() {
        this.updatedAt = Date.now();
    }

    /**
     * Crée un snapshot du projet
     * @param {string} description - Description du snapshot
     * @returns {Object}
     */
    createSnapshot(description = '') {
        const snapshot = {
            id: Date.now(),
            description,
            createdAt: Date.now(),
            data: this.clone().toJSON(),
            wordCount: this.getTotalWordCount()
        };

        this.versions.push(snapshot);
        return snapshot;
    }

    /**
     * Restaure un snapshot
     * @param {number} snapshotId
     * @returns {boolean}
     */
    restoreSnapshot(snapshotId) {
        const snapshot = ArrayUtils.findById(this.versions, snapshotId);
        if (!snapshot) return false;

        const restoredData = snapshot.data;
        Object.assign(this, new Project(restoredData));

        return true;
    }

    /**
     * Statistiques du projet
     * @returns {Object}
     */
    getStats() {
        const scenes = this.getAllScenes();
        const chapters = this.getAllChapters();
        const totalWords = this.getTotalWordCount();

        return {
            acts: this.acts.length,
            chapters: chapters.length,
            scenes: scenes.length,
            characters: this.characters.length,
            locations: this.world.length,
            notes: this.notes.length,
            totalWords,
            progress: this.stats.totalGoal > 0
                ? Math.round((totalWords / this.stats.totalGoal) * 100)
                : 0,
            averageSceneLength: scenes.length > 0
                ? Math.round(totalWords / scenes.length)
                : 0
        };
    }

    /**
     * Recherche dans le projet
     * @param {string} query - Texte à rechercher
     * @returns {Object} Résultats de recherche
     */
    search(query) {
        const normalizedQuery = TextUtils.normalize(query);
        const results = {
            scenes: [],
            characters: [],
            locations: [],
            notes: []
        };

        // Recherche dans les scènes
        this.getAllScenes().forEach(scene => {
            if (TextUtils.contains(scene.title, query) ||
                TextUtils.contains(scene.content, query)) {
                results.scenes.push(scene);
            }
        });

        // Recherche dans les personnages
        this.characters.forEach(character => {
            if (TextUtils.contains(character.name, query) ||
                TextUtils.contains(character.description, query)) {
                results.characters.push(character);
            }
        });

        // Recherche dans les lieux
        this.world.forEach(location => {
            if (TextUtils.contains(location.name, query) ||
                TextUtils.contains(location.description, query)) {
                results.locations.push(location);
            }
        });

        // Recherche dans les notes
        this.notes.forEach(note => {
            if (TextUtils.contains(note.title, query) ||
                TextUtils.contains(note.content, query)) {
                results.notes.push(note);
            }
        });

        return results;
    }
}

// Exposer globalement
window.Project = Project;

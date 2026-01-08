// ============================================
// CHARACTER SERVICE - Service métier Personnages
// ============================================

/**
 * CharacterService - Logique métier pour les personnages
 *
 * Responsabilités :
 * - CRUD des personnages
 * - Recherche et filtrage
 * - Calculs de statistiques
 * - Gestion des relations
 */

const CharacterService = {

    /**
     * Crée un nouveau personnage
     * @param {Object} characterData
     * @returns {Character}
     */
    create(characterData) {
        const character = new Character(characterData);
        character.validate();

        const state = StateManager.getState();
        if (!state.project) {
            throw new Error('Aucun projet actif');
        }

        state.project.characters.push(character.toJSON());
        state.project.touch();

        EventBus.emit('character:created', character);
        StorageService.saveProject(state.project);

        return character;
    },

    /**
     * Met à jour un personnage
     * @param {number} characterId
     * @param {Object} updates
     * @returns {Character}
     */
    update(characterId, updates) {
        const character = this.findById(characterId);
        if (!character) {
            throw new Error('Personnage introuvable');
        }

        Object.assign(character, updates);
        character.touch();
        character.validate();

        const state = StateManager.getState();
        state.project.touch();

        EventBus.emit('character:updated', character);
        StorageService.saveProject(state.project);

        return character;
    },

    /**
     * Supprime un personnage
     * @param {number} characterId
     * @returns {boolean}
     */
    delete(characterId) {
        const state = StateManager.getState();
        if (!state.project) return false;

        const index = state.project.characters.findIndex(c => c.id === characterId);
        if (index === -1) return false;

        const character = state.project.characters[index];

        // Nettoyer les références
        this._removeReferences(characterId);

        state.project.characters.splice(index, 1);
        state.project.touch();

        EventBus.emit('character:deleted', characterId);
        StorageService.saveProject(state.project);

        return true;
    },

    /**
     * Trouve un personnage par ID
     * @param {number} characterId
     * @returns {Character|null}
     */
    findById(characterId) {
        const state = StateManager.getState();
        if (!state.project) return null;

        const data = ArrayUtils.findById(state.project.characters, characterId);
        return data ? new Character(data) : null;
    },

    /**
     * Liste tous les personnages
     * @returns {Array<Character>}
     */
    findAll() {
        const state = StateManager.getState();
        if (!state.project) return [];

        return state.project.characters.map(data => new Character(data));
    },

    /**
     * Recherche des personnages par nom
     * @param {string} query
     * @returns {Array<Character>}
     */
    search(query) {
        return this.findAll().filter(char => char.matches(query));
    },

    /**
     * Filtre les personnages par rôle
     * @param {string} role
     * @returns {Array<Character>}
     */
    findByRole(role) {
        return this.findAll().filter(char => char.role === role);
    },

    /**
     * Récupère les scènes d'un personnage
     * @param {number} characterId
     * @returns {Array<Scene>}
     */
    getScenes(characterId) {
        const state = StateManager.getState();
        if (!state.project) return [];

        const scenes = [];
        state.project.acts?.forEach(act => {
            act.chapters?.forEach(chapter => {
                chapter.scenes?.forEach(scene => {
                    if (scene.characters?.includes(characterId)) {
                        scenes.push(new Scene(scene));
                    }
                });
            });
        });

        return scenes;
    },

    /**
     * Calcule les statistiques d'un personnage
     * @param {number} characterId
     * @returns {Object}
     */
    getStats(characterId) {
        const scenes = this.getScenes(characterId);
        const totalWords = scenes.reduce((sum, scene) =>
            sum + scene.getWordCount(), 0
        );

        return {
            sceneCount: scenes.length,
            wordCount: totalWords,
            firstAppearance: scenes[0]?.id || null,
            lastAppearance: scenes[scenes.length - 1]?.id || null
        };
    },

    /**
     * Retire les références à un personnage
     * @private
     */
    _removeReferences(characterId) {
        const state = StateManager.getState();

        // Retirer des scènes
        state.project.acts?.forEach(act => {
            act.chapters?.forEach(chapter => {
                chapter.scenes?.forEach(scene => {
                    if (scene.characters) {
                        scene.characters = ArrayUtils.removeId(scene.characters, characterId);
                    }
                });
            });
        });

        // Retirer des relations
        state.project.characters?.forEach(char => {
            if (char.relations) {
                char.relations = char.relations.filter(r => r.characterId !== characterId);
            }
        });
    }
};

window.CharacterService = CharacterService;

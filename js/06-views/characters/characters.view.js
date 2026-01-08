// ============================================
// CHARACTERS VIEW - Vue des personnages
// ============================================

/**
 * CharactersView - Contrôleur de la vue Personnages
 *
 * Responsabilités :
 * - Orchestrer l'affichage de la liste des personnages
 * - Gérer l'ouverture des modales
 * - Coordonner le rendu et les événements
 */

const CharactersView = {

    /**
     * Initialise la vue
     * @param {Object} params - Paramètres optionnels
     */
    async init(params = {}) {
        console.log('[CharactersView] Initializing...');

        this._bindEvents();
        await this.render();

        // Sélectionner un personnage si fourni
        if (params.characterId) {
            this.openDetail(params.characterId);
        }

        console.log('[CharactersView] Initialized');
    },

    /**
     * Rend la vue
     */
    async render() {
        const container = DOMUtils.query('#characters-view');
        if (!container) {
            console.error('[CharactersView] Container #characters-view not found');
            return;
        }

        const characters = CharacterService.findAll();
        const html = CharactersRender.renderList(characters);

        container.innerHTML = html;

        // Attacher les handlers
        CharactersHandlers.attachListHandlers();
    },

    /**
     * Ouvre la modale de création
     */
    async openAddModal() {
        const html = CharactersRender.renderAddModal();

        ModalUI.open('add-character-modal', html, {
            title: 'Nouveau personnage',
            width: 'large'
        });

        CharactersHandlers.attachModalHandlers();
    },

    /**
     * Ouvre la modale de détail
     * @param {number} characterId
     */
    async openDetail(characterId) {
        const character = CharacterService.findById(characterId);
        if (!character) {
            ToastUI.error('Personnage introuvable');
            return;
        }

        const stats = CharacterService.getStats(characterId);
        const html = CharactersRender.renderDetailModal(character, stats);

        ModalUI.open('character-detail-modal', html, {
            title: character.name,
            width: 'large'
        });

        CharactersHandlers.attachDetailHandlers(characterId);
    },

    /**
     * Ouvre la modale d'édition
     * @param {number} characterId
     */
    async openEditModal(characterId) {
        const character = CharacterService.findById(characterId);
        if (!character) {
            ToastUI.error('Personnage introuvable');
            return;
        }

        const html = CharactersRender.renderEditModal(character);

        ModalUI.open('edit-character-modal', html, {
            title: `Modifier ${character.name}`,
            width: 'large'
        });

        CharactersHandlers.attachEditHandlers(characterId);
    },

    /**
     * Lie les événements globaux
     * @private
     */
    _bindEvents() {
        // Recharger la vue quand un personnage est modifié
        EventBus.on('character:created', () => this.render());
        EventBus.on('character:updated', () => this.render());
        EventBus.on('character:deleted', () => this.render());
    },

    /**
     * Nettoie la vue
     */
    destroy() {
        EventBus.off('character:created');
        EventBus.off('character:updated');
        EventBus.off('character:deleted');

        console.log('[CharactersView] Destroyed');
    }
};

// Exposer globalement
window.CharactersView = CharactersView;

// ============================================
// CHARACTERS HANDLERS - Gestionnaires d'événements
// ============================================

/**
 * CharactersHandlers - Gestion des événements de la vue Personnages
 */

const CharactersHandlers = {

    /**
     * Attache les handlers pour la liste
     */
    attachListHandlers() {
        const container = DOMUtils.query('#characters-view');
        if (!container) return;

        // Utiliser la délégation d'événements
        container.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            const characterId = parseInt(e.target.closest('[data-character-id]')?.dataset.characterId);

            if (action === 'add-character') {
                CharactersView.openAddModal();
            }
            else if (action === 'view-character' && characterId) {
                CharactersView.openDetail(characterId);
            }
            else if (action === 'edit-character' && characterId) {
                CharactersView.openEditModal(characterId);
            }
            else if (action === 'delete-character' && characterId) {
                this.handleDelete(characterId);
            }
        });

        // Double-clic sur une carte pour ouvrir le détail
        container.addEventListener('dblclick', (e) => {
            const card = e.target.closest('.character-card');
            if (card) {
                const characterId = parseInt(card.dataset.characterId);
                CharactersView.openDetail(characterId);
            }
        });
    },

    /**
     * Attache les handlers pour la modale d'ajout/édition
     */
    attachModalHandlers() {
        const form = DOMUtils.query('#add-character-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreate();
        });

        form.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
            ModalUI.close();
        });
    },

    /**
     * Attache les handlers pour la modale de détail
     * @param {number} characterId
     */
    attachDetailHandlers(characterId) {
        const modal = document.querySelector('.character-detail');
        if (!modal) return;

        modal.addEventListener('click', async (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;

            if (action === 'edit-character-from-detail') {
                ModalUI.close();
                CharactersView.openEditModal(characterId);
            }
            else if (action === 'delete-character-from-detail') {
                const deleted = await this.handleDelete(characterId);
                if (deleted) {
                    ModalUI.close();
                }
            }
        });
    },

    /**
     * Attache les handlers pour la modale d'édition
     * @param {number} characterId
     */
    attachEditHandlers(characterId) {
        const form = DOMUtils.query('#edit-character-form');
        if (!form) return;

        // Charger les données du personnage
        const character = CharacterService.findById(characterId);
        if (character) {
            this._fillForm(form, character);
        }

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleUpdate(characterId);
        });

        form.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
            ModalUI.close();
        });
    },

    /**
     * Gère la création d'un personnage
     */
    async handleCreate() {
        const form = DOMUtils.query('#add-character-form');
        const formData = this._getFormData(form);

        try {
            const character = CharacterService.create(formData);

            ModalUI.close();
            ToastUI.success(`Personnage "${character.name}" créé`);

        } catch (error) {
            console.error('[CharactersHandlers] Error creating character:', error);
            ToastUI.error(error.message || 'Erreur lors de la création');
        }
    },

    /**
     * Gère la mise à jour d'un personnage
     * @param {number} characterId
     */
    async handleUpdate(characterId) {
        const form = DOMUtils.query('#edit-character-form');
        const formData = this._getFormData(form);

        try {
            const character = CharacterService.update(characterId, formData);

            ModalUI.close();
            ToastUI.success(`Personnage "${character.name}" mis à jour`);

        } catch (error) {
            console.error('[CharactersHandlers] Error updating character:', error);
            ToastUI.error(error.message || 'Erreur lors de la mise à jour');
        }
    },

    /**
     * Gère la suppression d'un personnage
     * @param {number} characterId
     * @returns {Promise<boolean>}
     */
    async handleDelete(characterId) {
        const character = CharacterService.findById(characterId);
        if (!character) return false;

        const confirmed = await ModalUI.confirm(
            `Supprimer "${character.name}" ?`,
            'Cette action est irréversible. Le personnage sera retiré de toutes les scènes.',
            { danger: true }
        );

        if (!confirmed) return false;

        try {
            const success = CharacterService.delete(characterId);

            if (success) {
                ToastUI.success(`Personnage "${character.name}" supprimé`);
            }

            return success;

        } catch (error) {
            console.error('[CharactersHandlers] Error deleting character:', error);
            ToastUI.error('Erreur lors de la suppression');
            return false;
        }
    },

    /**
     * Récupère les données du formulaire
     * @private
     */
    _getFormData(form) {
        return {
            name: DOMUtils.query('#char-name', form)?.value.trim() || '',
            role: DOMUtils.query('#char-role', form)?.value || 'secondary',
            description: DOMUtils.query('#char-description', form)?.value.trim() || '',
            color: DOMUtils.query('#char-color', form)?.value || '#3498db',
            appearance: {
                age: parseInt(DOMUtils.query('#char-age', form)?.value) || null,
                gender: DOMUtils.query('#char-gender', form)?.value.trim() || '',
                physicalDescription: DOMUtils.query('#char-physical', form)?.value.trim() || ''
            },
            background: {
                occupation: DOMUtils.query('#char-occupation', form)?.value.trim() || '',
                history: DOMUtils.query('#char-history', form)?.value.trim() || ''
            }
        };
    },

    /**
     * Remplit le formulaire avec les données du personnage
     * @private
     */
    _fillForm(form, character) {
        const nameInput = DOMUtils.query('#char-name', form);
        const roleSelect = DOMUtils.query('#char-role', form);
        const descriptionInput = DOMUtils.query('#char-description', form);
        const colorInput = DOMUtils.query('#char-color', form);
        const ageInput = DOMUtils.query('#char-age', form);
        const genderInput = DOMUtils.query('#char-gender', form);
        const physicalInput = DOMUtils.query('#char-physical', form);
        const occupationInput = DOMUtils.query('#char-occupation', form);
        const historyInput = DOMUtils.query('#char-history', form);

        if (nameInput) nameInput.value = character.name;
        if (roleSelect) roleSelect.value = character.role;
        if (descriptionInput) descriptionInput.value = character.description;
        if (colorInput) colorInput.value = character.color;
        if (ageInput && character.appearance.age) ageInput.value = character.appearance.age;
        if (genderInput) genderInput.value = character.appearance.gender || '';
        if (physicalInput) physicalInput.value = character.appearance.physicalDescription || '';
        if (occupationInput) occupationInput.value = character.background.occupation || '';
        if (historyInput) historyInput.value = character.background.history || '';
    }
};

// Exposer globalement
window.CharactersHandlers = CharactersHandlers;

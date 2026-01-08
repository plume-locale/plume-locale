// ============================================
// LOCATIONS HANDLERS - Gestionnaires d'événements
// ============================================

/**
 * LocationsHandlers - Gestion des événements de la vue Lieux
 */

const LocationsHandlers = {

    attachListHandlers() {
        const container = DOMUtils.query('#locations-view');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;
            const locationId = parseInt(e.target.closest('[data-location-id]')?.dataset.locationId);

            if (action === 'add-location') {
                LocationsView.openAddModal();
            }
            else if (action === 'view-location' && locationId) {
                LocationsView.openDetail(locationId);
            }
            else if (action === 'edit-location' && locationId) {
                LocationsView.openEditModal(locationId);
            }
            else if (action === 'delete-location' && locationId) {
                this.handleDelete(locationId);
            }
        });

        container.addEventListener('dblclick', (e) => {
            const card = e.target.closest('.location-card');
            if (card) {
                const locationId = parseInt(card.dataset.locationId);
                LocationsView.openDetail(locationId);
            }
        });
    },

    attachModalHandlers() {
        const form = DOMUtils.query('#add-location-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleCreate();
        });

        form.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
            ModalUI.close();
        });
    },

    attachDetailHandlers(locationId) {
        const modal = document.querySelector('.location-detail');
        if (!modal) return;

        modal.addEventListener('click', async (e) => {
            const action = e.target.closest('[data-action]')?.dataset.action;

            if (action === 'edit-location-from-detail') {
                ModalUI.close();
                LocationsView.openEditModal(locationId);
            }
            else if (action === 'delete-location-from-detail') {
                const deleted = await this.handleDelete(locationId);
                if (deleted) {
                    ModalUI.close();
                }
            }
        });
    },

    attachEditHandlers(locationId) {
        const form = DOMUtils.query('#edit-location-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleUpdate(locationId);
        });

        form.querySelector('[data-action="cancel"]')?.addEventListener('click', () => {
            ModalUI.close();
        });
    },

    async handleCreate() {
        const form = DOMUtils.query('#add-location-form');
        const formData = this._getFormData(form);

        try {
            const location = LocationService.create(formData);

            ModalUI.close();
            ToastUI.success(`Lieu "${location.name}" créé`);

        } catch (error) {
            console.error('[LocationsHandlers] Error creating location:', error);
            ToastUI.error(error.message || 'Erreur lors de la création');
        }
    },

    async handleUpdate(locationId) {
        const form = DOMUtils.query('#edit-location-form');
        const formData = this._getFormData(form);

        try {
            const location = LocationService.update(locationId, formData);

            ModalUI.close();
            ToastUI.success(`Lieu "${location.name}" mis à jour`);

        } catch (error) {
            console.error('[LocationsHandlers] Error updating location:', error);
            ToastUI.error(error.message || 'Erreur lors de la mise à jour');
        }
    },

    async handleDelete(locationId) {
        const location = LocationService.findById(locationId);
        if (!location) return false;

        const confirmed = await ModalUI.confirm(
            `Supprimer "${location.name}" ?`,
            'Cette action est irréversible. Le lieu sera retiré de toutes les scènes.',
            { danger: true }
        );

        if (!confirmed) return false;

        try {
            const success = LocationService.delete(locationId);

            if (success) {
                ToastUI.success(`Lieu "${location.name}" supprimé`);
            }

            return success;

        } catch (error) {
            console.error('[LocationsHandlers] Error deleting location:', error);
            ToastUI.error('Erreur lors de la suppression');
            return false;
        }
    },

    _getFormData(form) {
        return {
            name: DOMUtils.query('#loc-name', form)?.value.trim() || '',
            type: DOMUtils.query('#loc-type', form)?.value || 'place',
            description: DOMUtils.query('#loc-description', form)?.value.trim() || '',
            notes: DOMUtils.query('#loc-notes', form)?.value.trim() || '',
            color: DOMUtils.query('#loc-color', form)?.value || '#95a5a6',
            icon: DOMUtils.query('#loc-icon', form)?.value || 'map-pin'
        };
    }
};

window.LocationsHandlers = LocationsHandlers;

// ============================================
// LOCATIONS VIEW - Vue des lieux
// ============================================

/**
 * LocationsView - Contrôleur de la vue Lieux
 */

const LocationsView = {

    async init(params = {}) {
        console.log('[LocationsView] Initializing...');

        this._bindEvents();
        await this.render();

        if (params.locationId) {
            this.openDetail(params.locationId);
        }

        console.log('[LocationsView] Initialized');
    },

    async render() {
        const container = DOMUtils.query('#locations-view');
        if (!container) {
            console.error('[LocationsView] Container #locations-view not found');
            return;
        }

        const locations = LocationService.findAll();
        const html = LocationsRender.renderList(locations);

        container.innerHTML = html;
        LocationsHandlers.attachListHandlers();
    },

    async openAddModal() {
        const html = LocationsRender.renderAddModal();

        ModalUI.open('add-location-modal', html, {
            title: 'Nouveau lieu',
            width: 'large'
        });

        LocationsHandlers.attachModalHandlers();
    },

    async openDetail(locationId) {
        const location = LocationService.findById(locationId);
        if (!location) {
            ToastUI.error('Lieu introuvable');
            return;
        }

        const stats = LocationService.getStats(locationId);
        const html = LocationsRender.renderDetailModal(location, stats);

        ModalUI.open('location-detail-modal', html, {
            title: location.name,
            width: 'large'
        });

        LocationsHandlers.attachDetailHandlers(locationId);
    },

    async openEditModal(locationId) {
        const location = LocationService.findById(locationId);
        if (!location) {
            ToastUI.error('Lieu introuvable');
            return;
        }

        const html = LocationsRender.renderEditModal(location);

        ModalUI.open('edit-location-modal', html, {
            title: `Modifier ${location.name}`,
            width: 'large'
        });

        LocationsHandlers.attachEditHandlers(locationId);
    },

    _bindEvents() {
        EventBus.on('location:created', () => this.render());
        EventBus.on('location:updated', () => this.render());
        EventBus.on('location:deleted', () => this.render());
    },

    destroy() {
        EventBus.off('location:created');
        EventBus.off('location:updated');
        EventBus.off('location:deleted');

        console.log('[LocationsView] Destroyed');
    }
};

window.LocationsView = LocationsView;

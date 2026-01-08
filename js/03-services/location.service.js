// ============================================
// LOCATION SERVICE - Service métier Lieux
// ============================================

/**
 * LocationService - Logique métier pour les lieux
 */

const LocationService = {

    create(locationData) {
        const location = new Location(locationData);
        location.validate();

        const state = StateManager.getState();
        if (!state.project) {
            throw new Error('Aucun projet actif');
        }

        state.project.world.push(location.toJSON());
        state.project.touch();

        EventBus.emit('location:created', location);
        StorageService.saveProject(state.project);

        return location;
    },

    update(locationId, updates) {
        const location = this.findById(locationId);
        if (!location) {
            throw new Error('Lieu introuvable');
        }

        Object.assign(location, updates);
        location.touch();
        location.validate();

        const state = StateManager.getState();
        state.project.touch();

        EventBus.emit('location:updated', location);
        StorageService.saveProject(state.project);

        return location;
    },

    delete(locationId) {
        const state = StateManager.getState();
        if (!state.project) return false;

        const index = state.project.world.findIndex(l => l.id === locationId);
        if (index === -1) return false;

        // Nettoyer les références
        this._removeReferences(locationId);

        state.project.world.splice(index, 1);
        state.project.touch();

        EventBus.emit('location:deleted', locationId);
        StorageService.saveProject(state.project);

        return true;
    },

    findById(locationId) {
        const state = StateManager.getState();
        if (!state.project) return null;

        const data = ArrayUtils.findById(state.project.world, locationId);
        return data ? new Location(data) : null;
    },

    findAll() {
        const state = StateManager.getState();
        if (!state.project) return [];

        return state.project.world.map(data => new Location(data));
    },

    search(query) {
        return this.findAll().filter(loc =>
            TextUtils.contains(loc.name, query) ||
            TextUtils.contains(loc.description, query)
        );
    },

    findByType(type) {
        return this.findAll().filter(loc => loc.type === type);
    },

    getScenes(locationId) {
        const state = StateManager.getState();
        if (!state.project) return [];

        const scenes = [];
        state.project.acts?.forEach(act => {
            act.chapters?.forEach(chapter => {
                chapter.scenes?.forEach(scene => {
                    if (scene.locations?.includes(locationId)) {
                        scenes.push(new Scene(scene));
                    }
                });
            });
        });

        return scenes;
    },

    getStats(locationId) {
        const scenes = this.getScenes(locationId);
        const totalWords = scenes.reduce((sum, scene) =>
            sum + scene.getWordCount(), 0
        );

        return {
            sceneCount: scenes.length,
            wordCount: totalWords
        };
    },

    _removeReferences(locationId) {
        const state = StateManager.getState();

        // Retirer des scènes
        state.project.acts?.forEach(act => {
            act.chapters?.forEach(chapter => {
                chapter.scenes?.forEach(scene => {
                    if (scene.locations) {
                        scene.locations = ArrayUtils.removeId(scene.locations, locationId);
                    }
                });
            });
        });
    }
};

window.LocationService = LocationService;

/**
 * Relations Graph Handlers
 * Responsible for event handling and relation management
 */

const RelationsGraphHandlers = (() => {
    let currentDetailId = null;
    let currentDetailType = null;
    let autosaveDebounce = null;

    function attachListHandlers() {
        const container = document.querySelector('.relations-container');
        if (!container) return;

        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('entity-edit-btn')) {
                const card = e.target.closest('.entity-card');
                const entityId = card.dataset.entityId;
                const view = card.closest('.relations-view');
                const viewId = view.id;

                let type = 'character';
                if (viewId.includes('location')) type = 'location';
                else if (viewId.includes('all')) {
                    // Determine type by checking which list it's in
                    type = card.closest('.entities-list').textContent.includes('Personnages') ? 'character' : 'location';
                }

                openEntityDetail(entityId, type);
            }
        });
    }

    function openEntityDetail(entityId, type) {
        const project = StateManager.getState().project;
        let entity;

        if (type === 'character') {
            entity = project.characters?.find(c => c.id === entityId);
        } else {
            entity = project.locations?.find(l => l.id === entityId);
        }

        if (!entity) return;

        currentDetailId = entityId;
        currentDetailType = type;

        const html = RelationsRender.renderRelationDetail(entity, type);
        ModalUI.open(`Éditer ${type === 'character' ? 'personnage' : 'lieu'}`, html, () => {
            attachEntityDetailHandlers(entityId, type);
        });
    }

    function attachEntityDetailHandlers(entityId, type) {
        const form = document.querySelector('.detail-view');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => saveEntityDetail(entityId, type));
            input.addEventListener('input', () => {
                clearTimeout(autosaveDebounce);
                autosaveDebounce = setTimeout(() => saveEntityDetail(entityId, type), 1000);
            });
        });
    }

    function saveEntityDetail(entityId, type) {
        const project = StateManager.getState().project;
        let entity, collection;

        if (type === 'character') {
            entity = project.characters?.find(c => c.id === entityId);
            collection = project.characters;
        } else {
            entity = project.locations?.find(l => l.id === entityId);
            collection = project.locations;
        }

        if (!entity) return;

        const nameInput = document.getElementById('entity-name');
        const roleInput = document.getElementById('entity-role');
        const connectionsInput = document.getElementById('entity-connections');
        const descriptionInput = document.getElementById('entity-description');

        if (nameInput) entity.name = nameInput.value.trim();
        if (roleInput) {
            if (type === 'character') {
                entity.role = roleInput.value.trim();
            } else {
                entity.type = roleInput.value.trim();
            }
        }
        if (connectionsInput) {
            entity.connections = connectionsInput.value.split(',').map(id => id.trim()).filter(id => id);
        }
        if (descriptionInput) entity.description = descriptionInput.value.trim();

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit(`${type === 'character' ? 'characters' : 'locations'}:updated`, entity);
    }

    function getCharacterConnections(characterId) {
        const project = StateManager.getState().project;
        const character = project.characters?.find(c => c.id === characterId);
        if (!character || !character.connections) return [];

        return character.connections.map(connId => {
            return project.characters?.find(c => c.id === connId);
        }).filter(c => c);
    }

    function getLocationConnections(locationId) {
        const project = StateManager.getState().project;
        const location = project.locations?.find(l => l.id === locationId);
        if (!location || !location.connections) return [];

        return location.connections.map(connId => {
            return project.locations?.find(l => l.id === connId);
        }).filter(l => l);
    }

    function getAllCharacters() {
        const project = StateManager.getState().project;
        return project.characters || [];
    }

    function getAllLocations() {
        const project = StateManager.getState().project;
        return project.locations || [];
    }

    function getRelationshipStats() {
        const characters = getAllCharacters();
        const locations = getAllLocations();

        const charWithConnections = characters.filter(c => c.connections && c.connections.length > 0).length;
        const locWithConnections = locations.filter(l => l.connections && l.connections.length > 0).length;

        const totalConnections = characters.reduce((sum, c) => sum + (c.connections?.length || 0), 0) +
                               locations.reduce((sum, l) => sum + (l.connections?.length || 0), 0);

        return {
            totalCharacters: characters.length,
            totalLocations: locations.length,
            charWithConnections,
            locWithConnections,
            totalConnections
        };
    }

    return {
        attachListHandlers,
        openEntityDetail,
        getCharacterConnections,
        getLocationConnections,
        getAllCharacters,
        getAllLocations,
        getRelationshipStats
    };
})();

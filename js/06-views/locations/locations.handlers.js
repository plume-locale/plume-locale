/**
 * Locations Handlers
 * Responsible for handling all user interactions in the locations view
 */

const LocationsHandlers = (() => {
    /**
     * Attach event listeners to the locations list
     */
    function attachListHandlers() {
        const container = document.getElementById('locationsList');
        if (!container) return;

        // Group header toggle
        container.addEventListener('click', (e) => {
            const groupHeader = e.target.closest('.treeview-header');
            if (groupHeader) {
                const groupKey = groupHeader.dataset.groupKey;
                toggleLocationGroup(groupKey);
                return;
            }

            // Location item click
            const item = e.target.closest('.treeview-item');
            if (item) {
                const locationId = parseInt(item.dataset.locationId);
                openLocationDetail(locationId);
                return;
            }

            // Delete button
            const deleteBtn = e.target.closest('.treeview-item-delete');
            if (deleteBtn) {
                const item = deleteBtn.closest('.treeview-item');
                const locationId = parseInt(item.dataset.locationId);
                deleteLocation(locationId);
                return;
            }
        });

        // Refresh lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Toggle location group expansion
     * @param {string} groupKey - Group key
     */
    function toggleLocationGroup(groupKey) {
        const collapsedState = JSON.parse(localStorage.getItem('plume_treeview_collapsed') || '{}');
        collapsedState[groupKey] = !collapsedState[groupKey];
        localStorage.setItem('plume_treeview_collapsed', JSON.stringify(collapsedState));
        LocationsView.render();
    }

    /**
     * Open add location modal
     */
    function openAddLocationModal() {
        const html = LocationsRender.renderAddLocationModal();
        ModalUI.open('add-location-modal', html);
        attachAddLocationHandlers();
    }

    /**
     * Attach handlers to add location form
     */
    function attachAddLocationHandlers() {
        const form = document.getElementById('add-location-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleAddLocation();
        });
    }

    /**
     * Handle adding a new location
     */
    async function handleAddLocation() {
        const name = document.getElementById('location-name-input')?.value.trim();
        const type = document.getElementById('location-type-input')?.value;
        const description = document.getElementById('location-desc-input')?.value.trim();

        if (!name || !type) {
            alert('Le nom et le type sont requis');
            return;
        }

        try {
            const state = StateManager.get('project');

            const newLocation = {
                id: Date.now(),
                name: name,
                type: type,
                description: description || '',
                details: '',
                history: '',
                notes: '',
                linkedScenes: [],
                linkedElements: []
            };

            if (!state.locations) {
                state.locations = [];
            }

            state.locations.push(newLocation);
            StateManager.set('project', state);

            // Persist
            if (typeof StorageService !== 'undefined') {
                await StorageService.saveProject(state);
            } else if (typeof saveProject === 'function') {
                saveProject();
            }

            ModalUI.close();
            LocationsView.render();

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('location:created', newLocation);
            }
        } catch (error) {
            console.error('Error adding location:', error);
            alert('Erreur lors de la création du lieu');
        }
    }

    /**
     * Open location detail view
     * @param {number} locationId - Location ID
     */
    function openLocationDetail(locationId) {
        const state = StateManager.get('project');
        const location = state.locations?.find(l => l.id === locationId);

        if (!location) return;

        const html = LocationsRender.renderLocationDetail(location);
        const container = document.getElementById('editorView');
        if (container) {
            container.innerHTML = html;
            attachLocationDetailHandlers(locationId);

            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    /**
     * Attach handlers to location detail view
     * @param {number} locationId - Location ID
     */
    function attachLocationDetailHandlers(locationId) {
        const nameInput = document.getElementById('location-name');
        const typeSelect = document.getElementById('location-type');
        const descInput = document.getElementById('location-description');
        const detailsInput = document.getElementById('location-details');
        const historyInput = document.getElementById('location-history');
        const notesInput = document.getElementById('location-notes');

        // Auto-save on change
        if (nameInput) nameInput.addEventListener('change', async () => {
            await updateLocationField(locationId, 'name', nameInput.value);
        });

        if (typeSelect) typeSelect.addEventListener('change', async () => {
            await updateLocationField(locationId, 'type', typeSelect.value);
        });

        if (descInput) descInput.addEventListener('change', async () => {
            await updateLocationField(locationId, 'description', descInput.value);
        });

        if (detailsInput) detailsInput.addEventListener('change', async () => {
            await updateLocationField(locationId, 'details', detailsInput.value);
        });

        if (historyInput) historyInput.addEventListener('change', async () => {
            await updateLocationField(locationId, 'history', historyInput.value);
        });

        if (notesInput) notesInput.addEventListener('change', async () => {
            await updateLocationField(locationId, 'notes', notesInput.value);
        });

        // Handle scene link clicks
        const sceneLinks = document.querySelectorAll('.link-badge');
        sceneLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                try {
                    const sceneRef = JSON.parse(link.dataset.sceneLink);
                    if (typeof StructureView !== 'undefined' && typeof StructureView.openDetail === 'function') {
                        StructureView.openDetail(sceneRef.actId, sceneRef.chapterId, sceneRef.sceneId);
                    } else if (typeof openScene === 'function') {
                        openScene(sceneRef.actId, sceneRef.chapterId, sceneRef.sceneId);
                    }
                } catch (error) {
                    console.error('Error opening scene:', error);
                }
            });
        });
    }

    /**
     * Update a location field
     * @param {number} locationId - Location ID
     * @param {string} field - Field name
     * @param {string} value - Field value
     */
    async function updateLocationField(locationId, field, value) {
        try {
            const state = StateManager.get('project');
            const location = state.locations?.find(l => l.id === locationId);

            if (location) {
                location[field] = value;
                StateManager.set('project', state);

                if (typeof StorageService !== 'undefined') {
                    await StorageService.saveProject(state);
                } else if (typeof saveProject === 'function') {
                    saveProject();
                }

                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('location:updated', location);
                }

                // Re-render list to show updated name
                if (field === 'name') {
                    LocationsView.render();
                }
            }
        } catch (error) {
            console.error('Error updating location:', error);
        }
    }

    /**
     * Delete a location
     * @param {number} locationId - Location ID
     */
    async function deleteLocation(locationId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce lieu ?')) {
            return;
        }

        try {
            const state = StateManager.get('project');
            if (state.locations) {
                state.locations = state.locations.filter(l => l.id !== locationId);
                StateManager.set('project', state);

                if (typeof StorageService !== 'undefined') {
                    await StorageService.saveProject(state);
                } else if (typeof saveProject === 'function') {
                    saveProject();
                }

                LocationsView.render();

                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('location:deleted', locationId);
                }
            }
        } catch (error) {
            console.error('Error deleting location:', error);
            alert('Erreur lors de la suppression');
        }
    }

    /**
     * Link a location to a scene
     * @param {number} locationId - Location ID
     * @param {number} actId - Act ID
     * @param {number} chapterId - Chapter ID
     * @param {number} sceneId - Scene ID
     */
    async function linkLocationToScene(locationId, actId, chapterId, sceneId) {
        try {
            const state = StateManager.get('project');
            const location = state.locations?.find(l => l.id === locationId);

            if (location) {
                // Check if already linked
                const alreadyLinked = location.linkedScenes.some(s =>
                    s.sceneId === sceneId && s.actId === actId && s.chapterId === chapterId
                );

                if (!alreadyLinked) {
                    const scene = state.acts
                        .find(a => a.id === actId)?.chapters
                        .find(c => c.id === chapterId)?.scenes
                        .find(s => s.id === sceneId);

                    if (scene) {
                        location.linkedScenes.push({
                            sceneId: sceneId,
                            actId: actId,
                            chapterId: chapterId,
                            sceneTitle: scene.title
                        });

                        StateManager.set('project', state);

                        if (typeof StorageService !== 'undefined') {
                            await StorageService.saveProject(state);
                        } else if (typeof saveProject === 'function') {
                            saveProject();
                        }

                        if (typeof EventBus !== 'undefined') {
                            EventBus.emit('location:scene:linked', { locationId, sceneId });
                        }

                        openLocationDetail(locationId);
                    }
                }
            }
        } catch (error) {
            console.error('Error linking location to scene:', error);
        }
    }

    /**
     * Unlink a location from a scene
     * @param {number} locationId - Location ID
     * @param {number} sceneId - Scene ID
     */
    async function unlinkLocationFromScene(locationId, sceneId) {
        try {
            const state = StateManager.get('project');
            const location = state.locations?.find(l => l.id === locationId);

            if (location) {
                location.linkedScenes = location.linkedScenes.filter(s => s.sceneId !== sceneId);
                StateManager.set('project', state);

                if (typeof StorageService !== 'undefined') {
                    await StorageService.saveProject(state);
                } else if (typeof saveProject === 'function') {
                    saveProject();
                }

                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('location:scene:unlinked', { locationId, sceneId });
                }

                openLocationDetail(locationId);
            }
        } catch (error) {
            console.error('Error unlinking location from scene:', error);
        }
    }

    /**
     * Filter locations by type
     * @param {string} type - Location type to filter
     * @returns {Array} Filtered locations
     */
    function filterLocationsByType(type) {
        const state = StateManager.get('project');
        if (!state.locations) return [];

        if (!type) return state.locations;
        return state.locations.filter(l => l.type === type);
    }

    /**
     * Search locations by name or description
     * @param {string} query - Search query
     * @returns {Array} Matching locations
     */
    function searchLocations(query) {
        const state = StateManager.get('project');
        if (!state.locations) return [];

        const lowerQuery = query.toLowerCase();
        return state.locations.filter(l =>
            l.name.toLowerCase().includes(lowerQuery) ||
            (l.description && l.description.toLowerCase().includes(lowerQuery)) ||
            (l.details && l.details.toLowerCase().includes(lowerQuery))
        );
    }

    // Public API
    return {
        attachListHandlers,
        toggleLocationGroup,
        openAddLocationModal,
        attachAddLocationHandlers,
        handleAddLocation,
        openLocationDetail,
        attachLocationDetailHandlers,
        updateLocationField,
        deleteLocation,
        linkLocationToScene,
        unlinkLocationFromScene,
        filterLocationsByType,
        searchLocations
    };
})();

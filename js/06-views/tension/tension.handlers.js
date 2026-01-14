/**
 * Tension Handlers
 * Responsible for event handling and state updates for tension tracking
 */

const TensionHandlers = (() => {
    let currentDetailId = null;
    let autosaveDebounce = null;

    function attachListHandlers() {
        const listContainer = document.querySelector('.tension-list');
        if (!listContainer) return;

        // Slider changes for quick tension updates
        listContainer.addEventListener('input', (e) => {
            if (e.target.classList.contains('tension-slider')) {
                const sceneId = e.target.dataset.sceneId;
                const newTension = parseInt(e.target.value);
                updateSceneTension(sceneId, newTension);
            }
        });

        // Edit button clicks
        listContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('tension-item-edit')) {
                const sceneId = e.target.closest('.tension-item').dataset.sceneId;
                openTensionDetail(sceneId);
            }
        });

        // Chart bar clicks for detail view
        const chartContainer = document.querySelector('.tension-bars');
        if (chartContainer) {
            chartContainer.addEventListener('click', (e) => {
                const barContainer = e.target.closest('.tension-bar-container');
                if (barContainer) {
                    const sceneId = barContainer.dataset.sceneId;
                    openTensionDetail(sceneId);
                }
            });
        }
    }

    function openTensionDetail(sceneId) {
        const project = StateManager.getState().project;
        const scene = getAllScenes().find(s => s.id === sceneId);

        if (!scene) return;

        currentDetailId = sceneId;
        const html = TensionRender.renderTensionDetail(scene);
        ModalUI.open('Détails de la tension', html, () => {
            attachTensionDetailHandlers(sceneId);
        });
    }

    function attachTensionDetailHandlers(sceneId) {
        const form = document.querySelector('.detail-view');
        if (!form) return;

        const tensionSlider = document.getElementById('scene-tension');
        if (tensionSlider) {
            tensionSlider.addEventListener('input', (e) => {
                const display = document.getElementById('tension-value-display');
                if (display) {
                    display.textContent = e.target.value;
                }
                clearTimeout(autosaveDebounce);
                autosaveDebounce = setTimeout(() => saveTensionDetail(sceneId), 500);
            });
        }

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => saveTensionDetail(sceneId));
            input.addEventListener('input', () => {
                clearTimeout(autosaveDebounce);
                autosaveDebounce = setTimeout(() => saveTensionDetail(sceneId), 1000);
            });
        });
    }

    function saveTensionDetail(sceneId) {
        const project = StateManager.getState().project;
        const allScenes = getAllScenes();
        const scene = allScenes.find(s => s.id === sceneId);

        if (!scene) return;

        const titleInput = document.getElementById('scene-title');
        const tensionInput = document.getElementById('scene-tension');
        const eventTypeSelect = document.getElementById('scene-event-type');
        const elementsInput = document.getElementById('scene-tension-elements');
        const notesInput = document.getElementById('scene-notes');

        if (titleInput) scene.title = titleInput.value.trim();
        if (tensionInput) scene.tension = parseInt(tensionInput.value);
        if (eventTypeSelect) scene.eventType = eventTypeSelect.value;
        if (elementsInput) scene.tensionElements = elementsInput.value.trim();
        if (notesInput) scene.notes = notesInput.value.trim();

        // Find and update the scene in its location (acts -> chapters -> scenes)
        updateSceneInStructure(project, sceneId, scene);

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('tension:updated', scene);
    }

    function updateSceneTension(sceneId, tension) {
        const project = StateManager.getState().project;
        const scene = getAllScenes().find(s => s.id === sceneId);

        if (!scene) return;

        scene.tension = Math.max(0, Math.min(10, tension));
        updateSceneInStructure(project, sceneId, scene);

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('tension:updated', scene);
    }

    function updateSceneInStructure(project, sceneId, updatedScene) {
        if (!project.structure || !project.structure.acts) return;

        project.structure.acts.forEach(act => {
            if (act.chapters) {
                act.chapters.forEach(chapter => {
                    if (chapter.scenes) {
                        const sceneIndex = chapter.scenes.findIndex(s => s.id === sceneId);
                        if (sceneIndex !== -1) {
                            chapter.scenes[sceneIndex] = { ...chapter.scenes[sceneIndex], ...updatedScene };
                        }
                    }
                });
            }
        });
    }

    function getAllScenes() {
        const project = StateManager.getState().project;
        const scenes = [];

        if (project.structure && project.structure.acts) {
            project.structure.acts.forEach(act => {
                if (act.chapters) {
                    act.chapters.forEach(chapter => {
                        if (chapter.scenes) {
                            scenes.push(...chapter.scenes);
                        }
                    });
                }
            });
        }

        return scenes;
    }

    function filterByEventType(eventType) {
        return getAllScenes().filter(s => s.eventType === eventType);
    }

    function filterByTensionRange(min, max) {
        return getAllScenes().filter(s => {
            const tension = s.tension || 0;
            return tension >= min && tension <= max;
        });
    }

    function getAverageTension() {
        const scenes = getAllScenes();
        if (scenes.length === 0) return 0;
        const sum = scenes.reduce((acc, s) => acc + (s.tension || 0), 0);
        return (sum / scenes.length).toFixed(1);
    }

    function getTensionStats() {
        const scenes = getAllScenes();
        if (scenes.length === 0) return { min: 0, max: 0, avg: 0, critical: 0 };

        const tensions = scenes.map(s => s.tension || 0);
        return {
            min: Math.min(...tensions),
            max: Math.max(...tensions),
            avg: (tensions.reduce((a, b) => a + b, 0) / tensions.length).toFixed(1),
            critical: scenes.filter(s => (s.tension || 0) >= 8).length
        };
    }

    return {
        attachListHandlers,
        openTensionDetail,
        updateSceneTension,
        filterByEventType,
        filterByTensionRange,
        getAverageTension,
        getTensionStats,
        getAllScenes
    };
})();

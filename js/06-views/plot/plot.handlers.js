/**
 * Plot Handlers
 * Responsible for event handling and CRUD operations on plot structures
 */

const PlotHandlers = (() => {
    let currentDetailId = null;
    let autosaveDebounce = null;

    function attachListHandlers() {
        const container = document.querySelector('.plot-structure');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const plotItem = e.target.closest('.plot-item');
            if (!plotItem) return;

            const plotId = plotItem.dataset.plotId;

            if (e.target.classList.contains('plot-edit-btn')) {
                openPlotDetail(plotId);
            } else if (e.target.classList.contains('plot-delete-btn')) {
                deletePlot(plotId);
            }
        });
    }

    function openAddPlotModal() {
        const html = PlotRender.renderAddPlotModal();
        ModalUI.open('Nouvelle ligne d\'intrigue', html, () => {
            const form = document.getElementById('add-plot-form');
            if (form) {
                form.addEventListener('submit', handleAddPlot);
            }
        });
    }

    function handleAddPlot(e) {
        e.preventDefault();

        const title = document.getElementById('plot-title-input').value.trim();
        const type = document.getElementById('plot-type-input').value;
        const importance = document.getElementById('plot-importance-input').value;

        if (!title) return;

        const newPlot = {
            id: `plot-${Date.now()}`,
            title,
            type: type || 'secondary',
            importance: importance || 'medium',
            status: 'planning',
            exposition: '',
            incitingIncident: '',
            climax: '',
            resolution: '',
            characters: [],
            createdAt: new Date().toISOString()
        };

        const project = StateManager.getState().project;
        if (!project.plots) {
            project.plots = [];
        }

        project.plots.push(newPlot);
        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('plot:created', newPlot);

        ModalUI.close();
        PlotView.render();
    }

    function openPlotDetail(plotId) {
        const project = StateManager.getState().project;
        const plot = project.plots?.find(p => p.id === plotId);

        if (!plot) return;

        currentDetailId = plotId;
        const html = PlotRender.renderPlotDetail(plot);
        ModalUI.open('Détails de l\'intrigue', html, () => {
            attachPlotDetailHandlers(plotId);
        });
    }

    function attachPlotDetailHandlers(plotId) {
        const form = document.querySelector('.detail-view');
        if (!form) return;

        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('change', () => savePlotDetail(plotId));
            input.addEventListener('input', () => {
                clearTimeout(autosaveDebounce);
                autosaveDebounce = setTimeout(() => savePlotDetail(plotId), 1000);
            });
        });
    }

    function savePlotDetail(plotId) {
        const project = StateManager.getState().project;
        const plot = project.plots?.find(p => p.id === plotId);

        if (!plot) return;

        const titleInput = document.getElementById('plot-title');
        const typeSelect = document.getElementById('plot-type');
        const importanceSelect = document.getElementById('plot-importance');
        const statusSelect = document.getElementById('plot-status');
        const expositionInput = document.getElementById('plot-exposition');
        const incitingInput = document.getElementById('plot-inciting');
        const climaxInput = document.getElementById('plot-climax');
        const resolutionInput = document.getElementById('plot-resolution');
        const charactersInput = document.getElementById('plot-characters');

        if (titleInput) plot.title = titleInput.value.trim();
        if (typeSelect) plot.type = typeSelect.value;
        if (importanceSelect) plot.importance = importanceSelect.value;
        if (statusSelect) plot.status = statusSelect.value;
        if (expositionInput) plot.exposition = expositionInput.value.trim();
        if (incitingInput) plot.incitingIncident = incitingInput.value.trim();
        if (climaxInput) plot.climax = climaxInput.value.trim();
        if (resolutionInput) plot.resolution = resolutionInput.value.trim();
        if (charactersInput) {
            plot.characters = charactersInput.value.split(',').map(c => c.trim()).filter(c => c);
        }

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('plot:updated', plot);
    }

    function deletePlot(plotId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette ligne d\'intrigue ?')) return;

        const project = StateManager.getState().project;
        project.plots = project.plots?.filter(p => p.id !== plotId) || [];

        StateManager.setState({ project });
        StorageService.saveProject(project);
        EventBus.emit('plot:deleted', plotId);
        PlotView.render();

        if (currentDetailId === plotId) {
            ModalUI.close();
        }
    }

    function filterByType(type) {
        const project = StateManager.getState().project;
        const plots = project.plots || [];
        return plots.filter(p => p.type === type);
    }

    function filterByImportance(importance) {
        const project = StateManager.getState().project;
        const plots = project.plots || [];
        return plots.filter(p => p.importance === importance);
    }

    function filterByStatus(status) {
        const project = StateManager.getState().project;
        const plots = project.plots || [];
        return plots.filter(p => p.status === status);
    }

    function getPlotStats() {
        const project = StateManager.getState().project;
        const plots = project.plots || [];

        return {
            total: plots.length,
            main: plots.filter(p => p.type === 'main').length,
            secondary: plots.filter(p => p.type === 'secondary').length,
            complete: plots.filter(p => p.status === 'complete').length,
            avgProgress: plots.length > 0
                ? Math.round(plots.reduce((sum, p) => sum + PlotRender.calculatePlotProgress(p), 0) / plots.length)
                : 0
        };
    }

    return {
        attachListHandlers,
        openAddPlotModal,
        openPlotDetail,
        deletePlot,
        filterByType,
        filterByImportance,
        filterByStatus,
        getPlotStats
    };
})();

// Stats Advanced - Rendu des statistiques détaillées
window.renderStats = function() {
    const container = document.getElementById('editorView');
    if (!container) return;
    
    const state = StateManager.getState();
    const project = state.project;
    const stats = StatsService ? StatsService.calculateStats(project) : {};
    
    const totalWords = stats.totalWords || 0;
    const dailyGoal = project.stats?.dailyGoal || 500;
    const totalGoal = project.stats?.totalGoal || 80000;
    
    container.innerHTML = '<div style="padding: 2rem;"><h2>Statistiques</h2><p>Total: ' + totalWords.toLocaleString('fr-FR') + ' mots / ' + totalGoal.toLocaleString('fr-FR') + '</p></div>';
};

window.updateGoal = function(type, value) {
    const numValue = parseInt(value);
    if (numValue && numValue > 0) {
        const state = StateManager.getState();
        const project = state.project;
        if (!project.stats) project.stats = {};
        project.stats[type] = numValue;
        StateManager.setState({ project });
        if (window.StorageService) StorageService.saveProject(project);
        renderStats();
    }
};

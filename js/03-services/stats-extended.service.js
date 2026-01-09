// Stats Extended Service - Wrapper pour 07.stats.js (à garder temporairement)
// La majorité des fonctionnalités sont déjà dans stats.service.js et stats-advanced.service.js
// Ce fichier sert de pont de compatibilité

const StatsExtendedService = (() => {
    function trackWritingSession() {
        const state = StateManager.getState();
        const project = state.project;
        if (!project.stats) project.stats = { dailyGoal: 500, totalGoal: 80000, writingSessions: [] };
        
        const today = new Date().toDateString();
        const stats = StatsService.calculateStats(project);
        const totalWords = stats.totalWords;

        const sessionIndex = project.stats.writingSessions.findIndex(s => new Date(s.date).toDateString() === today);
        
        if (sessionIndex >= 0) {
            const session = project.stats.writingSessions[sessionIndex];
            session.words = totalWords - (session.startWords || 0);
        } else {
            project.stats.writingSessions.push({
                date: new Date().toISOString(),
                words: 0,
                startWords: totalWords
            });
        }
        
        StateManager.setState({ project });
        if (window.StorageService) StorageService.saveProject(project);
    }

    return { trackWritingSession };
})();

window.StatsExtendedService = StatsExtendedService;
window.trackWritingSession = () => StatsExtendedService.trackWritingSession();

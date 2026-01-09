// Scene Versions Service - Gestion des versions de scènes
const SceneVersionsService = (() => {
    function saveVersion(actId, chapterId, sceneId, label) {
        const state = StateManager.getState();
        const project = state.project;
        
        const act = project.acts?.find(a => a.id === actId);
        if (!act) return null;
        
        const chapter = act.chapters?.find(c => c.id === chapterId);
        if (!chapter) return null;
        
        const scene = chapter.scenes?.find(s => s.id === sceneId);
        if (!scene) return null;
        
        if (!scene.versions) scene.versions = [];
        
        const version = {
            id: Date.now(),
            label: label || 'Version ' + new Date().toLocaleString('fr-FR'),
            timestamp: new Date().toISOString(),
            content: scene.content,
            wordCount: window.getWordCount ? getWordCount(scene.content) : 0
        };
        
        scene.versions.push(version);
        StateManager.setState({ project });
        
        if (window.StorageService) StorageService.saveProject(project);
        if (window.ToastUI) ToastUI.success('Version sauvegardée');
        
        return version;
    }

    function restoreVersion(actId, chapterId, sceneId, versionId) {
        const state = StateManager.getState();
        const project = state.project;
        
        const act = project.acts?.find(a => a.id === actId);
        if (!act) return false;
        
        const chapter = act.chapters?.find(c => c.id === chapterId);
        if (!chapter) return false;
        
        const scene = chapter.scenes?.find(s => s.id === sceneId);
        if (!scene || !scene.versions) return false;
        
        const version = scene.versions.find(v => v.id === versionId);
        if (!version) return false;
        
        // Sauvegarder version actuelle avant restauration
        saveVersion(actId, chapterId, sceneId, 'Backup auto avant restauration');
        
        scene.content = version.content;
        StateManager.setState({ project });
        
        if (window.StorageService) StorageService.saveProject(project);
        if (window.ToastUI) ToastUI.success('Version restaurée');
        
        return true;
    }

    return { saveVersion, restoreVersion };
})();

window.SceneVersionsService = SceneVersionsService;
window.saveSceneVersion = (actId, chapterId, sceneId) => {
    const label = prompt('Nom de cette version :');
    if (label) SceneVersionsService.saveVersion(actId, chapterId, sceneId, label);
};

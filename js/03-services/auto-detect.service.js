// Auto Detect Service - Détection automatique de personnages/lieux dans le texte
const AutoDetectService = (() => {
    function detectMentions(text) {
        if (!text) return { characters: [], locations: [] };
        
        const state = StateManager.getState();
        const project = state.project;
        const detected = { characters: [], locations: [] };
        
        // Détecter les personnages
        project.characters?.forEach(char => {
            if (text.includes(char.name)) {
                detected.characters.push(char.id);
            }
        });
        
        // Détecter les lieux
        project.world?.forEach(loc => {
            if (loc.type === 'lieu' && text.includes(loc.name)) {
                detected.locations.push(loc.id);
            }
        });
        
        return detected;
    }

    function autoLinkScene(sceneId) {
        const state = StateManager.getState();
        const project = state.project;
        
        // Trouver la scène
        let scene = null;
        for (const act of project.acts || []) {
            for (const chapter of act.chapters || []) {
                scene = chapter.scenes?.find(s => s.id === sceneId);
                if (scene) break;
            }
            if (scene) break;
        }
        
        if (!scene) return;
        
        const detected = detectMentions(scene.content);
        scene.linkedCharacters = detected.characters;
        scene.linkedLocations = detected.locations;
        
        StateManager.setState({ project });
        if (window.StorageService) StorageService.saveProject(project);
    }

    return { detectMentions, autoLinkScene };
})();

window.AutoDetectService = AutoDetectService;

// ============================================
// SCENE SERVICE - Service métier Scènes
// ============================================

/**
 * SceneService - Logique métier pour les scènes
 */

const SceneService = {

    create(sceneData, chapterId) {
        const scene = new Scene(sceneData);
        scene.validate();

        const state = StateManager.getState();
        const chapter = this._findChapter(chapterId);

        if (!chapter) {
            throw new Error('Chapitre introuvable');
        }

        if (!chapter.scenes) {
            chapter.scenes = [];
        }

        chapter.scenes.push(scene.toJSON());
        state.project.touch();

        EventBus.emit('scene:created', scene);
        StorageService.saveProject(state.project);

        return scene;
    },

    update(sceneId, updates) {
        const sceneData = this._findSceneData(sceneId);
        if (!sceneData) {
            throw new Error('Scène introuvable');
        }

        Object.assign(sceneData, updates);
        sceneData.updatedAt = Date.now();

        const scene = new Scene(sceneData);
        scene.validate();

        const state = StateManager.getState();
        state.project.touch();

        EventBus.emit('scene:updated', scene);
        StorageService.saveProject(state.project);

        return scene;
    },

    delete(sceneId) {
        const state = StateManager.getState();

        for (const act of state.project.acts) {
            for (const chapter of act.chapters || []) {
                const index = chapter.scenes?.findIndex(s => s.id === sceneId);
                if (index !== undefined && index !== -1) {
                    chapter.scenes.splice(index, 1);
                    state.project.touch();

                    EventBus.emit('scene:deleted', sceneId);
                    StorageService.saveProject(state.project);

                    return true;
                }
            }
        }

        return false;
    },

    findById(sceneId) {
        const sceneData = this._findSceneData(sceneId);
        return sceneData ? new Scene(sceneData) : null;
    },

    findAll() {
        const state = StateManager.getState();
        const scenes = [];

        state.project?.acts?.forEach(act => {
            act.chapters?.forEach(chapter => {
                chapter.scenes?.forEach(sceneData => {
                    scenes.push(new Scene(sceneData));
                });
            });
        });

        return scenes;
    },

    search(query) {
        return this.findAll().filter(scene =>
            TextUtils.contains(scene.title, query) ||
            TextUtils.contains(scene.content, query)
        );
    },

    getStats(sceneId) {
        const scene = this.findById(sceneId);
        if (!scene) return null;

        return scene.getStats();
    },

    _findSceneData(sceneId) {
        const state = StateManager.getState();

        for (const act of state.project?.acts || []) {
            for (const chapter of act.chapters || []) {
                for (const scene of chapter.scenes || []) {
                    if (scene.id === sceneId) {
                        return scene;
                    }
                }
            }
        }

        return null;
    },

    _findChapter(chapterId) {
        const state = StateManager.getState();

        for (const act of state.project?.acts || []) {
            for (const chapter of act.chapters || []) {
                if (chapter.id === chapterId) {
                    return chapter;
                }
            }
        }

        return null;
    }
};

window.SceneService = SceneService;

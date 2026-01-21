// [MVVM : Repository]
// Gestionnaire d'accès aux données pour la structure du projet

/**
 * ActRepository
 * Encapsule toutes les opérations sur les Actes
 */
const ActRepository = {
    getAll: () => {
        return project.acts || [];
    },

    getById: (id) => {
        const act = project.acts.find(a => a.id === id);
        return act || null;
    },

    add: (act) => {
        project.acts.push(act);
        return act;
    },

    update: (id, updates) => {
        const actIndex = project.acts.findIndex(a => a.id === id);
        if (actIndex === -1) return null;

        const act = project.acts[actIndex];
        const updatedAct = { ...act, ...updates, updatedAt: new Date().toISOString() };
        project.acts[actIndex] = updatedAct;
        return updatedAct;
    },

    remove: (id) => {
        const actIndex = project.acts.findIndex(a => a.id === id);
        if (actIndex === -1) return null;

        const removed = project.acts[actIndex];
        project.acts = project.acts.filter(a => a.id !== id);
        return removed;
    },

    // UI State Persistence
    saveTreeState: async () => {
        if (typeof saveSetting !== 'function') return;
        try {
            await saveSetting('expanded_acts', [...expandedActs]);
            await saveSetting('expanded_chapters', [...expandedChapters]);
        } catch (error) {
            console.error('❌ Erreur sauvegarde TreeState:', error);
        }
    },

    loadTreeState: async () => {
        if (typeof loadSetting !== 'function') return;
        try {
            const savedActs = await loadSetting('expanded_acts');
            const savedChapters = await loadSetting('expanded_chapters');
            if (savedActs) expandedActs = new Set(savedActs);
            if (savedChapters) expandedChapters = new Set(savedChapters);
        } catch (e) {
            console.error('Erreur chargement état arborescence:', e);
        }
    }
};

/**
 * ChapterRepository
 * Encapsule toutes les opérations sur les Chapitres
 */
const ChapterRepository = {
    getAll: (actId) => {
        const act = ActRepository.getById(actId);
        return act ? act.chapters : [];
    },

    getById: (actId, chapterId) => {
        const act = ActRepository.getById(actId);
        if (!act) return null;
        return act.chapters.find(c => c.id === chapterId) || null;
    },

    add: (actId, chapter) => {
        const act = ActRepository.getById(actId);
        if (!act) return null;
        act.chapters.push(chapter);
        act.updatedAt = new Date().toISOString();
        return chapter;
    },

    update: (actId, chapterId, updates) => {
        const act = ActRepository.getById(actId);
        if (!act) return null;

        const chapterIndex = act.chapters.findIndex(c => c.id === chapterId);
        if (chapterIndex === -1) return null;

        const chapter = act.chapters[chapterIndex];
        const updatedChapter = { ...chapter, ...updates, updatedAt: new Date().toISOString() };
        act.chapters[chapterIndex] = updatedChapter;
        act.updatedAt = new Date().toISOString();
        return updatedChapter;
    },

    remove: (actId, chapterId) => {
        const act = ActRepository.getById(actId);
        if (!act) return null;

        const chapterIndex = act.chapters.findIndex(c => c.id === chapterId);
        if (chapterIndex === -1) return null;

        const removed = act.chapters[chapterIndex];
        act.chapters = act.chapters.filter(c => c.id !== chapterId);
        act.updatedAt = new Date().toISOString();
        return removed;
    }
};

/**
 * SceneRepository
 * Encapsule toutes les opérations sur les Scènes
 */
const SceneRepository = {
    getAll: (actId, chapterId) => {
        const chapter = ChapterRepository.getById(actId, chapterId);
        return chapter ? chapter.scenes : [];
    },

    getById: (actId, chapterId, sceneId) => {
        const chapter = ChapterRepository.getById(actId, chapterId);
        if (!chapter) return null;
        return chapter.scenes.find(s => s.id === sceneId) || null;
    },

    add: (actId, chapterId, scene) => {
        const chapter = ChapterRepository.getById(actId, chapterId);
        if (!chapter) return null;
        chapter.scenes.push(scene);
        chapter.updatedAt = new Date().toISOString();

        const act = ActRepository.getById(actId);
        if (act) act.updatedAt = new Date().toISOString();

        return scene;
    },

    update: (actId, chapterId, sceneId, updates) => {
        const chapter = ChapterRepository.getById(actId, chapterId);
        if (!chapter) return null;

        const sceneIndex = chapter.scenes.findIndex(s => s.id === sceneId);
        if (sceneIndex === -1) return null;

        const scene = chapter.scenes[sceneIndex];
        const updatedScene = { ...scene, ...updates, updatedAt: new Date().toISOString() };
        chapter.scenes[sceneIndex] = updatedScene;
        chapter.updatedAt = new Date().toISOString();

        const act = ActRepository.getById(actId);
        if (act) act.updatedAt = new Date().toISOString();

        return updatedScene;
    },

    remove: (actId, chapterId, sceneId) => {
        const chapter = ChapterRepository.getById(actId, chapterId);
        if (!chapter) return null;

        const sceneIndex = chapter.scenes.findIndex(s => s.id === sceneId);
        if (sceneIndex === -1) return null;

        const removed = chapter.scenes[sceneIndex];
        chapter.scenes = chapter.scenes.filter(s => s.id !== sceneId);
        chapter.updatedAt = new Date().toISOString();

        const act = ActRepository.getById(actId);
        if (act) act.updatedAt = new Date().toISOString();

        return removed;
    }
};

/**
 * [MVVM : Projects Module]
 * Refactorisé pour séparer le modèle, le viewmodel et la vue.
 */

// --- MODEL & PERSISTENCE ---

/**
 * Charge tous les projets depuis IndexedDB.
 */
async function loadAllProjects() {
    try {
        const loadedProjects = await loadAllProjectsFromDB();

        if (loadedProjects && loadedProjects.length > 0) {
            projects = loadedProjects;
            const savedId = await loadSetting('currentProjectId');

            if (savedId) {
                currentProjectId = savedId;
                project = projects.find(p => p.id === savedId);
            }

            if (!project && projects.length > 0) {
                project = projects[0];
                currentProjectId = project.id;
            }
        } else {
            createDefaultProject();
            await saveProjectToDB(project);
        }

        ensureProjectStructure();

        if (project?.title) {
            const headerTitle = document.getElementById('headerProjectTitle');
            if (headerTitle) headerTitle.textContent = project.title;
        }

        console.log('✅ Projets chargés:', projects.length);
    } catch (error) {
        console.error('❌ Erreur chargement projets:', error);
        createDefaultProject();
    }
}

/**
 * Sauvegarde tous les projets dans IndexedDB.
 */
async function saveAllProjects() {
    try {
        if (currentProjectId) {
            const index = projects.findIndex(p => p.id === currentProjectId);
            if (index >= 0) {
                projects[index] = { ...project, updatedAt: new Date().toISOString() };
            }
        }

        for (const proj of projects) {
            await saveProjectToDB(proj);
        }

        await saveSetting('currentProjectId', currentProjectId);
        console.log('💾 Tous les projets sauvegardés');
    } catch (error) {
        console.error('❌ Erreur sauvegarde projets:', error);
    }
}

/**
 * Crée un projet par défaut si aucun n'existe.
 */
function createDefaultProject() {
    project = {
        id: Date.now(),
        title: "Mon Roman",
        description: "",
        genre: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        acts: [],
        characters: [],
        world: [],
        timeline: [],
        notes: [],
        codex: [],
        stats: { dailyGoal: 500, totalGoal: 80000, writingSessions: [] },
        versions: [],
        relationships: []
    };
    projects = [project];
    currentProjectId = project.id;
}

/**
 * S'assure que la structure du projet est complète.
 */
function ensureProjectStructure() {
    if (!project) return;
    project.characters = project.characters || [];
    project.world = project.world || [];
    project.timeline = project.timeline || [];
    project.notes = project.notes || [];
    project.codex = project.codex || [];
    project.stats = project.stats || { dailyGoal: 500, totalGoal: 80000, writingSessions: [] };
    project.versions = project.versions || [];
    project.relationships = project.relationships || [];
}

// Override du saveProject global
saveProject = function () {
    saveAllProjects();
};

// --- VIEWMODEL (LOGIQUE MÉTIER) ---

/**
 * Crée un nouveau projet.
 */
function createNewProject() {
    const title = document.getElementById('newProjectTitle').value.trim();
    const description = document.getElementById('newProjectDesc').value.trim();
    const genre = document.getElementById('newProjectGenre').value;
    const template = document.getElementById('newProjectTemplate').value;

    if (!title) {
        alert('Veuillez entrer un titre pour le projet');
        return;
    }

    const newProject = {
        id: Date.now(),
        title: title,
        description: description,
        genre: genre,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        acts: [],
        characters: [],
        world: [],
        timeline: [],
        notes: [],
        codex: [],
        stats: { dailyGoal: 500, totalGoal: 80000, writingSessions: [] },
        versions: [],
        relationships: []
    };

    // Templates
    if (template === 'fantasy') {
        newProject.acts = [
            { id: Date.now(), title: "Acte I - Le Monde Ordinaire", chapters: [] },
            { id: Date.now() + 1, title: "Acte II - L'Aventure", chapters: [] },
            { id: Date.now() + 2, title: "Acte III - Le Retour", chapters: [] }
        ];
    } else if (template === 'thriller') {
        newProject.acts = [
            { id: Date.now(), title: "Acte I - L'Incident", chapters: [] },
            { id: Date.now() + 1, title: "Acte II - La Tension", chapters: [] },
            { id: Date.now() + 2, title: "Acte III - Le Dénouement", chapters: [] }
        ];
    }

    projects.push(newProject);
    saveAllProjects();

    // Reset UI
    document.getElementById('newProjectTitle').value = '';
    document.getElementById('newProjectDesc').value = '';

    closeModal('newProjectModal');
    switchToProject(newProject.id);
    closeModal('projectsModal');
}

/**
 * Change le projet actif.
 */
function switchToProject(projectId) {
    currentProjectId = projectId;
    project = projects.find(p => p.id === projectId);

    if (!project) return;

    const headerTitle = document.getElementById('headerProjectTitle');
    if (headerTitle) headerTitle.textContent = project.title;

    currentActId = null;
    currentChapterId = null;
    currentSceneId = null;

    if (typeof switchView === 'function') switchView('editor');
    if (typeof renderActsList === 'function') renderActsList();
    if (typeof refreshAllViews === 'function') refreshAllViews();

    localStorage.setItem('plume_locale_current_project', projectId);
}

/**
 * Supprime un projet.
 */
function deleteProject(projectId) {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    if (!confirm(`Supprimer "${proj.title}" ?\n\nIrréversible !`)) return;

    projects = projects.filter(p => p.id !== projectId);
    saveAllProjects();

    if (currentProjectId === projectId) {
        if (projects.length > 0) {
            switchToProject(projects[0].id);
        } else {
            createDefaultProject();
        }
    }

    renderProjectsList();
}

/**
 * Exporte un projet.
 */
function exportProjectIndividual(projectId) {
    const proj = projects.find(p => p.id === projectId);
    if (!proj) return;

    const dataStr = JSON.stringify(proj, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proj.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Gère l'import d'un projet.
 */
function handleProjectImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const imported = JSON.parse(e.target.result);
            if (!imported.title) throw new Error('Format invalide');

            imported.id = Date.now();
            imported.title += " (Importé)";
            imported.createdAt = new Date().toISOString();
            imported.updatedAt = new Date().toISOString();

            projects.push(imported);
            saveAllProjects();
            renderProjectsList();
            alert(`✅ "${imported.title}" importé !`);
        } catch (error) {
            alert('❌ Erreur: ' + error.message);
        }
        event.target.value = '';
    };
    reader.readAsText(file);
}

// --- VIEW (RENDU DOM) ---

/**
 * Ouvre la modale de création.
 */
function openNewProjectModal() {
    const modal = document.getElementById('newProjectModal');
    if (modal) {
        modal.classList.add('active');
        setTimeout(() => document.getElementById('newProjectTitle')?.focus(), 100);
    }
}

/**
 * Déclenche l'import.
 */
function importProject() {
    document.getElementById('importProjectInput')?.click();
}

/**
 * Affiche la liste des projets.
 */
function renderProjectsList() {
    const container = document.getElementById('projectsList');
    if (!container) return;

    if (projects.length === 0) {
        container.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Aucun projet</div>';
        return;
    }

    container.innerHTML = projects.map(proj => {
        const isActive = proj.id === currentProjectId;

        return `
            <div class="project-card ${isActive ? 'active' : ''}" onclick="switchToProject(${proj.id}); closeModal('projectsModal');">
                <div class="project-card-header">
                    <div>
                        <div class="project-card-title">${proj.title}</div>
                        ${proj.genre ? `<span class="project-card-genre">${proj.genre}</span>` : ''}
                    </div>
                    ${isActive ? '<span style="color: var(--accent-red); font-weight: 600;">● Actif</span>' : ''}
                </div>
                ${proj.description ? `<div class="project-card-desc">${proj.description}</div>` : ''}
                <div class="project-card-actions">
                    <button class="btn btn-small" onclick="event.stopPropagation(); exportProjectIndividual(${proj.id})">📤 Exporter</button>
                    <button class="btn btn-small" onclick="event.stopPropagation(); deleteProject(${proj.id})">🗑️ Supprimer</button>
                </div>
            </div>`;
    }).join('');
}

/**
 * Rendu pour Split View ou conteneur spécifique.
 */
function renderSceneInContainer(actId, chapterId, sceneId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const act = project.acts.find(a => a.id === actId);
    const chapter = act?.chapters.find(c => c.id === chapterId);
    const scene = chapter?.scenes.find(s => s.id === sceneId);

    if (!scene) return;

    const wordCount = typeof getWordCount === 'function' ? getWordCount(scene.content || '') : 0;

    container.innerHTML = `
        <div class="split-scene-view" style="height: 100%; display: flex; flex-direction: column;">
            <div style="padding: 0.75rem 1rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
                <div style="font-size: 0.8rem; color: var(--text-muted);">${act.title} > ${chapter.title}</div>
                <div style="font-size: 1.1rem; font-weight: 600;">${scene.title || 'Sans titre'}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${wordCount} mots</div>
            </div>
            <div class="editor-textarea" 
                 contenteditable="true" 
                 data-container="${containerId}"
                 data-scene-id="${scene.id}"
                 data-chapter-id="${chapter.id}"
                 data-act-id="${act.id}"
                 oninput="updateSplitSceneContent(this)"
                 style="flex: 1; padding: 1.5rem; overflow-y: auto; outline: none; line-height: 1.8; font-size: 1.1rem;"
            >${scene.content || ''}</div>
        </div>`;
}

// --- ANALYSE DE TEXTE ---

/**
 * Rendu de la vue analyse.
 */
function renderAnalysis() {
    const editorView = document.getElementById('editorView');
    if (!editorView) return;

    editorView.innerHTML = `
        <div style="height: 100%; overflow-y: auto; padding: 2rem 3rem;">
            <h2 style="margin-bottom: 2rem; color: var(--accent-gold);">
                <i data-lucide="scan-search" style="width:24px;height:24px;vertical-align:middle;margin-right:8px;"></i>Analyse du texte
            </h2>
            <div style="background: var(--bg-secondary); padding: 2rem; border-radius: 8px; margin-bottom: 2rem;">
                <label style="display: block; font-weight: 600; margin-bottom: 1rem; font-size: 1rem;">Portée de l'analyse :</label>
                <select id="analysisScope" class="form-input" style="width: 100%; max-width: 400px; font-size: 1rem;">
                    <option value="current">Scène actuelle</option>
                    <option value="chapter">Chapitre actuel</option>
                    <option value="act">Acte actuel</option>
                    <option value="all">Tout le projet</option>
                </select>
            </div>
            <div id="analysisResults"></div>
        </div>`;

    setTimeout(() => {
        document.getElementById('analysisScope')?.addEventListener('change', runTextAnalysis);
        runTextAnalysis();
    }, 0);
}

/**
 * Lance l'analyse.
 */
function runTextAnalysis() {
    const scope = document.getElementById('analysisScope')?.value || 'current';
    const text = typeof getTextForAnalysis === 'function' ? getTextForAnalysis(scope) : '';

    if (!text || text.trim().length === 0) {
        document.getElementById('analysisResults').innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">Aucun texte à analyser</div>';
        return;
    }

    const analysis = {
        wordCount: typeof getWordCount === 'function' ? getWordCount(text) : 0,
        repetitions: typeof detectRepetitions === 'function' ? detectRepetitions(text) : [],
        readability: typeof calculateReadability === 'function' ? calculateReadability(text) : { score: 0, level: 'N/A' },
        wordFrequency: typeof calculateWordFrequency === 'function' ? calculateWordFrequency(text) : [],
        sentenceLength: typeof calculateSentenceLength === 'function' ? calculateSentenceLength(text) : { avg: 0, min: 0, max: 0, distribution: [] },
        narrativeDistribution: typeof analyzeNarrativeDistribution === 'function' ? analyzeNarrativeDistribution(text) : { dialogue: 0, narrative: 0, dialogCount: 0 }
    };

    if (typeof displayAnalysisResults === 'function') displayAnalysisResults(analysis);
}

// [MVVM : View]
// Rafraîchit toutes les vues de l'application
function refreshAllViews() {
    // Rafraîchir tous les affichages après un undo/redo
    renderActsList();

    // Restaurer l'état d'expansion immédiatement après le rendu
    setTimeout(() => restoreTreeState(), 100);

    updateStats();

    // Rafraîchir la vue actuelle
    switch (currentView) {
        case 'editor':
            // Render the acts/chapters sidebar
            renderActsList();
            // renderViewContent will handle rendering the editor
            break;
        case 'characters':
            renderCharactersList();
            break;
        case 'world':
            renderWorldList();
            break;
        case 'timeline':
            renderTimelineList();
            break;
        case 'notes':
            renderNotesList();
            break;
        case 'codex':
            renderCodexList();
            break;
        case 'stats':
            renderStats();
            break;
        case 'analysis':
            renderAnalysis();
            break;
        case 'versions':
            renderVersionsList();
            break;
        case 'todos':
            if (typeof renderTodosList === 'function') renderTodosList();
            break;
        case 'corkboard':
            if (typeof renderCorkBoard === 'function') renderCorkBoard();
            break;
        case 'mindmap':
            if (typeof renderMindmapView === 'function') renderMindmapView();
            break;
        case 'plot':
            if (typeof renderPlotView === 'function') renderPlotView();
            break;
        case 'relations':
            if (typeof renderRelationsView === 'function') renderRelationsView();
            break;
        case 'map':
            if (typeof renderMapView === 'function') renderMapView();
            break;
        case 'timelineviz':
            if (typeof renderTimelineVizView === 'function') renderTimelineVizView();
            break;
    }

    // Rafraîchir l'éditeur si une scène est ouverte
    if (currentSceneId) {
        const scene = findScene(currentActId, currentChapterId, currentSceneId);
        if (scene) {
            document.getElementById('sceneTitle').value = scene.title;
            document.getElementById('sceneContent').value = scene.content || '';
            updateWordCount();
        }
    }
}

// Raccourcis clavier pour undo/redo
document.addEventListener('keydown', function (e) {
    // Ctrl+Z ou Cmd+Z pour undo
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        if (typeof EventBus !== 'undefined') EventBus.emit('history:undo');
        else if (typeof undo === 'function') undo();
    }
    // Ctrl+Y ou Cmd+Shift+Z pour redo
    else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        if (typeof EventBus !== 'undefined') EventBus.emit('history:redo');
        else if (typeof redo === 'function') redo();
    }
});

// [MVVM : Model]
// Charge le projet depuis le localStorage et gère la migration de structure
function loadProject() {
    const saved = localStorage.getItem('plume_locale_project');
    if (saved) {
        const loadedProject = JSON.parse(saved);

        // Migration: Convert old structure (chapters array) to new structure (acts array)
        if (loadedProject.chapters && !loadedProject.acts) {
            console.log('Migrating old project structure to acts-based structure...');
            project = {
                title: loadedProject.title || "Mon Roman",
                acts: [
                    {
                        id: Date.now(),
                        title: "Acte I",
                        chapters: loadedProject.chapters || []
                    }
                ],
                characters: loadedProject.characters || [],
                world: loadedProject.world || []
            };
            // Save migrated structure
            saveProject();
            console.log('Migration complete!');
        } else {
            // Ensure all data structures exist
            project = {
                ...loadedProject,
                characters: loadedProject.characters || [],
                world: loadedProject.world || [],
                timeline: loadedProject.timeline || [],
                notes: loadedProject.notes || [],
                codex: loadedProject.codex || [],
                stats: loadedProject.stats || {
                    dailyGoal: 500,
                    totalGoal: 80000,
                    writingSessions: []
                },
                versions: loadedProject.versions || [],
                relationships: loadedProject.relationships || [],
                metroTimeline: loadedProject.metroTimeline || [],
                characterColors: loadedProject.characterColors || {}
            };

            // Ensure all scenes have linked arrays
            project.acts.forEach(act => {
                act.chapters.forEach(chapter => {
                    chapter.scenes.forEach(scene => {
                        if (!scene.linkedCharacters) scene.linkedCharacters = [];
                        if (!scene.linkedElements) scene.linkedElements = [];
                    });
                });
            });

            // Ensure all characters have linked arrays
            project.characters.forEach(char => {
                if (!char.linkedScenes) char.linkedScenes = [];
                if (!char.linkedElements) char.linkedElements = [];
            });

            // Ensure all world elements have linked arrays
            project.world.forEach(elem => {
                if (!elem.linkedScenes) elem.linkedScenes = [];
                if (!elem.linkedElements) elem.linkedElements = [];
            });
        }
    }
}

// Act Management
// [MVVM : Other]
// Gestion des Actes (Mixte View/ViewModel)
function addAct() {
    const title = document.getElementById('actTitleInput').value.trim();
    if (!title) return;

    const act = {
        id: Date.now(),
        title: title,
        chapters: []
    };

    project.acts.push(act);

    // Auto-déplier le nouvel acte
    expandedActs.add(act.id);

    document.getElementById('actTitleInput').value = '';
    closeModal('addActModal');
    saveProject();
    renderActsList();
}

// [MVVM : Other]
// Supprime un acte et ses chapitres (Mixte Model/View)
function deleteAct(actId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet acte et tous ses chapitres ?')) return;

    project.acts = project.acts.filter(a => a.id !== actId);
    if (currentActId === actId) {
        currentActId = null;
        currentChapterId = null;
        currentSceneId = null;
        showEmptyState();
    }
    saveProject();
    renderActsList();
}

// [MVVM : View]
// Alterne l'affichage d'un acte (déplié/replié)
function toggleAct(actId) {
    const element = document.getElementById(`act-${actId}`);
    const icon = element.querySelector('.act-icon');
    const chaptersContainer = element.querySelector('.act-chapters');

    const isExpanded = icon.classList.contains('expanded');

    icon.classList.toggle('expanded');
    chaptersContainer.classList.toggle('visible');

    // Sauvegarder l'état
    if (isExpanded) {
        expandedActs.delete(actId);
    } else {
        expandedActs.add(actId);
    }
    saveTreeState();
}

// [MVVM : View]
// Active l'édition du titre d'un acte dans le DOM
function startEditingAct(actId, element) {
    const act = project.acts.find(a => a.id === actId);
    if (!act) return;

    const originalText = act.title;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'editing-input';
    input.value = originalText;

    element.textContent = '';
    element.appendChild(input);
    input.focus();
    input.select();

    const finishEditing = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== originalText) {
            act.title = newTitle;
            saveProject();
        }
        renderActsList();
    };

    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            finishEditing();
        } else if (e.key === 'Escape') {
            renderActsList();
        }
    });
}

// Chapter Management
// [MVVM : Other]
// Ajoute un nouveau chapitre (Mixte Model/View)
function addChapter() {
    const title = document.getElementById('chapterTitleInput').value.trim();
    if (!title) return;

    // Si pas d'acte, en créer un par défaut
    if (!activeActId || !project.acts.find(a => a.id === activeActId)) {
        if (project.acts.length === 0) {
            const defaultAct = {
                id: Date.now(),
                title: 'Roman',
                chapters: []
            };
            project.acts.push(defaultAct);
            activeActId = defaultAct.id;
            expandedActs.add(defaultAct.id);
        } else {
            activeActId = project.acts[0].id;
        }
    }

    const act = project.acts.find(a => a.id === activeActId);
    if (!act) return;

    const chapter = {
        id: Date.now() + 1, // +1 pour éviter collision avec l'acte créé juste avant
        title: title,
        scenes: []
    };

    act.chapters.push(chapter);

    // Auto-déplier l'acte parent et le nouveau chapitre
    expandedActs.add(act.id);
    expandedChapters.add(chapter.id);

    console.log('addChapter - act.id:', act.id, 'chapter.id:', chapter.id);
    console.log('expandedActs:', [...expandedActs]);
    console.log('expandedChapters:', [...expandedChapters]);

    document.getElementById('chapterTitleInput').value = '';
    closeModal('addChapterModal');
    saveProject();
    renderActsList();
}

// [MVVM : Other]
// Supprime un chapitre et ses scènes (Mixte Model/View)
function deleteChapter(actId, chapterId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chapitre et toutes ses scènes ?')) return;

    const act = project.acts.find(a => a.id === actId);
    if (!act) return;

    act.chapters = act.chapters.filter(c => c.id !== chapterId);
    if (currentChapterId === chapterId) {
        currentChapterId = null;
        currentSceneId = null;
        showEmptyState();
    }
    saveProject();
    renderActsList();
}

// [MVVM : View]
// Alterne l'affichage d'un chapitre (déplié/replié)
function toggleChapter(actId, chapterId) {
    const element = document.getElementById(`chapter-${chapterId}`);
    const icon = element.querySelector('.chapter-icon');
    const scenesList = element.querySelector('.scenes-list');

    const isExpanded = icon.classList.contains('expanded');

    icon.classList.toggle('expanded');
    scenesList.classList.toggle('visible');

    // Sauvegarder l'état
    if (isExpanded) {
        expandedChapters.delete(chapterId);
    } else {
        expandedChapters.add(chapterId);
    }
    saveTreeState();
}

// [MVVM : Model]
// Sauvegarde l'état d'expansion de l'arborescence dans IndexedDB
async function saveTreeState() {
    // Sauvegarder l'état d'expansion dans IndexedDB
    try {
        await saveSetting('expanded_acts', [...expandedActs]);
        await saveSetting('expanded_chapters', [...expandedChapters]);
    } catch (error) {
        console.error('❌ Erreur sauvegarde TreeState:', error);
    }
}

// [MVVM : View]
// Déploie toute l'arborescence dans l'interface
function expandAllTree() {
    // Déplier tous les actes
    document.querySelectorAll('.act-group').forEach(actEl => {
        const icon = actEl.querySelector('.act-icon');
        const chaptersContainer = actEl.querySelector('.act-chapters');
        const actId = parseInt(actEl.dataset.actId);

        if (icon && chaptersContainer) {
            icon.classList.add('expanded');
            chaptersContainer.classList.add('visible');
            expandedActs.add(actId);
        }
    });

    // Déplier tous les chapitres
    document.querySelectorAll('.chapter-group').forEach(chapterEl => {
        const icon = chapterEl.querySelector('.chapter-icon');
        const scenesList = chapterEl.querySelector('.scenes-list');
        const chapterId = parseInt(chapterEl.dataset.chapterId);

        if (icon && scenesList) {
            icon.classList.add('expanded');
            scenesList.classList.add('visible');
            expandedChapters.add(chapterId);
        }
    });

    // Déplier tous les groupes treeview (univers, codex)
    const collapsedState = JSON.parse(localStorage.getItem('plume_treeview_collapsed') || '{}');
    document.querySelectorAll('.treeview-group').forEach(group => {
        const header = group.querySelector('.treeview-header');
        const children = group.querySelector('.treeview-children');
        const chevron = group.querySelector('.treeview-chevron');

        if (children) {
            children.classList.remove('collapsed');
        }
        if (chevron) {
            chevron.setAttribute('data-lucide', 'chevron-down');
        }

        // Update localStorage state
        const onclickAttr = header ? header.getAttribute('onclick') : '';
        const match = onclickAttr ? onclickAttr.match(/toggleTreeviewGroup\('([^']+)'\)/) : null;
        if (match) {
            collapsedState[match[1]] = false;
        }
    });
    localStorage.setItem('plume_treeview_collapsed', JSON.stringify(collapsedState));

    // Déplier les catégories de notes
    expandedNoteCategories = new Set(['Idée', 'Recherche', 'Référence', 'A faire', 'Question', 'Autre']);
    if (document.getElementById('notesList').style.display !== 'none') {
        renderNotesList();
    }

    saveTreeState();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// [MVVM : View]
// Replie toute l'arborescence dans l'interface
function collapseAllTree() {
    // Replier tous les actes
    document.querySelectorAll('.act-group').forEach(actEl => {
        const icon = actEl.querySelector('.act-icon');
        const chaptersContainer = actEl.querySelector('.act-chapters');
        const actId = parseInt(actEl.dataset.actId);

        if (icon && chaptersContainer) {
            icon.classList.remove('expanded');
            chaptersContainer.classList.remove('visible');
            expandedActs.delete(actId);
        }
    });

    // Replier tous les chapitres
    document.querySelectorAll('.chapter-group').forEach(chapterEl => {
        const icon = chapterEl.querySelector('.chapter-icon');
        const scenesList = chapterEl.querySelector('.scenes-list');
        const chapterId = parseInt(chapterEl.dataset.chapterId);

        if (icon && scenesList) {
            icon.classList.remove('expanded');
            scenesList.classList.remove('visible');
            expandedChapters.delete(chapterId);
        }
    });

    // Replier tous les groupes treeview (univers, codex)
    const collapsedState = JSON.parse(localStorage.getItem('plume_treeview_collapsed') || '{}');
    document.querySelectorAll('.treeview-group').forEach(group => {
        const header = group.querySelector('.treeview-header');
        const children = group.querySelector('.treeview-children');
        const chevron = group.querySelector('.treeview-chevron');

        if (children) {
            children.classList.add('collapsed');
        }
        if (chevron) {
            chevron.setAttribute('data-lucide', 'chevron-right');
        }

        // Update localStorage state
        const onclickAttr = header ? header.getAttribute('onclick') : '';
        const match = onclickAttr ? onclickAttr.match(/toggleTreeviewGroup\('([^']+)'\)/) : null;
        if (match) {
            collapsedState[match[1]] = true;
        }
    });
    localStorage.setItem('plume_treeview_collapsed', JSON.stringify(collapsedState));

    // Replier les catégories de notes
    expandedNoteCategories.clear();
    if (document.getElementById('notesList').style.display !== 'none') {
        renderNotesList();
    }

    saveTreeState();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// [MVVM : Model]
// Charge l'état d'expansion de l'arborescence depuis IndexedDB
async function loadTreeState() {
    // Charger l'état d'expansion depuis IndexedDB
    try {
        const savedActs = await loadSetting('expanded_acts');
        const savedChapters = await loadSetting('expanded_chapters');

        if (savedActs) {
            expandedActs = new Set(savedActs);
        }
        if (savedChapters) {
            expandedChapters = new Set(savedChapters);
        }
    } catch (e) {
        console.error('Erreur chargement état arborescence:', e);
    }
}

// [MVVM : View]
// Restaure visuellement l'état d'expansion dans le DOM
function restoreTreeState() {
    // Restaurer visuellement l'état d'expansion après le rendu
    expandedActs.forEach(actId => {
        const element = document.getElementById(`act-${actId}`);
        if (element) {
            const icon = element.querySelector('.act-icon');
            const chaptersContainer = element.querySelector('.act-chapters');
            if (icon && chaptersContainer) {
                icon.classList.add('expanded');
                chaptersContainer.classList.add('visible');
            }
        }
    });

    expandedChapters.forEach(chapterId => {
        const element = document.getElementById(`chapter-${chapterId}`);
        if (element) {
            const icon = element.querySelector('.chapter-icon');
            const scenesList = element.querySelector('.scenes-list');
            if (icon && scenesList) {
                icon.classList.add('expanded');
                scenesList.classList.add('visible');
            }
        }
    });
}

// [MVVM : View]
// Active l'édition du titre d'un chapitre dans le DOM
function startEditingChapter(actId, chapterId, element) {
    const act = project.acts.find(a => a.id === actId);
    if (!act) return;

    const chapter = act.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const originalText = chapter.title;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'editing-input';
    input.value = originalText;

    element.textContent = '';
    element.appendChild(input);
    input.focus();
    input.select();

    const finishEditing = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== originalText) {
            chapter.title = newTitle;
            saveProject();

            // Update editor if this chapter is currently open
            if (currentChapterId === chapterId) {
                const breadcrumb = document.querySelector('.editor-breadcrumb');
                if (breadcrumb) breadcrumb.textContent = `${act.title} > ${newTitle}`;
            }
        }
        renderActsList();
    };

    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            finishEditing();
        } else if (e.key === 'Escape') {
            renderActsList();
        }
    });
}

// Scene Management
// [MVVM : View]
// Ouvre la modale d'ajout de scène
function openAddSceneModal(actId, chapterId) {
    activeActId = actId;
    activeChapterId = chapterId;
    document.getElementById('addSceneModal').classList.add('active');
}

// [MVVM : Other]
// Ouvre la modale d'ajout de scène rapidement (Mixte)
function openAddSceneModalQuick() {
    // Utiliser le chapitre courant s'il existe, sinon le premier chapitre disponible
    if (currentActId && currentChapterId) {
        openAddSceneModal(currentActId, currentChapterId);
    } else if (project.acts.length > 0 && project.acts[0].chapters.length > 0) {
        openAddSceneModal(project.acts[0].id, project.acts[0].chapters[0].id);
    } else {
        showNotification('Créez d\'abord un chapitre');
    }
}

// [MVVM : Other]
// Ajoute une nouvelle scène au modèle et met à jour la vue
function addScene() {
    const title = document.getElementById('sceneTitleInput').value.trim();
    if (!title || !activeActId || !activeChapterId) return;

    const act = project.acts.find(a => a.id === activeActId);
    if (!act) return;

    const chapter = act.chapters.find(c => c.id === activeChapterId);
    if (!chapter) return;

    const scene = {
        id: Date.now(),
        title: title,
        content: '',
        linkedCharacters: [],
        linkedElements: [],
        wordCount: 0,
        status: 'draft'
    };

    chapter.scenes.push(scene);

    // Auto-déplier l'acte et le chapitre parents
    expandedActs.add(act.id);
    expandedChapters.add(chapter.id);

    document.getElementById('sceneTitleInput').value = '';
    closeModal('addSceneModal');
    saveProject();
    renderActsList();

    // Auto-open the new scene
    openScene(activeActId, activeChapterId, scene.id);
}

// Variable pour les filtres actifs
let activeStatusFilters = ['draft', 'progress', 'complete', 'review'];
let currentStatusMenu = null;

// [MVVM : View]
// Ouvre le menu contextuel de statut d'une scène
function toggleSceneStatus(actId, chapterId, sceneId, event) {
    event = event || window.event;
    event.stopPropagation();

    // Fermer tout menu existant
    closeStatusMenu();

    const act = project.acts.find(a => a.id === actId);
    if (!act) return;

    const chapter = act.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const scene = chapter.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const currentStatus = scene.status || 'draft';

    // Créer le menu contextuel
    const menu = document.createElement('div');
    menu.className = 'status-menu visible';
    menu.id = 'statusMenu';
    menu.innerHTML = `
                <div class="status-menu-item ${currentStatus === 'draft' ? 'active' : ''}" onclick="setSceneStatus(${actId}, ${chapterId}, ${sceneId}, 'draft')">
                    <span class="status-menu-dot draft"></span>
                    <span>Brouillon</span>
                </div>
                <div class="status-menu-item ${currentStatus === 'progress' ? 'active' : ''}" onclick="setSceneStatus(${actId}, ${chapterId}, ${sceneId}, 'progress')">
                    <span class="status-menu-dot progress"></span>
                    <span>En cours</span>
                </div>
                <div class="status-menu-item ${currentStatus === 'complete' ? 'active' : ''}" onclick="setSceneStatus(${actId}, ${chapterId}, ${sceneId}, 'complete')">
                    <span class="status-menu-dot complete"></span>
                    <span>Terminé</span>
                </div>
                <div class="status-menu-item ${currentStatus === 'review' ? 'active' : ''}" onclick="setSceneStatus(${actId}, ${chapterId}, ${sceneId}, 'review')">
                    <span class="status-menu-dot review"></span>
                    <span>À réviser</span>
                </div>
            `;

    // Positionner le menu en position fixe près du clic
    const badge = event.target.closest('.status-badge');
    if (badge) {
        const rect = badge.getBoundingClientRect();
        menu.style.top = (rect.bottom + 5) + 'px';
        menu.style.left = (rect.left - 100) + 'px'; // Décaler vers la gauche

        // S'assurer que le menu ne sort pas de l'écran
        document.body.appendChild(menu);

        const menuRect = menu.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
            menu.style.left = (window.innerWidth - menuRect.width - 10) + 'px';
        }
        if (menuRect.left < 0) {
            menu.style.left = '10px';
        }
        if (menuRect.bottom > window.innerHeight) {
            menu.style.top = (rect.top - menuRect.height - 5) + 'px';
        }

        currentStatusMenu = menu;
    }

    // Fermer le menu si on clique ailleurs
    setTimeout(() => {
        document.addEventListener('click', closeStatusMenuOnClickOutside);
    }, 10);
}

// [MVVM : View]
// Ferme le menu de statut
function closeStatusMenu() {
    const menu = document.getElementById('statusMenu');
    if (menu) {
        menu.remove();
    }
    currentStatusMenu = null;
    document.removeEventListener('click', closeStatusMenuOnClickOutside);
}

// [MVVM : View]
// Gère la fermeture du menu au clic extérieur
function closeStatusMenuOnClickOutside(event) {
    if (currentStatusMenu && !currentStatusMenu.contains(event.target)) {
        closeStatusMenu();
    }
}

// [MVVM : Other]
// Met à jour le statut d'une scène (Mixte Model/View)
function setSceneStatus(actId, chapterId, sceneId, status) {
    const act = project.acts.find(a => a.id === actId);
    if (!act) return;

    const chapter = act.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const scene = chapter.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    scene.status = status;

    closeStatusMenu();
    saveProject();
    renderActsList();
    updateProgressBar();
}

// [MVVM : Other]
// Bascule un filtre de statut (Mixte)
function toggleStatusFilter(status) {
    const index = activeStatusFilters.indexOf(status);
    const btn = document.querySelector(`.status-filter-btn[data-status="${status}"]`);

    if (index > -1) {
        // Désactiver le filtre (cacher ce statut)
        activeStatusFilters.splice(index, 1);
        btn.classList.remove('active');
    } else {
        // Activer le filtre (montrer ce statut)
        activeStatusFilters.push(status);
        btn.classList.add('active');
    }

    applyStatusFilters();
}

// [MVVM : View]
// Applique visuellement les filtres de statut dans l'arborescence
function applyStatusFilters() {
    // Appliquer les filtres à toutes les scènes
    document.querySelectorAll('.scene-item[data-scene-id]').forEach(sceneEl => {
        const sceneId = parseInt(sceneEl.dataset.sceneId);
        const actId = parseInt(sceneEl.dataset.actId);
        const chapterId = parseInt(sceneEl.dataset.chapterId);

        const act = project.acts.find(a => a.id === actId);
        if (!act) return;
        const chapter = act.chapters.find(c => c.id === chapterId);
        if (!chapter) return;
        const scene = chapter.scenes.find(s => s.id === sceneId);
        if (!scene) return;

        const status = scene.status || 'draft';

        if (activeStatusFilters.includes(status)) {
            sceneEl.classList.remove('filtered-out');
        } else {
            sceneEl.classList.add('filtered-out');
        }
    });

    // Cacher les chapitres dont toutes les scènes sont filtrées (mais pas les chapitres vides)
    document.querySelectorAll('.chapter-group').forEach(chapterEl => {
        const allScenes = chapterEl.querySelectorAll('.scene-item[data-scene-id]');
        const visibleScenes = chapterEl.querySelectorAll('.scene-item[data-scene-id]:not(.filtered-out)');

        // Si le chapitre a des scènes mais aucune visible, le cacher
        // Si le chapitre n'a pas de scènes (vide), le garder visible
        if (allScenes.length > 0 && visibleScenes.length === 0) {
            chapterEl.classList.add('filtered-out');
        } else {
            chapterEl.classList.remove('filtered-out');
        }
    });

    // Cacher les actes dont tous les chapitres sont filtrés (mais pas les actes avec chapitres vides)
    document.querySelectorAll('.act-group').forEach(actEl => {
        const allChapters = actEl.querySelectorAll('.chapter-group');
        const visibleChapters = actEl.querySelectorAll('.chapter-group:not(.filtered-out)');

        // Si l'acte a des chapitres mais aucun visible, le cacher
        // Si l'acte n'a pas de chapitres (vide), le garder visible
        if (allChapters.length > 0 && visibleChapters.length === 0) {
            actEl.classList.add('filtered-out');
        } else {
            actEl.classList.remove('filtered-out');
        }
    });
}

/* [MVVM] View */
function updateProgressBar() {
    let counts = { draft: 0, progress: 0, complete: 0, review: 0 };
    let total = 0;

    project.acts.forEach(act => {
        act.chapters.forEach(chapter => {
            chapter.scenes.forEach(scene => {
                const status = scene.status || 'draft';
                counts[status] = (counts[status] || 0) + 1;
                total++;
            });
        });
    });

    // Mettre à jour les compteurs
    document.getElementById('countDraft').textContent = counts.draft;
    document.getElementById('countProgress').textContent = counts.progress;
    document.getElementById('countComplete').textContent = counts.complete;
    document.getElementById('countReview').textContent = counts.review;

    // Mettre à jour le texte de progression
    const completedPercent = total > 0 ? Math.round((counts.complete / total) * 100) : 0;
    document.getElementById('progressStatsText').textContent = `${total} scène${total > 1 ? 's' : ''}`;
    document.getElementById('progressPercent').textContent = `${completedPercent}% terminé`;

    // Mettre à jour les segments de la barre
    if (total > 0) {
        document.getElementById('progressComplete').style.width = `${(counts.complete / total) * 100}%`;
        document.getElementById('progressReview').style.width = `${(counts.review / total) * 100}%`;
        document.getElementById('progressProgress').style.width = `${(counts.progress / total) * 100}%`;
        document.getElementById('progressDraft').style.width = `${(counts.draft / total) * 100}%`;
    } else {
        document.getElementById('progressComplete').style.width = '0%';
        document.getElementById('progressReview').style.width = '0%';
        document.getElementById('progressProgress').style.width = '0%';
        document.getElementById('progressDraft').style.width = '0%';
    }
}

/* [MVVM] Mixte */
function deleteScene(actId, chapterId, sceneId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette scène ?')) return;

    const act = project.acts.find(a => a.id === actId);
    if (!act) return;

    const chapter = act.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    chapter.scenes = chapter.scenes.filter(s => s.id !== sceneId);
    if (currentSceneId === sceneId) {
        currentSceneId = null;
        showEmptyState();
    }
    saveProject();
    renderActsList();
}

/* [MVVM] View */
function startEditingScene(actId, chapterId, sceneId, element) {
    const act = project.acts.find(a => a.id === actId);
    if (!act) return;

    const chapter = act.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const scene = chapter.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const originalText = scene.title;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'editing-input';
    input.value = originalText;

    element.textContent = '';
    element.appendChild(input);
    input.focus();
    input.select();

    const finishEditing = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== originalText) {
            scene.title = newTitle;
            saveProject();

            // Update editor if this scene is currently open
            if (currentSceneId === sceneId) {
                const editorTitle = document.querySelector('.editor-title');
                if (editorTitle) editorTitle.textContent = newTitle;
            }
        }
        renderActsList();
    };

    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            finishEditing();
        } else if (e.key === 'Escape') {
            renderActsList();
        }
    });
}

// Navigation
/* [MVVM] Mixte */
function openScene(actId, chapterId, sceneId) {
    // Close mobile sidebar if open (for mobile devices)
    if (window.innerWidth <= 900 && typeof closeMobileSidebar === 'function') {
        closeMobileSidebar();
    }

    // Sauvegarder l'état avant d'ouvrir une nouvelle scène
    saveToHistoryImmediate();

    currentActId = actId;
    currentChapterId = chapterId;
    currentSceneId = sceneId;

    const act = project.acts.find(a => a.id === actId);
    const chapter = act.chapters.find(c => c.id === chapterId);
    const scene = chapter.scenes.find(s => s.id === sceneId);

    // Update active states in sidebar
    document.querySelectorAll('.act-header, .chapter-header, .scene-item').forEach(el => {
        el.classList.remove('active');
    });

    const sceneElement = document.querySelector(`[data-scene-id="${sceneId}"]`);
    if (sceneElement) {
        sceneElement.classList.add('active');

        // Expand parent chapter and act if needed
        const chapterElement = document.getElementById(`chapter-${chapterId}`);
        if (chapterElement) {
            const chapterIcon = chapterElement.querySelector('.chapter-icon');
            const scenesList = chapterElement.querySelector('.scenes-list');
            if (!scenesList.classList.contains('visible')) {
                chapterIcon.classList.add('expanded');
                scenesList.classList.add('visible');
            }
        }

        const actElement = document.getElementById(`act-${actId}`);
        if (actElement) {
            const actIcon = actElement.querySelector('.act-icon');
            const chaptersContainer = actElement.querySelector('.act-chapters');
            if (!chaptersContainer.classList.contains('visible')) {
                actIcon.classList.add('expanded');
                chaptersContainer.classList.add('visible');
            }
        }

        // Scroll the scene into view in the sidebar
        setTimeout(() => {
            const chaptersList = document.getElementById('chaptersList');
            if (chaptersList && sceneElement) {
                const containerRect = chaptersList.getBoundingClientRect();
                const elementRect = sceneElement.getBoundingClientRect();

                if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
                    sceneElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        }, 100);
    }

    // Handle split view mode
    if (splitViewActive) {
        // Find which panel has the editor view
        let editorPanel = null;
        if (splitViewState.left.view === 'editor') {
            editorPanel = 'left';
        } else if (splitViewState.right.view === 'editor') {
            editorPanel = 'right';
        }

        if (editorPanel) {
            // Update the editor panel's state
            const state = editorPanel === 'left' ? splitViewState.left : splitViewState.right;
            state.sceneId = sceneId;
            state.actId = actId;
            state.chapterId = chapterId;
            renderSplitPanelViewContent(editorPanel);

            // Set this as the active panel
            splitActivePanel = editorPanel;
            saveSplitViewState();
        } else {
            // No editor panel found, use the active panel
            const state = splitActivePanel === 'left' ? splitViewState.left : splitViewState.right;
            state.view = 'editor';
            state.sceneId = sceneId;
            state.actId = actId;
            state.chapterId = chapterId;
            renderSplitPanelViewContent(splitActivePanel);
            saveSplitViewState();
        }

        // CORRECTION SPLIT VIEW : Après le rendu, on rafraîchit les liens pour la scène active
        // Nous appelons les fonctions directement car les IDs globaux sont désormais corrects.
        autoDetectLinks();
        refreshLinksPanel();

    } else {
        // Normal mode
        renderEditor(act, chapter, scene);

        // CORRECTION NORMAL MODE : APRES le rendu de l'éditeur
        // 1. Déclenche l'analyse pour mettre à jour les suggestions
        autoDetectLinks();
        // 2. Affiche le panneau des liens avec les 3 listes
        refreshLinksPanel();
    }

    // Update scene versions sidebar
    renderSceneVersionsList();

    // Afficher automatiquement le panneau d'annotations si la scène en contient (sauf sur mobile)
    const annotationsPanel = document.getElementById('annotationsPanel');
    const annotations = getVersionAnnotations(scene);
    if (annotations && annotations.length > 0) {
        // Sur mobile, ne pas ouvrir automatiquement le panneau
        if (window.innerWidth > 900) {
            renderAnnotationsPanel();
        }
        updateAnnotationsButton(true);
    } else {
        if (annotationsPanel) {
            annotationsPanel.classList.remove('visible');
        }
        updateAnnotationsButton(false);
    }
}

// Rendering
// Expand/Collapse All
/* [MVVM] View */
function expandAll() {
    project.acts.forEach(act => {
        const actElement = document.getElementById(`act-${act.id}`);
        if (actElement) {
            const icon = actElement.querySelector('.act-icon');
            const chaptersContainer = actElement.querySelector('.act-chapters');
            if (icon && chaptersContainer) {
                icon.classList.add('expanded');
                chaptersContainer.classList.add('visible');
            }
        }

        act.chapters.forEach(chapter => {
            const chapterElement = document.getElementById(`chapter-${chapter.id}`);
            if (chapterElement) {
                const icon = chapterElement.querySelector('.chapter-icon');
                const scenesContainer = chapterElement.querySelector('.scenes-list');
                if (icon && scenesContainer) {
                    icon.classList.add('expanded');
                    scenesContainer.classList.add('visible');
                }
            }
        });
    });
}

/* [MVVM] View */
function collapseAll() {
    project.acts.forEach(act => {
        const actElement = document.getElementById(`act-${act.id}`);
        if (actElement) {
            const icon = actElement.querySelector('.act-icon');
            const chaptersContainer = actElement.querySelector('.act-chapters');
            if (icon && chaptersContainer) {
                icon.classList.remove('expanded');
                chaptersContainer.classList.remove('visible');
            }
        }

        act.chapters.forEach(chapter => {
            const chapterElement = document.getElementById(`chapter-${chapter.id}`);
            if (chapterElement) {
                const icon = chapterElement.querySelector('.chapter-icon');
                const scenesContainer = chapterElement.querySelector('.scenes-list');
                if (icon && scenesContainer) {
                    icon.classList.remove('expanded');
                    scenesContainer.classList.remove('visible');
                }
            }
        });
    });
}


/**
 * [MVVM : App View Orchestrator]
 * Ce fichier coordonne les différentes vues de l'application et gère les side-effects globaux.
 */

// --- ÉTAT UI GLOBAL ---
let activeStatusFilters = ['draft', 'progress', 'complete', 'review'];
let currentStatusMenu = null;
let chapterScrollTrackingHandler = null;

// --- DISPATCHER DE REPOSITORY ---

/**
 * Exécute les actions du repository retournées par un ViewModel.
 * Centralise toutes les mutations de données de l'application.
 */
function executeRepositorySideEffect(repoSideEffect) {
    if (!repoSideEffect) return;

    // Si on a un tableau d'actions
    if (Array.isArray(repoSideEffect)) {
        repoSideEffect.forEach(executeRepositorySideEffect);
        return;
    }

    const { action, collection, data, id, updates, actId, chapterId } = repoSideEffect;

    if (collection === 'acts') {
        if (action === 'ADD') ActRepository.add(data);
        else if (action === 'REMOVE') ActRepository.remove(id);
        else if (action === 'UPDATE') ActRepository.update(id, updates);
    }
    else if (collection === 'chapters') {
        if (action === 'ADD') ChapterRepository.add(actId, data);
        else if (action === 'REMOVE') ChapterRepository.remove(actId, id);
        else if (action === 'UPDATE') ChapterRepository.update(actId, id, updates);
    }
    else if (collection === 'scenes') {
        if (action === 'ADD') SceneRepository.add(actId, chapterId, data);
        else if (action === 'REMOVE') SceneRepository.remove(actId, chapterId, id);
        else if (action === 'UPDATE') SceneRepository.update(actId, chapterId, id, updates);
    }
}

// --- NAVIGATION & ROUTING ---

/**
 * Change la vue principale de l'application.
 */
function switchView(view) {
    // Si split view actif, changer la vue du panneau actif
    if (splitViewActive) {
        if (typeof switchSplitPanelView === 'function') {
            switchSplitPanelView(splitActivePanel, view);
        }
        return;
    }

    currentView = view;

    // Update header nav buttons
    document.querySelectorAll('[id^="header-tab-"]').forEach(btn => {
        btn.classList.remove('active');
    });
    const headerBtn = document.getElementById(`header-tab-${view}`);
    if (headerBtn) {
        headerBtn.classList.add('active');
    }

    // Éléments spécifiques à la vue Structure (Editor)
    const structureOnlyElements = [
        'projectProgressBar',
        'statusFilters',
        'sceneTools',
        'toolsSidebar'
    ];

    structureOnlyElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = (view === 'editor') ? '' : 'none';
        }
    });

    // Toolbar de l'arborescence
    const treeCollapseToolbar = document.getElementById('treeCollapseToolbar');
    const viewsWithGroups = ['editor', 'world', 'notes', 'codex', 'thriller'];
    if (treeCollapseToolbar) {
        treeCollapseToolbar.style.display = viewsWithGroups.includes(view) ? '' : 'none';
    }

    // Sidebar des versions (à droite)
    const sidebarVersions = document.getElementById('sidebarVersions');
    if (sidebarVersions) {
        if (view !== 'editor') {
            sidebarVersions.classList.add('hidden');
        }
    }

    // Cacher toutes les listes de la sidebar gauche
    const sidebarLists = [
        'chaptersList', 'charactersList', 'worldList', 'timelineList',
        'notesList', 'codexList', 'arcsList', 'statsList', 'versionsList', 'analysisList',
        'todosList', 'corkboardList', 'mindmapList', 'plotList',
        'relationsList', 'mapList', 'timelineVizList', 'storyGridList', 'thrillerList', 'noSidebarMessage'
    ];

    sidebarLists.forEach(listId => {
        const el = document.getElementById(listId);
        if (el) el.style.display = 'none';
    });

    // Mapping des vues vs listes sidebar
    const sidebarViews = {
        'editor': 'chaptersList',
        'characters': 'charactersList',
        'world': 'worldList',
        'notes': 'notesList',
        'codex': 'codexList',
        'arcs': 'arcsList',
        'mindmap': 'mindmapList',
        'timelineviz': 'timelineVizList',
        'thriller': 'thrillerList'
    };

    const editorViewVues = ['stats', 'analysis', 'versions', 'todos', 'timeline', 'corkboard', 'plot', 'relations', 'map'];

    const viewLabelsNoSidebar = {
        'stats': 'Statistiques', 'analysis': 'Analyse', 'versions': 'Versions',
        'todos': 'TODOs', 'timeline': 'Timeline', 'corkboard': 'Tableau',
        'plot': 'Intrigue', 'relations': 'Relations', 'map': 'Carte',
        'thriller': 'Thriller', 'storygrid': 'Story Grid'
    };

    if (sidebarViews[view]) {
        const listEl = document.getElementById(sidebarViews[view]);
        if (listEl) listEl.style.display = 'block';
    } else if (editorViewVues.includes(view)) {
        const noSidebarEl = document.getElementById('noSidebarMessage');
        if (noSidebarEl) {
            const viewLabel = viewLabelsNoSidebar[view] || 'Cette vue';
            noSidebarEl.innerHTML = `
                <div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted);">
                    <i data-lucide="layout-dashboard" style="width: 48px; height: 48px; opacity: 0.3; margin-bottom: 1rem;"></i>
                    <div style="font-size: 0.9rem; line-height: 1.6;">
                        <strong>${viewLabel}</strong> utilise tout l'espace disponible.
                    </div>
                </div>`;
            noSidebarEl.style.display = 'block';
        }
    }

    // Sur mobile, gérer la sidebar
    const isMobile = window.innerWidth <= 900;
    if (isMobile && sidebarViews[view] && typeof renderMobileSidebarView === 'function') {
        renderMobileSidebarView(view);
    }

    // Update sidebar actions
    const actionsHTML = {
        editor: '<button class="btn btn-primary" onclick="openAddActModal()">+ Acte</button><button class="btn btn-primary" onclick="openAddChapterModal()">+ Chapitre</button><button class="btn btn-primary" onclick="openAddSceneModalQuick()">+ Scène</button>',
        characters: '<button class="btn btn-primary" onclick="openAddCharacterModal()">+ Personnage</button>',
        world: '<button class="btn btn-primary" onclick="openAddWorldModal()">+ Élément</button>',
        notes: '<button class="btn btn-primary" onclick="openAddNoteModal()">+ Note</button>',
        codex: '<button class="btn btn-primary" onclick="openAddCodexModal()">+ Entrée</button>',
        arcs: '<button class="btn btn-primary" onclick="createNewArc()">+ Arc narratif</button>',
        plotgrid: '<button class="btn btn-primary" onclick="PlotGridUI.addNewColumn()">+ Colonne</button>'
    };
    const sidebarActions = document.getElementById('sidebarActions');
    if (sidebarActions) {
        sidebarActions.innerHTML = actionsHTML[view] || '';
    }

    // Hide plot sidebar when leaving editor
    if (view !== 'editor' && !splitViewActive) {
        document.getElementById('sidebarPlot')?.classList.add('hidden');
    }

    // Rendu du contenu
    renderViewContent(view, 'editorView');

    // Refresh icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

/**
 * Rend le contenu spécifique d'une vue dans un conteneur.
 */
function renderViewContent(view, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    switch (view) {
        case 'editor':
            if (currentActId && currentChapterId && currentSceneId) {
                if (containerId === 'editorView' && !splitViewActive) {
                    const act = project.acts.find(a => a.id === currentActId);
                    if (act) {
                        const chapter = act.chapters.find(c => c.id === currentChapterId);
                        if (chapter) {
                            const scene = chapter.scenes.find(s => s.id === currentSceneId);
                            if (scene) {
                                if (typeof renderEditor === 'function') {
                                    renderEditor(act, chapter, scene);
                                    // Force refresh of links panel
                                    if (typeof autoDetectLinks === 'function') autoDetectLinks();
                                    if (typeof refreshLinksPanel === 'function') refreshLinksPanel();
                                    return;
                                }
                            }
                        }
                    }
                } else if (typeof renderSceneInContainer === 'function') {
                    renderSceneInContainer(currentActId, currentChapterId, currentSceneId, containerId);
                    return;
                }
            }

            // État vide par défaut pour l'éditeur
            if (project.acts.length === 0 || (project.acts.length === 1 && project.acts[0].chapters.length === 0)) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">✏️</div>
                        <div class="empty-state-title">Commencez votre histoire</div>
                        <div class="empty-state-text">Créez votre premier chapitre pour commencer à écrire.</div>
                        <button class="btn btn-primary" onclick="openAddChapterModal()">+ Créer un chapitre</button>
                    </div>`;
            } else {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">✏️</div>
                        <div class="empty-state-title">Sélectionnez une scène</div>
                        <div class="empty-state-text">Choisissez une scène dans la barre latérale pour commencer à écrire.</div>
                    </div>`;
            }
            break;

        case 'characters':
            if (typeof renderCharactersList === 'function') renderCharactersList();
            if (typeof renderCharacterWelcome === 'function') renderCharacterWelcome();
            break;
        case 'world':
            if (typeof renderWorldList === 'function') renderWorldList();
            if (typeof renderWorldWelcome === 'function') renderWorldWelcome();
            break;
        case 'notes':
            if (typeof renderNotesList === 'function') renderNotesList();
            if (typeof renderNotesWelcome === 'function') renderNotesWelcome();
            break;
        case 'codex':
            if (typeof renderCodexList === 'function') renderCodexList();
            if (typeof renderCodexWelcome === 'function') renderCodexWelcome();
            break;
        case 'stats': if (typeof renderStats === 'function') renderStats(); break;
        case 'analysis': if (typeof renderAnalysis === 'function') renderAnalysis(); break;
        case 'versions': if (typeof renderVersionsList === 'function') renderVersionsList(); break;
        case 'todos': if (typeof renderTodosList === 'function') renderTodosList(); break;
        case 'corkboard': if (typeof openCorkBoardView === 'function') openCorkBoardView(); break;
        case 'mindmap': if (typeof renderMindmapView === 'function') renderMindmapView(); break;
        case 'plot': if (typeof renderPlotView === 'function') renderPlotView(); break;
        case 'relations': if (typeof renderRelationsView === 'function') renderRelationsView(); break;
        case 'map': if (typeof renderMapView === 'function') renderMapView(); break;
        case 'timelineviz': if (typeof renderTimelineVizView === 'function') renderTimelineVizView(); break;
        case 'arcs':
            if (typeof renderArcsList === 'function') renderArcsList();
            if (typeof renderArcsWelcome === 'function') renderArcsWelcome();
            break;
        case 'timeline': if (typeof renderTimelineList === 'function') renderTimelineList(); break;
        case 'storygrid': if (typeof renderStoryGrid === 'function') renderStoryGrid(); break;
        case 'thriller': if (typeof renderThrillerBoard === 'function') renderThrillerBoard(); break;
        default:
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon"><i data-lucide="layout" style="width:48px;height:48px;stroke-width:1;"></i></div>
                    <div class="empty-state-title">Panneau vide</div>
                    <div class="empty-state-text">Cliquez sur l'en-tête pour choisir une vue</div>
                </div>`;
            break;
    }
}

/**
 * Rafraîchit toutes les vues de l'application (utile après undo/redo ou import).
 */
function refreshAllViews() {
    // 1. Rafraîchir la structure (sidebar editor)
    if (typeof renderActsList === 'function') renderActsList();

    // 2. Restaurer l'état de l'arborescence
    setTimeout(() => {
        if (typeof restoreTreeState === 'function') restoreTreeState();
    }, 100);

    // 3. Rafraîchir les stats
    if (typeof updateStats === 'function') updateStats();

    // 4. Rafraîchir la vue actuelle
    switch (currentView) {
        case 'editor': if (typeof renderActsList === 'function') renderActsList(); break;
        case 'characters': if (typeof renderCharactersList === 'function') renderCharactersList(); break;
        case 'world': if (typeof renderWorldList === 'function') renderWorldList(); break;
        case 'timeline': if (typeof renderTimelineList === 'function') renderTimelineList(); break;
        case 'notes': if (typeof renderNotesList === 'function') renderNotesList(); break;
        case 'codex': if (typeof renderCodexList === 'function') renderCodexList(); break;
        case 'stats': if (typeof renderStats === 'function') renderStats(); break;
        case 'analysis': if (typeof renderAnalysis === 'function') renderAnalysis(); break;
        case 'versions': if (typeof renderVersionsList === 'function') renderVersionsList(); break;
        case 'todos': if (typeof renderTodosList === 'function') renderTodosList(); break;
        case 'corkboard': if (typeof renderCorkBoard === 'function') renderCorkBoard(); break;
        case 'mindmap': if (typeof renderMindmapView === 'function') renderMindmapView(); break;
        case 'plot': if (typeof renderPlotView === 'function') renderPlotView(); break;
        case 'relations': if (typeof renderRelationsView === 'function') renderRelationsView(); break;
        case 'map': if (typeof renderMapView === 'function') renderMapView(); break;
        case 'timelineviz': if (typeof renderTimelineVizView === 'function') renderTimelineVizView(); break;
        case 'arcs': if (typeof renderArcsList === 'function') renderArcsList(); break;
    }

    // 5. Rafraîchir l'éditeur si une scène est ouverte
    if (currentSceneId) {
        const scene = typeof findScene === 'function' ? findScene(currentActId, currentChapterId, currentSceneId) : null;
        if (scene) {
            const titleEl = document.getElementById('sceneTitle');
            const contentEl = document.getElementById('sceneContent');
            if (titleEl) titleEl.value = scene.title;
            if (contentEl) contentEl.value = scene.content || '';
            if (typeof updateWordCount === 'function') updateWordCount();
        }
    }
}

/**
 * Ouvre un chapitre complet et affiche toutes ses scènes de manière séquentielle.
 */
function openChapter(actId, chapterId) {
    if (window.innerWidth <= 900 && typeof closeMobileSidebar === 'function') {
        closeMobileSidebar();
    }

    if (typeof saveToHistoryImmediate === 'function') saveToHistoryImmediate();

    currentActId = actId;
    currentChapterId = chapterId;
    currentSceneId = null; // Mode chapitre, pas de scène unique

    const act = project.acts.find(a => a.id === actId);
    const chapter = act ? act.chapters.find(c => c.id === chapterId) : null;

    if (!chapter || !chapter.scenes || chapter.scenes.length === 0) return;

    // Mise à jour visuelle sidebar
    document.querySelectorAll('.act-header, .chapter-header, .scene-item').forEach(el => el.classList.remove('active'));
    const chapterElement = document.getElementById(`chapter-${chapterId}`);
    if (chapterElement) {
        chapterElement.querySelector('.chapter-header')?.classList.add('active');

        // Auto-expand parents
        chapterElement.querySelector('.chapter-icon')?.classList.add('expanded');
        chapterElement.querySelector('.scenes-list')?.classList.add('visible');

        const actElement = document.getElementById(`act-${actId}`);
        if (actElement) {
            actElement.querySelector('.act-icon')?.classList.add('expanded');
            actElement.querySelector('.act-chapters')?.classList.add('visible');
        }

        setTimeout(() => chapterElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }

    // Rendu de l'éditeur de chapitre
    if (typeof renderChapterEditor === 'function') {
        renderChapterEditor(act, chapter);
    }
}

/**
 * Ouvre une scène spécifique et gère toute l'orchestration associée.
 */
function openScene(actId, chapterId, sceneId) {
    // Nettoyer le tracking de scroll du mode chapitre
    if (typeof cleanupChapterScrollTracking === 'function') cleanupChapterScrollTracking();

    if (window.innerWidth <= 900 && typeof closeMobileSidebar === 'function') {
        closeMobileSidebar();
    }

    if (typeof saveToHistoryImmediate === 'function') saveToHistoryImmediate();

    currentActId = actId;
    currentChapterId = chapterId;
    currentSceneId = sceneId;

    const act = project.acts.find(a => a.id === actId);
    const chapter = act ? act.chapters.find(c => c.id === chapterId) : null;
    const scene = chapter ? chapter.scenes.find(s => s.id === sceneId) : null;

    if (!scene) return;

    // Mise à jour visuelle sidebar
    document.querySelectorAll('.act-header, .chapter-header, .scene-item').forEach(el => el.classList.remove('active'));
    const sceneElement = document.querySelector(`[data-scene-id="${sceneId}"]`);
    if (sceneElement) {
        sceneElement.classList.add('active');

        // Auto-expand parents
        const chapterElement = document.getElementById(`chapter-${chapterId}`);
        if (chapterElement) {
            chapterElement.querySelector('.chapter-icon')?.classList.add('expanded');
            chapterElement.querySelector('.scenes-list')?.classList.add('visible');
        }
        const actElement = document.getElementById(`act-${actId}`);
        if (actElement) {
            actElement.querySelector('.act-icon')?.classList.add('expanded');
            actElement.querySelector('.act-chapters')?.classList.add('visible');
        }

        setTimeout(() => sceneElement.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
    }

    // Gestion Split View vs Normal
    if (splitViewActive && typeof renderSplitPanelViewContent === 'function') {
        let editorPanel = splitViewState.left.view === 'editor' ? 'left' : (splitViewState.right.view === 'editor' ? 'right' : null);
        const panel = editorPanel || splitActivePanel;
        const state = panel === 'left' ? splitViewState.left : splitViewState.right;
        state.view = 'editor';
        state.sceneId = sceneId; state.actId = actId; state.chapterId = chapterId;
        renderSplitPanelViewContent(panel);
        splitActivePanel = panel;
        if (typeof saveSplitViewState === 'function') saveSplitViewState();
    } else if (typeof renderEditor === 'function') {
        renderEditor(act, chapter, scene);
    }

    // Post-open orchestrations
    if (typeof autoDetectLinks === 'function') autoDetectLinks();
    if (typeof refreshLinksPanel === 'function') refreshLinksPanel();
    if (typeof renderSceneVersionsList === 'function') renderSceneVersionsList();

    // Refresh plot sidebar if open
    if (typeof PlotGridUI !== 'undefined' && !document.getElementById('sidebarPlot').classList.contains('hidden')) {
        PlotGridUI.renderSidebar(sceneId);
    }

    // Annotations automatic opening
    const annotations = typeof getVersionAnnotations === 'function' ? getVersionAnnotations(scene) : [];
    if (annotations && annotations.length > 0 && window.innerWidth > 900) {
        if (typeof renderAnnotationsPanel === 'function') renderAnnotationsPanel();
        if (typeof updateAnnotationsButton === 'function') updateAnnotationsButton(true);
    } else {
        document.getElementById('annotationsPanel')?.classList.remove('visible');
        if (typeof updateAnnotationsButton === 'function') updateAnnotationsButton(false);
    }
}

// --- UTILITAIRES DE L'ARBORESCENCE (TREEVIEW) ---

function expandAllTree() {
    document.querySelectorAll('.act-group, .chapter-group').forEach(group => {
        group.querySelector('.act-icon, .chapter-icon')?.classList.add('expanded');
        group.querySelector('.act-chapters, .scenes-list')?.classList.add('visible');
    });

    document.querySelectorAll('.act-group').forEach(el => expandedActs.add(parseInt(el.dataset.actId)));
    document.querySelectorAll('.chapter-group').forEach(el => expandedChapters.add(parseInt(el.dataset.chapterId)));

    // Treeview groups (Univers, Codex, etc.)
    document.querySelectorAll('.treeview-group').forEach(group => {
        group.querySelector('.treeview-children')?.classList.remove('collapsed');
        group.querySelector('.treeview-chevron')?.setAttribute('data-lucide', 'chevron-down');
    });

    if (typeof renderNotesList === 'function') {
        expandedNoteCategories = new Set(['Idée', 'Recherche', 'Référence', 'A faire', 'Question', 'Autre']);
        renderNotesList();
    }

    if (typeof ActRepository?.saveTreeState === 'function') ActRepository.saveTreeState();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function collapseAllTree() {
    document.querySelectorAll('.act-icon, .chapter-icon').forEach(el => el.classList.remove('expanded'));
    document.querySelectorAll('.act-chapters, .scenes-list').forEach(el => el.classList.remove('visible'));

    expandedActs.clear();
    expandedChapters.clear();

    document.querySelectorAll('.treeview-children').forEach(el => el.classList.add('collapsed'));
    document.querySelectorAll('.treeview-chevron').forEach(el => el.setAttribute('data-lucide', 'chevron-right'));

    if (typeof renderNotesList === 'function') {
        expandedNoteCategories.clear();
        renderNotesList();
    }

    if (typeof ActRepository?.saveTreeState === 'function') ActRepository.saveTreeState();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function restoreTreeState() {
    expandedActs.forEach(id => {
        const el = document.getElementById(`act-${id}`);
        if (el) {
            el.querySelector('.act-icon')?.classList.add('expanded');
            el.querySelector('.act-chapters')?.classList.add('visible');
        }
    });
    expandedChapters.forEach(id => {
        const el = document.getElementById(`chapter-${id}`);
        if (el) {
            el.querySelector('.chapter-icon')?.classList.add('expanded');
            el.querySelector('.scenes-list')?.classList.add('visible');
        }
    });
}

// --- UTILITAIRES UI GLOBAUX ---

function closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('active');
}

function openProjectsModal() {
    if (typeof renderProjectsList === 'function') renderProjectsList();
    document.getElementById('projectsModal')?.classList.add('active');
}

function toggleStatusFilter(status) {
    const index = activeStatusFilters.indexOf(status);
    const btn = document.querySelector(`.status-filter-btn[data-status="${status}"]`);

    if (index > -1) {
        activeStatusFilters.splice(index, 1);
        btn?.classList.remove('active');
    } else {
        activeStatusFilters.push(status);
        btn?.classList.add('active');
    }

    if (typeof applyStatusFilters === 'function') applyStatusFilters();
}

// --- EDITOR RENDERING ---

/**
 * [MVVM : View]
 * Retourne le HTML complet de la barre d'outils de l'éditeur.
 * @param {string} [panel] - Si présent, utilise formatTextInPanel au lieu de formatText
 */
function getEditorToolbarHTML(panel = null) {
    const fnName = panel ? 'formatTextInPanel' : 'formatText';
    const fnPrefix = panel ? `'${panel}', ` : '';
    const idSuffix = panel ? `-${panel}` : '';

    return `
        <!-- Basic formatting -->
        <div class="toolbar-group">
            <button class="toolbar-btn" data-format="bold" onclick="${fnName}(${fnPrefix}'bold')" title="Gras (Ctrl+B)">
                <strong>B</strong>
            </button>
            <button class="toolbar-btn" data-format="italic" onclick="${fnName}(${fnPrefix}'italic')" title="Italique (Ctrl+I)">
                <em>I</em>
            </button>
            <button class="toolbar-btn" data-format="underline" onclick="${fnName}(${fnPrefix}'underline')" title="Souligné (Ctrl+U)">
                <u>U</u>
            </button>
            <button class="toolbar-btn" data-format="strikethrough" onclick="${fnName}(${fnPrefix}'strikeThrough')" title="Barré">
                <s>S</s>
            </button>
        </div>
        
        <!-- Font family and size -->
        <div class="toolbar-group">
            <select class="font-family-selector" onchange="${fnName}(${fnPrefix}'fontName', this.value)" title="Police de caractères">
                <option value="Crimson Pro">Crimson Pro</option>
                <option value="Arial">Arial</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
                <option value="Garamond">Garamond</option>
                <option value="Palatino">Palatino</option>
            </select>
            <select class="font-size-selector" onchange="${fnName}(${fnPrefix}'fontSize', this.value)" title="Taille de police">
                <option value="1">Très petit</option>
                <option value="2">Petit</option>
                <option value="3" selected>Normal</option>
                <option value="4">Grand</option>
                <option value="5">Très grand</option>
                <option value="6">Énorme</option>
                <option value="7">Gigantesque</option>
            </select>
        </div>
        
        <!-- Text color -->
        <div class="toolbar-group">
            <div class="color-picker-wrapper">
                <button class="toolbar-btn" onclick="toggleColorPicker('text', event, ${panel ? `'${panel}'` : 'null'})" title="Couleur du texte">
                    <span style="border-bottom: 3px solid currentColor;">A</span>
                </button>
                <div class="color-picker-dropdown" id="textColorPicker${idSuffix}">
                    <div class="color-grid" id="textColorGrid${idSuffix}"></div>
                    <div class="color-input-wrapper">
                        <input type="color" id="textColorInput${idSuffix}" onchange="applyTextColor(this.value, ${panel ? `'${panel}'` : 'null'})">
                        <input type="text" id="textColorHex${idSuffix}" placeholder="#000000" maxlength="7" onchange="applyTextColor(this.value, ${panel ? `'${panel}'` : 'null'})">
                    </div>
                </div>
            </div>
            <div class="color-picker-wrapper">
                <button class="toolbar-btn" onclick="toggleColorPicker('background', event, ${panel ? `'${panel}'` : 'null'})" title="Couleur de fond">
                    <span style="background: yellow; padding: 0 4px;">A</span>
                </button>
                <div class="color-picker-dropdown" id="backgroundColorPicker${idSuffix}">
                    <div class="color-grid" id="backgroundColorGrid${idSuffix}"></div>
                    <div class="color-input-wrapper">
                        <input type="color" id="bgColorInput${idSuffix}" onchange="applyBackgroundColor(this.value, ${panel ? `'${panel}'` : 'null'})">
                        <input type="text" id="bgColorHex${idSuffix}" placeholder="#FFFF00" maxlength="7" onchange="applyBackgroundColor(this.value, ${panel ? `'${panel}'` : 'null'})">
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Alignment -->
        <div class="toolbar-group">
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'justifyLeft')" title="Aligner à gauche">
                ⫷
            </button>
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'justifyCenter')" title="Centrer">
                ⫶
            </button>
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'justifyRight')" title="Aligner à droite">
                ⫸
            </button>
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'justifyFull')" title="Justifier">
                ☰
            </button>
        </div>
        
        <!-- Headings -->
        <div class="toolbar-group">
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'formatBlock', 'h1')" title="Titre 1">H1</button>
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'formatBlock', 'h2')" title="Titre 2">H2</button>
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'formatBlock', 'h3')" title="Titre 3">H3</button>
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'formatBlock', 'p')" title="Paragraphe">P</button>
        </div>
        
        <!-- Lists and quotes -->
        <div class="toolbar-group">
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'insertUnorderedList')" title="Liste à puces">• Liste</button>
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'insertOrderedList')" title="Liste numérotée">1. Liste</button>
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'formatBlock', 'blockquote')" title="Citation">❝ Citation</button>
        </div>
        
        <!-- Indentation -->
        <div class="toolbar-group">
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'indent')" title="Augmenter l'indentation">→|</button>
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'outdent')" title="Diminuer l'indentation">|←</button>
        </div>
        
        <!-- Superscript, subscript -->
        <div class="toolbar-group">
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'superscript')" title="Exposant">x²</button>
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'subscript')" title="Indice">x₂</button>
        </div>
        
        <!-- Other -->
        <div class="toolbar-group">
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'insertHorizontalRule')" title="Ligne horizontale">─</button>
            <button class="toolbar-btn" onclick="${fnName}(${fnPrefix}'removeFormat')" title="Supprimer le formatage">✕ Format</button>
        </div>

        <!-- Annotations, Arcs & Plot -->
        <div class="toolbar-group">
            <button class="toolbar-btn" onclick="${panel ? `toggleAnnotationsPanel()` : 'toggleAnnotationsPanel()'}" id="toolbarAnnotationsBtn${idSuffix}" title="Annotations"><i data-lucide="message-square"></i></button>
            <button class="toolbar-btn" onclick="${panel ? `toggleArcScenePanel()` : 'toggleArcScenePanel()'}" id="toolbarArcsBtn${idSuffix}" title="Arcs Narratifs"><i data-lucide="git-commit-horizontal"></i></button>
            <button class="toolbar-btn" onclick="PlotGridUI.toggleSidebar()" id="toolbarPlotBtn${idSuffix}" title="Afficher l'intrigue"><i data-lucide="trending-up"></i></button>
        </div>
        
        <!-- Revision mode button -->
        <div class="toolbar-group">
            <button class="toolbar-btn" onclick="toggleRevisionMode()" title="Mode Révision (Ctrl+R)" style="color: var(--accent-gold); font-weight: 600;">✏️ RÉVISION</button>
        </div>
    `;
}

/**
 * [MVVM : View]
 * Génère et affiche l'éditeur de texte complet.
 */
function renderEditor(act, chapter, scene) {
    const editorView = document.getElementById('editorView');
    if (!editorView) return;

    const wordCount = typeof getWordCount === 'function' ? getWordCount(scene.content) : 0;

    // Vérifier si une version finale existe
    const hasFinalVersion = scene.versions && scene.versions.some(v => v.isFinal === true);
    const finalVersion = hasFinalVersion ? scene.versions.find(v => v.isFinal === true) : null;
    const finalVersionBadge = hasFinalVersion
        ? `<span style="display: inline-flex; align-items: center; gap: 0.25rem; background: var(--accent-gold); color: var(--bg-accent); font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 10px; margin-left: 0.5rem;" title="Version finale : ${finalVersion.number}">⭐ ${finalVersion.number}</span>`
        : '';

    editorView.innerHTML = `
        <div class="editor-fixed-top">
            <div class="editor-header">
                <div class="editor-breadcrumb">${act.title} > ${chapter.title}</div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="editor-title" style="flex: 1;">${scene.title}${finalVersionBadge}</div>
                    <button class="btn btn-small" onclick="toggleFocusMode()" title="Mode Focus (F11)" style="white-space: nowrap;">
                        <i data-lucide="maximize" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Focus
                    </button>
                </div>
                <div class="editor-meta">
                    <span id="sceneWordCount">${wordCount} mots</span>
                    <span>Dernière modification : ${new Date(scene.updatedAt || Date.now()).toLocaleDateString('fr-FR')}</span>
                </div>
                <div class="editor-synopsis">
                    <span class="synopsis-label"><i data-lucide="file-text" style="width:12px;height:12px;"></i> Résumé :</span>
                    <input type="text" 
                           class="synopsis-input" 
                           value="${(scene.synopsis || '').replace(/"/g, '&quot;')}" 
                           placeholder="Ajouter un résumé de la scène..."
                           onchange="updateSceneSynopsis(${act.id}, ${chapter.id}, ${scene.id}, this.value)"
                           oninput="this.style.width = Math.max(200, this.scrollWidth) + 'px'">
                </div>
            </div>
            <!-- Toolbar and Links Panels -->
            <button class="toolbar-mobile-toggle" onclick="toggleEditorToolbar()">
                <span id="toolbarToggleText"><i data-lucide="pen-line" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Afficher les outils</span>
            </button>
            <div class="editor-toolbar" id="editorToolbar">
                ${getEditorToolbarHTML()}
            </div>
            
            <div class="links-panel-sticky" id="linksPanel">
                <div style="display: flex; gap: 2rem; align-items: start;">
                    <div style="flex: 1;">
                        <div class="quick-links-title"><i data-lucide="users" style="width:14px;height:14px;"></i> Personnages</div>
                        <div class="quick-links"></div>
                    </div>
                    <div style="flex: 1;">
                        <div class="quick-links-title"><i data-lucide="globe" style="width:14px;height:14px;"></i> Univers</div>
                        <div class="quick-links"></div>
                    </div>
                    <div style="flex: 1;">
                        <div class="quick-links-title"><i data-lucide="train-track" style="width:14px;height:14px;"></i> Timeline</div>
                        <div class="quick-links"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="editor-workspace">
            <div class="editor-content">
                <div class="editor-textarea" contenteditable="true" spellcheck="true" oninput="updateSceneContent()">${scene.content || ''}</div>
            </div>
        </div>`;

    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (typeof initializeColorPickers === 'function') initializeColorPickers();

    // Focus if empty
    setTimeout(() => {
        const editor = document.querySelector('.editor-textarea');
        if (editor && editor.textContent.trim() === '') editor.focus();
    }, 100);
}

/**
 * [MVVM : View]
 * Génère et affiche l'éditeur de chapitre avec toutes les scènes séquentiellement.
 */
function renderChapterEditor(act, chapter) {
    const editorView = document.getElementById('editorView');
    if (!editorView) return;

    // Calculer les statistiques du chapitre
    let totalWords = 0;
    const sceneWordCounts = [];
    chapter.scenes.forEach(scene => {
        const wc = typeof getWordCount === 'function' ? getWordCount(scene.content) : (scene.wordCount || 0);
        sceneWordCounts.push(wc);
        totalWords += wc;
    });

    // Générer le HTML pour toutes les scènes
    let scenesHTML = '';
    chapter.scenes.forEach((scene, index) => {
        const wordCount = sceneWordCounts[index];
        const hasFinalVersion = scene.versions && scene.versions.some(v => v.isFinal === true);
        const finalVersion = hasFinalVersion ? scene.versions.find(v => v.isFinal === true) : null;
        const finalVersionBadge = hasFinalVersion
            ? `<span style="display: inline-flex; align-items: center; gap: 0.25rem; background: var(--accent-gold); color: var(--bg-accent); font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.5rem; border-radius: 10px; margin-left: 0.5rem;" title="Version finale : ${finalVersion.number}">⭐ ${finalVersion.number}</span>`
            : '';

        scenesHTML += `
            <div class="chapter-scene-block" data-scene-id="${scene.id}" data-scene-index="${index}">
                <div class="scene-separator">
                    <div class="scene-separator-title">${scene.title}${finalVersionBadge}</div>
                    <div class="scene-separator-meta">
                        <span>${wordCount} mots</span>
                        ${scene.synopsis ? `<span class="scene-separator-synopsis">${scene.synopsis}</span>` : ''}
                    </div>
                </div>
                <div class="editor-textarea" contenteditable="true" spellcheck="true"
                     data-scene-id="${scene.id}"
                     oninput="updateChapterSceneContent(${act.id}, ${chapter.id}, ${scene.id})">${scene.content || ''}</div>
            </div>`;
    });

    editorView.innerHTML = `
        <div class="editor-fixed-top">
            <div class="editor-header">
                <div class="editor-breadcrumb">${act.title} > ${chapter.title}</div>
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <div class="editor-title" id="chapterEditorTitle" style="flex: 1;">${chapter.title} - Toutes les scènes</div>
                    <button class="btn btn-small" onclick="toggleFocusMode()" title="Mode Focus (F11)" style="white-space: nowrap;">
                        <i data-lucide="maximize" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Focus
                    </button>
                </div>
                <div class="editor-meta">
                    <span>${totalWords} mots au total</span>
                    <span>${chapter.scenes.length} scène${chapter.scenes.length > 1 ? 's' : ''}</span>
                    <span>Dernière modification : ${new Date(chapter.updatedAt || Date.now()).toLocaleDateString('fr-FR')}</span>
                </div>
            </div>
            <!-- Toolbar -->
            <button class="toolbar-mobile-toggle" onclick="toggleEditorToolbar()">
                <span id="toolbarToggleText"><i data-lucide="pen-line" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Afficher les outils</span>
            </button>
            <div class="editor-toolbar" id="editorToolbar">
                ${getEditorToolbarHTML()}
            </div>
        </div>

        <!-- Indicateur de position vertical -->
        <div class="chapter-progress-indicator" id="chapterProgressIndicator">
            ${chapter.scenes.map((scene, index) => {
                const wordCount = sceneWordCounts[index];
                const heightPercent = totalWords > 0 ? (wordCount / totalWords) * 100 : (100 / chapter.scenes.length);
                return `<div class="progress-scene-segment"
                            data-scene-id="${scene.id}"
                            data-scene-index="${index}"
                            style="height: ${heightPercent}%"
                            title="${scene.title} (${wordCount} mots)"
                            onclick="scrollToChapterScene(${index})"></div>`;
            }).join('')}
            <div class="progress-current-indicator" id="progressCurrentIndicator"></div>
        </div>

        <div class="editor-workspace">
            <div class="editor-content" id="chapterEditorContent">
                ${scenesHTML}
            </div>
        </div>`;

    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (typeof initializeColorPickers === 'function') initializeColorPickers();

    // Initialiser le tracking de scroll
    setTimeout(() => {
        initChapterScrollTracking(act.id, chapter.id);
    }, 100);
}

/**
 * [MVVM : View]
 * Synchronise la Vue vers le Modèle et rafraîchit les indicateurs.
 */
function updateSceneContent() {
    const editor = document.querySelector('.editor-textarea');
    if (!editor) return;

    const act = project.acts.find(a => a.id === currentActId);
    const chapter = act?.chapters.find(c => c.id === currentChapterId);
    const scene = chapter?.scenes.find(s => s.id === currentSceneId);
    if (!scene) return;

    scene.content = editor.innerHTML;
    const wordCount = typeof getWordCount === 'function' ? getWordCount(editor.innerHTML) : 0;
    scene.wordCount = wordCount;

    // Mise à jour de la version active (si applicable)
    if (typeof updateSceneContentWithVersion === 'function') updateSceneContentWithVersion(editor.innerHTML);

    const countEl = document.getElementById('sceneWordCount');
    if (countEl) countEl.textContent = `${wordCount} mots`;

    if (typeof saveProject === 'function') saveProject();
    if (typeof updateStats === 'function') updateStats();
    if (typeof renderActsList === 'function') renderActsList();
    if (typeof trackWritingSession === 'function') trackWritingSession();

    if (typeof focusModeActive !== 'undefined' && focusModeActive && typeof updateWritingProgress === 'function') {
        updateWritingProgress();
    }

    if (typeof autoDetectLinksDebounced === 'function') autoDetectLinksDebounced();
}

/**
 * [MVVM : View]
 * Met à jour le contenu d'une scène dans le mode chapitre.
 */
function updateChapterSceneContent(actId, chapterId, sceneId) {
    const editor = document.querySelector(`.editor-textarea[data-scene-id="${sceneId}"]`);
    if (!editor) return;

    const act = project.acts.find(a => a.id === actId);
    const chapter = act?.chapters.find(c => c.id === chapterId);
    const scene = chapter?.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    scene.content = editor.innerHTML;
    const wordCount = typeof getWordCount === 'function' ? getWordCount(editor.innerHTML) : 0;
    scene.wordCount = wordCount;

    // Mise à jour du compteur de mots de la scène
    const sceneBlock = document.querySelector(`.chapter-scene-block[data-scene-id="${sceneId}"]`);
    if (sceneBlock) {
        const metaSpan = sceneBlock.querySelector('.scene-separator-meta span');
        if (metaSpan) metaSpan.textContent = `${wordCount} mots`;
    }

    if (typeof saveProject === 'function') saveProject();
    if (typeof updateStats === 'function') updateStats();
    if (typeof renderActsList === 'function') renderActsList();
    if (typeof trackWritingSession === 'function') trackWritingSession();

    // Recalculer les proportions de l'indicateur
    updateChapterProgressIndicator(chapter);
}

/**
 * [MVVM : View]
 * Met à jour les proportions de l'indicateur de progression du chapitre.
 */
function updateChapterProgressIndicator(chapter) {
    let totalWords = 0;
    const wordCounts = [];

    chapter.scenes.forEach(scene => {
        const wc = typeof getWordCount === 'function' ? getWordCount(scene.content) : (scene.wordCount || 0);
        wordCounts.push(wc);
        totalWords += wc;
    });

    chapter.scenes.forEach((scene, index) => {
        const segment = document.querySelector(`.progress-scene-segment[data-scene-index="${index}"]`);
        if (segment) {
            const heightPercent = totalWords > 0 ? (wordCounts[index] / totalWords) * 100 : (100 / chapter.scenes.length);
            segment.style.height = `${heightPercent}%`;
            segment.title = `${scene.title} (${wordCounts[index]} mots)`;
        }
    });
}

/**
 * [MVVM : View]
 * Initialise le tracking de scroll pour l'éditeur de chapitre.
 */
function initChapterScrollTracking(actId, chapterId) {
    // Nettoyer le handler précédent s'il existe
    cleanupChapterScrollTracking();

    const editorContent = document.getElementById('chapterEditorContent');
    const indicator = document.getElementById('progressCurrentIndicator');
    const title = document.getElementById('chapterEditorTitle');

    if (!editorContent || !indicator) return;

    const act = project.acts.find(a => a.id === actId);
    const chapter = act?.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    let currentSceneIndex = 0;

    function updateScrollPosition() {
        const sceneBlocks = Array.from(document.querySelectorAll('.chapter-scene-block'));
        if (sceneBlocks.length === 0) return;

        // Trouver quelle scène est actuellement visible
        const viewportMiddle = window.innerHeight / 2;
        let closestScene = 0;
        let closestDistance = Infinity;

        sceneBlocks.forEach((block, index) => {
            const rect = block.getBoundingClientRect();
            const blockMiddle = rect.top + rect.height / 2;
            const distance = Math.abs(blockMiddle - viewportMiddle);

            if (distance < closestDistance) {
                closestDistance = distance;
                closestScene = index;
            }
        });

        // Mettre à jour le titre si la scène a changé
        if (closestScene !== currentSceneIndex) {
            currentSceneIndex = closestScene;
            const scene = chapter.scenes[closestScene];
            if (scene && title) {
                title.textContent = scene.title;
            }
        }

        // Calculer la position de l'indicateur
        const progressIndicator = document.getElementById('chapterProgressIndicator');
        if (!progressIndicator) return;

        const segments = Array.from(progressIndicator.querySelectorAll('.progress-scene-segment'));
        let topOffset = 0;

        // Calculer l'offset jusqu'à la scène actuelle
        for (let i = 0; i < currentSceneIndex; i++) {
            const seg = segments[i];
            if (seg) topOffset += seg.offsetHeight;
        }

        // Ajouter un pourcentage dans la scène actuelle basé sur le scroll
        const currentBlock = sceneBlocks[currentSceneIndex];
        if (currentBlock) {
            const blockRect = currentBlock.getBoundingClientRect();
            const viewportTop = 0;
            const relativeScroll = Math.max(0, Math.min(1, (viewportTop - blockRect.top) / blockRect.height));

            const currentSegment = segments[currentSceneIndex];
            if (currentSegment) {
                topOffset += currentSegment.offsetHeight * relativeScroll;
            }
        }

        indicator.style.top = `${topOffset}px`;

        // Mettre en surbrillance le segment actif
        segments.forEach((seg, i) => {
            if (i === currentSceneIndex) {
                seg.classList.add('active');
            } else {
                seg.classList.remove('active');
            }
        });
    }

    // Stocker le handler pour pouvoir le nettoyer plus tard
    chapterScrollTrackingHandler = updateScrollPosition;

    // Écouter le scroll
    window.addEventListener('scroll', chapterScrollTrackingHandler);
    updateScrollPosition(); // Initial call
}

/**
 * [MVVM : View]
 * Nettoie le tracking de scroll pour éviter les fuites mémoire.
 */
function cleanupChapterScrollTracking() {
    if (chapterScrollTrackingHandler) {
        window.removeEventListener('scroll', chapterScrollTrackingHandler);
        chapterScrollTrackingHandler = null;
    }
}

/**
 * [MVVM : View]
 * Fait défiler jusqu'à une scène spécifique dans le mode chapitre.
 */
function scrollToChapterScene(sceneIndex) {
    const sceneBlock = document.querySelector(`.chapter-scene-block[data-scene-index="${sceneIndex}"]`);
    if (sceneBlock) {
        sceneBlock.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// --- WELCOME SCREENS ---

function renderWelcomeEditor() {
    const container = document.getElementById('editorView');
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">✍️</div>
            <div class="empty-state-title">Sélectionnez une scène</div>
            <div class="empty-state-text">Choisissez une scène dans la barre latérale pour commencer à écrire.</div>
        </div>`;
}

function renderCharacterWelcome() {
    const container = document.getElementById('editorView');
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="users" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
            <div class="empty-state-title">Personnages</div>
            <div class="empty-state-text">Sélectionnez un personnage pour voir sa fiche, ou créez-en un nouveau.</div>
        </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderWorldWelcome() {
    const container = document.getElementById('editorView');
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="globe" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
            <div class="empty-state-title">Univers</div>
            <div class="empty-state-text">Sélectionnez un lieu ou un élément dans la liste pour voir ses détails.</div>
        </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderNotesWelcome() {
    const container = document.getElementById('editorView');
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="sticky-note" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
            <div class="empty-state-title">Notes</div>
            <div class="empty-state-text">Sélectionnez une note dans la liste pour la consulter.</div>
        </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderCodexWelcome() {
    const container = document.getElementById('editorView');
    if (!container) return;
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="book-open" style="width:48px;height:48px;stroke-width:1.5;"></i></div>
            <div class="empty-state-title">Codex</div>
            <div class="empty-state-text">Sélectionnez une entrée dans la liste pour la consulter.</div>
        </div>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

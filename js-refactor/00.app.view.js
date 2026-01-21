/**
 * [MVVM : App View Orchestrator]
 * Ce fichier coordonne les différentes vues de l'application et gère les side-effects globaux.
 */

// --- ÉTAT UI GLOBAL ---
let activeStatusFilters = ['draft', 'progress', 'complete', 'review'];
let currentStatusMenu = null;

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
        'sceneTools'
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
        arcs: '<button class="btn btn-primary" onclick="createNewArc()">+ Arc narratif</button>'
    };
    const sidebarActions = document.getElementById('sidebarActions');
    if (sidebarActions) {
        sidebarActions.innerHTML = actionsHTML[view] || '';
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
 * Ouvre une scène spécifique et gère toute l'orchestration associée.
 */
function openScene(actId, chapterId, sceneId) {
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
                <!-- Group formatting -->
                <div class="toolbar-group">
                    <button class="toolbar-btn" onclick="formatText('bold')"><strong>B</strong></button>
                    <button class="toolbar-btn" onclick="formatText('italic')"><em>I</em></button>
                    <button class="toolbar-btn" onclick="formatText('underline')"><u>U</u></button>
                </div>
                <!-- Alignment -->
                <div class="toolbar-group">
                    <button class="toolbar-btn" onclick="formatText('justifyLeft')">⫷</button>
                    <button class="toolbar-btn" onclick="formatText('justifyCenter')">⫶</button>
                    <button class="toolbar-btn" onclick="formatText('justifyRight')">⫸</button>
                </div>
                <!-- Annotations & Arcs -->
                <div class="toolbar-group">
                    <button class="toolbar-btn" onclick="toggleAnnotationsPanel()" id="toolbarAnnotationsBtn"><i data-lucide="message-square"></i></button>
                    <button class="toolbar-btn" onclick="toggleArcScenePanel()" id="toolbarArcsBtn"><i data-lucide="git-commit-horizontal"></i></button>
                </div>
                <div class="toolbar-group">
                    <button class="toolbar-btn" onclick="toggleRevisionMode()" id="toolbarRevisionBtn" style="color: var(--accent-gold); font-weight: 600;">✏️ RÉVISION</button>
                </div>
            </div>
            
            <div class="links-panel-sticky" id="linksPanel">
                <div style="display: flex; gap: 2rem; align-items: start;">
                    <div style="flex: 1;">
                        <div class="quick-links-title"><i data-lucide="users" style="width:14px;height:14px;"></i> Personnages</div>
                        <div class="quick-links">${typeof renderSceneCharacters === 'function' ? renderSceneCharacters(act.id, chapter.id, scene) : ''}</div>
                    </div>
                    <div style="flex: 1;">
                        <div class="quick-links-title"><i data-lucide="globe" style="width:14px;height:14px;"></i> Univers</div>
                        <div class="quick-links">${typeof renderSceneElements === 'function' ? renderSceneElements(act.id, chapter.id, scene) : ''}</div>
                    </div>
                    <div style="flex: 1;">
                        <div class="quick-links-title"><i data-lucide="train-track" style="width:14px;height:14px;"></i> Timeline</div>
                        <div class="quick-links">${typeof renderSceneMetroEvents === 'function' ? renderSceneMetroEvents(scene.id) : ''}</div>
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

    // Focus if empty
    setTimeout(() => {
        const editor = document.querySelector('.editor-textarea');
        if (editor && editor.textContent.trim() === '') editor.focus();
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

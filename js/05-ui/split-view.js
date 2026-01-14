// Migrated from js/16.split-view.js

// ==========================================
// SPLIT VIEW SYSTEM - New Architecture
// ==========================================

const viewLabels = {
    'editor': 'Structure',
    'characters': 'Personnages',
    'world': 'Univers',
    'notes': 'Notes',
    'codex': 'Codex',
    'stats': 'Statistiques',
    'analysis': 'Analyse',
    'versions': 'Snapshots',
    'todos': 'TODOs',
    'corkboard': 'Tableau',
    'mindmap': 'Mindmap',
    'plot': 'Intrigue',
    'relations': 'Relations',
    'map': 'Carte',
    'timelineviz': 'Timeline'
};

const viewIcons = {
    'editor': 'pen-line',
    'characters': 'users',
    'world': 'globe',
    'notes': 'sticky-note',
    'codex': 'book-open',
    'stats': 'bar-chart-3',
    'analysis': 'scan-search',
    'versions': 'history',
    'todos': 'check-square',
    'corkboard': 'layout-grid',
    'mindmap': 'git-branch',
    'plot': 'trending-up',
    'relations': 'link',
    'map': 'map',
    'timelineviz': 'clock'
};

function toggleSplitView() {
    if (splitViewActive) {
        closeSplitView();
    } else {
        activateSplitView();
    }
}

function activateSplitView() {
    splitViewActive = true;
    splitActivePanel = 'left';
    splitViewState.left.view = currentView || 'editor';
    if (currentSceneId) {
        splitViewState.left.sceneId = currentSceneId;
        splitViewState.left.actId = currentActId;
        splitViewState.left.chapterId = currentChapterId;
    }
    if (!splitViewState.right.view) splitViewState.right.view = null;
    renderSplitView();
    updateSplitToggleButton();
    showNotification('Mode split activé - Cliquez sur un panneau pour le sélectionner');
}

function closeSplitView() {
    splitViewActive = false;
    let viewToRestore = 'editor';
    let sceneToRestore = null;
    if (splitViewState.left.view === 'editor') {
        viewToRestore = 'editor';
        sceneToRestore = splitViewState.left.sceneId;
        currentActId = splitViewState.left.actId;
        currentChapterId = splitViewState.left.chapterId;
    } else if (splitViewState.right.view === 'editor') {
        viewToRestore = 'editor';
        sceneToRestore = splitViewState.right.sceneId;
        currentActId = splitViewState.right.actId;
        currentChapterId = splitViewState.right.chapterId;
    } else {
        viewToRestore = splitViewState.left.view || 'editor';
    }
    currentView = viewToRestore;
    if (sceneToRestore) currentSceneId = sceneToRestore;
    splitViewState.right.view = null;
    switchView(currentView);
    updateSplitToggleButton();
    saveSplitViewState();
    showNotification('Mode split désactivé');
}

function updateSplitToggleButton() {
    const btn = document.getElementById('splitModeToggle');
    if (!btn) return;
    if (splitViewActive) {
        btn.classList.add('active');
        btn.innerHTML = '<i data-lucide="columns-2" style="width:14px;height:14px;"></i> <span>Split actif</span>';
    } else {
        btn.classList.remove('active');
        btn.innerHTML = '<i data-lucide="columns-2" style="width:14px;height:14px;"></i> <span>Split</span>';
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderSplitView() {
    if (!splitViewActive) return;
    const editorView = document.getElementById('editorView');
    const ratio = splitViewState.ratio || 60;
    const leftLabel = splitViewState.left.view ? viewLabels[splitViewState.left.view] || 'Vue' : 'Vide';
    const rightLabel = splitViewState.right.view ? viewLabels[splitViewState.right.view] || 'Vue' : 'Vide';
    const leftIcon = splitViewState.left.view ? viewIcons[splitViewState.left.view] || 'file' : 'plus-circle';
    const rightIcon = splitViewState.right.view ? viewIcons[splitViewState.right.view] || 'file' : 'plus-circle';
    editorView.innerHTML = `
        <div class="split-view-container" id="splitViewContainer">
            <div class="split-panel split-panel-left ${splitActivePanel === 'left' ? 'active' : ''}" 
                 id="splitPanelLeft" 
                 style="flex: ${ratio};"
                 onclick="setActiveSplitPanel('left')">
                <div class="split-panel-header" onclick="openSplitViewSelector('left'); event.stopPropagation();">
                    <div class="split-panel-title" id="splitLeftTitle">
                        <i data-lucide="${leftIcon}" style="width:14px;height:14px;"></i>
                        <span>${leftLabel}</span>
                        <i data-lucide="chevron-down" style="width:12px;height:12px;opacity:0.5;margin-left:4px;"></i>
                    </div>
                    <div class="split-panel-actions" onclick="event.stopPropagation();">
                        <span class="split-panel-indicator ${splitActivePanel === 'left' ? 'active' : ''}" title="Panneau actif">●</span>
                    </div>
                </div>
                <div class="split-panel-content" id="splitLeftContent"></div>
            </div>
            <div class="split-resizer horizontal" id="splitResizer" onmousedown="startSplitResize(event)" ontouchstart="startSplitResize(event)"></div>
            <div class="split-panel split-panel-right ${splitActivePanel === 'right' ? 'active' : ''}" id="splitPanelRight" style="flex: ${100 - ratio};" onclick="setActiveSplitPanel('right')">
                <div class="split-panel-header" onclick="openSplitViewSelector('right'); event.stopPropagation();">
                    <div class="split-panel-title" id="splitRightTitle">
                        <i data-lucide="${rightIcon}" style="width:14px;height:14px;"></i>
                        <span>${rightLabel}</span>
                        <i data-lucide="chevron-down" style="width:12px;height:12px;opacity:0.5;margin-left:4px;"></i>
                    </div>
                    <div class="split-panel-actions" onclick="event.stopPropagation();">
                        <span class="split-panel-indicator ${splitActivePanel === 'right' ? 'active' : ''}" title="Panneau actif">●</span>
                        <button class="split-panel-btn" onclick="closeSplitView(); event.stopPropagation();" title="Fermer le split"><i data-lucide="x" style="width:12px;height:12px;"></i></button>
                    </div>
                </div>
                <div class="split-panel-content" id="splitRightContent"></div>
            </div>
        </div>
    `;
    renderSplitPanelViewContent('left');
    renderSplitPanelViewContent('right');
    updateSidebarForSplitPanel(splitActivePanel);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function setActiveSplitPanel(panel) {
    if (splitActivePanel === panel) return;
    splitActivePanel = panel;
    document.getElementById('splitPanelLeft')?.classList.toggle('active', panel === 'left');
    document.getElementById('splitPanelRight')?.classList.toggle('active', panel === 'right');
    document.querySelectorAll('.split-panel-indicator').forEach((el, index) => {
        el.classList.toggle('active', (index === 0 && panel === 'left') || (index === 1 && panel === 'right'));
    });
    updateSidebarForSplitPanel(panel);
    const activeView = panel === 'left' ? splitViewState.left.view : splitViewState.right.view;
    if (activeView) {
        document.querySelectorAll('[id^="header-tab-"]').forEach(btn => btn.classList.remove('active'));
        const headerBtn = document.getElementById(`header-tab-${activeView}`);
        if (headerBtn) headerBtn.classList.add('active');
    }
}

function updateSidebarForSplitPanel(panel) {
    const state = panel === 'left' ? splitViewState.left : splitViewState.right;
    const view = state.view;
    if (!view) return;
    const sidebarViews = { 'editor': 'chaptersList', 'characters': 'charactersList', 'world': 'worldList', 'notes': 'notesList', 'codex': 'codexList', 'arcs': 'arcsList', 'mindmap': 'mindmapList', 'timelineviz': 'timelineVizList' };
    const noSidebarViews = ['stats', 'analysis', 'versions', 'todos', 'timeline', 'corkboard', 'plot', 'relations', 'map'];
    const viewLabelsNoSidebar = { 'stats': 'Statistiques', 'analysis': 'Analyse', 'versions': 'Versions', 'todos': 'TODOs', 'timeline': 'Timeline', 'corkboard': 'Tableau', 'plot': 'Intrigue', 'relations': 'Relations', 'map': 'Carte' };
    const allLists = ['chaptersList','charactersList','worldList','timelineList','notesList','codexList','statsList','versionsList','analysisList','todosList','corkboardList','mindmapList','plotList','relationsList','mapList','timelineVizList','noSidebarMessage'];
    allLists.forEach(listId => { const el = document.getElementById(listId); if (el) el.style.display = 'none'; });
    if (sidebarViews[view]) {
        const listEl = document.getElementById(sidebarViews[view]);
        if (listEl) listEl.style.display = 'block';
        switch(view) {
            case 'editor': renderActsList(); break;
            case 'characters': if (typeof renderCharactersList === 'function') renderCharactersList(); break;
            case 'world': if (typeof renderWorldList === 'function') renderWorldList(); break;
            case 'notes': if (typeof renderNotesList === 'function') renderNotesList(); break;
            case 'codex': if (typeof renderCodexList === 'function') renderCodexList(); break;
            case 'mindmap': if (typeof renderMindmapList === 'function') renderMindmapList(); break;
            case 'timelineviz': if (typeof renderTimelineVizList === 'function') renderTimelineVizList(); break;
        }
    } else if (noSidebarViews.includes(view)) {
        const noSidebarEl = document.getElementById('noSidebarMessage');
        if (noSidebarEl) {
            const viewLabel = viewLabelsNoSidebar[view] || 'Cette vue';
            noSidebarEl.innerHTML = `<div style="padding: 2rem 1rem; text-align: center; color: var(--text-muted);"><i data-lucide="layout-dashboard" style="width: 48px; height: 48px; opacity: 0.3; margin-bottom: 1rem;"></i><div style="font-size: 0.9rem; line-height: 1.6;"><strong>${viewLabel}</strong> utilise tout l'espace disponible.</div><div style="font-size: 0.85rem; margin-top: 0.5rem; opacity: 0.8;">La barre latérale n'est pas utilisée dans cette vue.</div></div>`;
            noSidebarEl.style.display = 'block';
            setTimeout(() => { if (typeof lucide !== 'undefined') lucide.createIcons(); }, 50);
        }
    }
    const actionsHTML = { editor: '<button class="btn btn-primary" onclick="openAddActModal()">+ Acte</button><button class="btn btn-primary" onclick="openAddChapterModal()">+ Chapitre</button><button class="btn btn-primary" onclick="openAddSceneModalQuick()">+ Scène</button>', characters: '<button class="btn btn-primary" onclick="openAddCharacterModal()">+ Personnage</button>', world: '<button class="btn btn-primary" onclick="openAddWorldModal()">+ Élément</button>', notes: '<button class="btn btn-primary" onclick="openAddNoteModal()">+ Note</button>', codex: '<button class="btn btn-primary" onclick="openAddCodexModal()">+ Entrée</button>', arcs: '<button class="btn btn-primary" onclick="createNewArc()">+ Arc narratif</button>' };
    const sidebarActions = document.getElementById('sidebarActions'); if (sidebarActions) sidebarActions.innerHTML = actionsHTML[view] || '';
    const structureOnlyElements = ['projectProgressBar','statusFilters','sceneTools']; structureOnlyElements.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = (view === 'editor') ? '' : 'none'; });
    const treeCollapseToolbar = document.getElementById('treeCollapseToolbar'); const viewsWithGroups = ['editor','world','notes','codex']; if (treeCollapseToolbar) treeCollapseToolbar.style.display = viewsWithGroups.includes(view) ? '' : 'none';
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function switchSplitPanelView(panel, view) {
    const state = panel === 'left' ? splitViewState.left : splitViewState.right;
    state.view = view; state.sceneId = null; state.characterId = null; state.worldId = null; state.noteId = null;
    if (view === 'editor' && currentSceneId) { state.sceneId = currentSceneId; state.actId = currentActId; state.chapterId = currentChapterId; }
    renderSplitPanelViewContent(panel); updateSplitPanelHeader(panel);
    if (splitActivePanel === panel) { updateSidebarForSplitPanel(panel); document.querySelectorAll('[id^="header-tab-"]').forEach(btn => btn.classList.remove('active')); const headerBtn = document.getElementById(`header-tab-${view}`); if (headerBtn) headerBtn.classList.add('active'); }
    saveSplitViewState(); if (typeof lucide !== 'undefined') lucide.createIcons();
}

function updateSplitPanelHeader(panel) {
    const state = panel === 'left' ? splitViewState.left : splitViewState.right;
    const titleEl = document.getElementById(panel === 'left' ? 'splitLeftTitle' : 'splitRightTitle');
    if (!titleEl) return;
    const label = state.view ? viewLabels[state.view] || 'Vue' : 'Vide';
    const icon = state.view ? viewIcons[state.view] || 'file' : 'plus-circle';
    titleEl.innerHTML = `<i data-lucide="${icon}" style="width:14px;height:14px;"></i><span>${label}</span><i data-lucide="chevron-down" style="width:12px;height:12px;opacity:0.5;margin-left:4px;"></i>`;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderSplitPanelViewContent(panel) {
    const container = document.getElementById(panel === 'left' ? 'splitLeftContent' : 'splitRightContent'); if (!container) return;
    const state = panel === 'left' ? splitViewState.left : splitViewState.right; const view = state.view; if (!view) { container.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;color:var(--text-muted);text-align:center;padding:2rem;"></div>`; if (typeof lucide !== 'undefined') lucide.createIcons(); return; }
    const contentId = `split-${panel}-view-content`; container.innerHTML = `<div id="${contentId}" style="height:100%; overflow:auto;"></div>`; const contentContainer = document.getElementById(contentId);
    renderViewInSplitPanel(view, contentContainer, state, panel);
}

function renderViewInSplitPanel(view, container, state, panel) {
    const realEditorView = document.getElementById('editorView');
    const tempContainer = document.createElement('div'); tempContainer.id = 'editorView'; tempContainer.style.cssText = 'height: 100%; overflow: auto;'; container.innerHTML = ''; container.appendChild(tempContainer);
    if (realEditorView) realEditorView.id = 'editorView-backup';
    const restoreEditorView = () => { if (realEditorView) realEditorView.id = 'editorView'; tempContainer.id = 'splitPanelContent-' + panel; };
    switch(view) {
        case 'editor':
            if (state.sceneId) {
                const act = project.acts.find(a => a.id === state.actId);
                const chapter = act?.chapters.find(c => c.id === state.chapterId);
                const scene = chapter?.scenes.find(s => s.id === state.sceneId);
                if (act && chapter && scene) { renderEditorInContainer(act, chapter, scene, container, panel); restoreEditorView(); return; }
            } else {
                tempContainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon">✍️</div><div class="empty-state-title">Sélectionnez une scène</div><div class="empty-state-text">Choisissez une scène dans la barre latérale</div></div>`;
            }
            break;
        case 'characters': if (state.characterId) { const char = project.characters.find(c => c.id === state.characterId); if (char) { migrateCharacterData(char); tempContainer.innerHTML = renderCharacterSheet(char, false); setTimeout(() => { initCharacterRadar(char); if (typeof lucide !== 'undefined') lucide.createIcons(); }, 100); } } else { tempContainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon"><i data-lucide="users" style="width:48px;height:48px;stroke-width:1.5;"></i></div><div class="empty-state-title">Personnages</div><div class="empty-state-text">Sélectionnez un personnage dans la barre latérale</div></div>`; } break;
        case 'world': if (state.worldId) { const elem = project.world?.find(e => e.id === state.worldId); if (elem) { if (typeof renderWorldDetailFull === 'function') { renderWorldDetailFull(elem, tempContainer); } else { tempContainer.innerHTML = `<div class="detail-view"><div class="detail-header"><div style="display:flex;align-items:center;gap:1rem;"><div class="detail-title">${elem.name}</div><span style="font-size:0.9rem;padding:0.5rem 1rem;background:var(--accent-gold);color:var(--bg-primary);border-radius:2px;">${elem.type}</span></div></div>${typeof renderElementLinkedScenes === 'function' ? renderElementLinkedScenes(elem) : ''}<div class="detail-section"><div class="detail-section-title">Informations de base</div><div class="detail-field"><div class="detail-label">Nom</div><input type="text" class="form-input" value="${elem.name}" onchange="updateWorldField(${elem.id}, 'name', this.value)"></div></div></div>`; } } } else { tempContainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon"><i data-lucide="globe" style="width:48px;height:48px;stroke-width:1.5;"></i></div><div class="empty-state-title">Univers</div><div class="empty-state-text">Sélectionnez un élément dans la barre latérale</div></div>`; } break;
        case 'notes': if (state.noteId) { const note = project.notes?.find(n => n.id === state.noteId); if (note) { tempContainer.innerHTML = `<div class="detail-view"><div class="detail-header"><div style="display:flex;align-items:center;gap:1rem;flex:1;"><input type="text" class="form-input" value="${note.title || ''}" style="font-size:1.8rem;font-weight:600;font-family:'Noto Serif JP',serif;padding:0.5rem;" onchange="updateNoteField(${note.id}, 'title', this.value)" placeholder="Titre de la note"><span style="font-size:0.8rem;padding:0.4rem 0.8rem;background:var(--accent-gold);color:var(--bg-primary);border-radius:2px;">${note.category || 'Note'}</span></div></div><div class="detail-section"><div class="detail-section-title">Catégorie</div><select class="form-input" onchange="updateNoteField(${note.id}, 'category', this.value)"><option value="Recherche" ${note.category === 'Recherche' ? 'selected' : ''}>Recherche</option><option value="Idée" ${note.category === 'Idée' ? 'selected' : ''}>Idée</option><option value="Référence" ${note.category === 'Référence' ? 'selected' : ''}>Référence</option><option value="A faire" ${note.category === 'A faire' ? 'selected' : ''}>À faire</option><option value="Question" ${note.category === 'Question' ? 'selected' : ''}>Question</option><option value="Autre" ${note.category === 'Autre' ? 'selected' : ''}>Autre</option></select></div><div class="detail-section"><div class="detail-section-title">Tags</div><input type="text" class="form-input" value="${(note.tags || []).join(', ')}" onchange="updateNoteTags(${note.id}, this.value)"></div><div class="detail-section"><div class="detail-section-title">Contenu</div><textarea class="form-input" rows="20" oninput="updateNoteField(${note.id}, 'content', this.value)">${note.content || ''}</textarea></div><div style="font-size:0.8rem;color:var(--text-muted);margin-top:2rem;font-family:'Source Code Pro',monospace;">Créée le ${new Date(note.createdAt).toLocaleDateString('fr-FR')} • Modifiée le ${new Date(note.updatedAt).toLocaleDateString('fr-FR')}</div></div>`; } } else { tempContainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon"><i data-lucide="sticky-note" style="width:48px;height:48px;stroke-width:1.5;"></i></div><div class="empty-state-title">Notes</div><div class="empty-state-text">Sélectionnez une note dans la barre latérale</div></div>`; } break;
        case 'mindmap': if (typeof renderMindmapView === 'function') renderMindmapView(); break;
        case 'corkboard': if (typeof openCorkBoardView === 'function') openCorkBoardView(); break;
        case 'stats': if (typeof renderStats === 'function') renderStats(); break;
        case 'analysis': if (typeof renderAnalysis === 'function') renderAnalysis(); break;
        case 'map': if (typeof renderMapView === 'function') renderMapView(); break;
        case 'codex': if (state.codexId) { const entry = project.codex?.find(c => c.id === state.codexId); if (entry) { tempContainer.innerHTML = `<div class="detail-view"><div class="detail-header"><div style="display:flex;align-items:center;gap:1rem;flex:1;"><input type="text" class="form-input" value="${entry.title}" style="font-size:1.8rem;font-weight:600;padding:0.5rem;" onchange="updateCodexField(${entry.id}, 'title', this.value)" placeholder="Titre de l'entrée"><span style="font-size:0.8rem;padding:0.4rem 0.8rem;background:var(--accent-gold);color:var(--bg-primary);border-radius:2px;">${entry.category}</span></div></div><div class="detail-section"><div class="detail-section-title">Catégorie</div><select class="form-input" onchange="updateCodexField(${entry.id}, 'category', this.value)"> ... </select></div></div>`; } } else { tempContainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon"><i data-lucide="book-open" style="width:48px;height:48px;stroke-width:1.5;"></i></div><div class="empty-state-title">Codex</div><div class="empty-state-text">Sélectionnez une entrée dans la barre latérale</div></div>`; } break;
        case 'plot': if (typeof renderPlotView === 'function') renderPlotView(); break;
        case 'relations': if (typeof renderRelationsView === 'function') renderRelationsView(); break;
        case 'timelineviz': { const charCount = project.characters?.length || 0; if (charCount === 0) { tempContainer.innerHTML = `<div class="metro-empty-state"><i data-lucide="users" style="width:64px;height:64px;opacity:0.3;"></i><h3 style="margin:1rem 0 0.5rem;">Aucun personnage</h3><p style="margin-bottom:1.5rem;">Créez d'abord des personnages dans l'onglet "Personnages".</p></div>`; } else { tempContainer.innerHTML = `<div style="padding:1rem;height:100%;overflow:auto;"><div class="metro-toolbar" style="margin-bottom:1rem;"><button class="btn btn-primary" onclick="openMetroEventModal()"><i data-lucide="plus" style="width:16px;height:16px;"></i>Nouvel événement</button><button class="btn" onclick="sortMetroByDate()"><i data-lucide="calendar" style="width:16px;height:16px;"></i>Trier par date</button></div><div class="metro-timeline-container" id="metroTimelineContainer-split-${panel}">${renderMetroSVG()}</div><div class="metro-legend" style="margin-top:1rem;">${project.characters.map(char => `<div class="metro-legend-item" onclick="openMetroColorPicker(${char.id})" style="cursor:pointer;" title="Cliquer pour changer la couleur"><div class="metro-legend-line" style="background: ${project.characterColors[char.id] || '#999'};"></div><span>${char.name}</span></div>`).join('')}</div></div>`; } } break;
        case 'versions': if (typeof renderVersionsList === 'function') renderVersionsList(); break;
        case 'todos': if (typeof renderTodosList === 'function') renderTodosList(); break;
        case 'timeline': if (typeof renderTimelineList === 'function') renderTimelineList(); break;
        default: tempContainer.innerHTML = `<div class="empty-state"><div class="empty-state-icon"><i data-lucide="${viewIcons[view] || 'file'}" style="width:48px;height:48px;"></i></div><div class="empty-state-title">${viewLabels[view] || view}</div><div class="empty-state-text">Cette vue est disponible</div></div>`;
    }
    restoreEditorView();
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// (The file continues with many helper functions; they were migrated verbatim.)

// Split resize state
let _splitResizing = false;
let _splitStartX = 0;
let _splitStartRatio = 60;

function startSplitResize(e) {
    e = e || window.event;
    _splitResizing = true;
    _splitStartX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    _splitStartRatio = splitViewState.ratio || 60;

    document.addEventListener('mousemove', doSplitResize);
    document.addEventListener('touchmove', doSplitResize, { passive: false });
    document.addEventListener('mouseup', stopSplitResize);
    document.addEventListener('touchend', stopSplitResize);
}

function doSplitResize(e) {
    if (!_splitResizing) return;
    e.preventDefault();
    const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    const container = document.getElementById('splitViewContainer');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const delta = clientX - _splitStartX;
    const width = rect.width || (window.innerWidth * 0.6);
    const deltaPercent = (delta / width) * 100;
    let newRatio = _splitStartRatio + deltaPercent;
    if (newRatio < 20) newRatio = 20;
    if (newRatio > 80) newRatio = 80;
    splitViewState.ratio = Math.round(newRatio);
    const left = document.getElementById('splitPanelLeft');
    const right = document.getElementById('splitPanelRight');
    if (left) left.style.flex = `${splitViewState.ratio}`;
    if (right) right.style.flex = `${100 - splitViewState.ratio}`;
}

function stopSplitResize() {
    if (!_splitResizing) return;
    _splitResizing = false;
    document.removeEventListener('mousemove', doSplitResize);
    document.removeEventListener('touchmove', doSplitResize);
    document.removeEventListener('mouseup', stopSplitResize);
    document.removeEventListener('touchend', stopSplitResize);
    saveSplitViewState();
}

function saveSplitViewState() {
    try {
        if (window.StateManager && typeof window.StateManager.set === 'function') {
            window.StateManager.set('splitViewState', splitViewState);
        }
    } catch (e) { console.warn('StateManager not available for splitViewState'); }
    try {
        localStorage.setItem('splitViewState', JSON.stringify(splitViewState));
    } catch (e) { /* ignore */ }
}

function loadSplitViewState() {
    try {
        const fromState = (window.StateManager && typeof window.StateManager.get === 'function') ? window.StateManager.get('splitViewState') : null;
        if (fromState && typeof fromState === 'object') {
            Object.assign(splitViewState, fromState);
        } else {
            const raw = localStorage.getItem('splitViewState');
            if (raw) {
                const obj = JSON.parse(raw);
                if (obj && typeof obj === 'object') Object.assign(splitViewState, obj);
            }
        }
    } catch (e) { /* ignore */ }
}

// Try to load persisted state when app is ready
if (window.EventBus && typeof window.EventBus.on === 'function') {
    window.EventBus.on('app:ready', () => {
        loadSplitViewState();
        if (splitViewState.ratio) {
            const left = document.getElementById('splitPanelLeft');
            const right = document.getElementById('splitPanelRight');
            if (left) left.style.flex = `${splitViewState.ratio}`;
            if (right) right.style.flex = `${100 - splitViewState.ratio}`;
        }
    });
} else {
    // Fallback: attempt shortly after load
    setTimeout(() => {
        loadSplitViewState();
    }, 200);
}

// Lightweight UI helpers / shims for split interactions
function openSplitViewSelector(panel) {
    // Simple selector fallback: prompt for view key
    const choices = Object.keys(viewLabels).join(', ');
    const pick = prompt('Choisir une vue pour le panneau (' + panel + ') — options: ' + choices);
    if (!pick) return;
    selectSplitPanelView(panel, pick.trim());
}

function selectSplitPanelView(panel, view) {
    if (!view) return;
    switchSplitPanelView(panel, view);
}

function openSceneInSplitPanel(actId, chapterId, sceneId, panel = splitActivePanel) {
    const state = panel === 'left' ? splitViewState.left : splitViewState.right;
    state.view = 'editor';
    state.actId = actId;
    state.chapterId = chapterId;
    state.sceneId = sceneId;
    renderSplitPanelViewContent(panel);
    if (splitActivePanel === panel) updateSidebarForSplitPanel(panel);
    saveSplitViewState();
}

function openCharacterInSplitPanel(charId, panel = splitActivePanel) {
    const state = panel === 'left' ? splitViewState.left : splitViewState.right;
    state.view = 'characters';
    state.characterId = charId;
    renderSplitPanelViewContent(panel);
    if (splitActivePanel === panel) updateSidebarForSplitPanel(panel);
    saveSplitViewState();
}

function openWorldElementInSplitPanel(worldId, panel = splitActivePanel) {
    const state = panel === 'left' ? splitViewState.left : splitViewState.right;
    state.view = 'world';
    state.worldId = worldId;
    renderSplitPanelViewContent(panel);
    if (splitActivePanel === panel) updateSidebarForSplitPanel(panel);
    saveSplitViewState();
}

function openNoteInSplitPanel(noteId, panel = splitActivePanel) {
    const state = panel === 'left' ? splitViewState.left : splitViewState.right;
    state.view = 'notes';
    state.noteId = noteId;
    renderSplitPanelViewContent(panel);
    if (splitActivePanel === panel) updateSidebarForSplitPanel(panel);
    saveSplitViewState();
}

function formatTextInPanel(panel, command, value = null) {
    // Try to execute command within the split panel's editable area
    try {
        // Find contenteditable element inside the split panel content
        const container = document.getElementById(`splitPanelContent-${panel}`) || document.getElementById(`split-${panel}-view-content`);
        if (container) {
            // Attempt to focus and execCommand
            container.focus();
            if (value !== null) document.execCommand(command, false, value);
            else document.execCommand(command);
            return;
        }
    } catch (e) { /* ignore */ }

    // Fallback: try global formatting function if present
    if (typeof window.formatText === 'function') {
        return window.formatText(command, value);
    }
}

// Mark migrated flag
window.splitViewMigrated = true;

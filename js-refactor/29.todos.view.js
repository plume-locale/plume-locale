/**
 * [MVVM : Todos View]
 * Gestion de l'affichage et des interactions utilisateur pour les TODOs.
 * Responsable uniquement du rendu et des événements DOM.
 */

// ============================================
// VIEW - GESTION DU PANNEAU TODOS
// ============================================

/**
 * [MVVM : View]
 * Alterne l'affichage du panneau des TODOs.
 */
function toggleTodosPanel() {
    const panel = document.getElementById('todosPanel');
    const btn = document.getElementById('sidebarTodosBtn');
    const toolBtn = document.getElementById('toolTodosBtn');

    if (!panel) {
        console.error('Panneau TODOs introuvable');
        return;
    }

    if (panel.classList.contains('visible')) {
        panel.classList.remove('visible');
        if (btn) btn.classList.remove('active');
        if (toolBtn) toolBtn.classList.remove('active');
    } else {
        renderTodosPanel();
        panel.classList.add('visible');
        if (btn) btn.classList.add('active');
        if (toolBtn) toolBtn.classList.add('active');
    }
}

/**
 * [MVVM : View]
 * Ferme le panneau des TODOs.
 */
function closeTodosPanel() {
    const panel = document.getElementById('todosPanel');
    const btn = document.getElementById('sidebarTodosBtn');
    const toolBtn = document.getElementById('toolTodosBtn');

    if (panel) {
        panel.classList.remove('visible');
    }
    if (btn) btn.classList.remove('active');
    if (toolBtn) toolBtn.classList.remove('active');
}

/**
 * [MVVM : View]
 * Rendu du panneau latéral des TODOs.
 */
function renderTodosPanel() {
    const panel = document.getElementById('todosPanelContent');
    const parentPanel = document.getElementById('todosPanel');

    if (!panel || !parentPanel) {
        console.error('Panneau TODOs introuvable');
        return;
    }

    // Récupérer les données via le ViewModel
    const viewModel = getTodosPanelViewModel();

    if (!viewModel.hasTodos) {
        panel.innerHTML = `
            <div class="annotations-panel-header">
                <h3 style="margin: 0;">
                    <i data-lucide="check-square" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;"></i>
                    TODOs (0)
                </h3>
                <span class="annotations-panel-close" onclick="closeTodosPanel()" title="Fermer">×</span>
            </div>
            <p style="text-align: center; color: var(--text-muted); padding: 2rem;">
                Aucun TODO dans le projet
            </p>
        `;
    } else {
        panel.innerHTML = `
            <div class="annotations-panel-header">
                <h3 style="margin: 0;">
                    <i data-lucide="check-square" style="width:18px;height:18px;vertical-align:middle;margin-right:6px;"></i>
                    TODOs (${viewModel.pendingCount} actif${viewModel.pendingCount > 1 ? 's' : ''})
                </h3>
                <span class="annotations-panel-close" onclick="closeTodosPanel()" title="Fermer">×</span>
            </div>
            
            ${viewModel.pendingTodos.length > 0 ? `
                <div style="margin-bottom: 1rem;">
                    <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">
                        À faire
                    </div>
                    ${viewModel.pendingTodos.map(todo => `
                        <div class="annotation-card todo" 
                             onclick="handleTodoCardClick(${todo.actId}, ${todo.chapterId}, ${todo.sceneId})" 
                             style="cursor: pointer;">
                            <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.25rem;">
                                ${escapeHtml(todo.sceneTitle)}
                            </div>
                            <div class="annotation-content">${escapeHtml(todo.text)}</div>
                            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                                <button class="btn btn-small" 
                                        onclick="event.stopPropagation(); handleTodoToggle(${todo.actId}, ${todo.chapterId}, ${todo.sceneId}, ${todo.id})">
                                    Marquer terminé
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${viewModel.completedTodos.length > 0 ? `
                <div>
                    <div style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); margin-bottom: 0.5rem; text-transform: uppercase;">
                        Terminés (${viewModel.completedCount})
                    </div>
                    ${viewModel.completedTodos.map(todo => `
                        <div class="annotation-card" 
                             style="opacity: 0.6; cursor: pointer;" 
                             onclick="handleTodoCardClick(${todo.actId}, ${todo.chapterId}, ${todo.sceneId})">
                            <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 0.25rem;">
                                ${escapeHtml(todo.sceneTitle)}
                            </div>
                            <div class="annotation-content" style="text-decoration: line-through;">
                                ${escapeHtml(todo.text)}
                            </div>
                            <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                                <button class="btn btn-small" 
                                        onclick="event.stopPropagation(); handleTodoToggle(${todo.actId}, ${todo.chapterId}, ${todo.sceneId}, ${todo.id})">
                                    Rouvrir
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    }

    // Afficher le panneau
    parentPanel.classList.add('visible');

    // Rafraîchir les icônes Lucide
    refreshLucideIcons();
}

// ============================================
// VIEW - LISTE COMPLÈTE DES TODOS
// ============================================

/**
 * [MVVM : View]
 * Rendu de la vue complète de la liste des TODOs (dans editorView).
 */
function renderTodosList() {
    const editorView = document.getElementById('editorView');
    if (!editorView) {
        console.error('editorView not found');
        return;
    }

    // Récupérer les données via le ViewModel
    const viewModel = getTodosListViewModel();

    if (!viewModel.hasTodos) {
        editorView.innerHTML = `
            <div style="height: 100%; overflow-y: auto; padding: 3rem; text-align: center; color: var(--text-muted); font-size: 1.2rem;">
                📝 Aucun TODO<br><br>
                <small style="font-size: 0.9rem;">
                    Les TODOs apparaissent lorsque vous utilisez le mode révision
                </small>
            </div>
        `;
    } else {
        editorView.innerHTML = `
            <div style="height: 100%; overflow-y: auto; padding: 2rem 3rem;">
                <h2 style="margin-bottom: 2rem; color: var(--accent-gold);">
                    <i data-lucide="check-square" style="width:24px;height:24px;vertical-align:middle;margin-right:8px;"></i>
                    TODOs (${viewModel.activeCount} actifs)
                </h2>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
                ${viewModel.todos.map(todo => `
                    <div class="todo-item" 
                         onclick="handleTodoListClick(${todo.actId}, ${todo.chapterId}, ${todo.sceneId})" 
                         style="display: flex; gap: 1rem; padding: 1rem; background: var(--bg-secondary); border-left: 3px solid ${todo.completed ? 'var(--text-muted)' : 'var(--accent-gold)'}; border-radius: 4px; cursor: pointer; transition: all 0.2s;">
                        <input type="checkbox" ${todo.completed ? 'checked' : ''} 
                               onclick="event.stopPropagation(); handleTodoListToggle(${todo.id}, ${todo.actId}, ${todo.chapterId}, ${todo.sceneId})"
                               style="margin-top: 0.25rem;">
                        <div style="flex: 1;">
                            <div style="font-size: 1rem; ${todo.completed ? 'text-decoration: line-through; opacity: 0.6;' : 'font-weight: 500;'}">
                                ${escapeHtml(todo.text)}
                            </div>
                            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.5rem;">
                                📍 ${escapeHtml(todo.actTitle)} › ${escapeHtml(todo.chapterTitle)} › ${escapeHtml(todo.sceneTitle)}
                            </div>
                        </div>
                    </div>
                `).join('')}
                </div>
            </div>
        `;
    }

    refreshLucideIcons();
}

// ============================================
// VIEW - GESTIONNAIRES D'ÉVÉNEMENTS
// ============================================

/**
 * [MVVM : View]
 * Gère le clic sur une carte TODO (navigation vers la scène).
 * @param {number} actId - ID de l'acte.
 * @param {number} chapterId - ID du chapitre.
 * @param {number} sceneId - ID de la scène.
 */
function handleTodoCardClick(actId, chapterId, sceneId) {
    const viewModel = navigateToTodoSceneViewModel(actId, chapterId, sceneId);
    processTodoSideEffects(viewModel);
}

/**
 * [MVVM : View]
 * Gère le basculement d'un TODO depuis le panneau.
 * @param {number} actId - ID de l'acte.
 * @param {number} chapterId - ID du chapitre.
 * @param {number} sceneId - ID de la scène.
 * @param {number} todoId - ID du TODO.
 */
function handleTodoToggle(actId, chapterId, sceneId, todoId) {
    const result = toggleTodoViewModel(actId, chapterId, sceneId, todoId);
    processTodoSideEffects(result);
}

/**
 * [MVVM : View]
 * Gère le clic sur un TODO depuis la liste complète.
 * @param {number} actId - ID de l'acte.
 * @param {number} chapterId - ID du chapitre.
 * @param {number} sceneId - ID de la scène.
 */
function handleTodoListClick(actId, chapterId, sceneId) {
    const viewModel = navigateToTodoSceneViewModel(actId, chapterId, sceneId);
    processTodoSideEffects(viewModel);
}

/**
 * [MVVM : View]
 * Gère le basculement d'un TODO depuis la liste complète.
 * @param {number} todoId - ID du TODO.
 * @param {number} actId - ID de l'acte.
 * @param {number} chapterId - ID du chapitre.
 * @param {number} sceneId - ID de la scène.
 */
function handleTodoListToggle(todoId, actId, chapterId, sceneId) {
    const result = toggleTodoViewModel(actId, chapterId, sceneId, todoId);
    
    // Pour la liste complète, on rafraîchit la liste au lieu du panneau
    if (result.success) {
        saveProject();
        renderTodosList();
        if (typeof renderActsList === 'function') {
            renderActsList();
        }
    }
}

// ============================================
// VIEW - UTILITAIRES
// ============================================

/**
 * [MVVM : View]
 * Rafraîchit les icônes Lucide.
 */
function refreshLucideIcons() {
    setTimeout(() => {
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            lucide.createIcons();
        }
    }, 10);
}

/**
 * [MVVM : View]
 * Échappe les caractères HTML pour éviter les injections XSS.
 * @param {string} text - Texte à échapper.
 * @returns {string} Texte échappé.
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// VIEW - BADGES D'ANNOTATIONS (EXTENSION)
// ============================================

/**
 * [MVVM : View]
 * Extension du rendu de la liste des actes pour afficher les badges de TODOs.
 * Cette fonction est appelée après renderActsList.
 */
function renderTodoBadges() {
    if (!project || !project.acts) return;

    project.acts.forEach(act => {
        act.chapters.forEach(chapter => {
            chapter.scenes.forEach(scene => {
                const sceneElement = document.querySelector(`[data-scene-id="${scene.id}"]`);
                if (!sceneElement) return;

                const stats = getSceneTodosStatsViewModel(act.id, chapter.id, scene.id);
                
                if (stats.hasTodos) {
                    const textSpan = sceneElement.querySelector('div > span:not(.drag-handle)');
                    if (textSpan && !textSpan.querySelector('.scene-badge')) {
                        let badgeHTML = `<span class="scene-badge">${stats.totalCount}</span>`;
                        if (stats.pendingCount > 0) {
                            badgeHTML += `<span class="scene-badge" style="background: var(--accent-red);">✓${stats.pendingCount}</span>`;
                        }
                        textSpan.innerHTML += badgeHTML;
                    }
                }
            });
        });
    });
}

// ============================================
// VIEW - POSITIONNEMENT DU PANNEAU
// ============================================

/**
 * [MVVM : View]
 * Calcule et positionne le panneau d'annotations en fonction de la toolbar.
 */
function updateAnnotationsPanelPosition() {
    const header = document.querySelector('.editor-header');
    const toolbar = document.querySelector('.editor-toolbar, .revision-toolbar');
    const linksPanel = document.getElementById('linksPanel');
    const panel = document.getElementById('annotationsPanel');

    if (header && toolbar && panel) {
        let totalHeight = header.offsetHeight + toolbar.offsetHeight;
        if (linksPanel && linksPanel.style.display !== 'none') {
            totalHeight += linksPanel.offsetHeight;
        }
        panel.style.setProperty('--toolbar-height', totalHeight + 'px');
    }
}

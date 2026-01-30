// ============================================
// ARC BOARD - Views (HTML Rendering)
// ============================================

/**
 * Vue principale - Génère le HTML
 */
const ArcBoardView = {
    // ==========================================
    // SIDEBAR
    // ==========================================

    /**
     * Rendu de la sidebar avec la liste des arcs
     */
    renderSidebar() {
        const list = document.getElementById('arcsList');
        if (!list) return;

        ArcRepository.init();
        const arcs = ArcRepository.getAll();

        let html = '';

        // Formulaire de création d'arc
        if (ArcBoardState.showingArcForm) {
            html += this._renderArcForm();
        }

        // Formulaire de création de catégorie
        if (ArcBoardState.showingCategoryForm) {
            html += this._renderCategoryForm();
        }

        if (arcs.length === 0 && !ArcBoardState.showingArcForm && !ArcBoardState.showingCategoryForm) {
            html += `
                <div class="sidebar-empty">
                    <div class="sidebar-empty-icon"><i data-lucide="layout-dashboard"></i></div>
                    <p>Aucun arc narratif</p>
                </div>
            `;
        } else if (arcs.length > 0) {
            html += this._renderArcsByCategory(arcs);
        }

        // Bouton nouvelle catégorie
        if (!ArcBoardState.showingCategoryForm && !ArcBoardState.showingArcForm) {
            html += `
                <div class="sidebar-tree-add" onclick="ArcBoardViewModel.showCategoryForm()">
                    <i data-lucide="folder-plus"></i>
                    <span>Nouvelle catégorie</span>
                </div>
            `;
        }

        list.innerHTML = html;
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Focus sur le formulaire
        if (ArcBoardState.showingArcForm) {
            document.getElementById('inlineArcTitle')?.focus();
        } else if (ArcBoardState.showingCategoryForm) {
            document.getElementById('inlineCategoryName')?.focus();
        }
    },

    _renderArcsByCategory(arcs) {
        const allCategories = ArcRepository.getAllCategories();
        const arcsByCategory = {};
        const uncategorized = [];

        arcs.forEach(arc => {
            const cat = arc.category || 'uncategorized';
            if (cat === 'uncategorized' || !allCategories[cat]) {
                uncategorized.push(arc);
            } else {
                if (!arcsByCategory[cat]) arcsByCategory[cat] = [];
                arcsByCategory[cat].push(arc);
            }
        });

        let html = '';

        // Non catégorisés en premier
        if (uncategorized.length > 0) {
            html += this._renderCategory('uncategorized', {
                label: 'Non catégorisé',
                icon: 'folder',
                color: 'var(--text-muted)'
            }, uncategorized);
        }

        // Autres catégories
        Object.entries(allCategories).forEach(([key, data]) => {
            const categoryArcs = arcsByCategory[key] || [];
            if (categoryArcs.length > 0) {
                html += this._renderCategory(key, data, categoryArcs);
            }
        });

        return html;
    },

    _renderCategory(key, data, arcs) {
        const isExpanded = !ArcRepository.isCategoryCollapsed(key);
        return `
            <div class="sidebar-tree-category" data-category="${key}">
                <div class="sidebar-tree-header" onclick="ArcRepository.toggleCategoryCollapse('${key}'); ArcBoardView.renderSidebar();">
                    <span class="sidebar-tree-toggle">
                        <i data-lucide="${isExpanded ? 'chevron-down' : 'chevron-right'}"></i>
                    </span>
                    <span class="sidebar-tree-icon" style="color: ${data.color}">
                        <i data-lucide="${data.icon}"></i>
                    </span>
                    <span class="sidebar-tree-label">${data.label}</span>
                    <span class="sidebar-tree-count">${arcs.length}</span>
                </div>
                <div class="sidebar-tree-children ${isExpanded ? '' : 'collapsed'}">
                    ${arcs.map(arc => this._renderArcItem(arc)).join('')}
                </div>
            </div>
        `;
    },

    _renderArcItem(arc) {
        const isActive = ArcBoardState.currentArcId === arc.id;
        const allCategories = ArcRepository.getAllCategories();
        const catData = allCategories[arc.category] || { color: '#999' };

        return `
            <div class="sidebar-tree-item ${isActive ? 'active' : ''}"
                 onclick="ArcBoardViewModel.openArc('${arc.id}')"
                 data-arc-id="${arc.id}">
                <span class="sidebar-tree-item-dot" style="background: ${arc.color || catData.color}"></span>
                <span class="sidebar-tree-item-title">${arc.title || 'Sans titre'}</span>
                <button class="sidebar-tree-item-menu" onclick="event.stopPropagation(); ArcBoardView.showArcContextMenu(event, '${arc.id}')">
                    <i data-lucide="more-horizontal"></i>
                </button>
            </div>
        `;
    },

    _renderArcForm() {
        const allCategories = ArcRepository.getAllCategories();
        const editingArc = ArcBoardState.editingArcId
            ? ArcRepository.getById(ArcBoardState.editingArcId)
            : null;

        const isEditing = !!editingArc;
        const formTitle = isEditing ? "Modifier l'arc" : 'Nouvel arc narratif';
        const buttonText = isEditing ? 'Enregistrer' : 'Créer';

        const arcTitle = editingArc?.title || '';
        const arcCategory = editingArc?.category || 'intrigue';
        const arcColor = editingArc?.color || '#e74c3c';

        return `
            <div class="sidebar-inline-form" id="arc-form-panel">
                <div class="sidebar-inline-form-header">
                    <i data-lucide="${isEditing ? 'settings' : 'sparkles'}"></i>
                    <span>${formTitle}</span>
                    <button class="sidebar-inline-form-close" onclick="ArcBoardViewModel.hideArcForm()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="sidebar-inline-form-body">
                    <input type="hidden" id="inlineArcId" value="${ArcBoardState.editingArcId || ''}">
                    <div class="sidebar-inline-form-group">
                        <label>Titre *</label>
                        <input type="text" id="inlineArcTitle" class="sidebar-inline-input"
                               placeholder="Ex: La quête de rédemption"
                               value="${arcTitle.replace(/"/g, '&quot;')}"
                               onkeydown="ArcBoardEventHandlers.handleArcFormKeydown(event)">
                    </div>
                    <div class="sidebar-inline-form-group">
                        <label>Catégorie</label>
                        <select id="inlineArcCategory" class="sidebar-inline-select" onchange="ArcBoardEventHandlers.updateArcFormColor()">
                            ${Object.entries(allCategories).map(([key, cat]) =>
            `<option value="${key}" ${key === arcCategory ? 'selected' : ''}>${cat.label}</option>`
        ).join('')}
                        </select>
                    </div>
                    <div class="sidebar-inline-form-group">
                        <label>Couleur</label>
                        <div class="sidebar-inline-color-row">
                            <input type="color" id="inlineArcColor" value="${arcColor}" class="sidebar-inline-color">
                            <span id="inlineArcColorHex" class="sidebar-inline-color-hex">${arcColor}</span>
                        </div>
                    </div>
                    <div class="sidebar-inline-form-actions">
                        <button class="btn-secondary btn-sm" onclick="ArcBoardViewModel.hideArcForm()">Annuler</button>
                        <button class="btn-primary btn-sm" onclick="ArcBoardEventHandlers.confirmArcForm()">
                            <i data-lucide="${isEditing ? 'save' : 'plus'}"></i> ${buttonText}
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    _renderCategoryForm() {
        return `
            <div class="sidebar-inline-form">
                <div class="sidebar-inline-form-header">
                    <i data-lucide="folder-plus"></i>
                    <span>Nouvelle catégorie</span>
                    <button class="sidebar-inline-form-close" onclick="ArcBoardViewModel.hideCategoryForm()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="sidebar-inline-form-body">
                    <div class="sidebar-inline-form-group">
                        <label>Nom *</label>
                        <input type="text" id="inlineCategoryName" class="sidebar-inline-input"
                               placeholder="Ex: Arcs de croissance"
                               onkeydown="ArcBoardEventHandlers.handleCategoryFormKeydown(event)">
                    </div>
                    <div class="sidebar-inline-form-group">
                        <label>Couleur</label>
                        <div class="sidebar-inline-color-row">
                            <input type="color" id="inlineCategoryColor" value="#6c757d" class="sidebar-inline-color">
                        </div>
                    </div>
                    <div class="sidebar-inline-form-actions">
                        <button class="btn-secondary btn-sm" onclick="ArcBoardViewModel.hideCategoryForm()">Annuler</button>
                        <button class="btn-primary btn-sm" onclick="ArcBoardEventHandlers.confirmCategoryForm()">
                            <i data-lucide="plus"></i> Créer
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    // ==========================================
    // CANVAS
    // ==========================================

    /**
     * Rendu du canvas principal
     */
    renderCanvas(arc) {
        const view = document.getElementById('editorView');
        if (!view) return;

        // En mode Split, rendu différent
        if (ArcBoardState.multiArcMode === MultiArcModes.SPLIT) {
            view.innerHTML = this._renderSplitMode();
            if (typeof lucide !== 'undefined') lucide.createIcons();
            return;
        }

        view.innerHTML = `
            <div class="arc-board-container">
                ${this._renderToolbar()}
                ${this._renderMultiArcBar(arc)}

                <!-- Zone Non attribué en sidebar -->
                <div id="arcUnassignedSidebar"></div>

                <div class="arc-board-canvas-wrapper">
                    <div class="arc-board-canvas" id="arcBoardCanvas"
                         onmousedown="ArcBoardEventHandlers.onCanvasMouseDown(event)"
                         onmousemove="ArcBoardEventHandlers.onCanvasMouseMove(event)"
                         onmouseup="ArcBoardEventHandlers.onCanvasMouseUp(event)"
                         onwheel="ArcBoardEventHandlers.onCanvasWheel(event)"
                         oncontextmenu="ArcBoardEventHandlers.onCanvasContextMenu(event)"
                         ondrop="DragDropService.handleCanvasDrop(event)"
                         ondragover="DragDropService.handleCanvasDragOver(event)"
                         ondragleave="DragDropService.handleCanvasDragLeave(event)">

                        <div class="arc-board-content" id="arcBoardContent"
                             style="transform: scale(${ArcBoardState.zoom}) translate(${ArcBoardState.panX}px, ${ArcBoardState.panY}px)">

                            <!-- Ghost layers pour mode Compare (DANS le content pour suivre le zoom) -->
                            ${ArcBoardState.multiArcMode === MultiArcModes.COMPARE ? this._renderGhostLayers() : ''}

                            <div class="arc-connections-layer" id="arcConnectionsLayer">
                                <svg id="arcConnectionsSvg">
                                    <defs>
                                        <marker id="arrowhead" markerWidth="10" markerHeight="7"
                                                refX="9" refY="3.5" orient="auto">
                                            <polygon points="0 0, 10 3.5, 0 7" class="arc-connection-arrow"/>
                                        </marker>
                                    </defs>
                                </svg>
                            </div>

                            <div id="arcBoardItems"></div>
                        </div>

                        <div class="arc-connection-mode-hint" id="connectionModeHint" style="display:none">
                            <i data-lucide="git-branch"></i>
                            <span id="connectionHintText">Cliquez sur l'élément source</span>
                            <button onclick="ConnectionService.cancel()"><i data-lucide="x"></i> Annuler</button>
                        </div>

                        ${arc.board.items.length === 0 ? this._renderEmptyState() : ''}
                    </div>

                    ${this._renderZoomControls()}
                </div>

                ${this._renderContextPanel(arc)}
            </div>

            <input type="file" id="arcFileInput" style="display:none" accept="image/*"
                   onchange="ArcBoardEventHandlers.onFileUpload(event)">
        `;

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    _renderToolbar() {
        // Génère un bouton draggable pour les items de création
        const draggableBtn = (type, tooltip, icon) => `
            <button class="arc-toolbar-btn arc-toolbar-draggable"
                    data-tooltip="${tooltip}"
                    data-item-type="${type}"
                    draggable="true"
                    onclick="ArcBoardViewModel.addItem('${type}')"
                    ondragstart="DragDropService.startToolbarDrag(event, '${type}')"
                    ondragend="DragDropService.endDrag(event)">
                <i data-lucide="${icon}"></i>
            </button>
        `;

        return `
            <div class="arc-board-toolbar">
                <button class="arc-toolbar-btn ${ArcBoardState.activeTool === 'select' ? 'active' : ''}"
                        data-tool="select" data-tooltip="Sélection" onclick="ArcBoardViewModel.setTool('select')">
                    <i data-lucide="mouse-pointer-2"></i>
                </button>
                <button class="arc-toolbar-btn ${ArcBoardState.activeTool === 'pan' ? 'active' : ''}"
                        data-tool="pan" data-tooltip="Déplacer" onclick="ArcBoardViewModel.setTool('pan')">
                    <i data-lucide="hand"></i>
                </button>

                <div class="arc-toolbar-separator"></div>

                ${draggableBtn('note', 'Note (glisser-déposer)', 'file-text')}
                ${draggableBtn('column', 'Colonne (glisser-déposer)', 'columns-3')}
                ${draggableBtn('link', 'Lien (glisser-déposer)', 'link')}
                ${draggableBtn('todo', 'Tâches (glisser-déposer)', 'check-square')}
                ${draggableBtn('comment', 'Commentaire (glisser-déposer)', 'message-square')}
                ${draggableBtn('table', 'Tableau (glisser-déposer)', 'table')}

                <div class="arc-toolbar-separator"></div>

                ${draggableBtn('image', 'Image (glisser-déposer)', 'image')}
                <button class="arc-toolbar-btn" data-tooltip="Upload" onclick="document.getElementById('arcFileInput').click()">
                    <i data-lucide="upload"></i>
                </button>

                <div class="arc-toolbar-separator"></div>

                <button class="arc-toolbar-btn ${ArcBoardState.activeTool === 'connect' ? 'active' : ''}"
                        data-tool="connect" data-tooltip="Connexion" onclick="ConnectionService.toggle()">
                    <i data-lucide="git-branch"></i>
                </button>

                <div style="flex:1"></div>

                <button class="arc-toolbar-btn" data-tooltip="Supprimer" onclick="ArcBoardViewModel.deleteSelected()">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;
    },

    _renderZoomControls() {
        return `
            <div class="arc-zoom-controls">
                <button class="arc-zoom-btn" onclick="ArcBoardViewModel.zoom(-1)" title="Zoom arrière">
                    <i data-lucide="zoom-out"></i>
                </button>
                <span class="arc-zoom-level" id="arcZoomLevel">${Math.round(ArcBoardState.zoom * 100)}%</span>
                <button class="arc-zoom-btn" onclick="ArcBoardViewModel.zoom(1)" title="Zoom avant">
                    <i data-lucide="zoom-in"></i>
                </button>
                <button class="arc-zoom-btn" onclick="ArcBoardViewModel.resetView()" title="Réinitialiser">
                    <i data-lucide="maximize-2"></i>
                </button>
            </div>
        `;
    },

    _renderEmptyState() {
        return `
            <div class="arc-board-empty">
                <div class="arc-board-empty-icon"><i data-lucide="layout-dashboard"></i></div>
                <div class="arc-board-empty-title">Board vide</div>
                <div class="arc-board-empty-text">
                    Utilisez la barre d'outils à gauche pour ajouter<br>
                    des colonnes, notes, images et plus encore.
                </div>
            </div>
        `;
    },

    // ==========================================
    // MULTI-ARCS
    // ==========================================

    /**
     * Rendu de la barre multi-arcs (version compacte sur une ligne)
     */
    _renderMultiArcBar(arc) {
        const mode = ArcBoardState.multiArcMode;
        const allArcs = ArcRepository.getAll();
        const availableArcs = ArcBoardViewModel.getAvailableArcsForAdd();

        // Tags des arcs fantômes
        const ghostTagsHtml = ArcBoardState.ghostArcs.map(ghostId => {
            const ghostArc = ArcRepository.getById(ghostId);
            if (!ghostArc) return '';
            return `<span class="arc-multi-tag" style="--tag-color: ${ghostArc.color}">
                <span class="arc-multi-dot" style="background:${ghostArc.color}"></span>
                ${ghostArc.title}
                <button onclick="ArcBoardViewModel.removeGhostArc('${ghostId}')"><i data-lucide="x"></i></button>
            </span>`;
        }).join('');

        return `
            <div class="arc-multi-bar">
                <div class="arc-multi-left">
                    <select class="arc-multi-select" onchange="ArcBoardViewModel.openArc(this.value)">
                        ${allArcs.map(a => `<option value="${a.id}" ${a.id === arc.id ? 'selected' : ''}>${a.title}</option>`).join('')}
                    </select>
                </div>

                <div class="arc-multi-modes">
                    <button class="${mode === MultiArcModes.SOLO ? 'active' : ''}" onclick="ArcBoardViewModel.setMultiArcMode('solo')">Solo</button>
                    <button class="${mode === MultiArcModes.COMPARE ? 'active' : ''}" onclick="ArcBoardViewModel.setMultiArcMode('compare')">Comparer</button>
                    <button class="${mode === MultiArcModes.SPLIT ? 'active' : ''}" onclick="ArcBoardViewModel.setMultiArcMode('split')">Split</button>
                </div>

                ${mode === MultiArcModes.COMPARE ? `
                    <div class="arc-multi-ghosts">
                        ${ghostTagsHtml}
                        ${availableArcs.length > 0 ? `
                            <select class="arc-multi-add" onchange="if(this.value) { ArcBoardViewModel.addGhostArc(this.value); this.value=''; }">
                                <option value="">+ Arc...</option>
                                ${availableArcs.map(a => `<option value="${a.id}">${a.title}</option>`).join('')}
                            </select>
                        ` : ''}
                        <input type="range" class="arc-multi-opacity" min="10" max="100" value="${Math.round(ArcBoardState.ghostOpacity * 100)}"
                               onchange="ArcBoardViewModel.setGhostOpacity(this.value / 100)"
                               oninput="ArcBoardViewModel.setGhostOpacity(this.value / 100)"
                               title="Opacité: ${Math.round(ArcBoardState.ghostOpacity * 100)}%">
                    </div>
                ` : ''}
            </div>
        `;
    },

    /**
     * Rendu des layers fantômes (mode Compare)
     * Note: Le layer est DANS arc-board-content donc il suit automatiquement le zoom/pan
     */
    _renderGhostLayers() {
        if (ArcBoardState.ghostArcs.length === 0) return '';

        return ArcBoardState.ghostArcs.map(ghostId => {
            const ghostArc = ArcRepository.getById(ghostId);
            if (!ghostArc || !ghostArc.board) return '';

            return `
                <div class="arc-ghost-layer"
                     data-arc-id="${ghostId}"
                     style="opacity: ${ArcBoardState.ghostOpacity}; --ghost-color: ${ghostArc.color}">
                    ${this._renderGhostItems(ghostArc)}
                    ${this._renderGhostConnections(ghostArc)}
                </div>
            `;
        }).join('');
    },

    /**
     * Rendu des items d'un arc fantôme
     */
    _renderGhostItems(arc) {
        return arc.board.items.map(item => {
            if (item.type === 'column') {
                return `
                    <div class="arc-ghost-column"
                         style="left:${item.x}px; top:${item.y}px; width:${item.width || 280}px"
                         data-item-id="${item.id}"
                         data-arc-id="${arc.id}">
                        <div class="arc-ghost-column-header">
                            <span>${item.title || 'Colonne'}</span>
                            <span class="arc-ghost-card-count">${item.cards?.length || 0}</span>
                        </div>
                        <div class="arc-ghost-column-body">
                            ${(item.cards || []).slice(0, 3).map(card => `
                                <div class="arc-ghost-card">${this._getGhostCardPreview(card)}</div>
                            `).join('')}
                            ${(item.cards?.length || 0) > 3 ? `<div class="arc-ghost-more">+${item.cards.length - 3} autres</div>` : ''}
                        </div>
                    </div>
                `;
            } else {
                return `
                    <div class="arc-ghost-item arc-ghost-${item.type}"
                         style="left:${item.x}px; top:${item.y}px; ${item.width ? `width:${item.width}px` : ''}"
                         data-item-id="${item.id}"
                         data-arc-id="${arc.id}">
                        ${this._getGhostItemPreview(item)}
                    </div>
                `;
            }
        }).join('');
    },

    _getGhostCardPreview(card) {
        switch (card.type) {
            case 'scene': return `<i data-lucide="film"></i> ${card.sceneTitle || 'Scène'}`;
            case 'note': return `<i data-lucide="file-text"></i> ${(card.content || '').substring(0, 30)}...`;
            case 'todo': return `<i data-lucide="check-square"></i> ${card.title || 'Tâches'}`;
            default: return `<i data-lucide="file"></i> ${card.type}`;
        }
    },

    _getGhostItemPreview(item) {
        switch (item.type) {
            case 'note': return `<i data-lucide="file-text"></i>`;
            case 'image': return `<i data-lucide="image"></i>`;
            case 'todo': return `<i data-lucide="check-square"></i>`;
            case 'link': return `<i data-lucide="link"></i>`;
            default: return `<i data-lucide="file"></i>`;
        }
    },

    /**
     * Rendu des connexions d'un arc fantôme
     */
    _renderGhostConnections(arc) {
        if (!arc.board.connections || arc.board.connections.length === 0) return '';

        return `
            <svg class="arc-ghost-connections">
                ${arc.board.connections.map(conn => {
                    const fromItem = arc.board.items.find(i => i.id === conn.from);
                    const toItem = arc.board.items.find(i => i.id === conn.to);
                    if (!fromItem || !toItem) return '';

                    const fromPos = this._getConnectionPoint(fromItem, conn.fromSide);
                    const toPos = this._getConnectionPoint(toItem, conn.toSide);
                    const path = this._createConnectionPath(fromPos, toPos);

                    return `<path d="${path}" class="arc-ghost-connection-line" />`;
                }).join('')}
            </svg>
        `;
    },

    /**
     * Rendu du mode Split (panneaux côte à côte)
     */
    _renderSplitMode() {
        const splitArcs = ArcBoardState.splitArcs;
        const layout = ArcBoardState.splitLayout;
        const availableArcs = ArcBoardViewModel.getAvailableArcsForAdd();

        const panelsHtml = splitArcs.map((panel, index) => {
            const arc = ArcRepository.getById(panel.id);
            if (!arc) return '';

            return `
                <div class="arc-split-panel" data-arc-id="${panel.id}" data-panel-index="${index}">
                    <div class="arc-split-panel-header">
                        <div class="arc-split-panel-title">
                            <span class="arc-multi-dot" style="background:${arc.color}"></span>
                            <select class="arc-split-select" onchange="ArcBoardViewModel.changeSplitPanelArc(${index}, this.value)">
                                ${ArcRepository.getAll().map(a => `
                                    <option value="${a.id}" ${a.id === panel.id ? 'selected' : ''}>${a.title}</option>
                                `).join('')}
                            </select>
                        </div>
                        ${splitArcs.length > 1 ? `
                            <button class="arc-split-close" onclick="ArcBoardViewModel.removeSplitPanel('${panel.id}')" title="Fermer">
                                <i data-lucide="x"></i>
                            </button>
                        ` : ''}
                    </div>
                    <div class="arc-split-canvas"
                         id="splitCanvas-${panel.id}"
                         data-arc-id="${panel.id}"
                         onmousedown="ArcBoardEventHandlers.onSplitCanvasMouseDown(event, '${panel.id}')"
                         onmousemove="ArcBoardEventHandlers.onSplitCanvasMouseMove(event, '${panel.id}')"
                         onmouseup="ArcBoardEventHandlers.onSplitCanvasMouseUp(event, '${panel.id}')"
                         onwheel="ArcBoardEventHandlers.onSplitCanvasWheel(event, '${panel.id}')">
                        <div class="arc-split-content"
                             id="splitContent-${panel.id}"
                             style="transform: scale(${panel.zoom}) translate(${panel.panX}px, ${panel.panY}px)">
                            ${this._renderSplitPanelItems(arc)}
                            ${this._renderSplitPanelConnections(arc)}
                        </div>
                    </div>
                    <div class="arc-split-zoom">
                        <button onclick="ArcBoardViewModel.zoomSplitPanel('${panel.id}', -1)"><i data-lucide="zoom-out"></i></button>
                        <span>${Math.round(panel.zoom * 100)}%</span>
                        <button onclick="ArcBoardViewModel.zoomSplitPanel('${panel.id}', 1)"><i data-lucide="zoom-in"></i></button>
                    </div>
                </div>
            `;
        }).join('');

        const addPanelOptions = availableArcs.map(a =>
            `<option value="${a.id}">${a.title}</option>`
        ).join('');

        return `
            <div class="arc-split-container">
                <div class="arc-split-bar">
                    <div class="arc-split-bar-left">
                        <div class="arc-split-layout-toggle">
                            <button class="${layout === 'vertical' ? 'active' : ''}"
                                    onclick="ArcBoardViewModel.setSplitLayout('vertical')"
                                    title="Côte à côte">
                                <i data-lucide="columns-2"></i>
                            </button>
                            <button class="${layout === 'horizontal' ? 'active' : ''}"
                                    onclick="ArcBoardViewModel.setSplitLayout('horizontal')"
                                    title="Empilé">
                                <i data-lucide="rows-2"></i>
                            </button>
                        </div>
                        ${availableArcs.length > 0 ? `
                            <select class="arc-split-add-select" onchange="if(this.value) { ArcBoardViewModel.addSplitPanel(this.value); this.value=''; }">
                                <option value="">+ Panneau</option>
                                ${addPanelOptions}
                            </select>
                        ` : ''}
                    </div>
                    <button class="arc-split-exit" onclick="ArcBoardViewModel.setMultiArcMode('solo')">
                        <i data-lucide="x"></i>
                        Quitter
                    </button>
                </div>

                <div class="arc-split-panels ${layout === 'horizontal' ? 'arc-split-horizontal' : 'arc-split-vertical'}">
                    ${panelsHtml}
                </div>
            </div>
        `;
    },

    _renderSplitPanelItems(arc) {
        return arc.board.items.map(item => {
            if (item.type === 'column') {
                return `
                    <div class="arc-column arc-split-column"
                         style="left:${item.x}px; top:${item.y}px; width:${item.width || 280}px"
                         data-item-id="${item.id}">
                        <div class="arc-column-header">
                            <span class="arc-column-title">${item.title || 'Colonne'}</span>
                            <span class="arc-column-count">${item.cards?.length || 0}</span>
                        </div>
                        <div class="arc-column-body">
                            ${(item.cards || []).map(card => `
                                <div class="arc-card arc-card-${card.type}" data-card-id="${card.id}">
                                    ${this._getGhostCardPreview(card)}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
            return '';
        }).join('');
    },

    _renderSplitPanelConnections(arc) {
        if (!arc.board.connections || arc.board.connections.length === 0) return '';

        return `
            <svg class="arc-split-connections">
                ${arc.board.connections.map(conn => {
                    const fromItem = arc.board.items.find(i => i.id === conn.from);
                    const toItem = arc.board.items.find(i => i.id === conn.to);
                    if (!fromItem || !toItem) return '';

                    const fromPos = this._getConnectionPoint(fromItem, conn.fromSide);
                    const toPos = this._getConnectionPoint(toItem, conn.toSide);
                    const path = this._createConnectionPath(fromPos, toPos);

                    return `<path d="${path}" class="arc-connection-line" marker-end="url(#arrowhead)" />`;
                }).join('')}
            </svg>
        `;
    },

    /**
     * Rendu du panneau de connexions inter-arcs (mode Split)
     */
    _renderInterArcConnectionsPanel() {
        const connections = InterArcConnectionRepository.getAll();

        return `
            <div class="arc-interarc-panel">
                <div class="arc-interarc-header">
                    <i data-lucide="git-branch"></i>
                    <span>Connexions inter-arcs</span>
                    <span class="arc-interarc-count">${connections.length}</span>
                </div>
                <div class="arc-interarc-body">
                    ${connections.length === 0 ? `
                        <div class="arc-interarc-empty">
                            Aucune connexion inter-arc.<br>
                            <small>Utilisez l'outil Connexion pour lier des éléments entre les arcs.</small>
                        </div>
                    ` : connections.map(conn => this._renderInterArcConnection(conn)).join('')}
                </div>
                <div class="arc-interarc-footer">
                    <button class="arc-interarc-add" onclick="InterArcConnectionService.startConnection()">
                        <i data-lucide="plus"></i>
                        Nouvelle connexion
                    </button>
                </div>
            </div>
        `;
    },

    _renderInterArcConnection(conn) {
        const fromArc = ArcRepository.getById(conn.fromArcId);
        const toArc = ArcRepository.getById(conn.toArcId);
        const fromItem = fromArc ? BoardItemRepository.getById(conn.fromArcId, conn.fromItemId) : null;
        const toItem = toArc ? BoardItemRepository.getById(conn.toArcId, conn.toItemId) : null;

        const typeLabels = {
            parallel: 'Parallèle',
            cause: 'Cause',
            consequence: 'Conséquence',
            echo: 'Écho',
            contrast: 'Contraste'
        };

        return `
            <div class="arc-interarc-connection" data-connection-id="${conn.id}">
                <div class="arc-interarc-from">
                    <span class="arc-multi-dot" style="background:${fromArc?.color || '#999'}"></span>
                    <span>${fromArc?.title || '?'}</span>
                    <i data-lucide="chevron-right"></i>
                    <span>${fromItem?.title || '?'}</span>
                </div>
                <div class="arc-interarc-type">
                    <select onchange="InterArcConnectionRepository.update('${conn.id}', { type: this.value })">
                        ${Object.entries(typeLabels).map(([key, label]) => `
                            <option value="${key}" ${conn.type === key ? 'selected' : ''}>${label}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="arc-interarc-to">
                    <span class="arc-multi-dot" style="background:${toArc?.color || '#999'}"></span>
                    <span>${toArc?.title || '?'}</span>
                    <i data-lucide="chevron-right"></i>
                    <span>${toItem?.title || '?'}</span>
                </div>
                <button class="arc-interarc-delete" onclick="InterArcConnectionRepository.delete('${conn.id}'); ArcBoardViewModel.render()">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        `;
    },

    /**
     * Helper pour calculer le point de connexion
     */
    _getConnectionPoint(item, side) {
        const width = item.width || 280;
        const height = 200; // Estimation

        switch (side) {
            case 'top': return { x: item.x + width / 2, y: item.y };
            case 'bottom': return { x: item.x + width / 2, y: item.y + height };
            case 'left': return { x: item.x, y: item.y + height / 2 };
            case 'right': return { x: item.x + width, y: item.y + height / 2 };
            default: return { x: item.x + width, y: item.y + height / 2 };
        }
    },

    /**
     * Helper pour créer le path SVG d'une connexion
     */
    _createConnectionPath(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const cx = Math.abs(dx) / 2;

        return `M ${from.x} ${from.y} C ${from.x + cx} ${from.y}, ${to.x - cx} ${to.y}, ${to.x} ${to.y}`;
    },

    _renderContextPanel(arc) {
        return `
            <div class="arc-board-context-panel ${ArcBoardState.contextPanelOpen ? '' : 'collapsed'}" id="arcContextPanel">
                <div class="arc-context-header">
                    <div class="arc-context-title">
                        <i data-lucide="sliders-horizontal"></i>
                        <span>Propriétés</span>
                    </div>
                    <button class="arc-context-close" onclick="ArcBoardViewModel.toggleContextPanel()">
                        <i data-lucide="x"></i>
                    </button>
                </div>
                <div class="arc-context-body" id="arcContextBody">
                    ${this._renderContextPanelDefault(arc)}
                </div>
            </div>
        `;
    },

    _renderContextPanelDefault(arc) {
        const allCategories = ArcRepository.getAllCategories();
        const catData = allCategories[arc.category] || { label: 'Non catégorisé', color: '#999' };

        return `
            <div class="arc-context-section">
                <div class="arc-context-section-title">Arc actuel</div>
                <div style="margin-bottom:12px">
                    <input type="text" class="form-input" value="${arc.title}"
                           onchange="ArcBoardEventHandlers.updateArcTitle(this.value)"
                           style="font-weight:600">
                </div>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                    <span style="width:12px;height:12px;border-radius:50%;background:${arc.color}"></span>
                    <span style="font-size:13px;color:var(--text-secondary)">${catData.label}</span>
                </div>
            </div>

            <div class="arc-context-section">
                <div class="arc-context-section-title">Ajouter au board</div>
                <div class="arc-context-tools">
                    <div class="arc-context-tool" onclick="ArcBoardViewModel.addItem('column')">
                        <i data-lucide="columns-3"></i><span>Colonne</span>
                    </div>
                    <div class="arc-context-tool" onclick="ArcBoardViewModel.addItem('note')">
                        <i data-lucide="file-text"></i><span>Note</span>
                    </div>
                    <div class="arc-context-tool" onclick="ArcBoardViewModel.addItem('image')">
                        <i data-lucide="image"></i><span>Image</span>
                    </div>
                    <div class="arc-context-tool" onclick="ArcBoardViewModel.addItem('todo')">
                        <i data-lucide="check-square"></i><span>Tâches</span>
                    </div>
                </div>
            </div>

            <div class="arc-context-section">
                <div class="arc-context-section-title">Statistiques</div>
                <div style="font-size:13px;color:var(--text-secondary)">
                    <div style="margin-bottom:4px">${arc.board.items.length} élément${arc.board.items.length > 1 ? 's' : ''}</div>
                    <div>${arc.board.connections?.length || 0} connexion${(arc.board.connections?.length || 0) > 1 ? 's' : ''}</div>
                </div>
            </div>
        `;
    },

    renderContextPanelDefault(arc) {
        const body = document.getElementById('arcContextBody');
        if (body) {
            body.innerHTML = this._renderContextPanelDefault(arc);
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    },

    renderContextPanel(item) {
        const body = document.getElementById('arcContextBody');
        if (!body) return;

        body.innerHTML = this._getContextPanelForItem(item);
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    _getContextPanelForItem(item) {
        switch (item.type) {
            case 'column':
                return `
                    <div class="arc-context-section">
                        <div class="arc-context-section-title">Colonne</div>
                        <div class="form-group">
                            <label style="font-size:12px">Titre</label>
                            <input type="text" class="form-input" value="${item.title || ''}"
                                   onchange="ArcBoardViewModel.updateItem('${item.id}', { title: this.value })">
                        </div>
                        <div class="form-group">
                            <label style="font-size:12px">Largeur (px)</label>
                            <input type="number" class="form-input" value="${item.width || ArcBoardConfig.column.defaultWidth}"
                                   min="${ArcBoardConfig.column.minWidth}" max="${ArcBoardConfig.column.maxWidth}"
                                   onchange="ArcBoardViewModel.updateItem('${item.id}', { width: parseInt(this.value) }); ArcBoardViewModel.renderItems();">
                        </div>
                    </div>
                    <div class="arc-context-section">
                        <button class="arc-context-delete" onclick="ArcBoardViewModel.deleteSelected()">
                            <i data-lucide="trash-2"></i> Supprimer
                        </button>
                    </div>
                `;
            default:
                return `
                    <div class="arc-context-section">
                        <div class="arc-context-section-title">Élément</div>
                        <p style="font-size:13px;color:var(--text-secondary)">Type: ${item.type}</p>
                    </div>
                    <div class="arc-context-section">
                        <button class="arc-context-delete" onclick="ArcBoardViewModel.deleteSelected()">
                            <i data-lucide="trash-2"></i> Supprimer
                        </button>
                    </div>
                `;
        }
    },

    // ==========================================
    // ITEMS
    // ==========================================

    /**
     * Rendu de tous les items du board
     */
    renderItems(arc) {
        const itemsContainer = document.getElementById('arcBoardItems');
        const sidebarContainer = document.getElementById('arcUnassignedSidebar');
        if (!itemsContainer || !arc.board) return;

        // Construire la liste des scènes non attribuées depuis scenePresence
        const unassignedScenes = [];
        if (arc.scenePresence) {
            arc.scenePresence
                .filter(p => !p.columnId || p.columnId === null)
                .forEach(presence => {
                    // Récupérer les infos de la scène
                    let sceneTitle = 'Scène sans titre';
                    let breadcrumb = '';

                    for (const act of project.acts) {
                        for (const chapter of act.chapters) {
                            const scene = chapter.scenes.find(s => s.id == presence.sceneId);
                            if (scene) {
                                sceneTitle = scene.title || 'Scène sans titre';
                                breadcrumb = `${act.title || 'Acte'} › ${chapter.title || 'Chapitre'}`;
                                break;
                            }
                        }
                    }

                    unassignedScenes.push({
                        id: 'unassigned_' + presence.sceneId,
                        type: 'scene',
                        sceneId: presence.sceneId,
                        sceneTitle,
                        breadcrumb,
                        intensity: presence.intensity || 3,
                        status: presence.status || 'development',
                        notes: presence.notes || ''
                    });
                });
        }

        // Filtrer les items réguliers (plus de scènes flottantes dans arc.board.items)
        const regularItems = arc.board.items.filter(item => item.type !== 'scene');

        // Rendre la zone "Non attribué" dans la sidebar
        if (sidebarContainer) {
            sidebarContainer.innerHTML = this._renderUnassignedZone(unassignedScenes);
        }

        // Rendre les items normaux dans le canvas
        itemsContainer.innerHTML = regularItems.map(item => this._renderItem(item)).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Masquer l'empty state si items présents
        const emptyState = document.querySelector('.arc-board-empty');
        if (emptyState) {
            emptyState.style.display = arc.board.items.length > 0 ? 'none' : 'block';
        }
    },

    _renderUnassignedZone(floatingScenes) {
        const cardsHtml = floatingScenes.map(scene => this._renderSceneCard(scene)).join('');

        return `
            <div class="arc-unassigned-zone" id="arc-unassigned-zone">
                <div class="arc-unassigned-header">
                    <div class="arc-unassigned-title">
                        <i data-lucide="inbox"></i>
                        <span>Non attribué</span>
                    </div>
                    <span class="arc-unassigned-count">${floatingScenes.length}</span>
                </div>
                <div class="arc-unassigned-body"
                     ondrop="DragDropService.handleUnassignedDrop(event)"
                     ondragover="DragDropService.handleColumnDragOver(event)"
                     ondragleave="DragDropService.handleColumnDragLeave(event)">
                    ${cardsHtml}
                    ${floatingScenes.length === 0 ? `
                        <div class="arc-unassigned-empty">
                            <i data-lucide="check-circle" style="width:24px;height:24px;opacity:0.3;"></i>
                            <span>Toutes les scènes sont organisées</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    _renderSceneCard(scene, isUnassigned = true) {
        const statusLabels = { 'setup': 'Introduction', 'development': 'Développement', 'climax': 'Point culminant', 'resolution': 'Résolution' };

        const dragHandle = `
            <div class="arc-card-drag-handle"
                 draggable="true"
                 ondragstart="DragDropService.startUnassignedDrag(event, '${scene.sceneId}')"
                 ondragend="DragDropService.endDrag(event)"
                 onmousedown="event.stopPropagation()"
                 title="Glisser pour déplacer">
                <i data-lucide="grip-vertical"></i>
            </div>
        `;

        const deleteBtn = `
            <button class="arc-card-delete" onclick="event.stopPropagation(); deleteArcItem('${scene.id}')" title="Supprimer">
                <i data-lucide="x"></i>
            </button>
        `;

        return `
            <div class="arc-card arc-card-scene" data-card-id="${scene.id}" data-scene-id="${scene.sceneId || ''}">
                ${dragHandle}${deleteBtn}
                <div class="arc-card-scene-header">
                    <i data-lucide="book-open"></i>
                    <div class="arc-card-scene-title-wrapper">
                        <div class="arc-card-scene-breadcrumb">${scene.breadcrumb || ''}</div>
                        <div class="arc-card-scene-title">${scene.sceneTitle || 'Scène'}</div>
                    </div>
                </div>
                <div class="arc-card-scene-meta">
                    <div class="arc-card-scene-status">
                        <span class="arc-card-scene-label">Statut:</span>
                        <span class="arc-card-scene-value">${statusLabels[scene.status] || 'Développement'}</span>
                    </div>
                </div>
                <button class="arc-card-scene-open" onclick="ArcBoardEventHandlers.openScene('${scene.sceneId}'); event.stopPropagation();">
                    <i data-lucide="external-link"></i> Ouvrir
                </button>
            </div>
        `;
    },

    _renderItem(item) {
        const isSelected = ArcBoardState.selectedItems.includes(item.id);

        switch (item.type) {
            case 'column': return this._renderColumn(item, isSelected);
            case 'note': return this._renderNote(item, isSelected);
            case 'image': return this._renderImage(item, isSelected);
            case 'link': return this._renderLink(item, isSelected);
            case 'todo': return this._renderTodo(item, isSelected);
            case 'comment': return this._renderComment(item, isSelected);
            case 'table': return this._renderTable(item, isSelected);
            case 'scene': return this._renderSceneItem(item, isSelected);
            default: return '';
        }
    },

    _renderDragHandle(itemId, isFloating = false) {
        const className = isFloating ? 'arc-floating-drag-handle' : 'arc-card-drag-handle';

        if (isFloating) {
            // Pour les éléments flottants: deux poignées
            // 1. Poignée de repositionnement (ItemMoveService)
            // 2. Poignée de drop dans colonne (DragDropService)
            return `
                <div class="${className}">
                    <div class="arc-drag-move"
                         onmousedown="ItemMoveService.start(event, '${itemId}'); event.stopPropagation();"
                         title="Déplacer sur le canvas">
                        <i data-lucide="grip-vertical"></i>
                    </div>
                    <div class="arc-drag-to-column"
                         draggable="true"
                         ondragstart="DragDropService.startFloatingDrag(event, '${itemId}')"
                         ondragend="DragDropService.endDrag(event)"
                         onmousedown="event.stopPropagation()"
                         title="Déposer dans une colonne">
                        <i data-lucide="columns-3"></i>
                    </div>
                </div>
            `;
        } else {
            // Pour les cartes: utiliser DragDropService pour le drag & drop entre colonnes
            return `
                <div class="${className}"
                     draggable="true"
                     ondragstart="DragDropService.startCardDrag(event, '${itemId}', this.closest('.arc-column').dataset.itemId)"
                     ondragend="DragDropService.endDrag(event)"
                     onmousedown="event.stopPropagation()"
                     title="Glisser pour déplacer">
                    <i data-lucide="grip-vertical"></i>
                </div>
            `;
        }
    },

    _renderColumn(item, isSelected) {
        const cardsHtml = (item.cards || []).map(card => this._renderCard(card, item.id)).join('');

        return `
            <div class="arc-column ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="column"
                 style="left: ${item.x}px; top: ${item.y}px; width: ${item.width || ArcBoardConfig.column.defaultWidth}px"
                 onclick="ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)">

                <div class="arc-column-header" onmousedown="ItemMoveService.start(event, '${item.id}')">
                    <input type="text" class="arc-column-title" value="${item.title || ''}"
                           placeholder="Titre de la colonne"
                           onchange="ArcBoardViewModel.updateItem('${item.id}', { title: this.value })"
                           onclick="event.stopPropagation()">
                    <span class="arc-column-meta">${(item.cards || []).length} carte${(item.cards || []).length > 1 ? 's' : ''}</span>
                </div>

                <div class="arc-column-body"
                     ondrop="DragDropService.handleColumnDrop(event, '${item.id}')"
                     ondragover="DragDropService.handleColumnDragOver(event)"
                     ondragleave="DragDropService.handleColumnDragLeave(event)">
                    ${cardsHtml}
                    <div class="arc-card-add" onclick="event.stopPropagation(); ArcBoardView.showCardTypeMenu(event, '${item.id}')">
                        <i data-lucide="plus"></i> Ajouter une carte
                    </div>
                </div>

                <div class="arc-column-resize" onmousedown="ResizeService.start(event, '${item.id}')"></div>
            </div>
        `;
    },

    _renderCard(card, columnId) {
        const deleteBtn = `
            <button class="arc-card-delete" onclick="event.stopPropagation(); ArcBoardViewModel.deleteCard('${columnId}', '${card.id}')" title="Supprimer">
                <i data-lucide="x"></i>
            </button>
        `;

        const dragHandle = `
            <div class="arc-card-drag-handle"
                 draggable="true"
                 ondragstart="DragDropService.startCardDrag(event, '${card.id}', '${columnId}')"
                 ondragend="DragDropService.endDrag(event)"
                 onmousedown="event.stopPropagation()"
                 title="Glisser pour déplacer">
                <i data-lucide="grip-vertical"></i>
            </div>
        `;

        switch (card.type) {
            case 'note':
                return `
                    <div class="arc-card arc-card-note" data-card-id="${card.id}">
                        ${dragHandle}${deleteBtn}
                        <div class="arc-card-content" contenteditable="true"
                             onblur="ArcBoardViewModel.updateCard('${columnId}', '${card.id}', { content: this.innerHTML })"
                             onclick="event.stopPropagation()">${card.content || ''}</div>
                    </div>
                `;

            case 'image':
                return `
                    <div class="arc-card arc-card-image" data-card-id="${card.id}">
                        ${dragHandle}${deleteBtn}
                        ${card.src
                        ? `<img src="${card.src}" alt="" draggable="false">`
                        : `<div class="arc-card-upload" onclick="ArcBoardEventHandlers.triggerCardImageUpload('${columnId}', '${card.id}')">
                                    <i data-lucide="cloud-upload"></i>
                                    <span>Ajouter une image</span>
                                </div>`
                    }
                    </div>
                `;

            case 'todo':
                const todosHtml = (card.items || []).map((todo, idx) => `
                    <div class="arc-todo-item">
                        <div class="arc-todo-checkbox ${todo.completed ? 'checked' : ''}"
                             onclick="ArcBoardEventHandlers.toggleTodo('${columnId}', '${card.id}', ${idx})">
                            ${todo.completed ? '<i data-lucide="check"></i>' : ''}
                        </div>
                        <input type="text" class="arc-todo-text ${todo.completed ? 'completed' : ''}"
                               value="${todo.text || ''}"
                               onchange="ArcBoardEventHandlers.updateTodoText('${columnId}', '${card.id}', ${idx}, this.value)"
                               onclick="event.stopPropagation()">
                    </div>
                `).join('');

                return `
                    <div class="arc-card arc-card-todo" data-card-id="${card.id}">
                        ${dragHandle}${deleteBtn}
                        <input type="text" class="arc-card-title" value="${card.title || ''}"
                               placeholder="Titre"
                               onchange="ArcBoardViewModel.updateCard('${columnId}', '${card.id}', { title: this.value })"
                               onclick="event.stopPropagation()">
                        <div class="arc-todo-list">${todosHtml}</div>
                        <div class="arc-todo-add" onclick="ArcBoardEventHandlers.addTodoItem('${columnId}', '${card.id}'); event.stopPropagation();">
                            <i data-lucide="plus"></i> Ajouter une tâche...
                        </div>
                    </div>
                `;

            case 'scene':
                const statusLabels = { 'setup': 'Introduction', 'development': 'Développement', 'climax': 'Point culminant', 'resolution': 'Résolution' };
                return `
                    <div class="arc-card arc-card-scene" data-card-id="${card.id}" data-scene-id="${card.sceneId || ''}">
                        ${dragHandle}${deleteBtn}
                        <div class="arc-card-scene-header">
                            <i data-lucide="book-open"></i>
                            <div class="arc-card-scene-title-wrapper">
                                <div class="arc-card-scene-breadcrumb">${card.breadcrumb || ''}</div>
                                <div class="arc-card-scene-title">${card.sceneTitle || 'Scène'}</div>
                            </div>
                        </div>
                        <div class="arc-card-scene-meta">
                            <div class="arc-card-scene-status">
                                <span class="arc-card-scene-label">Statut:</span>
                                <span class="arc-card-scene-value">${statusLabels[card.status] || 'Développement'}</span>
                            </div>
                        </div>
                        <button class="arc-card-scene-open" onclick="ArcBoardEventHandlers.openScene('${card.sceneId}'); event.stopPropagation();">
                            <i data-lucide="external-link"></i> Ouvrir
                        </button>
                    </div>
                `;

            case 'link':
                return `
                    <div class="arc-card arc-card-link" data-card-id="${card.id}">
                        ${dragHandle}${deleteBtn}
                        ${card.url ? `
                            <div class="arc-link-preview">
                                ${card.previewImage ? `<div class="arc-link-preview-image" style="background-image:url(${card.previewImage})"></div>` : ''}
                                <div class="arc-link-preview-info">
                                    <div class="arc-link-preview-title">${card.title || card.url}</div>
                                    <div class="arc-link-preview-url">${card.url}</div>
                                </div>
                            </div>
                        ` : `
                            <div class="arc-link-input">
                                <i data-lucide="link"></i>
                                <input type="text" placeholder="Entrer une URL"
                                       onkeypress="ArcBoardEventHandlers.handleCardLinkInput(event, '${columnId}', '${card.id}')"
                                       onclick="event.stopPropagation()">
                            </div>
                        `}
                    </div>
                `;

            case 'comment':
                return `
                    <div class="arc-card arc-card-comment" data-card-id="${card.id}">
                        ${dragHandle}${deleteBtn}
                        <div class="arc-card-content" contenteditable="true"
                             onblur="ArcBoardViewModel.updateCard('${columnId}', '${card.id}', { content: this.innerHTML })"
                             onclick="event.stopPropagation()">${card.content || ''}</div>
                    </div>
                `;

            case 'table':
                const rows = card.rows || 3;
                const cols = card.cols || 3;
                const data = card.data || [];
                let tableHtml = '<table>';
                for (let r = 0; r < rows; r++) {
                    tableHtml += '<tr>';
                    for (let c = 0; c < cols; c++) {
                        const cellData = data[r]?.[c] || '';
                        const tag = r === 0 ? 'th' : 'td';
                        tableHtml += `<${tag} contenteditable="true"
                                       onblur="ArcBoardEventHandlers.updateCardTableCell('${columnId}', '${card.id}', ${r}, ${c}, this.textContent)"
                                       onclick="event.stopPropagation()">${cellData}</${tag}>`;
                    }
                    // Bouton supprimer ligne (sauf header)
                    if (r > 0) {
                        tableHtml += `<td class="arc-table-action" onclick="ArcBoardEventHandlers.removeCardTableRow('${columnId}', '${card.id}', ${r}); event.stopPropagation();">
                            <i data-lucide="minus"></i>
                        </td>`;
                    } else {
                        tableHtml += '<th class="arc-table-action"></th>';
                    }
                    tableHtml += '</tr>';
                }
                // Ligne pour supprimer colonnes
                tableHtml += '<tr class="arc-table-actions-row">';
                for (let c = 0; c < cols; c++) {
                    if (cols > 1) {
                        tableHtml += `<td class="arc-table-action" onclick="ArcBoardEventHandlers.removeCardTableCol('${columnId}', '${card.id}', ${c}); event.stopPropagation();">
                            <i data-lucide="minus"></i>
                        </td>`;
                    } else {
                        tableHtml += '<td class="arc-table-action"></td>';
                    }
                }
                tableHtml += '<td class="arc-table-action"></td></tr>';
                tableHtml += '</table>';
                return `
                    <div class="arc-card arc-card-table" data-card-id="${card.id}">
                        ${dragHandle}${deleteBtn}
                        ${tableHtml}
                        <div class="arc-table-controls">
                            <button class="arc-table-btn" onclick="ArcBoardEventHandlers.addCardTableRow('${columnId}', '${card.id}'); event.stopPropagation();" title="Ajouter une ligne">
                                <i data-lucide="plus"></i> Ligne
                            </button>
                            <button class="arc-table-btn" onclick="ArcBoardEventHandlers.addCardTableCol('${columnId}', '${card.id}'); event.stopPropagation();" title="Ajouter une colonne">
                                <i data-lucide="plus"></i> Colonne
                            </button>
                        </div>
                    </div>
                `;

            default:
                return `
                    <div class="arc-card arc-card-note" data-card-id="${card.id}">
                        ${dragHandle}${deleteBtn}
                        <div class="arc-card-content">${card.content || ''}</div>
                    </div>
                `;
        }
    },

    _renderNote(item, isSelected) {
        return `
            <div class="arc-floating-item arc-floating-note ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="note"
                 style="left: ${item.x}px; top: ${item.y}px; width: ${item.width || 250}px"
                 onclick="ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)">
                ${this._renderDragHandle(item.id, true)}
                <div class="arc-card-content" contenteditable="true"
                     onblur="ArcBoardViewModel.updateItem('${item.id}', { content: this.innerHTML })"
                     onclick="event.stopPropagation()">${item.content || ''}</div>
            </div>
        `;
    },

    _renderImage(item, isSelected) {
        return `
            <div class="arc-floating-item arc-floating-image ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="image"
                 style="left: ${item.x}px; top: ${item.y}px"
                 onclick="ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)">
                ${this._renderDragHandle(item.id, true)}
                ${item.src
                ? `<img src="${item.src}" alt="" style="max-width: ${item.width || 300}px" draggable="false">`
                : `<div class="arc-card-upload" style="padding: 40px" onclick="ArcBoardEventHandlers.triggerItemImageUpload('${item.id}')">
                            <i data-lucide="cloud-upload"></i>
                            <span>Ajouter une image</span>
                        </div>`
            }
            </div>
        `;
    },

    _renderLink(item, isSelected) {
        return `
            <div class="arc-floating-item ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="link"
                 style="left: ${item.x}px; top: ${item.y}px; width: 280px"
                 onclick="ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)">
                ${this._renderDragHandle(item.id, true)}
                <div class="arc-card arc-card-link" style="margin:0">
                    ${item.url ? `
                        <div class="arc-link-preview">
                            <div class="arc-link-preview-info">
                                <div class="arc-link-preview-title">${item.title || item.url}</div>
                                <div class="arc-link-preview-url">${item.url}</div>
                            </div>
                        </div>
                    ` : `
                        <div class="arc-link-input">
                            <i data-lucide="link"></i>
                            <input type="text" placeholder="Entrer une URL"
                                   onkeypress="ArcBoardEventHandlers.handleLinkInput(event, '${item.id}')"
                                   onclick="event.stopPropagation()">
                        </div>
                    `}
                </div>
            </div>
        `;
    },

    _renderTodo(item, isSelected) {
        const todosHtml = (item.items || []).map((todo, idx) => `
            <div class="arc-todo-item">
                <div class="arc-todo-checkbox ${todo.completed ? 'checked' : ''}"
                     onclick="ArcBoardEventHandlers.toggleFloatingTodo('${item.id}', ${idx})">
                    ${todo.completed ? '<i data-lucide="check"></i>' : ''}
                </div>
                <input type="text" class="arc-todo-text ${todo.completed ? 'completed' : ''}"
                       value="${todo.text || ''}"
                       onchange="ArcBoardEventHandlers.updateFloatingTodoText('${item.id}', ${idx}, this.value)"
                       onclick="event.stopPropagation()">
            </div>
        `).join('');

        return `
            <div class="arc-floating-item ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="todo"
                 style="left: ${item.x}px; top: ${item.y}px; width: 260px"
                 onclick="ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)">
                ${this._renderDragHandle(item.id, true)}
                <div class="arc-card arc-card-todo" style="margin:0">
                    <input type="text" class="arc-card-title" value="${item.title || ''}"
                           placeholder="Liste de tâches"
                           onchange="ArcBoardViewModel.updateItem('${item.id}', { title: this.value })"
                           onclick="event.stopPropagation()">
                    <div class="arc-todo-list">${todosHtml}</div>
                    <div class="arc-todo-add" onclick="ArcBoardEventHandlers.addFloatingTodoItem('${item.id}'); event.stopPropagation();">
                        <i data-lucide="plus"></i> Ajouter une tâche...
                    </div>
                </div>
            </div>
        `;
    },

    _renderComment(item, isSelected) {
        return `
            <div class="arc-floating-item ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="comment"
                 style="left: ${item.x}px; top: ${item.y}px; width: 220px"
                 onclick="ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)">
                ${this._renderDragHandle(item.id, true)}
                <div class="arc-card arc-card-comment" style="margin:0">
                    <div class="arc-card-content" contenteditable="true"
                         onblur="ArcBoardViewModel.updateItem('${item.id}', { content: this.innerHTML })"
                         onclick="event.stopPropagation()">${item.content || ''}</div>
                </div>
            </div>
        `;
    },

    _renderTable(item, isSelected) {
        const rows = item.rows || 3;
        const cols = item.cols || 3;
        const data = item.data || [];

        let tableHtml = '<table>';
        for (let r = 0; r < rows; r++) {
            tableHtml += '<tr>';
            for (let c = 0; c < cols; c++) {
                const cellData = data[r]?.[c] || '';
                const tag = r === 0 ? 'th' : 'td';
                tableHtml += `<${tag} contenteditable="true"
                               onblur="ArcBoardEventHandlers.updateTableCell('${item.id}', ${r}, ${c}, this.textContent)"
                               onclick="event.stopPropagation()">${cellData}</${tag}>`;
            }
            // Bouton supprimer ligne (sauf header)
            if (r > 0) {
                tableHtml += `<td class="arc-table-action" onclick="ArcBoardEventHandlers.removeTableRow('${item.id}', ${r}); event.stopPropagation();">
                    <i data-lucide="minus"></i>
                </td>`;
            } else {
                tableHtml += '<th class="arc-table-action"></th>';
            }
            tableHtml += '</tr>';
        }
        // Ligne pour supprimer colonnes
        tableHtml += '<tr class="arc-table-actions-row">';
        for (let c = 0; c < cols; c++) {
            if (cols > 1) {
                tableHtml += `<td class="arc-table-action" onclick="ArcBoardEventHandlers.removeTableCol('${item.id}', ${c}); event.stopPropagation();">
                    <i data-lucide="minus"></i>
                </td>`;
            } else {
                tableHtml += '<td class="arc-table-action"></td>';
            }
        }
        tableHtml += '<td class="arc-table-action"></td></tr>';
        tableHtml += '</table>';

        return `
            <div class="arc-floating-item ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="table"
                 style="left: ${item.x}px; top: ${item.y}px"
                 onclick="ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)">
                ${this._renderDragHandle(item.id, true)}
                <div class="arc-card arc-card-table" style="margin:0">
                    ${tableHtml}
                    <div class="arc-table-controls">
                        <button class="arc-table-btn" onclick="ArcBoardEventHandlers.addTableRow('${item.id}'); event.stopPropagation();" title="Ajouter une ligne">
                            <i data-lucide="plus"></i> Ligne
                        </button>
                        <button class="arc-table-btn" onclick="ArcBoardEventHandlers.addTableCol('${item.id}'); event.stopPropagation();" title="Ajouter une colonne">
                            <i data-lucide="plus"></i> Colonne
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    _renderSceneItem(item, isSelected) {
        const statusLabels = { 'setup': 'Introduction', 'development': 'Développement', 'climax': 'Point culminant', 'resolution': 'Résolution' };

        return `
            <div class="arc-floating-item ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="scene"
                 data-scene-id="${item.sceneId || ''}"
                 style="left: ${item.x}px; top: ${item.y}px; width: ${item.width || 220}px; z-index: ${item.zIndex || 1}"
                 onclick="ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)">
                ${this._renderDragHandle(item.id, true)}
                <button class="arc-floating-delete" onclick="event.stopPropagation(); deleteArcItem('${item.id}')" title="Supprimer">
                    <i data-lucide="x"></i>
                </button>
                <div class="arc-card arc-card-scene" style="margin:0">
                    <div class="arc-card-scene-header">
                        <i data-lucide="book-open"></i>
                        <div class="arc-card-scene-title-wrapper">
                            <div class="arc-card-scene-breadcrumb">${item.breadcrumb || ''}</div>
                            <div class="arc-card-scene-title">${item.sceneTitle || 'Scène'}</div>
                        </div>
                    </div>
                    <div class="arc-card-scene-meta">
                        <div class="arc-card-scene-status">
                            <span class="arc-card-scene-label">Statut:</span>
                            <span class="arc-card-scene-value">${statusLabels[item.status] || 'Développement'}</span>
                        </div>
                    </div>
                    <button class="arc-card-scene-open" onclick="ArcBoardEventHandlers.openScene('${item.sceneId}'); event.stopPropagation();">
                        <i data-lucide="external-link"></i> Ouvrir
                    </button>
                </div>
            </div>
        `;
    },

    // ==========================================
    // CONNEXIONS
    // ==========================================

    /**
     * Rendu des connexions SVG
     */
    renderConnections(arc) {
        const svg = document.getElementById('arcConnectionsSvg');
        if (!svg) return;

        const defs = svg.querySelector('defs');
        svg.innerHTML = '';
        if (defs) svg.appendChild(defs);

        if (!arc.board.connections?.length) return;

        arc.board.connections.forEach(conn => {
            const fromEl = document.getElementById(`item-${conn.from}`);
            const toEl = document.getElementById(`item-${conn.to}`);

            if (!fromEl || !toEl) return;

            const fromPos = this._getElementPosition(fromEl, conn.fromSide);
            const toPos = this._getElementPosition(toEl, conn.toSide);

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = this._createBezierPath(fromPos, toPos, conn.fromSide, conn.toSide);

            path.setAttribute('d', d);
            path.setAttribute('class', `arc-connection-line ${ArcBoardState.selectedItems.includes(conn.id) ? 'selected' : ''}`);
            path.setAttribute('data-connection-id', conn.id);
            path.setAttribute('marker-end', 'url(#arrowhead)');
            path.style.pointerEvents = 'stroke';
            path.onclick = (e) => {
                e.stopPropagation();
                ArcBoardState.selectedItems = [conn.id];
                ArcBoardViewModel._updateSelectionUI();
            };

            svg.appendChild(path);
        });
    },

    _getElementPosition(element, side) {
        const x = parseInt(element.style.left) || 0;
        const y = parseInt(element.style.top) || 0;
        const w = element.offsetWidth;
        const h = element.offsetHeight;

        switch (side) {
            case 'top': return { x: x + w / 2, y: y };
            case 'bottom': return { x: x + w / 2, y: y + h };
            case 'left': return { x: x, y: y + h / 2 };
            case 'right': return { x: x + w, y: y + h / 2 };
            default: return { x: x + w / 2, y: y + h / 2 };
        }
    },

    _createBezierPath(from, to, fromSide, toSide) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const offset = Math.min(80, Math.max(40, dist / 3));

        let cp1 = { x: from.x, y: from.y };
        let cp2 = { x: to.x, y: to.y };

        switch (fromSide) {
            case 'top': cp1.y -= offset; break;
            case 'bottom': cp1.y += offset; break;
            case 'left': cp1.x -= offset; break;
            case 'right': cp1.x += offset; break;
        }

        switch (toSide) {
            case 'top': cp2.y -= offset; break;
            case 'bottom': cp2.y += offset; break;
            case 'left': cp2.x -= offset; break;
            case 'right': cp2.x += offset; break;
        }

        return `M ${from.x} ${from.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`;
    },

    // ==========================================
    // WELCOME & MENUS
    // ==========================================

    renderWelcome() {
        const view = document.getElementById('editorView');
        if (!view) return;

        ArcRepository.init();
        const arcs = ArcRepository.getAll();

        view.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon"><i data-lucide="layout-dashboard"></i></div>
                <div class="empty-state-title">${arcs.length === 0 ? 'Gérez vos arcs narratifs' : 'Sélectionnez un arc'}</div>
                <div class="empty-state-text">
                    ${arcs.length === 0
                ? 'Créez des boards visuels pour planifier vos arcs narratifs,<br>organiser vos idées et suivre la progression de votre histoire.'
                : 'Choisissez un arc dans la barre latérale<br>ou créez-en un nouveau.'
            }
                </div>
                <button class="btn btn-primary" onclick="ArcBoardViewModel.showArcForm()">
                    <i data-lucide="${arcs.length === 0 ? 'sparkles' : 'plus'}"></i>
                    ${arcs.length === 0 ? 'Créer votre premier arc' : 'Nouvel arc'}
                </button>
            </div>
        `;

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    showArcContextMenu(event, arcId) {
        this._removeContextMenu();

        const menu = document.createElement('div');
        menu.className = 'arc-context-menu';
        menu.id = 'arcContextMenu';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;

        menu.innerHTML = `
            <div class="arc-context-menu-item" onclick="ArcBoardViewModel.openArc('${arcId}')">
                <i data-lucide="layout-dashboard"></i> Ouvrir
            </div>
            <div class="arc-context-menu-item" onclick="ArcBoardViewModel.showArcForm('${arcId}')">
                <i data-lucide="settings"></i> Modifier
            </div>
            <div class="arc-context-menu-item" onclick="ArcBoardEventHandlers.duplicateArc('${arcId}')">
                <i data-lucide="copy"></i> Dupliquer
            </div>
            <div class="arc-context-menu-separator"></div>
            <div class="arc-context-menu-item danger" onclick="ArcBoardEventHandlers.deleteArc('${arcId}')">
                <i data-lucide="trash-2"></i> Supprimer
            </div>
        `;

        document.body.appendChild(menu);
        if (typeof lucide !== 'undefined') lucide.createIcons();

        setTimeout(() => {
            document.addEventListener('click', () => this._removeContextMenu(), { once: true });
        }, 10);
    },

    showCanvasContextMenu(event) {
        this._removeContextMenu();

        const menu = document.createElement('div');
        menu.className = 'arc-context-menu';
        menu.id = 'arcContextMenu';
        menu.style.left = `${event.clientX}px`;
        menu.style.top = `${event.clientY}px`;

        menu.innerHTML = `
            <div class="arc-context-menu-item" onclick="ArcBoardViewModel.addItemAt('column', ${event.clientX}, ${event.clientY})">
                <i data-lucide="columns-3"></i> Ajouter une colonne
            </div>
            <div class="arc-context-menu-item" onclick="ArcBoardViewModel.addItemAt('note', ${event.clientX}, ${event.clientY})">
                <i data-lucide="file-text"></i> Ajouter une note
            </div>
            <div class="arc-context-menu-item" onclick="ArcBoardViewModel.addItemAt('image', ${event.clientX}, ${event.clientY})">
                <i data-lucide="image"></i> Ajouter une image
            </div>
            <div class="arc-context-menu-separator"></div>
            <div class="arc-context-menu-item" onclick="ArcBoardViewModel.paste()">
                <i data-lucide="clipboard"></i> Coller
            </div>
            <div class="arc-context-menu-separator"></div>
            <div class="arc-context-menu-item" onclick="ArcBoardViewModel.resetView()">
                <i data-lucide="maximize-2"></i> Réinitialiser le zoom
            </div>
        `;

        document.body.appendChild(menu);
        if (typeof lucide !== 'undefined') lucide.createIcons();

        setTimeout(() => {
            document.addEventListener('click', () => this._removeContextMenu(), { once: true });
        }, 10);
    },

    _removeContextMenu() {
        const menu = document.getElementById('arcContextMenu');
        if (menu) menu.remove();
        const cardMenu = document.getElementById('arcCardTypeMenu');
        if (cardMenu) cardMenu.remove();
    },

    /**
     * Affiche le menu de sélection de type de carte
     * @param {Event} event - L'événement click
     * @param {string} columnId - L'ID de la colonne cible
     */
    showCardTypeMenu(event, columnId) {
        this._removeContextMenu();

        const menu = document.createElement('div');
        menu.className = 'arc-card-type-menu';
        menu.id = 'arcCardTypeMenu';

        // Positionner près du bouton
        const rect = event.target.closest('.arc-card-add').getBoundingClientRect();
        menu.style.left = `${rect.left}px`;
        menu.style.top = `${rect.bottom + 4}px`;

        // Générer les options de types de cartes
        const cardTypes = Object.entries(CreatableItemTypes)
            .filter(([_, config]) => config.canBeCard);

        menu.innerHTML = `
            <div class="arc-card-type-menu-header">
                <span>Type de carte</span>
            </div>
            <div class="arc-card-type-menu-grid">
                ${cardTypes.map(([type, config]) => `
                    <div class="arc-card-type-option" onclick="ArcBoardViewModel.addCard('${columnId}', '${type}'); ArcBoardView._removeContextMenu();">
                        <i data-lucide="${config.icon}"></i>
                        <span>${config.label}</span>
                    </div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(menu);
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Ajuster la position si le menu dépasse de l'écran
        const menuRect = menu.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
            menu.style.left = `${window.innerWidth - menuRect.width - 10}px`;
        }
        if (menuRect.bottom > window.innerHeight) {
            menu.style.top = `${rect.top - menuRect.height - 4}px`;
        }

        // Fermer le menu au clic extérieur
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target)) {
                    this._removeContextMenu();
                }
            }, { once: true });
        }, 10);
    }
};

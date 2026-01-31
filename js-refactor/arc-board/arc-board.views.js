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

        view.innerHTML = `
            <div class="arc-board-container">
                ${this._renderToolbar()}

                <div class="arc-board-main">
                    ${this._renderMultiArcBar(arc)}

                    <div class="arc-board-body">
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

                            <div class="arc-connections-layer" id="arcConnectionsLayer">
                                <svg id="arcConnectionsSvg">
                                    <defs>
                                        <marker id="arrowhead" markerWidth="10" markerHeight="7"
                                                refX="9" refY="3.5" orient="auto">
                                            <polygon points="0 0, 10 3.5, 0 7" class="arc-connection-arrow"/>
                                        </marker>
                                        <marker id="arrowhead-interarc" markerWidth="10" markerHeight="7"
                                                refX="9" refY="3.5" orient="auto">
                                            <polygon points="0 0, 10 3.5, 0 7" fill="var(--primary-color)"/>
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
                </div>
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
        const interArcConnections = InterArcConnectionRepository.getAll();

        // Tags des arcs en comparaison
        const compareTagsHtml = ArcBoardState.compareArcs.map(arcId => {
            const compareArc = ArcRepository.getById(arcId);
            if (!compareArc) return '';
            const isMain = arcId === arc.id;
            return `<span class="arc-compare-tag ${isMain ? 'main' : ''}" style="--tag-color: ${compareArc.color}">
                <span class="arc-compare-tag-dot" style="background:${compareArc.color}"></span>
                ${compareArc.title}
                ${!isMain && ArcBoardState.compareArcs.length > 1 ? `<button onclick="ArcBoardViewModel.removeCompareArc('${arcId}')"><i data-lucide="x"></i></button>` : ''}
            </span>`;
        }).join('');

        // Liste des connexions inter-arcs
        const interArcHtml = interArcConnections.length > 0 ? `
            <div class="arc-interarc-tags">
                ${interArcConnections.map(conn => {
                    const fromArc = ArcRepository.getById(conn.fromArcId);
                    const toArc = ArcRepository.getById(conn.toArcId);
                    return `<span class="arc-interarc-tag">
                        <span class="arc-interarc-tag-dot" style="background:${fromArc?.color || '#999'}"></span>
                        <i data-lucide="arrow-right"></i>
                        <span class="arc-interarc-tag-dot" style="background:${toArc?.color || '#999'}"></span>
                        <button onclick="InterArcConnectionRepository.delete('${conn.id}'); ArcBoardViewModel.render()"><i data-lucide="x"></i></button>
                    </span>`;
                }).join('')}
            </div>
        ` : '';

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
                </div>

                ${mode === MultiArcModes.COMPARE ? `
                    <div class="arc-compare-controls">
                        ${compareTagsHtml}
                        ${availableArcs.length > 0 ? `
                            <select class="arc-compare-add" onchange="if(this.value) { ArcBoardViewModel.addCompareArc(this.value); this.value=''; }">
                                <option value="">+ Arc...</option>
                                ${availableArcs.map(a => `<option value="${a.id}">${a.title}</option>`).join('')}
                            </select>
                        ` : ''}
                        <button class="arc-compare-link-btn" onclick="InterArcConnectionService.startConnection()" title="Créer un lien entre arcs">
                            <i data-lucide="link"></i>
                        </button>
                        ${interArcHtml}
                    </div>
                ` : ''}
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

        // MODE COMPARE : afficher plusieurs arcs empilés verticalement
        if (ArcBoardState.multiArcMode === MultiArcModes.COMPARE && ArcBoardState.compareArcs.length > 0) {
            this._renderCompareItems(itemsContainer, sidebarContainer);
            return;
        }

        // MODE SOLO : affichage normal
        this._renderSoloItems(arc, itemsContainer, sidebarContainer);
    },

    /**
     * Rendu mode Solo (un seul arc)
     */
    _renderSoloItems(arc, itemsContainer, sidebarContainer) {
        // Construire la liste des scènes non attribuées depuis scenePresence
        const unassignedScenes = this._getUnassignedScenes(arc);

        // Filtrer les items réguliers
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

    /**
     * Rendu mode Compare (plusieurs arcs empilés)
     */
    _renderCompareItems(itemsContainer, sidebarContainer) {
        const ARC_PADDING = 30; // Padding entre les arcs
        const HEADER_HEIGHT = 50; // Hauteur de l'en-tête d'arc
        let html = '';
        let currentY = 0;

        // Stocker les offsets par arc pour le rendu des connexions
        this._compareArcOffsets = {};

        // Pour chaque arc à comparer
        ArcBoardState.compareArcs.forEach((arcId, index) => {
            const compareArc = ArcRepository.getById(arcId);
            if (!compareArc) return;

            // Stocker l'offset pour cet arc
            this._compareArcOffsets[arcId] = { x: 0, y: currentY + HEADER_HEIGHT };

            // En-tête de l'arc (bande colorée)
            html += `
                <div class="arc-compare-header" style="top:${currentY}px; --arc-color:${compareArc.color}" data-arc-id="${arcId}">
                    <span class="arc-compare-header-dot" style="background:${compareArc.color}"></span>
                    <span class="arc-compare-header-title">${compareArc.title}</span>
                    <span class="arc-compare-header-count">${compareArc.board.items.filter(i => i.type === 'column').length} colonnes</span>
                </div>
            `;

            // Items de cet arc avec offset Y
            const offsetY = currentY + HEADER_HEIGHT;
            compareArc.board.items.filter(item => item.type !== 'scene').forEach(item => {
                html += this._renderItem(item, arcId, 0, offsetY);
            });

            // Calculer la hauteur réelle de cet arc (basée sur le contenu)
            const arcHeight = this._getArcContentHeight(compareArc);
            currentY += HEADER_HEIGHT + arcHeight + ARC_PADDING;
        });

        itemsContainer.innerHTML = html;

        // Sidebar : scènes non attribuées du premier arc
        if (sidebarContainer && ArcBoardState.compareArcs.length > 0) {
            const mainArc = ArcRepository.getById(ArcBoardState.compareArcs[0]);
            if (mainArc) {
                const unassignedScenes = this._getUnassignedScenes(mainArc);
                sidebarContainer.innerHTML = this._renderUnassignedZone(unassignedScenes);
            }
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Masquer l'empty state
        const emptyState = document.querySelector('.arc-board-empty');
        if (emptyState) emptyState.style.display = 'none';

        // Rendre les connexions après le DOM mis à jour
        requestAnimationFrame(() => {
            this._renderCompareConnections();
        });
    },

    /**
     * Calcule la hauteur du contenu d'un arc (basée sur les éléments réels)
     */
    _getArcContentHeight(arc) {
        let maxBottom = 0;

        arc.board.items.forEach(item => {
            const itemY = item.y || 0;
            let itemHeight = 100; // Hauteur par défaut

            if (item.type === 'column') {
                // Calculer la hauteur réelle de la colonne basée sur les cartes
                const cardCount = (item.cards || []).length;
                const headerHeight = 45;
                const cardHeight = 80; // Hauteur moyenne d'une carte
                const addBtnHeight = 35;
                const padding = 20;
                itemHeight = headerHeight + (cardCount * cardHeight) + addBtnHeight + padding;
                itemHeight = Math.max(itemHeight, 150); // Minimum 150px
            } else if (item.type === 'note' || item.type === 'comment') {
                itemHeight = 80;
            } else if (item.type === 'image') {
                itemHeight = item.height || 150;
            } else if (item.type === 'todo') {
                const todoCount = (item.items || []).length;
                itemHeight = 80 + (todoCount * 30);
            } else if (item.type === 'table') {
                const rows = item.rows || 3;
                itemHeight = 50 + (rows * 35);
            }

            const bottom = itemY + itemHeight;
            if (bottom > maxBottom) maxBottom = bottom;
        });

        return Math.max(maxBottom, 100); // Minimum 100px
    },

    /**
     * Rend les connexions en mode Compare (internes + inter-arcs)
     */
    _renderCompareConnections() {
        const svg = document.getElementById('arcConnectionsSvg');
        if (!svg) return;

        const defs = svg.querySelector('defs');
        svg.innerHTML = '';
        if (defs) svg.appendChild(defs);

        // 1. Connexions internes de chaque arc
        ArcBoardState.compareArcs.forEach(arcId => {
            const arc = ArcRepository.getById(arcId);
            if (!arc?.board?.connections) return;

            const offset = this._compareArcOffsets?.[arcId] || { x: 0, y: 0 };

            arc.board.connections.forEach(conn => {
                const fromEl = document.getElementById(`item-${conn.from}`);
                const toEl = document.getElementById(`item-${conn.to}`);

                if (!fromEl || !toEl) return;

                const fromPos = this._getElementPosition(fromEl, conn.fromSide);
                const toPos = this._getElementPosition(toEl, conn.toSide);

                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                const d = this._createBezierPath(fromPos, toPos, conn.fromSide, conn.toSide);

                path.setAttribute('d', d);
                path.setAttribute('class', 'arc-connection-line');
                path.setAttribute('data-connection-id', conn.id);
                path.setAttribute('data-arc-id', arcId);
                path.setAttribute('marker-end', 'url(#arrowhead)');
                path.style.stroke = arc.color;
                path.style.opacity = '0.6';

                svg.appendChild(path);
            });
        });

        // 2. Connexions inter-arcs
        const interArcConnections = InterArcConnectionRepository.getAll();
        interArcConnections.forEach(conn => {
            // Trouver les éléments dans les arcs comparés
            if (!ArcBoardState.compareArcs.includes(conn.fromArcId) ||
                !ArcBoardState.compareArcs.includes(conn.toArcId)) return;

            const fromEl = document.querySelector(`[data-arc-id="${conn.fromArcId}"][data-item-id="${conn.fromItemId}"]`);
            const toEl = document.querySelector(`[data-arc-id="${conn.toArcId}"][data-item-id="${conn.toItemId}"]`);

            if (!fromEl || !toEl) return;

            const fromPos = this._getElementPosition(fromEl, 'right');
            const toPos = this._getElementPosition(toEl, 'left');

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const d = this._createBezierPath(fromPos, toPos, 'right', 'left');

            path.setAttribute('d', d);
            path.setAttribute('class', 'arc-connection-line arc-interarc-connection');
            path.setAttribute('data-interarc-id', conn.id);
            path.setAttribute('marker-end', 'url(#arrowhead-interarc)');
            path.style.stroke = 'var(--primary-color)';
            path.style.strokeWidth = '2';
            path.style.strokeDasharray = '5,5';

            svg.appendChild(path);
        });
    },

    /**
     * Récupère les scènes non attribuées d'un arc
     */
    _getUnassignedScenes(arc) {
        const unassignedScenes = [];
        if (arc.scenePresence) {
            arc.scenePresence
                .filter(p => !p.columnId || p.columnId === null)
                .forEach(presence => {
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
        return unassignedScenes;
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

    _renderItem(item, arcId = null, offsetX = 0, offsetY = 0) {
        const isSelected = ArcBoardState.selectedItems.includes(item.id);
        const isCompareMode = ArcBoardState.multiArcMode === MultiArcModes.COMPARE;

        switch (item.type) {
            case 'column': return this._renderColumn(item, isSelected, arcId, offsetX, offsetY);
            case 'note': return this._renderNote(item, isSelected, arcId, offsetX, offsetY);
            case 'image': return this._renderImage(item, isSelected, arcId, offsetX, offsetY);
            case 'link': return this._renderLink(item, isSelected, arcId, offsetX, offsetY);
            case 'todo': return this._renderTodo(item, isSelected, arcId, offsetX, offsetY);
            case 'comment': return this._renderComment(item, isSelected, arcId, offsetX, offsetY);
            case 'table': return this._renderTable(item, isSelected, arcId, offsetX, offsetY);
            case 'scene': return this._renderSceneItem(item, isSelected, arcId, offsetX, offsetY);
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

    _renderColumn(item, isSelected, arcId = null, offsetX = 0, offsetY = 0) {
        const cardsHtml = (item.cards || []).map(card => this._renderCard(card, item.id)).join('');
        const isCompareMode = arcId !== null;
        const arc = isCompareMode ? ArcRepository.getById(arcId) : null;
        const borderColor = arc ? arc.color : 'var(--border-color)';

        return `
            <div class="arc-column ${isSelected ? 'selected' : ''} ${isCompareMode ? 'arc-column-compare' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="column"
                 ${arcId ? `data-arc-id="${arcId}"` : ''}
                 style="left: ${(item.x || 0) + offsetX}px; top: ${(item.y || 0) + offsetY}px; width: ${item.width || ArcBoardConfig.column.defaultWidth}px; ${isCompareMode ? `--column-accent: ${borderColor}` : ''}"
                 onclick="${isCompareMode ? `InterArcConnectionService.handleClick('${arcId}', '${item.id}')` : `ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)`}">

                <div class="arc-column-header" ${!isCompareMode ? `onmousedown="ItemMoveService.start(event, '${item.id}')"` : ''}>
                    ${isCompareMode ? `<span class="arc-column-title">${item.title || 'Colonne'}</span>` : `
                    <input type="text" class="arc-column-title" value="${item.title || ''}"
                           placeholder="Titre de la colonne"
                           onchange="ArcBoardViewModel.updateItem('${item.id}', { title: this.value })"
                           onclick="event.stopPropagation()">`}
                    <span class="arc-column-meta">${(item.cards || []).length} carte${(item.cards || []).length > 1 ? 's' : ''}</span>
                </div>

                <div class="arc-column-body"
                     ${!isCompareMode ? `ondrop="DragDropService.handleColumnDrop(event, '${item.id}')"
                     ondragover="DragDropService.handleColumnDragOver(event)"
                     ondragleave="DragDropService.handleColumnDragLeave(event)"` : ''}>
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

    _renderNote(item, isSelected, arcId = null, offsetX = 0, offsetY = 0) {
        const isCompareMode = arcId !== null;
        return `
            <div class="arc-floating-item arc-floating-note ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="note"
                 ${arcId ? `data-arc-id="${arcId}"` : ''}
                 style="left: ${(item.x || 0) + offsetX}px; top: ${(item.y || 0) + offsetY}px; width: ${item.width || 250}px"
                 onclick="${isCompareMode ? `InterArcConnectionService.handleClick('${arcId}', '${item.id}')` : `ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)`}">
                ${!isCompareMode ? this._renderDragHandle(item.id, true) : ''}
                <div class="arc-card-content" ${!isCompareMode ? 'contenteditable="true"' : ''}
                     ${!isCompareMode ? `onblur="ArcBoardViewModel.updateItem('${item.id}', { content: this.innerHTML })"` : ''}
                     onclick="event.stopPropagation()">${item.content || ''}</div>
            </div>
        `;
    },

    _renderImage(item, isSelected, arcId = null, offsetX = 0, offsetY = 0) {
        const isCompareMode = arcId !== null;
        return `
            <div class="arc-floating-item arc-floating-image ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="image"
                 ${arcId ? `data-arc-id="${arcId}"` : ''}
                 style="left: ${(item.x || 0) + offsetX}px; top: ${(item.y || 0) + offsetY}px"
                 onclick="${isCompareMode ? `InterArcConnectionService.handleClick('${arcId}', '${item.id}')` : `ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)`}">
                ${!isCompareMode ? this._renderDragHandle(item.id, true) : ''}
                ${item.src
                ? `<img src="${item.src}" alt="" style="max-width: ${item.width || 300}px" draggable="false">`
                : (!isCompareMode ? `<div class="arc-card-upload" style="padding: 40px" onclick="ArcBoardEventHandlers.triggerItemImageUpload('${item.id}')">
                            <i data-lucide="cloud-upload"></i>
                            <span>Ajouter une image</span>
                        </div>` : '<i data-lucide="image"></i>')
            }
            </div>
        `;
    },

    _renderLink(item, isSelected, arcId = null, offsetX = 0, offsetY = 0) {
        const isCompareMode = arcId !== null;
        return `
            <div class="arc-floating-item ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="link"
                 ${arcId ? `data-arc-id="${arcId}"` : ''}
                 style="left: ${(item.x || 0) + offsetX}px; top: ${(item.y || 0) + offsetY}px; width: 280px"
                 onclick="${isCompareMode ? `InterArcConnectionService.handleClick('${arcId}', '${item.id}')` : `ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)`}">
                ${!isCompareMode ? this._renderDragHandle(item.id, true) : ''}
                <div class="arc-card arc-card-link" style="margin:0">
                    ${item.url ? `
                        <div class="arc-link-preview">
                            <div class="arc-link-preview-info">
                                <div class="arc-link-preview-title">${item.title || item.url}</div>
                                <div class="arc-link-preview-url">${item.url}</div>
                            </div>
                        </div>
                    ` : (!isCompareMode ? `
                        <div class="arc-link-input">
                            <i data-lucide="link"></i>
                            <input type="text" placeholder="Entrer une URL"
                                   onkeypress="ArcBoardEventHandlers.handleLinkInput(event, '${item.id}')"
                                   onclick="event.stopPropagation()">
                        </div>
                    ` : '<i data-lucide="link"></i>')}
                </div>
            </div>
        `;
    },

    _renderTodo(item, isSelected, arcId = null, offsetX = 0, offsetY = 0) {
        const isCompareMode = arcId !== null;
        const todosHtml = (item.items || []).map((todo, idx) => `
            <div class="arc-todo-item">
                <div class="arc-todo-checkbox ${todo.completed ? 'checked' : ''}"
                     ${!isCompareMode ? `onclick="ArcBoardEventHandlers.toggleFloatingTodo('${item.id}', ${idx})"` : ''}>
                    ${todo.completed ? '<i data-lucide="check"></i>' : ''}
                </div>
                ${isCompareMode ? `<span class="arc-todo-text ${todo.completed ? 'completed' : ''}">${todo.text || ''}</span>` : `
                <input type="text" class="arc-todo-text ${todo.completed ? 'completed' : ''}"
                       value="${todo.text || ''}"
                       onchange="ArcBoardEventHandlers.updateFloatingTodoText('${item.id}', ${idx}, this.value)"
                       onclick="event.stopPropagation()">`}
            </div>
        `).join('');

        return `
            <div class="arc-floating-item ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="todo"
                 ${arcId ? `data-arc-id="${arcId}"` : ''}
                 style="left: ${(item.x || 0) + offsetX}px; top: ${(item.y || 0) + offsetY}px; width: 260px"
                 onclick="${isCompareMode ? `InterArcConnectionService.handleClick('${arcId}', '${item.id}')` : `ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)`}">
                ${!isCompareMode ? this._renderDragHandle(item.id, true) : ''}
                <div class="arc-card arc-card-todo" style="margin:0">
                    ${isCompareMode ? `<span class="arc-card-title">${item.title || 'Liste de tâches'}</span>` : `
                    <input type="text" class="arc-card-title" value="${item.title || ''}"
                           placeholder="Liste de tâches"
                           onchange="ArcBoardViewModel.updateItem('${item.id}', { title: this.value })"
                           onclick="event.stopPropagation()">`}
                    <div class="arc-todo-list">${todosHtml}</div>
                    ${!isCompareMode ? `<div class="arc-todo-add" onclick="ArcBoardEventHandlers.addFloatingTodoItem('${item.id}'); event.stopPropagation();">
                        <i data-lucide="plus"></i> Ajouter une tâche...
                    </div>` : ''}
                </div>
            </div>
        `;
    },

    _renderComment(item, isSelected, arcId = null, offsetX = 0, offsetY = 0) {
        const isCompareMode = arcId !== null;
        return `
            <div class="arc-floating-item ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="comment"
                 ${arcId ? `data-arc-id="${arcId}"` : ''}
                 style="left: ${(item.x || 0) + offsetX}px; top: ${(item.y || 0) + offsetY}px; width: 220px"
                 onclick="${isCompareMode ? `InterArcConnectionService.handleClick('${arcId}', '${item.id}')` : `ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)`}">
                ${!isCompareMode ? this._renderDragHandle(item.id, true) : ''}
                <div class="arc-card arc-card-comment" style="margin:0">
                    <div class="arc-card-content" ${!isCompareMode ? 'contenteditable="true"' : ''}
                         ${!isCompareMode ? `onblur="ArcBoardViewModel.updateItem('${item.id}', { content: this.innerHTML })"` : ''}
                         onclick="event.stopPropagation()">${item.content || ''}</div>
                </div>
            </div>
        `;
    },

    _renderTable(item, isSelected, arcId = null, offsetX = 0, offsetY = 0) {
        const isCompareMode = arcId !== null;
        const rows = item.rows || 3;
        const cols = item.cols || 3;
        const data = item.data || [];

        let tableHtml = '<table>';
        for (let r = 0; r < rows; r++) {
            tableHtml += '<tr>';
            for (let c = 0; c < cols; c++) {
                const cellData = data[r]?.[c] || '';
                const tag = r === 0 ? 'th' : 'td';
                tableHtml += `<${tag} ${!isCompareMode ? 'contenteditable="true"' : ''}
                               ${!isCompareMode ? `onblur="ArcBoardEventHandlers.updateTableCell('${item.id}', ${r}, ${c}, this.textContent)"` : ''}
                               onclick="event.stopPropagation()">${cellData}</${tag}>`;
            }
            // Bouton supprimer ligne (sauf header) - uniquement en mode solo
            if (!isCompareMode) {
                if (r > 0) {
                    tableHtml += `<td class="arc-table-action" onclick="ArcBoardEventHandlers.removeTableRow('${item.id}', ${r}); event.stopPropagation();">
                        <i data-lucide="minus"></i>
                    </td>`;
                } else {
                    tableHtml += '<th class="arc-table-action"></th>';
                }
            }
            tableHtml += '</tr>';
        }
        // Ligne pour supprimer colonnes - uniquement en mode solo
        if (!isCompareMode) {
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
        }
        tableHtml += '</table>';

        return `
            <div class="arc-floating-item ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="table"
                 ${arcId ? `data-arc-id="${arcId}"` : ''}
                 style="left: ${(item.x || 0) + offsetX}px; top: ${(item.y || 0) + offsetY}px"
                 onclick="${isCompareMode ? `InterArcConnectionService.handleClick('${arcId}', '${item.id}')` : `ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)`}">
                ${!isCompareMode ? this._renderDragHandle(item.id, true) : ''}
                <div class="arc-card arc-card-table" style="margin:0">
                    ${tableHtml}
                    ${!isCompareMode ? `<div class="arc-table-controls">
                        <button class="arc-table-btn" onclick="ArcBoardEventHandlers.addTableRow('${item.id}'); event.stopPropagation();" title="Ajouter une ligne">
                            <i data-lucide="plus"></i> Ligne
                        </button>
                        <button class="arc-table-btn" onclick="ArcBoardEventHandlers.addTableCol('${item.id}'); event.stopPropagation();" title="Ajouter une colonne">
                            <i data-lucide="plus"></i> Colonne
                        </button>
                    </div>` : ''}
                </div>
            </div>
        `;
    },

    _renderSceneItem(item, isSelected, arcId = null, offsetX = 0, offsetY = 0) {
        const isCompareMode = arcId !== null;
        const statusLabels = { 'setup': 'Introduction', 'development': 'Développement', 'climax': 'Point culminant', 'resolution': 'Résolution' };

        return `
            <div class="arc-floating-item ${isSelected ? 'selected' : ''}"
                 id="item-${item.id}"
                 data-item-id="${item.id}"
                 data-item-type="scene"
                 data-scene-id="${item.sceneId || ''}"
                 ${arcId ? `data-arc-id="${arcId}"` : ''}
                 style="left: ${(item.x || 0) + offsetX}px; top: ${(item.y || 0) + offsetY}px; width: ${item.width || 220}px; z-index: ${item.zIndex || 1}"
                 onclick="${isCompareMode ? `InterArcConnectionService.handleClick('${arcId}', '${item.id}')` : `ArcBoardViewModel.selectItem('${item.id}', event.ctrlKey || event.metaKey)`}">
                ${!isCompareMode ? this._renderDragHandle(item.id, true) : ''}
                ${!isCompareMode ? `<button class="arc-floating-delete" onclick="event.stopPropagation(); deleteArcItem('${item.id}')" title="Supprimer">
                    <i data-lucide="x"></i>
                </button>` : ''}
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
                    ${!isCompareMode ? `<button class="arc-card-scene-open" onclick="ArcBoardEventHandlers.openScene('${item.sceneId}'); event.stopPropagation();">
                        <i data-lucide="external-link"></i> Ouvrir
                    </button>` : ''}
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

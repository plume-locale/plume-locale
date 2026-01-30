// ============================================
// ARC BOARD - ViewModel (State & Logic)
// ============================================

/**
 * Modes d'affichage multi-arcs
 */
const MultiArcModes = {
    SOLO: 'solo',
    COMPARE: 'compare',
    SPLIT: 'split'
};

/**
 * État global du Arc Board (observable)
 */
const ArcBoardState = {
    // Arc courant
    currentArcId: null,

    // Vue & Navigation
    zoom: 1,
    panX: 0,
    panY: 0,

    // Sélection
    selectedItems: [],

    // Outil actif
    activeTool: ToolTypes.SELECT,

    // Mode connexion
    connectionSource: null,

    // Panneau contextuel
    contextPanelOpen: false,

    // Formulaires inline
    showingArcForm: false,
    showingCategoryForm: false,
    editingArcId: null,

    // Presse-papier
    clipboard: null,

    // === MULTI-ARCS ===
    multiArcMode: MultiArcModes.SOLO,
    multiArcBarExpanded: false,
    ghostArcs: [],           // IDs des arcs fantômes en mode Compare
    ghostOpacity: 0.3,       // Opacité des arcs fantômes (0-1)
    splitArcs: [],           // IDs des arcs en mode Split [{id, zoom, panX, panY}]
    splitLayout: 'vertical', // 'vertical' ou 'horizontal'
    interArcConnectionSource: null, // Pour créer des connexions inter-arcs

    // Reset l'état
    reset() {
        this.currentArcId = null;
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        this.selectedItems = [];
        this.activeTool = ToolTypes.SELECT;
        this.connectionSource = null;
        this.contextPanelOpen = false;
        this.showingArcForm = false;
        this.showingCategoryForm = false;
        this.editingArcId = null;
        // Reset multi-arcs
        this.multiArcMode = MultiArcModes.SOLO;
        this.multiArcBarExpanded = false;
        this.ghostArcs = [];
        this.ghostOpacity = 0.3;
        this.splitArcs = [];
        this.splitLayout = 'vertical';
        this.interArcConnectionSource = null;
    }
};

/**
 * ViewModel principal - Coordonne les actions
 */
const ArcBoardViewModel = {
    // ==========================================
    // NAVIGATION & ARCS
    // ==========================================

    /**
     * Ouvre un arc dans le board
     */
    openArc(arcId) {
        const arc = ArcRepository.getById(arcId);
        if (!arc) return false;

        // Initialiser le board si nécessaire
        if (!arc.board) {
            arc.board = createBoardModel();
        }

        ArcBoardState.currentArcId = arcId;
        ArcBoardState.selectedItems = [];
        ArcBoardState.zoom = 1;
        ArcBoardState.panX = 0;
        ArcBoardState.panY = 0;

        this.render();
        return true;
    },

    /**
     * Ferme l'arc courant
     */
    closeArc() {
        ArcBoardState.currentArcId = null;
        ArcBoardState.selectedItems = [];
        ArcBoardView.renderWelcome();
        ArcBoardView.renderSidebar();
    },

    /**
     * Récupère l'arc courant
     */
    getCurrentArc() {
        return ArcRepository.getById(ArcBoardState.currentArcId);
    },

    // ==========================================
    // RENDU
    // ==========================================

    /**
     * Rendu complet de l'interface
     */
    render() {
        ArcBoardView.renderSidebar();

        const arc = this.getCurrentArc();
        if (arc) {
            ArcBoardView.renderCanvas(arc);
            ArcBoardView.renderItems(arc);
            ArcBoardView.renderConnections(arc);
        } else {
            ArcBoardView.renderWelcome();
        }
    },

    /**
     * Rendu partiel des items seulement
     */
    renderItems() {
        const arc = this.getCurrentArc();
        if (arc) {
            ArcBoardView.renderItems(arc);
            ArcBoardView.renderConnections(arc);
        }
    },

    // ==========================================
    // SÉLECTION
    // ==========================================

    /**
     * Sélectionne un item
     */
    selectItem(itemId, addToSelection = false) {
        if (ArcBoardState.activeTool === ToolTypes.CONNECT) {
            return ConnectionService.handleClick(itemId);
        }

        if (addToSelection) {
            const index = ArcBoardState.selectedItems.indexOf(itemId);
            if (index === -1) {
                ArcBoardState.selectedItems.push(itemId);
            } else {
                ArcBoardState.selectedItems.splice(index, 1);
            }
        } else {
            ArcBoardState.selectedItems = [itemId];
        }

        this._updateSelectionUI();

        // Mettre à jour le panneau contextuel
        if (ArcBoardState.selectedItems.length === 1) {
            const arc = this.getCurrentArc();
            const item = BoardItemRepository.getById(arc.id, itemId);
            if (item) {
                ArcBoardView.renderContextPanel(item);
                if (!ArcBoardState.contextPanelOpen) {
                    this.toggleContextPanel();
                }
            }
        }
    },

    /**
     * Désélectionne tout
     */
    deselectAll() {
        ArcBoardState.selectedItems = [];
        this._updateSelectionUI();

        const arc = this.getCurrentArc();
        if (arc) {
            ArcBoardView.renderContextPanelDefault(arc);
        }
    },

    /**
     * Sélectionne tous les items
     */
    selectAll() {
        const arc = this.getCurrentArc();
        if (!arc) return;

        ArcBoardState.selectedItems = arc.board.items.map(i => i.id);
        this._updateSelectionUI();
    },

    _updateSelectionUI() {
        document.querySelectorAll('.arc-column, .arc-floating-item').forEach(el => {
            el.classList.remove('selected');
        });
        document.querySelectorAll('.arc-connection-line').forEach(el => {
            el.classList.remove('selected');
        });

        ArcBoardState.selectedItems.forEach(id => {
            const el = document.getElementById(`item-${id}`);
            if (el) el.classList.add('selected');

            const line = document.querySelector(`[data-connection-id="${id}"]`);
            if (line) line.classList.add('selected');
        });
    },

    // ==========================================
    // OUTILS
    // ==========================================

    /**
     * Change l'outil actif
     */
    setTool(tool) {
        // Annuler le mode connexion si on change d'outil
        if (ArcBoardState.activeTool === ToolTypes.CONNECT && tool !== ToolTypes.CONNECT) {
            ConnectionService.cancel();
        }

        ArcBoardState.activeTool = tool;

        // Mettre à jour l'UI
        document.querySelectorAll('.arc-toolbar-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeBtn = document.querySelector(`.arc-toolbar-btn[data-tool="${tool}"]`);
        if (activeBtn) activeBtn.classList.add('active');

        // Changer le curseur
        const canvas = document.getElementById('arcBoardCanvas');
        if (canvas) {
            canvas.classList.remove('tool-pan', 'tool-connect');
            if (tool === ToolTypes.PAN) canvas.classList.add('tool-pan');
            if (tool === ToolTypes.CONNECT) canvas.classList.add('tool-connect');
        }
    },

    // ==========================================
    // ZOOM & PAN
    // ==========================================

    /**
     * Zoom avant/arrière
     */
    zoom(delta) {
        const newZoom = ArcBoardState.zoom + (delta * ArcBoardConfig.canvas.zoomStep);
        ArcBoardState.zoom = Math.max(
            ArcBoardConfig.canvas.minZoom,
            Math.min(ArcBoardConfig.canvas.maxZoom, newZoom)
        );
        this._updateCanvasTransform();
    },

    /**
     * Reset zoom et position
     */
    resetView() {
        ArcBoardState.zoom = 1;
        ArcBoardState.panX = 0;
        ArcBoardState.panY = 0;
        this._updateCanvasTransform();
    },

    /**
     * Pan le canvas
     */
    pan(deltaX, deltaY) {
        ArcBoardState.panX += deltaX;
        ArcBoardState.panY += deltaY;
        this._updateCanvasTransform();
    },

    _updateCanvasTransform() {
        const content = document.getElementById('arcBoardContent');
        if (content) {
            content.style.transform = `scale(${ArcBoardState.zoom}) translate(${ArcBoardState.panX}px, ${ArcBoardState.panY}px)`;
        }

        const zoomLevel = document.getElementById('arcZoomLevel');
        if (zoomLevel) {
            zoomLevel.textContent = `${Math.round(ArcBoardState.zoom * 100)}%`;
        }
    },

    // ==========================================
    // ITEMS
    // ==========================================

    /**
     * Ajoute un item au centre du canvas visible
     */
    addItem(type) {
        const arc = this.getCurrentArc();
        if (!arc) return null;

        const position = this._getCenterPosition();
        const item = BoardItemRepository.create(arc.id, type, position);

        this.renderItems();
        this.selectItem(item.id);

        return item;
    },

    /**
     * Ajoute un item à une position spécifique
     */
    addItemAt(type, clientX, clientY) {
        const arc = this.getCurrentArc();
        if (!arc) return null;

        const position = this._clientToCanvasPosition(clientX, clientY);
        const item = BoardItemRepository.create(arc.id, type, position);

        this.renderItems();
        this.selectItem(item.id);

        return item;
    },

    /**
     * Supprime les items sélectionnés
     */
    deleteSelected() {
        const arc = this.getCurrentArc();
        if (!arc || ArcBoardState.selectedItems.length === 0) return;

        ArcBoardState.selectedItems.forEach(id => {
            // Vérifier si c'est une connexion
            const conn = ConnectionRepository.getById(arc.id, id);
            if (conn) {
                ConnectionRepository.delete(arc.id, id);
            } else {
                BoardItemRepository.delete(arc.id, id);
            }
        });

        ArcBoardState.selectedItems = [];
        this.renderItems();

        // Mettre à jour le panneau arcScenePanel s'il est visible
        const arcPanel = document.getElementById('arcScenePanel');
        if (arcPanel && !arcPanel.classList.contains('hidden') && typeof renderArcScenePanel === 'function') {
            renderArcScenePanel();
        }
    },

    /**
     * Met à jour un item
     */
    updateItem(itemId, data) {
        const arc = this.getCurrentArc();
        if (!arc) return;

        BoardItemRepository.update(arc.id, itemId, data);
    },

    /**
     * Met à jour la position d'un item
     */
    updateItemPosition(itemId, x, y) {
        const arc = this.getCurrentArc();
        if (!arc) return;

        BoardItemRepository.updatePosition(arc.id, itemId, x, y);
        ArcBoardView.renderConnections(arc);
    },

    // ==========================================
    // CARTES
    // ==========================================

    /**
     * Ajoute une carte à une colonne
     */
    addCard(columnId, type = 'note') {
        const arc = this.getCurrentArc();
        if (!arc) return null;

        const card = CardRepository.create(arc.id, columnId, type);
        this.renderItems();
        return card;
    },

    /**
     * Supprime une carte
     */
    deleteCard(columnId, cardId) {
        const arc = this.getCurrentArc();
        if (!arc) return;

        CardRepository.delete(arc.id, columnId, cardId);
        this.renderItems();

        // Mettre à jour le panneau arcScenePanel s'il est visible
        const arcPanel = document.getElementById('arcScenePanel');
        if (arcPanel && !arcPanel.classList.contains('hidden') && typeof renderArcScenePanel === 'function') {
            renderArcScenePanel();
        }
    },

    /**
     * Met à jour une carte
     */
    updateCard(columnId, cardId, data) {
        const arc = this.getCurrentArc();
        if (!arc) return;

        CardRepository.update(arc.id, columnId, cardId, data);
    },

    // ==========================================
    // COPY/PASTE
    // ==========================================

    /**
     * Copie les items sélectionnés
     */
    copy() {
        const arc = this.getCurrentArc();
        if (!arc) return;

        const itemsToCopy = arc.board.items.filter(i =>
            ArcBoardState.selectedItems.includes(i.id)
        );
        ArcBoardState.clipboard = JSON.parse(JSON.stringify(itemsToCopy));
    },

    /**
     * Colle les items du presse-papier
     */
    paste() {
        if (!ArcBoardState.clipboard?.length) return;

        const arc = this.getCurrentArc();
        if (!arc) return;

        const offset = 40;

        ArcBoardState.clipboard.forEach(item => {
            const newItem = JSON.parse(JSON.stringify(item));
            newItem.id = generateUniqueId('item');
            newItem.x += offset;
            newItem.y += offset;

            if (newItem.cards) {
                newItem.cards.forEach(card => {
                    card.id = generateUniqueId('card');
                });
            }

            arc.board.items.push(newItem);
        });

        saveProject();
        this.renderItems();
    },

    // ==========================================
    // PANNEAU CONTEXTUEL
    // ==========================================

    toggleContextPanel() {
        ArcBoardState.contextPanelOpen = !ArcBoardState.contextPanelOpen;
        const panel = document.getElementById('arcContextPanel');
        if (panel) {
            panel.classList.toggle('collapsed', !ArcBoardState.contextPanelOpen);
        }
    },

    // ==========================================
    // FORMULAIRES
    // ==========================================

    showArcForm(arcId = null) {
        ArcBoardState.editingArcId = arcId;
        ArcBoardState.showingArcForm = true;
        ArcBoardState.showingCategoryForm = false;
        ArcBoardView.renderSidebar();
    },

    hideArcForm() {
        ArcBoardState.showingArcForm = false;
        ArcBoardState.editingArcId = null;
        ArcBoardView.renderSidebar();
    },

    showCategoryForm() {
        ArcBoardState.showingCategoryForm = true;
        ArcBoardState.showingArcForm = false;
        ArcBoardView.renderSidebar();
    },

    hideCategoryForm() {
        ArcBoardState.showingCategoryForm = false;
        ArcBoardView.renderSidebar();
    },

    // ==========================================
    // HELPERS
    // ==========================================

    _getCenterPosition() {
        const canvas = document.getElementById('arcBoardCanvas');
        if (!canvas) return { x: 100, y: 100 };

        const rect = canvas.getBoundingClientRect();
        let x = (rect.width / 2 - ArcBoardState.panX) / ArcBoardState.zoom;
        let y = (rect.height / 2 - ArcBoardState.panY) / ArcBoardState.zoom;

        return this._snapToGrid({ x, y });
    },

    _clientToCanvasPosition(clientX, clientY) {
        const content = document.getElementById('arcBoardContent');
        if (!content) return { x: clientX, y: clientY };

        const rect = content.getBoundingClientRect();
        let x = (clientX - rect.left) / ArcBoardState.zoom;
        let y = (clientY - rect.top) / ArcBoardState.zoom;

        return this._snapToGrid({ x, y });
    },

    _snapToGrid(position) {
        if (!ArcBoardConfig.grid.snapEnabled) return position;

        const gridSize = ArcBoardConfig.grid.size;
        return {
            x: Math.round(position.x / gridSize) * gridSize,
            y: Math.round(position.y / gridSize) * gridSize
        };
    },

    // ==========================================
    // MULTI-ARCS
    // ==========================================

    /**
     * Bascule l'affichage de la barre multi-arcs
     */
    toggleMultiArcBar() {
        ArcBoardState.multiArcBarExpanded = !ArcBoardState.multiArcBarExpanded;
        this.render();
    },

    /**
     * Change le mode d'affichage multi-arcs
     */
    setMultiArcMode(mode) {
        if (!Object.values(MultiArcModes).includes(mode)) return;

        const previousMode = ArcBoardState.multiArcMode;
        ArcBoardState.multiArcMode = mode;

        // Expand la barre si on passe en mode Compare ou Split
        if (mode !== MultiArcModes.SOLO) {
            ArcBoardState.multiArcBarExpanded = true;
        }

        // Initialiser splitArcs si on passe en mode Split
        if (mode === MultiArcModes.SPLIT && ArcBoardState.splitArcs.length === 0) {
            if (ArcBoardState.currentArcId) {
                ArcBoardState.splitArcs = [{
                    id: ArcBoardState.currentArcId,
                    zoom: ArcBoardState.zoom,
                    panX: ArcBoardState.panX,
                    panY: ArcBoardState.panY
                }];
            }
        }

        // Nettoyer les ghost arcs si on quitte le mode Compare
        if (previousMode === MultiArcModes.COMPARE && mode !== MultiArcModes.COMPARE) {
            ArcBoardState.ghostArcs = [];
        }

        this.render();
    },

    /**
     * Ajoute un arc fantôme en mode Compare
     */
    addGhostArc(arcId) {
        if (!arcId || arcId === ArcBoardState.currentArcId) return;
        if (ArcBoardState.ghostArcs.includes(arcId)) return;

        ArcBoardState.ghostArcs.push(arcId);
        this.render();
    },

    /**
     * Retire un arc fantôme
     */
    removeGhostArc(arcId) {
        const index = ArcBoardState.ghostArcs.indexOf(arcId);
        if (index > -1) {
            ArcBoardState.ghostArcs.splice(index, 1);
            this.render();
        }
    },

    /**
     * Change l'opacité des arcs fantômes
     */
    setGhostOpacity(opacity) {
        ArcBoardState.ghostOpacity = Math.max(0.1, Math.min(1, opacity));
        this._updateGhostOpacity();
    },

    _updateGhostOpacity() {
        document.querySelectorAll('.arc-ghost-layer').forEach(el => {
            el.style.opacity = ArcBoardState.ghostOpacity;
        });
    },

    /**
     * Bascule un arc comme arc principal (depuis un ghost)
     */
    setMainArc(arcId) {
        const previousMainId = ArcBoardState.currentArcId;

        // L'ancien main devient ghost
        if (previousMainId && !ArcBoardState.ghostArcs.includes(previousMainId)) {
            ArcBoardState.ghostArcs.push(previousMainId);
        }

        // Retirer le nouvel arc principal des ghosts
        const ghostIndex = ArcBoardState.ghostArcs.indexOf(arcId);
        if (ghostIndex > -1) {
            ArcBoardState.ghostArcs.splice(ghostIndex, 1);
        }

        ArcBoardState.currentArcId = arcId;
        this.render();
    },

    /**
     * Ajoute un panneau en mode Split
     */
    addSplitPanel(arcId) {
        if (!arcId) return;
        if (ArcBoardState.splitArcs.find(s => s.id === arcId)) return;

        ArcBoardState.splitArcs.push({
            id: arcId,
            zoom: 1,
            panX: 0,
            panY: 0
        });
        this.render();
    },

    /**
     * Retire un panneau en mode Split
     */
    removeSplitPanel(arcId) {
        const index = ArcBoardState.splitArcs.findIndex(s => s.id === arcId);
        if (index > -1 && ArcBoardState.splitArcs.length > 1) {
            ArcBoardState.splitArcs.splice(index, 1);
            this.render();
        }
    },

    /**
     * Change le layout du mode Split
     */
    setSplitLayout(layout) {
        if (layout === 'vertical' || layout === 'horizontal') {
            ArcBoardState.splitLayout = layout;
            this.render();
        }
    },

    /**
     * Met à jour le zoom/pan d'un panneau split spécifique
     */
    updateSplitPanelView(arcId, zoom, panX, panY) {
        const panel = ArcBoardState.splitArcs.find(s => s.id === arcId);
        if (panel) {
            if (zoom !== undefined) panel.zoom = zoom;
            if (panX !== undefined) panel.panX = panX;
            if (panY !== undefined) panel.panY = panY;
        }
    },

    /**
     * Zoom un panneau split
     */
    zoomSplitPanel(arcId, delta) {
        const panel = ArcBoardState.splitArcs.find(s => s.id === arcId);
        if (!panel) return;

        const newZoom = panel.zoom + (delta * ArcBoardConfig.canvas.zoomStep);
        panel.zoom = Math.max(
            ArcBoardConfig.canvas.minZoom,
            Math.min(ArcBoardConfig.canvas.maxZoom, newZoom)
        );

        // Mettre à jour l'UI
        const content = document.getElementById(`splitContent-${arcId}`);
        if (content) {
            content.style.transform = `scale(${panel.zoom}) translate(${panel.panX}px, ${panel.panY}px)`;
        }

        const zoomEl = document.querySelector(`[data-arc-id="${arcId}"] .arc-split-zoom span`);
        if (zoomEl) {
            zoomEl.textContent = `${Math.round(panel.zoom * 100)}%`;
        }
    },

    /**
     * Change l'arc d'un panneau split
     */
    changeSplitPanelArc(panelIndex, newArcId) {
        if (panelIndex < 0 || panelIndex >= ArcBoardState.splitArcs.length) return;

        // Vérifier que l'arc n'est pas déjà utilisé
        if (ArcBoardState.splitArcs.find(s => s.id === newArcId)) {
            console.warn('Cet arc est déjà affiché dans un autre panneau');
            return;
        }

        ArcBoardState.splitArcs[panelIndex] = {
            id: newArcId,
            zoom: 1,
            panX: 0,
            panY: 0
        };

        this.render();
    },

    /**
     * Récupère les arcs disponibles pour ajouter (ni current, ni ghost, ni split)
     */
    getAvailableArcsForAdd() {
        const allArcs = ArcRepository.getAll();
        const usedIds = [ArcBoardState.currentArcId, ...ArcBoardState.ghostArcs];

        if (ArcBoardState.multiArcMode === MultiArcModes.SPLIT) {
            ArcBoardState.splitArcs.forEach(s => usedIds.push(s.id));
        }

        return allArcs.filter(arc => !usedIds.includes(arc.id));
    }
};

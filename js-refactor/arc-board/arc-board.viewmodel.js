// ============================================
// ARC BOARD - ViewModel (State & Logic)
// ============================================

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
    }
};

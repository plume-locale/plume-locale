// ============================================
// ARC BOARD - Configuration & Constants
// ============================================

const ArcBoardConfig = {
    canvas: {
        minZoom: 0.25,
        maxZoom: 2,
        zoomStep: 0.1,
        width: 3000,
        height: 2000
    },
    grid: {
        size: 24,
        snapEnabled: true
    },
    column: {
        defaultWidth: 280,
        minWidth: 200,
        maxWidth: 500
    },
    item: {
        noteWidth: 250,
        imageWidth: 300,
        linkWidth: 280,
        todoWidth: 260,
        commentWidth: 220
    }
};

// Catégories d'arcs prédéfinies
const ArcCategories = Object.freeze({
    intrigue: { label: 'Intrigue principale', icon: 'book-open', color: '#e74c3c' },
    subplot: { label: 'Intrigue secondaire', icon: 'file-text', color: '#16a085' },
    character: { label: 'Arc personnage', icon: 'user', color: '#3498db' },
    relationship: { label: 'Relation', icon: 'heart', color: '#e91e63' },
    theme: { label: 'Thème', icon: 'message-circle', color: '#9b59b6' },
    mystery: { label: 'Mystère', icon: 'search', color: '#607d8b' },
    worldbuilding: { label: 'Worldbuilding', icon: 'globe', color: '#1976d2' }
});

// Types de cartes supportés
const CardTypes = Object.freeze({
    note: { label: 'Note', icon: 'file-text' },
    image: { label: 'Image', icon: 'image' },
    link: { label: 'Lien', icon: 'link' },
    todo: { label: 'Tâches', icon: 'check-square' },
    comment: { label: 'Commentaire', icon: 'message-square' },
    table: { label: 'Tableau', icon: 'table' },
    audio: { label: 'Audio', icon: 'music' },
    scene: { label: 'Scène liée', icon: 'book-open' }
});

// Types d'items sur le board
const BoardItemTypes = Object.freeze({
    COLUMN: 'column',
    NOTE: 'note',
    IMAGE: 'image',
    LINK: 'link',
    TODO: 'todo',
    COMMENT: 'comment',
    TABLE: 'table'
});

// Outils disponibles
const ToolTypes = Object.freeze({
    SELECT: 'select',
    PAN: 'pan',
    CONNECT: 'connect'
});

// Types de drag
const DragTypes = Object.freeze({
    NONE: null,
    CARD: 'card',
    FLOATING: 'floating',
    COLUMN: 'column'
});
// ============================================
// ARC BOARD - Models (Data Structures)
// ============================================

/**
 * Factory pour créer un nouvel Arc narratif
 */
function createArcModel(data = {}) {
    const now = new Date().toISOString();
    return {
        id: data.id || generateUniqueId('arc'),
        title: data.title || 'Nouvel arc',
        category: data.category || 'intrigue',
        color: data.color || '#e74c3c',
        description: data.description || '',
        created: data.created || now,
        updated: now,
        board: data.board || createBoardModel(),
        type: data.category || 'intrigue',
        importance: data.importance || 'major',
        relatedCharacters: data.relatedCharacters || [],
        resolution: data.resolution || { type: 'ongoing', sceneId: null },
        scenePresence: data.scenePresence || []
    };
}

/**
 * Factory pour créer un Board vide
 */
function createBoardModel() {
    return {
        items: [],
        connections: []
    };
}

/**
 * Factory pour créer un Item du board (colonne, note, image, etc.)
 */
function createBoardItemModel(type, position = { x: 0, y: 0 }, data = {}) {
    const base = {
        id: data.id || generateUniqueId('item'),
        type: type,
        x: position.x,
        y: position.y
    };

    switch (type) {
        case BoardItemTypes.COLUMN:
            return {
                ...base,
                title: data.title || 'Nouvelle colonne',
                width: data.width || ArcBoardConfig.column.defaultWidth,
                cards: data.cards || []
            };

        case BoardItemTypes.NOTE:
            return {
                ...base,
                content: data.content || '',
                width: data.width || ArcBoardConfig.item.noteWidth
            };

        case BoardItemTypes.IMAGE:
            return {
                ...base,
                src: data.src || '',
                width: data.width || ArcBoardConfig.item.imageWidth,
                caption: data.caption || ''
            };

        case BoardItemTypes.LINK:
            return {
                ...base,
                url: data.url || '',
                title: data.title || ''
            };

        case BoardItemTypes.TODO:
            return {
                ...base,
                title: data.title || 'Liste de tâches',
                items: data.items || []
            };

        case BoardItemTypes.COMMENT:
            return {
                ...base,
                content: data.content || ''
            };

        case BoardItemTypes.TABLE:
            return {
                ...base,
                rows: data.rows || 3,
                cols: data.cols || 3,
                data: data.data || []
            };

        default:
            return base;
    }
}

/**
 * Factory pour créer une Carte (dans une colonne)
 */
function createCardModel(type, data = {}) {
    const base = {
        id: data.id || generateUniqueId('card'),
        type: type
    };

    switch (type) {
        case 'note':
            return { ...base, content: data.content || '' };

        case 'image':
            return { ...base, src: data.src || '', caption: data.caption || '' };

        case 'link':
            return { ...base, url: data.url || '', title: data.title || '', previewImage: data.previewImage || '' };

        case 'todo':
            return { ...base, title: data.title || '', items: data.items || [] };

        case 'audio':
            return { ...base, url: data.url || '' };

        case 'scene':
            return {
                ...base,
                sceneId: data.sceneId || '',
                sceneTitle: data.sceneTitle || '',
                breadcrumb: data.breadcrumb || '',
                intensity: data.intensity || 3,
                status: data.status || 'development',
                notes: data.notes || ''
            };

        default:
            return { ...base, content: data.content || '' };
    }
}

/**
 * Factory pour créer une Connexion entre deux items
 */
function createConnectionModel(fromId, toId, sides = {}) {
    return {
        id: generateUniqueId('conn'),
        from: fromId,
        fromSide: sides.fromSide || 'right',
        to: toId,
        toSide: sides.toSide || 'left'
    };
}

/**
 * Factory pour créer une tâche Todo
 */
function createTodoItemModel(text = '') {
    return {
        text: text,
        completed: false
    };
}

/**
 * Factory pour créer une catégorie custom
 */
function createCategoryModel(name, color) {
    return {
        label: name,
        icon: 'folder',
        color: color,
        custom: true
    };
}

/**
 * Convertit un item flottant en carte
 */
function convertItemToCard(item) {
    const card = createCardModel(item.type === 'comment' ? 'note' : item.type);

    switch (item.type) {
        case 'note':
        case 'comment':
            card.content = item.content || '';
            break;
        case 'todo':
            card.title = item.title || '';
            card.items = item.items || [];
            break;
        case 'image':
            card.src = item.src || '';
            card.caption = item.caption || '';
            break;
        case 'link':
            card.url = item.url || '';
            card.title = item.title || '';
            break;
        case 'table':
            card.type = 'note';
            card.content = 'Tableau converti';
            break;
    }

    return card;
}

/**
 * Convertit une carte en item flottant
 */
function convertCardToItem(card, position) {
    const type = card.type === 'audio' ? 'note' : card.type;
    const item = createBoardItemModel(type, position);

    switch (card.type) {
        case 'note':
            item.content = card.content || '';
            break;
        case 'todo':
            item.title = card.title || '';
            item.items = card.items || [];
            break;
        case 'image':
            item.src = card.src || '';
            break;
        case 'link':
            item.url = card.url || '';
            item.title = card.title || '';
            break;
    }

    return item;
}
// ============================================
// ARC BOARD - Repository (CRUD Operations)
// ============================================

/**
 * Repository pour les opérations CRUD sur les Arcs
 */
const ArcRepository = {
    /**
     * Initialise les structures de données si nécessaires
     */
    init() {
        if (!project.arcCategories) {
            project.arcCategories = {};
        }
        if (!project.narrativeArcs) {
            project.narrativeArcs = [];
        }
        if (!project.collapsedArcCategories) {
            project.collapsedArcCategories = [];
        }
    },

    /**
     * Récupère tous les arcs
     */
    getAll() {
        this.init();
        return project.narrativeArcs || [];
    },

    /**
     * Récupère un arc par son ID
     */
    getById(arcId) {
        return this.getAll().find(arc => arc.id === arcId) || null;
    },

    /**
     * Crée un nouvel arc
     */
    create(data) {
        this.init();
        const arc = createArcModel(data);
        project.narrativeArcs.push(arc);
        this._save();
        return arc;
    },

    /**
     * Met à jour un arc existant
     */
    update(arcId, data) {
        const arc = this.getById(arcId);
        if (!arc) return null;

        Object.assign(arc, data, { updated: new Date().toISOString() });
        this._save();
        return arc;
    },

    /**
     * Supprime un arc
     */
    delete(arcId) {
        this.init();
        const index = project.narrativeArcs.findIndex(a => a.id === arcId);
        if (index === -1) return false;

        project.narrativeArcs.splice(index, 1);
        this._save();
        return true;
    },

    /**
     * Duplique un arc
     */
    duplicate(arcId) {
        const arc = this.getById(arcId);
        if (!arc) return null;

        const newArc = JSON.parse(JSON.stringify(arc));
        newArc.id = generateUniqueId('arc');
        newArc.title = arc.title + ' (copie)';
        newArc.created = new Date().toISOString();
        newArc.updated = new Date().toISOString();

        // Régénérer les IDs
        const idMap = {};
        newArc.board.items.forEach(item => {
            const oldId = item.id;
            item.id = generateUniqueId('item');
            idMap[oldId] = item.id;

            if (item.cards) {
                item.cards.forEach(card => {
                    card.id = generateUniqueId('card');
                });
            }
        });

        if (newArc.board.connections) {
            newArc.board.connections.forEach(conn => {
                conn.id = generateUniqueId('conn');
                conn.from = idMap[conn.from] || conn.from;
                conn.to = idMap[conn.to] || conn.to;
            });
        }

        project.narrativeArcs.push(newArc);
        this._save();
        return newArc;
    },

    /**
     * Récupère toutes les catégories (prédéfinies + custom)
     */
    getAllCategories() {
        this.init();
        return { ...ArcCategories, ...project.arcCategories };
    },

    /**
     * Ajoute une catégorie custom
     */
    addCategory(name, color) {
        this.init();
        const key = name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
        project.arcCategories[key] = createCategoryModel(name, color);
        this._save();
        return key;
    },

    /**
     * Toggle l'état collapsed d'une catégorie
     */
    toggleCategoryCollapse(categoryKey) {
        this.init();
        const index = project.collapsedArcCategories.indexOf(categoryKey);
        if (index === -1) {
            project.collapsedArcCategories.push(categoryKey);
        } else {
            project.collapsedArcCategories.splice(index, 1);
        }
        this._save();
    },

    /**
     * Vérifie si une catégorie est collapsed
     */
    isCategoryCollapsed(categoryKey) {
        return project.collapsedArcCategories?.includes(categoryKey) || false;
    },

    _save() {
        if (typeof saveProject === 'function') {
            saveProject();
        }
    }
};

/**
 * Repository pour les opérations CRUD sur les Items du Board
 */
const BoardItemRepository = {
    /**
     * Récupère tous les items d'un arc
     */
    getAll(arcId) {
        const arc = ArcRepository.getById(arcId);
        return arc?.board?.items || [];
    },

    /**
     * Récupère un item par son ID
     */
    getById(arcId, itemId) {
        return this.getAll(arcId).find(item => item.id === itemId) || null;
    },

    /**
     * Crée un nouvel item
     */
    create(arcId, type, position, data = {}) {
        const arc = ArcRepository.getById(arcId);
        if (!arc) return null;

        if (!arc.board) arc.board = createBoardModel();

        const item = createBoardItemModel(type, position, data);
        arc.board.items.push(item);
        this._save();
        return item;
    },

    /**
     * Met à jour un item
     */
    update(arcId, itemId, data) {
        const item = this.getById(arcId, itemId);
        if (!item) return null;

        Object.assign(item, data);
        this._save();
        return item;
    },

    /**
     * Met à jour la position d'un item
     */
    updatePosition(arcId, itemId, x, y) {
        return this.update(arcId, itemId, { x, y });
    },

    /**
     * Supprime un item
     */
    delete(arcId, itemId) {
        const arc = ArcRepository.getById(arcId);
        if (!arc?.board?.items) return false;

        const index = arc.board.items.findIndex(i => i.id === itemId);
        if (index === -1) return false;

        arc.board.items.splice(index, 1);

        // Supprimer les connexions liées
        if (arc.board.connections) {
            arc.board.connections = arc.board.connections.filter(
                c => c.from !== itemId && c.to !== itemId
            );
        }

        this._save();
        return true;
    },

    _save() {
        if (typeof saveProject === 'function') {
            saveProject();
        }
    }
};

/**
 * Repository pour les opérations CRUD sur les Cartes
 */
const CardRepository = {
    /**
     * Récupère toutes les cartes d'une colonne
     */
    getAll(arcId, columnId) {
        const column = BoardItemRepository.getById(arcId, columnId);
        return column?.cards || [];
    },

    /**
     * Récupère une carte par son ID
     */
    getById(arcId, columnId, cardId) {
        return this.getAll(arcId, columnId).find(card => card.id === cardId) || null;
    },

    /**
     * Trouve une carte dans tout le board (retourne { column, card, index })
     */
    findInBoard(arcId, cardId) {
        const items = BoardItemRepository.getAll(arcId);
        for (const item of items) {
            if (item.type === 'column' && item.cards) {
                const index = item.cards.findIndex(c => c.id === cardId);
                if (index !== -1) {
                    return { column: item, card: item.cards[index], index };
                }
            }
        }
        return null;
    },

    /**
     * Crée une nouvelle carte
     */
    create(arcId, columnId, type, data = {}) {
        const column = BoardItemRepository.getById(arcId, columnId);
        if (!column || column.type !== 'column') return null;

        if (!column.cards) column.cards = [];

        const card = createCardModel(type, data);
        column.cards.push(card);
        this._save();
        return card;
    },

    /**
     * Met à jour une carte
     */
    update(arcId, columnId, cardId, data) {
        const card = this.getById(arcId, columnId, cardId);
        if (!card) return null;

        Object.assign(card, data);
        this._save();
        return card;
    },

    /**
     * Supprime une carte
     */
    delete(arcId, columnId, cardId) {
        const column = BoardItemRepository.getById(arcId, columnId);
        if (!column?.cards) return false;

        const index = column.cards.findIndex(c => c.id === cardId);
        if (index === -1) return false;

        column.cards.splice(index, 1);
        this._save();
        return true;
    },

    /**
     * Déplace une carte vers une autre colonne
     */
    move(arcId, fromColumnId, toColumnId, cardId, insertIndex = -1) {
        const arc = ArcRepository.getById(arcId);
        if (!arc) return false;

        const fromColumn = BoardItemRepository.getById(arcId, fromColumnId);
        const toColumn = BoardItemRepository.getById(arcId, toColumnId);

        if (!fromColumn?.cards || !toColumn) return false;
        if (!toColumn.cards) toColumn.cards = [];

        const cardIndex = fromColumn.cards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return false;

        const [card] = fromColumn.cards.splice(cardIndex, 1);

        if (insertIndex >= 0 && insertIndex < toColumn.cards.length) {
            toColumn.cards.splice(insertIndex, 0, card);
        } else {
            toColumn.cards.push(card);
        }

        // Mise à jour scenePresence si c'est une carte scene
        if (card.type === 'scene' && card.sceneId && arc.scenePresence) {
            const presence = arc.scenePresence.find(p => p.sceneId == card.sceneId);
            if (presence) {
                presence.columnId = toColumnId;
            }
        }

        this._save();
        return true;
    },

    /**
     * Convertit une carte en item flottant
     */
    convertToItem(arcId, columnId, cardId, position) {
        const column = BoardItemRepository.getById(arcId, columnId);
        if (!column?.cards) return null;

        const cardIndex = column.cards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return null;

        const [card] = column.cards.splice(cardIndex, 1);
        const item = convertCardToItem(card, position);

        const arc = ArcRepository.getById(arcId);
        arc.board.items.push(item);

        this._save();
        return item;
    },

    _save() {
        if (typeof saveProject === 'function') {
            saveProject();
        }
    }
};

/**
 * Repository pour les opérations CRUD sur les Connexions
 */
const ConnectionRepository = {
    /**
     * Récupère toutes les connexions d'un arc
     */
    getAll(arcId) {
        const arc = ArcRepository.getById(arcId);
        return arc?.board?.connections || [];
    },

    /**
     * Récupère une connexion par son ID
     */
    getById(arcId, connectionId) {
        return this.getAll(arcId).find(conn => conn.id === connectionId) || null;
    },

    /**
     * Vérifie si une connexion existe entre deux items
     */
    exists(arcId, fromId, toId) {
        return this.getAll(arcId).some(c =>
            (c.from === fromId && c.to === toId) ||
            (c.from === toId && c.to === fromId)
        );
    },

    /**
     * Crée une nouvelle connexion
     */
    create(arcId, fromId, toId, sides = {}) {
        const arc = ArcRepository.getById(arcId);
        if (!arc) return null;

        if (!arc.board.connections) arc.board.connections = [];

        // Vérifier si la connexion existe déjà
        if (this.exists(arcId, fromId, toId)) return null;

        const connection = createConnectionModel(fromId, toId, sides);
        arc.board.connections.push(connection);
        this._save();
        return connection;
    },

    /**
     * Supprime une connexion
     */
    delete(arcId, connectionId) {
        const arc = ArcRepository.getById(arcId);
        if (!arc?.board?.connections) return false;

        const index = arc.board.connections.findIndex(c => c.id === connectionId);
        if (index === -1) return false;

        arc.board.connections.splice(index, 1);
        this._save();
        return true;
    },

    /**
     * Supprime toutes les connexions liées à un item
     */
    deleteByItemId(arcId, itemId) {
        const arc = ArcRepository.getById(arcId);
        if (!arc?.board?.connections) return;

        arc.board.connections = arc.board.connections.filter(
            c => c.from !== itemId && c.to !== itemId
        );
        this._save();
    },

    _save() {
        if (typeof saveProject === 'function') {
            saveProject();
        }
    }
};
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
// ============================================
// ARC BOARD - Services (DragDrop, Connection, etc.)
// ============================================

/**
 * Service unifié de Drag & Drop
 * Gère le drag de cartes, d'items flottants et de colonnes
 */
const DragDropService = {
    // État du drag en cours
    _state: {
        active: false,
        type: null,         // 'card' | 'floating' | 'column'
        itemId: null,
        sourceColumnId: null,
        element: null,
        startX: 0,
        startY: 0,
        offsetX: 0,
        offsetY: 0
    },

    /**
     * Reset l'état
     */
    reset() {
        this._state = {
            active: false,
            type: null,
            itemId: null,
            sourceColumnId: null,
            element: null,
            startX: 0,
            startY: 0,
            offsetX: 0,
            offsetY: 0
        };
    },

    /**
     * Démarre le drag d'une carte
     */
    startCardDrag(event, cardId, columnId) {
        event.stopPropagation();

        this._state = {
            active: true,
            type: DragTypes.CARD,
            itemId: cardId,
            sourceColumnId: columnId,
            element: event.target.closest('.arc-card'),
            startX: event.clientX,
            startY: event.clientY
        };

        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/json', JSON.stringify({
            type: 'card',
            cardId: cardId,
            columnId: columnId
        }));

        if (this._state.element) {
            this._state.element.classList.add('dragging');
        }

        // Activer les zones de drop
        requestAnimationFrame(() => {
            document.querySelectorAll('.arc-column-body').forEach(el => {
                el.classList.add('drop-target');
            });
            document.getElementById('arcBoardCanvas')?.classList.add('drop-zone-active');
        });
    },

    /**
     * Démarre le drag d'un item flottant
     */
    startFloatingDrag(event, itemId) {
        event.stopPropagation();

        this._state = {
            active: true,
            type: DragTypes.FLOATING,
            itemId: itemId,
            sourceColumnId: null,
            element: event.target.closest('.arc-floating-item'),
            startX: event.clientX,
            startY: event.clientY
        };

        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('application/json', JSON.stringify({
            type: 'floating',
            itemId: itemId
        }));

        if (this._state.element) {
            this._state.element.classList.add('dragging');
        }

        // Activer les zones de drop (colonnes uniquement pour les items flottants)
        requestAnimationFrame(() => {
            document.querySelectorAll('.arc-column-body').forEach(el => {
                el.classList.add('drop-target');
            });
        });
    },

    /**
     * Fin du drag
     */
    endDrag(event) {
        if (this._state.element) {
            this._state.element.classList.remove('dragging');
        }

        // Nettoyer les zones de drop
        document.querySelectorAll('.arc-column-body').forEach(el => {
            el.classList.remove('drop-target', 'drop-hover');
        });
        document.getElementById('arcBoardCanvas')?.classList.remove('drop-zone-active', 'drop-hover');

        this.reset();
    },

    /**
     * Gère le dragover sur une colonne
     */
    handleColumnDragOver(event) {
        if (!this._state.active) return;

        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        event.currentTarget.classList.add('drop-hover');
    },

    /**
     * Gère le dragleave sur une colonne
     */
    handleColumnDragLeave(event) {
        event.currentTarget.classList.remove('drop-hover');
    },

    /**
     * Gère le drop sur une colonne
     */
    handleColumnDrop(event, targetColumnId) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('drop-hover');

        if (!this._state.active) return;

        const arc = ArcBoardViewModel.getCurrentArc();
        if (!arc) return;

        try {
            if (this._state.type === DragTypes.CARD) {
                // Déplacer une carte entre colonnes
                if (this._state.sourceColumnId !== targetColumnId) {
                    CardRepository.move(
                        arc.id,
                        this._state.sourceColumnId,
                        targetColumnId,
                        this._state.itemId
                    );
                }
            } else if (this._state.type === DragTypes.FLOATING) {
                // Convertir un item flottant en carte
                const item = BoardItemRepository.getById(arc.id, this._state.itemId);
                if (item) {
                    const card = convertItemToCard(item);
                    BoardItemRepository.delete(arc.id, this._state.itemId);

                    const column = BoardItemRepository.getById(arc.id, targetColumnId);
                    if (column) {
                        if (!column.cards) column.cards = [];
                        column.cards.push(card);
                        saveProject();
                    }
                }
            }

            ArcBoardViewModel.renderItems();
        } finally {
            this.reset();
        }
    },

    /**
     * Gère le dragover sur le canvas
     */
    handleCanvasDragOver(event) {
        // Permettre le drop seulement pour les cartes (conversion en item flottant)
        if (this._state.type === DragTypes.CARD) {
            // Ne pas accepter si on est sur une colonne
            if (!event.target.closest('.arc-column')) {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                document.getElementById('arcBoardCanvas')?.classList.add('drop-hover');
            }
        }
    },

    /**
     * Gère le dragleave sur le canvas
     */
    handleCanvasDragLeave(event) {
        if (!event.relatedTarget || !event.currentTarget.contains(event.relatedTarget)) {
            document.getElementById('arcBoardCanvas')?.classList.remove('drop-hover');
        }
    },

    /**
     * Gère le drop sur le canvas (convertit carte en item flottant)
     */
    handleCanvasDrop(event) {
        // Ignorer si on drop sur une colonne
        if (event.target.closest('.arc-column')) return;

        event.preventDefault();
        document.getElementById('arcBoardCanvas')?.classList.remove('drop-hover');

        if (this._state.type !== DragTypes.CARD) return;

        const arc = ArcBoardViewModel.getCurrentArc();
        if (!arc) return;

        try {
            const position = ArcBoardViewModel._clientToCanvasPosition(event.clientX, event.clientY);
            CardRepository.convertToItem(
                arc.id,
                this._state.sourceColumnId,
                this._state.itemId,
                position
            );
            ArcBoardViewModel.renderItems();
        } finally {
            this.reset();
        }
    },

    /**
     * Vérifie si un drag est en cours
     */
    isActive() {
        return this._state.active;
    },

    /**
     * Récupère le type de drag en cours
     */
    getType() {
        return this._state.type;
    }
};

/**
 * Service de gestion des Connexions
 */
const ConnectionService = {
    /**
     * Active/désactive le mode connexion
     */
    toggle() {
        if (ArcBoardState.activeTool === ToolTypes.CONNECT) {
            this.cancel();
        } else {
            ArcBoardState.activeTool = ToolTypes.CONNECT;
            ArcBoardState.connectionSource = null;
            this._updateUI();
        }
    },

    /**
     * Annule le mode connexion
     */
    cancel() {
        ArcBoardState.activeTool = ToolTypes.SELECT;
        ArcBoardState.connectionSource = null;
        this._cleanupUI();
        ArcBoardViewModel.setTool(ToolTypes.SELECT);
    },

    /**
     * Gère un clic sur un item en mode connexion
     */
    handleClick(itemId) {
        if (ArcBoardState.activeTool !== ToolTypes.CONNECT) return false;

        const arc = ArcBoardViewModel.getCurrentArc();
        if (!arc) return false;

        if (!ArcBoardState.connectionSource) {
            // Premier clic: sélectionner la source
            ArcBoardState.connectionSource = itemId;
            this._updateSourceUI(itemId);
            return true;
        } else {
            // Deuxième clic: créer la connexion ou annuler
            if (ArcBoardState.connectionSource === itemId) {
                // Clic sur le même élément = annuler
                this.cancel();
                return true;
            }

            // Créer la connexion
            const sides = this._calculateBestSides(ArcBoardState.connectionSource, itemId);
            ConnectionRepository.create(arc.id, ArcBoardState.connectionSource, itemId, sides);

            // Reset pour nouvelle connexion
            ArcBoardState.connectionSource = null;
            this._updateUI();
            ArcBoardView.renderConnections(arc);

            return true;
        }
    },

    /**
     * Calcule les meilleurs côtés pour une connexion
     */
    _calculateBestSides(fromId, toId) {
        const fromEl = document.getElementById(`item-${fromId}`);
        const toEl = document.getElementById(`item-${toId}`);

        if (!fromEl || !toEl) return { fromSide: 'right', toSide: 'left' };

        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();

        const fromCenterX = fromRect.left + fromRect.width / 2;
        const fromCenterY = fromRect.top + fromRect.height / 2;
        const toCenterX = toRect.left + toRect.width / 2;
        const toCenterY = toRect.top + toRect.height / 2;

        const dx = toCenterX - fromCenterX;
        const dy = toCenterY - fromCenterY;

        if (Math.abs(dx) > Math.abs(dy)) {
            return dx > 0
                ? { fromSide: 'right', toSide: 'left' }
                : { fromSide: 'left', toSide: 'right' };
        } else {
            return dy > 0
                ? { fromSide: 'bottom', toSide: 'top' }
                : { fromSide: 'top', toSide: 'bottom' };
        }
    },

    _updateUI() {
        const hint = document.getElementById('connectionModeHint');
        if (hint) {
            hint.style.display = 'flex';
            document.getElementById('connectionHintText').textContent = 'Cliquez sur l\'élément source';
        }

        document.querySelectorAll('.arc-column, .arc-floating-item').forEach(el => {
            el.classList.add('connectable');
            el.classList.remove('connection-source', 'connection-target');
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    _updateSourceUI(sourceId) {
        const sourceEl = document.getElementById(`item-${sourceId}`);
        if (sourceEl) {
            sourceEl.classList.add('connection-source');
            sourceEl.classList.remove('connectable');
        }

        document.getElementById('connectionHintText').textContent = 'Cliquez sur l\'élément cible';

        document.querySelectorAll('.arc-column, .arc-floating-item').forEach(el => {
            if (el.id !== `item-${sourceId}`) {
                el.classList.add('connection-target');
            }
        });
    },

    _cleanupUI() {
        const hint = document.getElementById('connectionModeHint');
        if (hint) hint.style.display = 'none';

        document.querySelectorAll('.arc-column, .arc-floating-item').forEach(el => {
            el.classList.remove('connectable', 'connection-source', 'connection-target');
        });
    }
};

/**
 * Service de gestion du Pan (déplacement du canvas)
 */
const PanService = {
    _state: {
        active: false,
        startX: 0,
        startY: 0
    },

    start(event) {
        this._state = {
            active: true,
            startX: event.clientX - ArcBoardState.panX,
            startY: event.clientY - ArcBoardState.panY
        };
        document.getElementById('arcBoardCanvas')?.classList.add('panning');
    },

    move(event) {
        if (!this._state.active) return;

        ArcBoardState.panX = event.clientX - this._state.startX;
        ArcBoardState.panY = event.clientY - this._state.startY;
        ArcBoardViewModel._updateCanvasTransform();
    },

    end() {
        this._state.active = false;
        document.getElementById('arcBoardCanvas')?.classList.remove('panning');
    },

    isActive() {
        return this._state.active;
    }
};

/**
 * Service de redimensionnement des colonnes
 */
const ResizeService = {
    _state: {
        active: false,
        columnId: null,
        startX: 0,
        startWidth: 0
    },

    start(event, columnId) {
        event.stopPropagation();
        event.preventDefault();

        const el = document.getElementById(`item-${columnId}`);
        if (!el) return;

        this._state = {
            active: true,
            columnId: columnId,
            startX: event.clientX,
            startWidth: parseInt(el.style.width) || ArcBoardConfig.column.defaultWidth
        };
    },

    move(event) {
        if (!this._state.active) return;

        const dx = (event.clientX - this._state.startX) / ArcBoardState.zoom;
        let newWidth = this._state.startWidth + dx;

        newWidth = Math.max(ArcBoardConfig.column.minWidth, Math.min(ArcBoardConfig.column.maxWidth, newWidth));

        const el = document.getElementById(`item-${this._state.columnId}`);
        if (el) {
            el.style.width = `${newWidth}px`;
        }
    },

    end() {
        if (!this._state.active) return;

        const el = document.getElementById(`item-${this._state.columnId}`);
        if (el) {
            const arc = ArcBoardViewModel.getCurrentArc();
            if (arc) {
                BoardItemRepository.update(arc.id, this._state.columnId, {
                    width: parseInt(el.style.width) || ArcBoardConfig.column.defaultWidth
                });
            }
        }

        this._state = { active: false, columnId: null, startX: 0, startWidth: 0 };
    },

    isActive() {
        return this._state.active;
    }
};

/**
 * Service de déplacement des items (mousedown/mousemove)
 */
const ItemMoveService = {
    _state: {
        active: false,
        itemId: null,
        startX: 0,
        startY: 0,
        itemStartX: 0,
        itemStartY: 0
    },

    start(event, itemId) {
        const el = document.getElementById(`item-${itemId}`);
        if (!el) return;

        this._state = {
            active: true,
            itemId: itemId,
            startX: event.clientX,
            startY: event.clientY,
            itemStartX: parseInt(el.style.left) || 0,
            itemStartY: parseInt(el.style.top) || 0
        };

        el.classList.add('dragging');
    },

    move(event) {
        if (!this._state.active) return;

        const dx = (event.clientX - this._state.startX) / ArcBoardState.zoom;
        const dy = (event.clientY - this._state.startY) / ArcBoardState.zoom;

        let newX = this._state.itemStartX + dx;
        let newY = this._state.itemStartY + dy;

        // Snap to grid
        if (ArcBoardConfig.grid.snapEnabled) {
            const gridSize = ArcBoardConfig.grid.size;
            newX = Math.round(newX / gridSize) * gridSize;
            newY = Math.round(newY / gridSize) * gridSize;
        }

        const el = document.getElementById(`item-${this._state.itemId}`);
        if (el) {
            el.style.left = `${newX}px`;
            el.style.top = `${newY}px`;
        }

        // Mettre à jour les connexions en temps réel
        const arc = ArcBoardViewModel.getCurrentArc();
        if (arc) {
            ArcBoardView.renderConnections(arc);
        }
    },

    end() {
        if (!this._state.active) return;

        const el = document.getElementById(`item-${this._state.itemId}`);
        if (el) {
            el.classList.remove('dragging');

            const arc = ArcBoardViewModel.getCurrentArc();
            if (arc) {
                BoardItemRepository.updatePosition(
                    arc.id,
                    this._state.itemId,
                    parseInt(el.style.left) || 0,
                    parseInt(el.style.top) || 0
                );
            }
        }

        this._state = { active: false, itemId: null, startX: 0, startY: 0, itemStartX: 0, itemStartY: 0 };
    },

    isActive() {
        return this._state.active;
    }
};
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

                <button class="arc-toolbar-btn" data-tooltip="Note" onclick="ArcBoardViewModel.addItem('note')">
                    <i data-lucide="file-text"></i>
                </button>
                <button class="arc-toolbar-btn" data-tooltip="Colonne" onclick="ArcBoardViewModel.addItem('column')">
                    <i data-lucide="columns-3"></i>
                </button>
                <button class="arc-toolbar-btn" data-tooltip="Lien" onclick="ArcBoardViewModel.addItem('link')">
                    <i data-lucide="link"></i>
                </button>
                <button class="arc-toolbar-btn" data-tooltip="Tâches" onclick="ArcBoardViewModel.addItem('todo')">
                    <i data-lucide="check-square"></i>
                </button>
                <button class="arc-toolbar-btn" data-tooltip="Commentaire" onclick="ArcBoardViewModel.addItem('comment')">
                    <i data-lucide="message-square"></i>
                </button>
                <button class="arc-toolbar-btn" data-tooltip="Tableau" onclick="ArcBoardViewModel.addItem('table')">
                    <i data-lucide="table"></i>
                </button>

                <div class="arc-toolbar-separator"></div>

                <button class="arc-toolbar-btn" data-tooltip="Image" onclick="ArcBoardViewModel.addItem('image')">
                    <i data-lucide="image"></i>
                </button>
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
        const container = document.getElementById('arcBoardItems');
        if (!container || !arc.board) return;

        container.innerHTML = arc.board.items.map(item => this._renderItem(item)).join('');

        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Masquer l'empty state si items présents
        const emptyState = document.querySelector('.arc-board-empty');
        if (emptyState) {
            emptyState.style.display = arc.board.items.length > 0 ? 'none' : 'block';
        }
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
            default: return '';
        }
    },

    _renderDragHandle(itemId, isFloating = false) {
        const className = isFloating ? 'arc-floating-drag-handle' : 'arc-card-drag-handle';
        const handler = isFloating
            ? `DragDropService.startFloatingDrag(event, '${itemId}')`
            : `DragDropService.startCardDrag(event, '${itemId}', this.closest('.arc-column').dataset.itemId)`;

        return `
            <div class="${className}"
                 draggable="true"
                 ondragstart="${handler}"
                 ondragend="DragDropService.endDrag(event)"
                 onmousedown="event.stopPropagation()"
                 title="Glisser pour déplacer">
                <i data-lucide="grip-vertical"></i>
            </div>
        `;
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
                    <div class="arc-card-add" onclick="event.stopPropagation(); ArcBoardViewModel.addCard('${item.id}')">
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
            tableHtml += '</tr>';
        }
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
    }
};
// ============================================
// ARC BOARD - Event Handlers
// ============================================

/**
 * Gestionnaires d'événements centralisés
 */
const ArcBoardEventHandlers = {
    // ==========================================
    // CANVAS EVENTS
    // ==========================================

    onCanvasMouseDown(event) {
        const target = event.target;

        // Clic sur le fond du canvas
        if (target.id === 'arcBoardCanvas' ||
            target.id === 'arcBoardContent' ||
            target.classList.contains('arc-board-content') ||
            target.id === 'arcBoardItems') {

            if (ArcBoardState.activeTool === ToolTypes.PAN || event.button === 1) {
                PanService.start(event);
            } else if (ArcBoardState.activeTool === ToolTypes.CONNECT) {
                ConnectionService.cancel();
            } else {
                ArcBoardViewModel.deselectAll();
            }
        }
    },

    onCanvasMouseMove(event) {
        if (PanService.isActive()) {
            PanService.move(event);
        }

        if (ItemMoveService.isActive()) {
            ItemMoveService.move(event);
        }

        if (ResizeService.isActive()) {
            ResizeService.move(event);
        }
    },

    onCanvasMouseUp(event) {
        if (PanService.isActive()) {
            PanService.end();
        }

        if (ItemMoveService.isActive()) {
            ItemMoveService.end();
        }

        if (ResizeService.isActive()) {
            ResizeService.end();
        }
    },

    onCanvasWheel(event) {
        if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            ArcBoardViewModel.zoom(event.deltaY > 0 ? -1 : 1);
        }
    },

    onCanvasContextMenu(event) {
        event.preventDefault();
        ArcBoardView.showCanvasContextMenu(event);
    },

    // ==========================================
    // FORMULAIRES
    // ==========================================

    handleArcFormKeydown(event) {
        if (event.key === 'Enter') {
            this.confirmArcForm();
        } else if (event.key === 'Escape') {
            ArcBoardViewModel.hideArcForm();
        }
    },

    handleCategoryFormKeydown(event) {
        if (event.key === 'Enter') {
            this.confirmCategoryForm();
        } else if (event.key === 'Escape') {
            ArcBoardViewModel.hideCategoryForm();
        }
    },

    confirmArcForm() {
        const arcId = document.getElementById('inlineArcId')?.value;
        const title = document.getElementById('inlineArcTitle')?.value.trim();
        const category = document.getElementById('inlineArcCategory')?.value;
        const color = document.getElementById('inlineArcColor')?.value;

        if (!title) {
            document.getElementById('inlineArcTitle')?.classList.add('error');
            document.getElementById('inlineArcTitle')?.focus();
            return;
        }

        let targetArc;

        if (arcId) {
            // Mode édition
            targetArc = ArcRepository.update(arcId, { title, category, color });
        } else {
            // Mode création
            targetArc = ArcRepository.create({ title, category, color });
        }

        ArcBoardViewModel.hideArcForm();

        if (targetArc) {
            ArcBoardViewModel.openArc(targetArc.id);
        }
    },

    confirmCategoryForm() {
        const name = document.getElementById('inlineCategoryName')?.value.trim();
        const color = document.getElementById('inlineCategoryColor')?.value;

        if (!name) {
            document.getElementById('inlineCategoryName')?.classList.add('error');
            document.getElementById('inlineCategoryName')?.focus();
            return;
        }

        ArcRepository.addCategory(name, color);
        ArcBoardViewModel.hideCategoryForm();
    },

    updateArcFormColor() {
        const category = document.getElementById('inlineArcCategory')?.value;
        const allCategories = ArcRepository.getAllCategories();

        if (allCategories[category]) {
            const colorInput = document.getElementById('inlineArcColor');
            const colorHex = document.getElementById('inlineArcColorHex');

            if (colorInput) colorInput.value = allCategories[category].color;
            if (colorHex) colorHex.textContent = allCategories[category].color;
        }
    },

    // ==========================================
    // ARC ACTIONS
    // ==========================================

    updateArcTitle(title) {
        const arc = ArcBoardViewModel.getCurrentArc();
        if (arc) {
            ArcRepository.update(arc.id, { title });
            ArcBoardView.renderSidebar();
        }
    },

    deleteArc(arcId) {
        ArcBoardView._removeContextMenu();

        const arc = ArcRepository.getById(arcId);
        if (!arc) return;

        if (!confirm(`Voulez-vous vraiment supprimer l'arc "${arc.title}" ?\n\nCette action est irréversible.`)) {
            return;
        }

        ArcRepository.delete(arcId);

        if (ArcBoardState.currentArcId === arcId) {
            ArcBoardState.currentArcId = null;
            ArcBoardView.renderWelcome();
        }

        ArcBoardView.renderSidebar();
    },

    duplicateArc(arcId) {
        ArcBoardView._removeContextMenu();

        const newArc = ArcRepository.duplicate(arcId);
        if (newArc) {
            ArcBoardView.renderSidebar();
            ArcBoardViewModel.openArc(newArc.id);
        }
    },

    // ==========================================
    // TODO ITEMS
    // ==========================================

    addTodoItem(columnId, cardId) {
        const arc = ArcBoardViewModel.getCurrentArc();
        if (!arc) return;

        const card = CardRepository.getById(arc.id, columnId, cardId);
        if (!card) return;

        if (!card.items) card.items = [];
        card.items.push(createTodoItemModel());

        saveProject();
        ArcBoardViewModel.renderItems();
    },

    toggleTodo(columnId, cardId, todoIndex) {
        const arc = ArcBoardViewModel.getCurrentArc();
        if (!arc) return;

        const card = CardRepository.getById(arc.id, columnId, cardId);
        if (!card?.items?.[todoIndex]) return;

        card.items[todoIndex].completed = !card.items[todoIndex].completed;

        saveProject();
        ArcBoardViewModel.renderItems();
    },

    updateTodoText(columnId, cardId, todoIndex, text) {
        const arc = ArcBoardViewModel.getCurrentArc();
        if (!arc) return;

        const card = CardRepository.getById(arc.id, columnId, cardId);
        if (!card?.items?.[todoIndex]) return;

        card.items[todoIndex].text = text;
        saveProject();
    },

    addFloatingTodoItem(itemId) {
        const arc = ArcBoardViewModel.getCurrentArc();
        if (!arc) return;

        const item = BoardItemRepository.getById(arc.id, itemId);
        if (!item) return;

        if (!item.items) item.items = [];
        item.items.push(createTodoItemModel());

        saveProject();
        ArcBoardViewModel.renderItems();
    },

    toggleFloatingTodo(itemId, todoIndex) {
        const arc = ArcBoardViewModel.getCurrentArc();
        if (!arc) return;

        const item = BoardItemRepository.getById(arc.id, itemId);
        if (!item?.items?.[todoIndex]) return;

        item.items[todoIndex].completed = !item.items[todoIndex].completed;

        saveProject();
        ArcBoardViewModel.renderItems();
    },

    updateFloatingTodoText(itemId, todoIndex, text) {
        const arc = ArcBoardViewModel.getCurrentArc();
        if (!arc) return;

        const item = BoardItemRepository.getById(arc.id, itemId);
        if (!item?.items?.[todoIndex]) return;

        item.items[todoIndex].text = text;
        saveProject();
    },

    // ==========================================
    // TABLE
    // ==========================================

    updateTableCell(itemId, row, col, value) {
        const arc = ArcBoardViewModel.getCurrentArc();
        if (!arc) return;

        const item = BoardItemRepository.getById(arc.id, itemId);
        if (!item) return;

        if (!item.data) item.data = [];
        if (!item.data[row]) item.data[row] = [];

        item.data[row][col] = value;
        saveProject();
    },

    // ==========================================
    // LINKS
    // ==========================================

    handleLinkInput(event, itemId) {
        if (event.key !== 'Enter') return;

        const url = event.target.value.trim();
        if (!url) return;

        ArcBoardViewModel.updateItem(itemId, { url, title: url });
        ArcBoardViewModel.renderItems();
    },

    // ==========================================
    // IMAGES
    // ==========================================

    triggerItemImageUpload(itemId) {
        const input = document.getElementById('arcFileInput');
        if (input) {
            input.dataset.targetItem = itemId;
            input.dataset.targetType = 'item';
            input.click();
        }
    },

    triggerCardImageUpload(columnId, cardId) {
        const input = document.getElementById('arcFileInput');
        if (input) {
            input.dataset.targetColumn = columnId;
            input.dataset.targetCard = cardId;
            input.dataset.targetType = 'card';
            input.click();
        }
    },

    onFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const src = e.target.result;
            const input = event.target;

            if (input.dataset.targetType === 'card') {
                const arc = ArcBoardViewModel.getCurrentArc();
                if (arc) {
                    CardRepository.update(arc.id, input.dataset.targetColumn, input.dataset.targetCard, { src });
                    ArcBoardViewModel.renderItems();
                }
            } else if (input.dataset.targetType === 'item') {
                ArcBoardViewModel.updateItem(input.dataset.targetItem, { src });
                ArcBoardViewModel.renderItems();
            } else {
                // Créer un nouvel item image
                const item = ArcBoardViewModel.addItem('image');
                if (item) {
                    setTimeout(() => {
                        ArcBoardViewModel.updateItem(item.id, { src });
                        ArcBoardViewModel.renderItems();
                    }, 100);
                }
            }

            // Reset
            input.value = '';
            delete input.dataset.targetItem;
            delete input.dataset.targetColumn;
            delete input.dataset.targetCard;
            delete input.dataset.targetType;
        };
        reader.readAsDataURL(file);
    },

    // ==========================================
    // SCENES
    // ==========================================

    openScene(sceneId) {
        if (!sceneId) return;

        for (const act of project.acts || []) {
            for (const chapter of act.chapters || []) {
                const scene = chapter.scenes?.find(s => s.id == sceneId);
                if (scene) {
                    if (typeof switchView === 'function') switchView('editor');
                    if (typeof openScene === 'function') openScene(act.id, chapter.id, scene.id);
                    return;
                }
            }
        }
    }
};

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================

document.addEventListener('keydown', function(event) {
    // Ignorer si on édite du texte
    if (event.target.tagName === 'INPUT' ||
        event.target.tagName === 'TEXTAREA' ||
        event.target.contentEditable === 'true') {
        return;
    }

    // Vérifier qu'on est dans le mode arc board
    if (!ArcBoardState.currentArcId) return;

    // Delete/Backspace - supprimer sélection
    if (event.key === 'Delete' || event.key === 'Backspace') {
        if (ArcBoardState.selectedItems.length > 0) {
            event.preventDefault();
            ArcBoardViewModel.deleteSelected();
        }
    }

    // Escape - annuler action en cours
    if (event.key === 'Escape') {
        if (ArcBoardState.activeTool === ToolTypes.CONNECT) {
            ConnectionService.cancel();
        } else {
            ArcBoardViewModel.deselectAll();
        }
    }

    // Ctrl+A - tout sélectionner
    if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        ArcBoardViewModel.selectAll();
    }

    // Ctrl+C - copier
    if ((event.ctrlKey || event.metaKey) && event.key === 'c') {
        if (ArcBoardState.selectedItems.length > 0) {
            event.preventDefault();
            ArcBoardViewModel.copy();
        }
    }

    // Ctrl+V - coller
    if ((event.ctrlKey || event.metaKey) && event.key === 'v') {
        if (ArcBoardState.clipboard) {
            event.preventDefault();
            ArcBoardViewModel.paste();
        }
    }

    // Ctrl+Z - undo
    if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (typeof EventBus !== 'undefined') EventBus.emit('history:undo');
        else if (typeof undo === 'function') undo();
    }

    // Ctrl+Y ou Ctrl+Shift+Z - redo
    if ((event.ctrlKey || event.metaKey) && (event.key === 'y' || (event.key === 'z' && event.shiftKey))) {
        event.preventDefault();
        if (typeof EventBus !== 'undefined') EventBus.emit('history:redo');
        else if (typeof redo === 'function') redo();
    }
});
// ============================================
// ARC BOARD - Main Entry Point
// ============================================
// Ce fichier charge tous les modules et expose
// les fonctions globales pour la compatibilité.
// ============================================

/**
 * Initialise le système Arc Board
 */
function initArcBoardSystem() {
    ArcRepository.init();
}

// ============================================
// API PUBLIQUE (Compatibilité avec l'ancien code)
// ============================================

// Initialisation
function initArcBoard() {
    initArcBoardSystem();
}

// Sidebar
function renderArcsBoardSidebar() {
    ArcBoardView.renderSidebar();
}

function renderArcsList() {
    ArcBoardView.renderSidebar();
}

// Welcome
function renderArcsWelcomeBoard() {
    ArcBoardView.renderWelcome();
}

function renderArcsWelcome() {
    ArcBoardView.renderWelcome();
}

// Création
function createNewArcBoard() {
    ArcBoardViewModel.showArcForm();
}

function createNewArc() {
    ArcBoardViewModel.showArcForm();
}

function showInlineArcForm(arcId = null) {
    if (typeof arcId === 'string') {
        arcId = arcId.replace(/['\"]/g, '').trim();
        if (arcId === '') arcId = null;
    }
    ArcBoardViewModel.showArcForm(arcId);
}

function cancelInlineArcForm() {
    ArcBoardViewModel.hideArcForm();
}

function confirmInlineArcForm() {
    ArcBoardEventHandlers.confirmArcForm();
}

function handleInlineArcKeydown(event) {
    ArcBoardEventHandlers.handleArcFormKeydown(event);
}

function updateInlineArcColor() {
    ArcBoardEventHandlers.updateArcFormColor();
}

// Catégories
function showInlineCategoryForm() {
    ArcBoardViewModel.showCategoryForm();
}

function showAddCategoryModal() {
    ArcBoardViewModel.showCategoryForm();
}

function cancelInlineCategoryForm() {
    ArcBoardViewModel.hideCategoryForm();
}

function confirmInlineCategoryForm() {
    ArcBoardEventHandlers.confirmCategoryForm();
}

function handleInlineCategoryKeydown(event) {
    ArcBoardEventHandlers.handleCategoryFormKeydown(event);
}

function toggleArcCategory(categoryKey) {
    ArcRepository.toggleCategoryCollapse(categoryKey);
    ArcBoardView.renderSidebar();
}

// Navigation
function openArcBoard(arcId) {
    ArcBoardViewModel.openArc(arcId);
}

function openArcDetail(arcId) {
    ArcBoardViewModel.openArc(arcId);
}

// Outils
function setArcTool(tool) {
    ArcBoardViewModel.setTool(tool);
}

function toggleConnectionMode() {
    ConnectionService.toggle();
}

function cancelConnectionMode() {
    ConnectionService.cancel();
}

// Zoom
function zoomArcBoard(direction) {
    ArcBoardViewModel.zoom(direction);
}

function resetArcZoom() {
    ArcBoardViewModel.resetView();
}

// Items
function addArcItem(type) {
    ArcBoardViewModel.addItem(type);
}

function addArcItemAtPosition(clientX, clientY, type) {
    ArcBoardView._removeContextMenu();
    ArcBoardViewModel.addItemAt(type, clientX, clientY);
}

function deleteArcItem(itemId) {
    const arc = ArcBoardViewModel.getCurrentArc();
    if (arc) {
        BoardItemRepository.delete(arc.id, itemId);
        ArcBoardState.selectedItems = ArcBoardState.selectedItems.filter(id => id !== itemId);
        ArcBoardViewModel.renderItems();
        ArcBoardViewModel.deselectAll();
    }
}

function deleteSelectedItems() {
    ArcBoardViewModel.deleteSelected();
}

function selectArcItem(event, itemId) {
    if (event) event.stopPropagation();
    ArcBoardViewModel.selectItem(itemId, event?.ctrlKey || event?.metaKey);
}

function selectArcCard(event, cardId, columnId) {
    if (event) event.stopPropagation();
    ArcBoardViewModel.selectItem(columnId, event?.ctrlKey || event?.metaKey);
}

function deselectAllArcItems() {
    ArcBoardViewModel.deselectAll();
}

// Mise à jour items
function updateArcItemTitle(itemId, title) {
    ArcBoardViewModel.updateItem(itemId, { title });
}

function updateArcItemContent(itemId, content) {
    ArcBoardViewModel.updateItem(itemId, { content });
}

function updateArcItemWidth(itemId, width) {
    ArcBoardViewModel.updateItem(itemId, { width: parseInt(width) });
    ArcBoardViewModel.renderItems();
}

function updateCurrentArcTitle(title) {
    ArcBoardEventHandlers.updateArcTitle(title);
}

// Cartes
function addCardToColumn(columnId, cardType = 'note') {
    ArcBoardViewModel.addCard(columnId, cardType);
}

function deleteArcCard(event, columnId, cardId) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    ArcBoardViewModel.deleteCard(columnId, cardId);
}

function updateArcCardContent(columnId, cardId, content) {
    ArcBoardViewModel.updateCard(columnId, cardId, { content });
}

function updateArcCardTitle(columnId, cardId, title) {
    ArcBoardViewModel.updateCard(columnId, cardId, { title });
}

// Todo
function addArcTodoItem(columnId, cardId) {
    ArcBoardEventHandlers.addTodoItem(columnId, cardId);
}

function toggleArcTodo(columnId, cardId, todoIndex) {
    ArcBoardEventHandlers.toggleTodo(columnId, cardId, todoIndex);
}

function updateArcTodoText(columnId, cardId, todoIndex, text) {
    ArcBoardEventHandlers.updateTodoText(columnId, cardId, todoIndex, text);
}

function addFloatingTodoItem(itemId) {
    ArcBoardEventHandlers.addFloatingTodoItem(itemId);
}

function toggleFloatingTodo(itemId, todoIndex) {
    ArcBoardEventHandlers.toggleFloatingTodo(itemId, todoIndex);
}

function updateFloatingTodoText(itemId, todoIndex, text) {
    ArcBoardEventHandlers.updateFloatingTodoText(itemId, todoIndex, text);
}

// Table
function updateArcTableCell(itemId, row, col, value) {
    ArcBoardEventHandlers.updateTableCell(itemId, row, col, value);
}

function updateArcTableSize(itemId, dimension, value) {
    const arc = ArcBoardViewModel.getCurrentArc();
    if (!arc) return;

    const data = {};
    data[dimension] = parseInt(value);
    BoardItemRepository.update(arc.id, itemId, data);
    ArcBoardViewModel.renderItems();
}

// Links
function handleLinkInput(event, columnId, cardId) {
    if (event.key !== 'Enter') return;

    const url = event.target.value.trim();
    if (!url) return;

    ArcBoardViewModel.updateCard(columnId, cardId, { url, title: url });
    ArcBoardViewModel.renderItems();
}

function handleFloatingLinkInput(event, itemId) {
    ArcBoardEventHandlers.handleLinkInput(event, itemId);
}

// Images
function triggerArcUpload() {
    document.getElementById('arcFileInput')?.click();
}

function triggerItemImageUpload(itemId) {
    ArcBoardEventHandlers.triggerItemImageUpload(itemId);
}

function triggerCardImageUpload(columnId, cardId) {
    ArcBoardEventHandlers.triggerCardImageUpload(columnId, cardId);
}

function handleArcFileUpload(event) {
    ArcBoardEventHandlers.onFileUpload(event);
}

function updateItemImage(itemId, src) {
    ArcBoardViewModel.updateItem(itemId, { src });
    ArcBoardViewModel.renderItems();
}

function updateCardImage(columnId, cardId, src) {
    ArcBoardViewModel.updateCard(columnId, cardId, { src });
    ArcBoardViewModel.renderItems();
}

// Arcs
function deleteArc(arcId) {
    ArcBoardEventHandlers.deleteArc(arcId);
}

function duplicateArc(arcId) {
    ArcBoardEventHandlers.duplicateArc(arcId);
}

function renameArc(arcId) {
    ArcBoardView._removeContextMenu();

    const arc = ArcRepository.getById(arcId);
    if (!arc) return;

    const newTitle = prompt("Nouveau nom de l'arc:", arc.title);
    if (newTitle && newTitle.trim()) {
        ArcRepository.update(arcId, { title: newTitle.trim() });
        ArcBoardView.renderSidebar();
    }
}

// Connexions
function selectArcConnection(event, connId) {
    event.stopPropagation();
    ArcBoardState.selectedItems = [connId];
    ArcBoardViewModel._updateSelectionUI();
}

// Canvas handlers
function handleCanvasMouseDown(event) {
    ArcBoardEventHandlers.onCanvasMouseDown(event);
}

function handleCanvasMouseMove(event) {
    ArcBoardEventHandlers.onCanvasMouseMove(event);
}

function handleCanvasMouseUp(event) {
    ArcBoardEventHandlers.onCanvasMouseUp(event);
}

function handleCanvasWheel(event) {
    ArcBoardEventHandlers.onCanvasWheel(event);
}

function handleCanvasContextMenu(event) {
    ArcBoardEventHandlers.onCanvasContextMenu(event);
}

// Drag & Drop
function handleItemMouseDown(event, itemId) {
    // Ne pas intercepter les éléments interactifs
    if (event.target.classList.contains('arc-column-resize')) return;
    if (event.target.closest('.arc-connection-point')) return;
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.contentEditable === 'true') return;
    if (event.target.closest('.arc-card-drag-handle') || event.target.closest('.arc-floating-drag-handle')) return;
    if (event.target.closest('.arc-card') && !event.target.closest('.arc-floating-item')) return;

    event.stopPropagation();
    ItemMoveService.start(event, itemId);
}

function handleItemDrag(event) {
    ItemMoveService.move(event);
}

function endItemDrag(event) {
    ItemMoveService.end();
}

function startColumnResize(event, columnId) {
    ResizeService.start(event, columnId);
}

function handleColumnResizeDrag(event) {
    ResizeService.move(event);
}

function endColumnResize(event) {
    ResizeService.end();
}

function handleCardDragStart(event, cardId, columnId) {
    DragDropService.startCardDrag(event, cardId, columnId);
}

function handleCardDragEnd(event) {
    DragDropService.endDrag(event);
}

function handleFloatingDragStart(event, itemId) {
    DragDropService.startFloatingDrag(event, itemId);
}

function handleFloatingDragEnd(event) {
    DragDropService.endDrag(event);
}

function handleCardDragOver(event) {
    DragDropService.handleColumnDragOver(event);
}

function handleCardDragLeave(event) {
    DragDropService.handleColumnDragLeave(event);
}

function handleCardDrop(event, targetColumnId) {
    DragDropService.handleColumnDrop(event, targetColumnId);
}

function handleCanvasDrop(event) {
    DragDropService.handleCanvasDrop(event);
}

function handleCanvasDragOver(event) {
    DragDropService.handleCanvasDragOver(event);
}

function handleCanvasDragLeave(event) {
    DragDropService.handleCanvasDragLeave(event);
}

// Panneau contextuel
function toggleArcContextPanel() {
    ArcBoardViewModel.toggleContextPanel();
}

function renderArcContextForItem(item) {
    ArcBoardView.renderContextPanel(item);
}

// Copy/Paste
function copySelectedItems() {
    ArcBoardViewModel.copy();
}

function pasteArcItem() {
    ArcBoardView._removeContextMenu();
    ArcBoardViewModel.paste();
}

// Menu contextuel
function showCanvasContextMenu(event) {
    ArcBoardView.showCanvasContextMenu(event);
}

function showArcContextMenu(event, arcId) {
    ArcBoardView.showArcContextMenu(event, arcId);
}

function removeContextMenu() {
    ArcBoardView._removeContextMenu();
}

// Scenes
function openSceneFromCard(event, sceneId) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    ArcBoardEventHandlers.openScene(sceneId);
}

// Formatage texte
function formatArcText(command) {
    document.execCommand(command, false, null);
}

function insertArcCode() {
    document.execCommand('insertHTML', false, '<code></code>');
}

// État global pour compatibilité
let arcBoardState = ArcBoardState;

// ============================================
// EXPORT (si module)
// ============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ArcBoardConfig,
        ArcCategories,
        CardTypes,
        BoardItemTypes,
        ToolTypes,
        DragTypes,
        ArcBoardState,
        ArcRepository,
        BoardItemRepository,
        CardRepository,
        ConnectionRepository,
        ArcBoardViewModel,
        ArcBoardView,
        DragDropService,
        ConnectionService,
        PanService,
        ResizeService,
        ItemMoveService,
        ArcBoardEventHandlers
    };
}

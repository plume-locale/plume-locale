// ============================================
// THRILLER BOARD - Canvas System for Mystery Elements
// ============================================

console.log('📋 Thriller Board script loaded');

// ============================================
// CONFIGURATION & TYPES
// ============================================

const THRILLER_BOARD_CONFIG = {
    minZoom: 0.25,
    maxZoom: 2,
    zoomStep: 0.1,
    gridSize: 24,
    defaultColumnWidth: 280,
    minColumnWidth: 200,
    maxColumnWidth: 500,
    canvasWidth: 3000,
    canvasHeight: 2000,
    snapToGrid: true,
    // Grid view configuration
    swimlaneHeight: 200,
    minSwimlaneHeight: 120,
    maxSwimlaneHeight: 400,
    cardMinWidth: 240,
    cardMaxWidth: 360,
    cardDefaultWidth: 280
};

// Thriller element types based on the JSON schemas
const THRILLER_TYPES = {
    alibi: {
        label: 'Alibi',
        icon: 'shield-check',
        color: '#27ae60',
        description: 'Alibi de personnage pour un événement'
    },
    backstory: {
        label: 'Événement passé',
        icon: 'history',
        color: '#8e44ad',
        description: 'Informations de contexte du personnage'
    },
    clue: {
        label: 'Indice',
        icon: 'search',
        color: '#e67e22',
        description: 'Preuve ou indice dans le mystère'
    },
    knowledge_state: {
        label: 'État de connaissance',
        icon: 'brain',
        color: '#3498db',
        description: 'Ce qu\'un personnage sait'
    },
    location: {
        label: 'Lieu',
        icon: 'map-pin',
        color: '#16a085',
        description: 'Lieu important dans l\'histoire'
    },
    motive_means_opportunity: {
        label: 'Analyse de suspect',
        icon: 'target',
        color: '#e74c3c',
        description: 'Potentiel du suspect à commettre le crime'
    },
    question: {
        label: 'Question',
        icon: 'help-circle',
        color: '#f39c12',
        description: 'Question mystérieuse à résoudre'
    },
    red_herring: {
        label: 'Fausse piste',
        icon: 'fish',
        color: '#9b59b6',
        description: 'Indice trompeur ou fausse piste'
    },
    reversal: {
        label: 'Révélation',
        icon: 'rotate-ccw',
        color: '#d35400',
        description: 'Rebondissement ou révélation'
    },
    secret: {
        label: 'Secret',
        icon: 'lock',
        color: '#c0392b',
        description: 'Information cachée'
    }
};

// Card types for thriller elements
const THRILLER_CARD_TYPES = {
    note: { label: 'Note', icon: 'file-text' },
    image: { label: 'Image', icon: 'image' },
    link: { label: 'Lien', icon: 'link' },
    todo: { label: 'Tâches', icon: 'check-square' },
    comment: { label: 'Commentaire', icon: 'message-square' },
    table: { label: 'Tableau', icon: 'table' },
    audio: { label: 'Audio', icon: 'music' },
    divider: { label: 'Séparateur', icon: 'minus' }
};

// Card statuses
const THRILLER_CARD_STATUS = {
    pending: { label: 'En attente', color: '#95a5a6', icon: 'clock' },
    active: { label: 'Actif', color: '#3498db', icon: 'activity' },
    resolved: { label: 'Résolu', color: '#27ae60', icon: 'check-circle' },
    contradicted: { label: 'Contredit', color: '#e74c3c', icon: 'x-circle' },
    partial: { label: 'Partiel', color: '#f39c12', icon: 'alert-circle' },
    hidden: { label: 'Caché', color: '#34495e', icon: 'eye-off' }
};

// Swimlane row types
const SWIMLANE_ROW_TYPES = {
    character: { label: 'Personnages', icon: 'user', color: '#3498db' },
    location: { label: 'Lieux', icon: 'map-pin', color: '#16a085' },
    custom: { label: 'Personnalisé', icon: 'tag', color: '#95a5a6' }
};

// Column mode types
const COLUMN_MODE_TYPES = {
    free: { label: 'Colonnes libres', icon: 'columns' },
    narrative: { label: 'Structure narrative', icon: 'book-open' }
};

// ============================================
// STATE MANAGEMENT
// ============================================

let thrillerBoardState = {
    elements: [], // Array of thriller elements
    connections: [], // Links between elements
    canvasOffset: { x: 0, y: 0 },
    zoom: 1,
    selectedElements: [],
    contextPanelOpen: true,
    currentFilter: 'clue', // Default to clues tab
    snapToGrid: true,
    viewMode: 'canvas', // 'canvas' or 'grid'
    gridConfig: {
        columnMode: 'free', // 'free' or 'narrative'
        rows: [], // Swimlane rows configuration
        columns: [], // Column configuration
        cards: [] // Cards positioned on the grid
    }
};

// ============================================
// INITIALIZATION
// ============================================

// Global flag to track if socket event listener is attached
let socketEventListenerAttached = false;

// [MVVM : ViewModel]
// Initialise le Thriller Board, l'état global et les écouteurs d'événements.
function initThrillerBoard() {
    // Initialize thriller elements array if not exists
    if (!project.thrillerElements) {
        project.thrillerElements = [];
    }
    if (!project.thrillerConnections) {
        project.thrillerConnections = [];
    }
    if (!project.thrillerGridConfig) {
        project.thrillerGridConfig = {
            columnMode: 'free',
            rows: [],
            columns: [],
            cards: []
        };
    }

    thrillerBoardState.elements = project.thrillerElements;
    thrillerBoardState.connections = project.thrillerConnections;
    thrillerBoardState.gridConfig = project.thrillerGridConfig;

    // Restore view mode from localStorage
    const savedViewMode = localStorage.getItem('plume_thriller_view_mode');
    if (savedViewMode) {
        thrillerBoardState.viewMode = savedViewMode;
    }

    // Attach global socket event listener (only once)
    if (!socketEventListenerAttached) {
        document.body.addEventListener('mousedown', function (event) {
            const socket = event.target.closest('.thriller-card-socket');
            if (socket && socket.dataset.cardId && socket.dataset.property) {
                const cardId = socket.dataset.cardId;
                const property = socket.dataset.property;
                console.log('Socket clicked:', cardId, property);
                startThrillerConnection(event, cardId, property);
            }
        }, true); // Use capture phase to catch event before others

        socketEventListenerAttached = true;
        console.log('Global socket event listener attached');
    }
}

// [MVVM : ViewModel]
// Point d'entrée principal pour le rendu du Thriller Board selon le mode de vue.
function renderThrillerBoard() {
    console.log('=== RENDER THRILLER BOARD ===');
    const container = document.getElementById('editorView');
    if (!container) {
        console.log('Editor view container not found!');
        return;
    }

    initThrillerBoard();

    // Render sidebar list
    renderThrillerList();

    // Render based on view mode
    if (thrillerBoardState.viewMode === 'grid') {
        renderThrillerGridView();
    } else {
        renderThrillerCanvasView();
    }

    // Refresh Lucide icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// [MVVM : View]
// Affiche la vue "Canvas" (tableau blanc) du Thriller Board.
function renderThrillerCanvasView() {
    const container = document.getElementById('editorView');
    if (!container) return;

    // Render main canvas area
    container.innerHTML = `
        <div class="thriller-board-toolbar">
            <button class="btn btn-secondary btn-sm" onclick="toggleThrillerViewMode()" title="Basculer vers la vue grille">
                <i data-lucide="table"></i> Vue grille
            </button>
        </div>
        <div class="thriller-board-canvas-wrapper">
            <div class="thriller-board-canvas" id="thrillerBoardCanvas"
                 onmousedown="handleThrillerCanvasMouseDown(event)"
                 onmousemove="handleThrillerCanvasMouseMove(event)"
                 onmouseup="handleThrillerCanvasMouseUp(event)"
                 onwheel="handleThrillerCanvasWheel(event)">
                <div class="thriller-board-content" id="thrillerBoardContent">
                    <!-- Elements will be rendered here -->
                </div>
            </div>

            <!-- Floating Add Button -->
            <button class="floating-add-button" onclick="addThrillerElement()" title="Ajouter un nouvel élément">
                <i data-lucide="plus"></i>
            </button>
        </div>
    `;

    renderThrillerElements();
}

// [MVVM : View]
// Affiche la vue "Grille" (swimlanes) du Thriller Board.
function renderThrillerGridView() {
    const container = document.getElementById('editorView');
    if (!container) return;

    const gridConfig = thrillerBoardState.gridConfig;

    container.innerHTML = `
        <div class="thriller-grid-view">
            <!-- Toolbar -->
            <div class="thriller-board-toolbar">
                <button class="btn btn-secondary btn-sm" onclick="toggleThrillerViewMode()" title="Basculer vers la vue canvas">
                    <i data-lucide="layout"></i> Vue canvas
                </button>
                <div class="toolbar-divider"></div>
                <button class="btn btn-secondary btn-sm ${gridConfig.columnMode === 'free' ? 'active' : ''}"
                        onclick="setThrillerColumnMode('free')" title="Colonnes libres">
                    <i data-lucide="columns"></i> Colonnes libres
                </button>
                <button class="btn btn-secondary btn-sm ${gridConfig.columnMode === 'narrative' ? 'active' : ''}"
                        onclick="setThrillerColumnMode('narrative')" title="Structure narrative">
                    <i data-lucide="book-open"></i> Structure
                </button>
                <div class="toolbar-divider"></div>
                <button class="btn btn-secondary btn-sm" onclick="addThrillerSwimlaneRow()" title="Ajouter une ligne">
                    <i data-lucide="plus"></i> Ajouter ligne
                </button>
                ${gridConfig.columnMode === 'free' ? `
                    <button class="btn btn-secondary btn-sm" onclick="addThrillerColumn()" title="Ajouter une colonne">
                        <i data-lucide="plus"></i> Ajouter colonne
                    </button>
                ` : ''}
            </div>

            <!-- Grid Container -->
            <div class="thriller-grid-container" id="thrillerGridContainer">
                ${renderThrillerGrid()}
            </div>
        </div>
    `;

    // Render connections after DOM is ready
    setTimeout(() => {
        console.log('Grid view timeout callback');
        const sockets = document.querySelectorAll('.thriller-card-socket');
        console.log('Sockets found in DOM:', sockets.length);
        if (sockets.length > 0) {
            console.log('First socket:', sockets[0]);
            console.log('First socket data:', sockets[0].dataset);
        }

        renderThrillerConnections();

        // Add scroll listener to update connections on scroll
        const gridContainer = document.getElementById('thrillerGridContainer');
        if (gridContainer) {
            gridContainer.addEventListener('scroll', () => {
                renderThrillerConnections();
            });
        }

        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 100);
}

// [MVVM : View]
// Génère le HTML pour la structure de la grille (colonnes et lignes).
function renderThrillerGrid() {
    const gridConfig = thrillerBoardState.gridConfig;

    // Get columns based on mode
    const columns = gridConfig.columnMode === 'narrative' ? getNarrativeColumns() : gridConfig.columns;

    // Get rows: use auto-generated rows (characters + locations) combined with manual rows
    const autoRows = getAutoGeneratedRows();
    const manualRows = gridConfig.rows.filter(r => r.type !== 'character' && r.type !== 'location');
    const allRows = [...autoRows, ...manualRows];

    // If no rows at all (no characters, locations, or manual rows), show empty state
    if (allRows.length === 0) {
        return `
            <div class="thriller-grid-empty-state">
                <i data-lucide="table" style="width: 48px; height: 48px; color: var(--text-secondary);"></i>
                <p>Aucun personnage ou lieu disponible</p>
                <p style="font-size: 0.9rem; color: var(--text-muted); margin-top: 0.5rem;">
                    Créez des personnages ou des lieux dans la base de données pour qu'ils apparaissent automatiquement comme lignes.
                </p>
                <button class="btn btn-primary" onclick="addThrillerSwimlaneRow()">
                    <i data-lucide="plus"></i> Ajouter une ligne personnalisée
                </button>
            </div>
        `;
    }

    let html = `
        <div class="thriller-grid-wrapper" style="position: relative;">
            <!-- Grid Table -->
            <div class="thriller-grid-table" style="position: relative; z-index: 1;">
                <!-- Header Row -->
                <div class="thriller-grid-header-row">
                    <div class="thriller-grid-row-header-cell">
                        <span>Lignes / Colonnes</span>
                    </div>
                    ${columns.map(col => `
                        <div class="thriller-grid-column-header" data-column-id="${col.id}">
                            <div class="thriller-grid-column-title">
                                ${col.title}
                                ${gridConfig.columnMode === 'free' ? `
                                    <button class="btn-icon-sm" onclick="editThrillerColumn('${col.id}')" title="Modifier">
                                        <i data-lucide="edit-2"></i>
                                    </button>
                                    <button class="btn-icon-sm" onclick="deleteThrillerColumn('${col.id}')" title="Supprimer">
                                        <i data-lucide="trash-2"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Swimlane Rows -->
                ${allRows.map(row => renderThrillerSwimlaneRow(row, columns)).join('')}
            </div>

            <!-- SVG Connections Layer (on top) -->
            <svg class="thriller-grid-connections" id="thrillerGridConnections" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 10;">
                <defs>
                    ${Object.entries(THRILLER_TYPES).map(([key, data]) => `
                        <marker id="arrowhead-${key}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="${data.color}" />
                        </marker>
                    `).join('')}
                </defs>
            </svg>
        </div>
    `;

    return html;
}

// [MVVM : View]
// Affiche une ligne (swimlane) spécifique dans la grille.
function renderThrillerSwimlaneRow(row, columns) {
    const gridConfig = thrillerBoardState.gridConfig;
    const isAutoGenerated = row.type === 'character' || row.type === 'location';

    return `
        <div class="thriller-grid-row" data-row-id="${row.id}">
            <!-- Row Header -->
            <div class="thriller-grid-row-header" style="background-color: ${row.color || '#f0f0f0'};">
                <div class="thriller-grid-row-info">
                    <i data-lucide="${row.icon || 'tag'}" style="width: 16px; height: 16px;"></i>
                    <span class="thriller-grid-row-title">${row.title}</span>
                    ${isAutoGenerated ? `<span style="font-size: 0.7rem; opacity: 0.7; margin-left: 6px;">(auto)</span>` : ''}
                </div>
                ${!isAutoGenerated ? `
                    <div class="thriller-grid-row-actions">
                        <button class="btn-icon-sm" onclick="editThrillerRow('${row.id}')" title="Modifier">
                            <i data-lucide="edit-2"></i>
                        </button>
                        <button class="btn-icon-sm" onclick="deleteThrillerRow('${row.id}')" title="Supprimer">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                ` : ''}
            </div>

            <!-- Row Cells -->
            ${columns.map(col => {
        const cards = gridConfig.cards.filter(c => c.rowId === row.id && c.columnId === col.id);
        return renderThrillerGridCell(row, col, cards);
    }).join('')}
        </div>
    `;
}

// [MVVM : View]
// Affiche une cellule individuelle de la grille, gérant le drop de cartes.
function renderThrillerGridCell(row, column, cards) {
    if (!cards || cards.length === 0) {
        return `
            <div class="thriller-grid-cell thriller-grid-cell-empty"
                 data-row-id="${row.id}"
                 data-column-id="${column.id}"
                 ondragover="handleCellDragOver(event)"
                 ondragleave="handleCellDragLeave(event)"
                 ondrop="handleCellDrop(event, '${row.id}', '${column.id}')">
            </div>
        `;
    }

    return `
        <div class="thriller-grid-cell has-card"
             data-row-id="${row.id}"
             data-column-id="${column.id}"
             ondragover="handleCellDragOver(event)"
             ondragleave="handleCellDragLeave(event)"
             ondrop="handleCellDrop(event, '${row.id}', '${column.id}')">
            ${renderCardStack(cards, row.id, column.id)}
        </div>
    `;
}

// [MVVM : View]
// Affiche une pile de cartes dans une cellule de la grille.
function renderCardStack(cards, rowId, columnId) {
    // Sort cards by zIndex (or creation order)
    const sortedCards = [...cards].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
    const visibleCount = Math.min(sortedCards.length, 3); // Show max 3 cards in stack
    const hiddenCount = sortedCards.length - visibleCount;

    return `
        <div class="thriller-card-stack" data-row-id="${rowId}" data-column-id="${columnId}">
            ${sortedCards.slice(0, visibleCount).map((card, index) => {
        const offset = index * 4; // 4px offset (plus compact)
        const zIndex = visibleCount - index;
        const rotation = index * 0.5; // Léger effet de rotation
        return `
                    <div class="thriller-card-wrapper"
                         style="transform: translate(${offset}px, ${offset}px) rotate(${rotation}deg); z-index: ${zIndex};"
                         data-card-id="${card.id}"
                         draggable="true"
                         ondragstart="handleCardDragStart(event, '${card.id}')"
                         ondragend="handleCardDragEnd(event)"
                         onclick="handleStackedCardClick(event, '${card.id}', ${index})">
                        ${renderThrillerCard(card)}
                    </div>
                `;
    }).join('')}

            ${cards.length > 1 ? `
                <div class="thriller-stack-indicator"
                     style="transform: translate(${(visibleCount - 1) * 4}px, ${(visibleCount - 1) * 4 + 4}px);">
                    <span class="thriller-stack-count">${cards.length}</span>
                    ${hiddenCount > 0 ? `<span class="thriller-stack-more" onclick="showCardStackModal(event, '${rowId}', '${columnId}')" title="Voir toutes les cartes">+${hiddenCount}</span>` : ''}
                </div>
            ` : ''}
        </div>
    `;
}

// Drag & Drop State
let cardDragState = {
    draggedCardId: null,
    sourceRowId: null,
    sourceColumnId: null,
    draggedElementId: null, // For dragging from treeview
    isTreeviewDrag: false
};

// [MVVM : Mixte]
// Gère le début du glissement d'une carte : met à jour l'état (ViewModel) et applique des styles (View).
function handleCardDragStart(event, cardId) {
    event.stopPropagation();

    const card = thrillerBoardState.gridConfig.cards.find(c => c.id === cardId);
    if (!card) return;

    cardDragState.draggedCardId = cardId;
    cardDragState.sourceRowId = card.rowId;
    cardDragState.sourceColumnId = card.columnId;

    // Visual feedback
    event.currentTarget.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', cardId);
}

// [MVVM : Mixte]
// Gère la fin du glissement d'une carte : réinitialise l'état et nettoie les styles visuels (View).
function handleCardDragEnd(event) {
    event.stopPropagation();
    event.currentTarget.classList.remove('dragging');

    // Remove all drop highlights
    document.querySelectorAll('.thriller-grid-cell').forEach(cell => {
        cell.classList.remove('drop-target-hover');
    });
}

// [MVVM : ViewModel]
// Gère le survol d'une cellule pendant un glissement, définit l'effet de drop et surligne la zone (View).
function handleCellDragOver(event) {
    event.preventDefault();
    event.stopPropagation();

    // Set dropEffect based on what's being dragged
    if (cardDragState.isTreeviewDrag) {
        event.dataTransfer.dropEffect = 'copy';
    } else {
        event.dataTransfer.dropEffect = 'move';
    }

    // Highlight drop zone
    event.currentTarget.classList.add('drop-target-hover');
}

// [MVVM : View]
// Retire le surlignage visuel lorsqu'on quitte une cellule pendant un glissement.
function handleCellDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();

    // Remove highlight if leaving cell
    if (!event.currentTarget.contains(event.relatedTarget)) {
        event.currentTarget.classList.remove('drop-target-hover');
    }
}

// [MVVM : Mixte]
// Gère le drop de cartes : crée ou déplace des éléments (Model/ViewModel) et rafraîchit l'affichage (View).
function handleCellDrop(event, targetRowId, targetColumnId) {
    event.preventDefault();
    event.stopPropagation();

    event.currentTarget.classList.remove('drop-target-hover');

    // Case 1: Dragging from treeview to create a new card
    if (cardDragState.isTreeviewDrag && cardDragState.draggedElementId) {
        const element = thrillerBoardState.elements.find(el => el.id === cardDragState.draggedElementId);
        if (!element) {
            cardDragState.draggedElementId = null;
            cardDragState.isTreeviewDrag = false;
            return;
        }

        // Calculate zIndex for new card
        const cellCards = thrillerBoardState.gridConfig.cards.filter(
            c => c.rowId === targetRowId && c.columnId === targetColumnId
        );
        const maxZIndex = cellCards.length > 0 ? Math.max(...cellCards.map(c => c.zIndex || 0), 0) : 0;

        // Create a new card from the element
        const newCard = {
            id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: element.type,
            elementId: element.id, // Reference to the original element
            title: element.title,
            data: { ...element.data },
            status: element.status || 'pending',
            rowId: targetRowId,
            columnId: targetColumnId,
            zIndex: maxZIndex + 1
        };

        thrillerBoardState.gridConfig.cards.push(newCard);
        project.thrillerGridConfig.cards = thrillerBoardState.gridConfig.cards;

        // Save and re-render
        saveProject();
        renderThrillerBoard();

        // Reset drag state
        cardDragState.draggedElementId = null;
        cardDragState.isTreeviewDrag = false;
        return;
    }

    // Case 2: Dragging an existing card to a new position
    if (!cardDragState.draggedCardId) return;

    const card = thrillerBoardState.gridConfig.cards.find(c => c.id === cardDragState.draggedCardId);
    if (!card) return;

    // Don't do anything if dropping in same cell
    if (card.rowId === targetRowId && card.columnId === targetColumnId) {
        cardDragState.draggedCardId = null;
        return;
    }

    // Move card to new cell
    card.rowId = targetRowId;
    card.columnId = targetColumnId;

    // Reset zIndex in new cell
    const cellCards = thrillerBoardState.gridConfig.cards.filter(
        c => c.rowId === targetRowId && c.columnId === targetColumnId
    );
    const maxZIndex = cellCards.length > 0 ? Math.max(...cellCards.map(c => c.zIndex || 0), 0) : 0;
    card.zIndex = maxZIndex + 1;

    project.thrillerGridConfig.cards = thrillerBoardState.gridConfig.cards;

    // Save and re-render
    saveProject();
    renderThrillerBoard();

    // Reset drag state
    cardDragState.draggedCardId = null;
    cardDragState.sourceRowId = null;
    cardDragState.sourceColumnId = null;
}

// [MVVM : ViewModel]
// Gère le clic sur une carte empilée : édition si en haut, sinon mise au premier plan (View logic).
function handleStackedCardClick(event, cardId, index) {
    event.stopPropagation();

    // If clicking on top card (index 0), edit it
    if (index === 0) {
        // Check if we're not clicking on a socket
        if (!event.target.closest('.thriller-card-socket')) {
            editThrillerCard(cardId);
        }
    } else {
        // If clicking on a card behind, bring it to front
        bringCardToFront(event, cardId);
    }
}

// [MVVM : Mixte]
// Gère le début du glissement depuis l'arborescence (treeview) vers la grille.
function handleTreeviewDragStart(event, elementId) {
    event.stopPropagation();

    cardDragState.draggedElementId = elementId;
    cardDragState.isTreeviewDrag = true;

    // Visual feedback
    event.currentTarget.classList.add('dragging');
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData('text/plain', elementId);
}

// [MVVM : Mixte]
// Gère la fin du glissement depuis l'arborescence, nettoie les indicateurs visuels (View).
function handleTreeviewDragEnd(event) {
    event.stopPropagation();
    event.currentTarget.classList.remove('dragging');

    // Remove all drop highlights
    document.querySelectorAll('.thriller-grid-cell').forEach(cell => {
        cell.classList.remove('drop-target-hover');
    });

    // Don't reset state here - let handleCellDrop do it
    // The dragend event fires BEFORE the drop event, so we can't reset here
}

// [MVVM : View]
// Rendu HTML d'une carte Thriller individuelle (en-tête, corps, pied de page).
function renderThrillerCard(card) {
    const typeData = THRILLER_TYPES[card.type];
    const statusData = THRILLER_CARD_STATUS[card.status || 'pending'];

    // Special header for alibi with Vrai/Faux badge
    let headerExtra = '';
    if (card.type === 'alibi') {
        const isTrue = card.data.is_true;
        headerExtra = `
            <span class="thriller-card-badge" style="background: ${isTrue ? '#27ae60' : '#e74c3c'}; color: white; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-left: auto;">
                ${isTrue ? 'VRAI' : 'FAUX'}
            </span>
        `;
    }

    return `
        <div class="thriller-card" data-card-id="${card.id}">
            <!-- Card Header -->
            <div class="thriller-card-header"
                 style="background-color: ${typeData.color}; cursor: pointer;"
                 onclick="handleCardHeaderClick(event, '${card.id}')">
                <i data-lucide="${typeData.icon}" style="width: 16px; height: 16px;"></i>
                <span class="thriller-card-type">${typeData.label}</span>
                <span class="thriller-card-title">${card.title}</span>
                ${headerExtra}
                <button class="thriller-card-delete-btn"
                        onclick="event.stopPropagation(); deleteThrillerCard('${card.id}')"
                        title="Supprimer cette carte">
                    <i data-lucide="x"></i>
                </button>
            </div>

            <!-- Card Body with Sockets -->
            <div class="thriller-card-body">
                ${renderThrillerCardProperties(card)}
            </div>

            <!-- Card Footer -->
            <div class="thriller-card-footer"
                 style="background-color: ${statusData.color}20; border-left: 3px solid ${statusData.color}; cursor: pointer;"
                 onclick="handleCardFooterClick(event, '${card.id}')">
                <i data-lucide="${statusData.icon}" style="width: 14px; height: 14px; color: ${statusData.color};"></i>
                <span style="color: ${statusData.color};">${statusData.label}</span>
            </div>
        </div>
    `;
}

// [MVVM : ViewModel]
// Gère le clic sur l'en-tête d'une carte pour ouvrir le modal d'édition de l'élément d'origine.
function handleCardHeaderClick(event, cardId) {
    event.stopPropagation();

    // Don't open modal if we're in connection mode
    if (connectionState.isDrawing) {
        return;
    }

    // Find the card and get its element ID
    const card = thrillerBoardState.gridConfig.cards.find(c => c.id === cardId);
    if (!card || !card.elementId) return;

    // Open the element modal (same as treeview)
    editThrillerElement(card.elementId);
}

// [MVVM : View]
// Affiche un "popover" (bulle) pour changer rapidement le statut d'une carte.
function handleCardFooterClick(event, cardId) {
    event.stopPropagation();

    // Don't open popover if we're in connection mode
    if (connectionState.isDrawing) {
        return;
    }

    // Remove any existing popover
    const existingPopover = document.querySelector('.thriller-card-status-popover');
    if (existingPopover) {
        existingPopover.remove();
    }

    // Get the card
    const card = thrillerBoardState.gridConfig.cards.find(c => c.id === cardId);
    if (!card) return;

    // Create popover
    const popover = document.createElement('div');
    popover.className = 'thriller-card-status-popover';

    // Position popover near the clicked footer
    const footer = event.currentTarget;
    const rect = footer.getBoundingClientRect();

    popover.innerHTML = `
        <div class="thriller-card-status-popover-content">
            <div class="thriller-card-status-popover-header">Changer le statut</div>
            ${Object.entries(THRILLER_CARD_STATUS).map(([key, data]) => `
                <div class="thriller-card-status-option ${key === card.status ? 'active' : ''}"
                     onclick="changeCardStatus('${cardId}', '${key}')"
                     style="border-left-color: ${data.color};">
                    <i data-lucide="${data.icon}" style="width: 14px; height: 14px; color: ${data.color};"></i>
                    <span>${data.label}</span>
                    ${key === card.status ? '<i data-lucide="check" style="width: 14px; height: 14px; margin-left: auto;"></i>' : ''}
                </div>
            `).join('')}
        </div>
    `;

    // Position the popover
    popover.style.position = 'fixed';
    popover.style.top = `${rect.bottom + 5}px`;
    popover.style.left = `${rect.left}px`;

    document.body.appendChild(popover);

    // Re-render icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 10);

    // Close popover when clicking outside
    setTimeout(() => {
        // [MVVM : ViewModel]
        // Gère la fermeture du popover de statut lors d'un clic extérieur.
        function closePopover(e) {
            if (!popover.contains(e.target)) {
                popover.remove();
                document.removeEventListener('click', closePopover);
            }
        };
        document.addEventListener('click', closePopover);
    }, 100);
}

// [MVVM : Mixte]
// Met à jour le modèle (statut de la carte) et rafraîchit la vue.
function changeCardStatus(cardId, newStatus) {
    const card = thrillerBoardState.gridConfig.cards.find(c => c.id === cardId);
    if (!card) return;

    card.status = newStatus;

    // Also update the element's status if it exists
    const element = thrillerBoardState.elements.find(el => el.id === card.elementId);
    if (element) {
        element.status = newStatus;
        project.thrillerElements = thrillerBoardState.elements;
    }

    project.thrillerGridConfig.cards = thrillerBoardState.gridConfig.cards;
    saveProject();
    renderThrillerBoard();

    // Close popover
    const popover = document.querySelector('.thriller-card-status-popover');
    if (popover) {
        popover.remove();
    }
}

// [MVVM : Mixte]
// Change l'ordre d'affichage (zIndex) pour amener une carte au premier plan.
function bringCardToFront(event, cardId) {
    event.stopPropagation();

    // Find the card and update its zIndex to be highest
    const card = thrillerBoardState.gridConfig.cards.find(c => c.id === cardId);
    if (!card) return;

    // Get all cards in the same cell
    const cellCards = thrillerBoardState.gridConfig.cards.filter(
        c => c.rowId === card.rowId && c.columnId === card.columnId
    );

    // Find max zIndex
    const maxZIndex = Math.max(...cellCards.map(c => c.zIndex || 0), 0);

    // Set this card's zIndex to max + 1
    card.zIndex = maxZIndex + 1;

    saveProject();
    renderThrillerBoard();
}

// [MVVM : View]
// Affiche un modal listant toutes les cartes d'une cellule empilée.
function showCardStackModal(event, rowId, columnId) {
    event.stopPropagation();

    const cards = thrillerBoardState.gridConfig.cards.filter(
        c => c.rowId === rowId && c.columnId === columnId
    );

    if (!cards || cards.length === 0) return;

    // Sort cards by zIndex
    const sortedCards = [...cards].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Cartes de cette cellule (${cards.length})</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="thriller-stack-modal-list">
                    ${sortedCards.map((card, index) => {
        const typeData = THRILLER_TYPES[card.type];
        const statusData = THRILLER_CARD_STATUS[card.status || 'pending'];
        return `
                            <div class="thriller-stack-modal-item" data-card-id="${card.id}">
                                <div class="thriller-stack-modal-item-header" style="background: ${typeData.color};">
                                    <i data-lucide="${typeData.icon}"></i>
                                    <span>${typeData.label}</span>
                                </div>
                                <div class="thriller-stack-modal-item-content">
                                    <h4>${card.title}</h4>
                                    <div class="thriller-stack-modal-item-status" style="color: ${statusData.color};">
                                        <i data-lucide="${statusData.icon}"></i>
                                        ${statusData.label}
                                    </div>
                                </div>
                                <div class="thriller-stack-modal-item-actions">
                                    <button class="btn btn-sm btn-secondary" onclick="bringCardToFrontAndClose('${card.id}')" title="Mettre au premier plan">
                                        <i data-lucide="bring-to-front"></i>
                                    </button>
                                    <button class="btn btn-sm btn-secondary" onclick="editThrillerCardFromModal('${card.id}')" title="Éditer">
                                        <i data-lucide="edit-2"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="deleteThrillerCardFromStack('${card.id}')" title="Supprimer">
                                        <i data-lucide="trash-2"></i>
                                    </button>
                                </div>
                            </div>
                        `;
    }).join('')}
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// [MVVM : ViewModel]
// Amène une carte au front et ferme le modal de la pile.
function bringCardToFrontAndClose(cardId) {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();

    const card = thrillerBoardState.gridConfig.cards.find(c => c.id === cardId);
    if (!card) return;

    const cellCards = thrillerBoardState.gridConfig.cards.filter(
        c => c.rowId === card.rowId && c.columnId === card.columnId
    );

    const maxZIndex = Math.max(...cellCards.map(c => c.zIndex || 0), 0);
    card.zIndex = maxZIndex + 1;

    saveProject();
    renderThrillerBoard();
}

// [MVVM : ViewModel]
// Ouvre le modal d'édition à partir d'une sélection dans la pile.
function editThrillerCardFromModal(cardId) {
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();

    // Find the card and open the element modal instead of card modal
    const card = thrillerBoardState.gridConfig.cards.find(c => c.id === cardId);
    if (!card || !card.elementId) return;

    editThrillerElement(card.elementId);
}

// [MVVM : Mixte]
// Supprime une carte depuis le modal de la pile et rafraîchit l'interface.
function deleteThrillerCardFromStack(cardId) {
    if (!confirm('Supprimer cette carte ?')) return;

    thrillerBoardState.gridConfig.cards = thrillerBoardState.gridConfig.cards.filter(c => c.id !== cardId);

    // Remove connections
    if (thrillerBoardState.gridConfig.connections) {
        thrillerBoardState.gridConfig.connections = thrillerBoardState.gridConfig.connections.filter(
            conn => conn.from.cardId !== cardId && conn.to.cardId !== cardId
        );
    }

    saveProject();

    // Update modal or close if no cards left
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        const modalContent = modal.querySelector('.modal-body');
        if (modalContent) {
            // Re-render modal content
            modal.remove();
        }
    }

    renderThrillerBoard();
}

// [MVVM : View]
// Affiche les propriétés spécifiques d'une carte (champs alibi, indice, etc.) sous forme de badges/icônes.
function renderThrillerCardProperties(card) {
    // Render properties with sockets based on card type
    const properties = getCardTypeProperties(card.type);

    return properties.map(prop => {
        // Get value from card.data, or from card directly for special keys like 'description'
        let value;
        if (prop.key === 'description') {
            value = card.description || '';
        } else {
            value = card.data[prop.key] || '';
        }

        if (!value && !prop.showEmpty) return '';

        // Special handling for witnesses - create a property for each witness with sockets
        if (prop.type === 'witnesses') {
            if (!value || !Array.isArray(value) || value.length === 0) {
                return `
                    <div class="thriller-card-property" data-property="${prop.key}">
                        <div class="thriller-card-socket thriller-card-socket-left"
                             data-card-id="${card.id}"
                             data-property="${prop.key}"
                             data-side="left"
                             title="Créer une connexion">
                            <i data-lucide="circle" style="width: 12px; height: 12px;"></i>
                        </div>
                        <div class="thriller-card-property-content">
                            <span class="thriller-card-property-label">${prop.label}:</span>
                            <span class="thriller-card-property-value"><em>Aucun témoin</em></span>
                        </div>
                        <div class="thriller-card-socket thriller-card-socket-right"
                             data-card-id="${card.id}"
                             data-property="${prop.key}"
                             data-side="right"
                             title="Créer une connexion">
                            <i data-lucide="circle" style="width: 12px; height: 12px;"></i>
                        </div>
                    </div>
                `;
            }

            // Create a property for each witness
            const witnessesHeader = `
                <div class="thriller-card-property-header">
                    <span class="thriller-card-property-label">${prop.label}:</span>
                </div>
            `;

            const witnessItems = value.map((witnessId, index) => {
                const char = project.characters.find(c => String(c.id) === String(witnessId));
                const witnessName = char ? char.name : 'Inconnu';
                const propertyKey = `${prop.key}_${index}`;

                return `
                    <div class="thriller-card-property" data-property="${propertyKey}">
                        <div class="thriller-card-socket thriller-card-socket-left"
                             data-card-id="${card.id}"
                             data-property="${propertyKey}"
                             data-side="left"
                             title="Créer une connexion">
                            <i data-lucide="circle" style="width: 12px; height: 12px;"></i>
                        </div>
                        <div class="thriller-card-property-content">
                            <span class="thriller-card-property-value">${witnessName}</span>
                        </div>
                        <div class="thriller-card-socket thriller-card-socket-right"
                             data-card-id="${card.id}"
                             data-property="${propertyKey}"
                             data-side="right"
                             title="Créer une connexion">
                            <i data-lucide="circle" style="width: 12px; height: 12px;"></i>
                        </div>
                    </div>
                `;
            }).join('');

            return witnessesHeader + witnessItems;
        }

        return `
            <div class="thriller-card-property" data-property="${prop.key}">
                <!-- Socket Left -->
                <div class="thriller-card-socket thriller-card-socket-left"
                     data-card-id="${card.id}"
                     data-property="${prop.key}"
                     data-side="left"
                     title="Créer une connexion">
                    <i data-lucide="circle" style="width: 12px; height: 12px;"></i>
                </div>

                <!-- Property Content -->
                <div class="thriller-card-property-content">
                    <span class="thriller-card-property-label">${prop.label}:</span>
                    <span class="thriller-card-property-value">${formatPropertyValue(value, prop.type)}</span>
                </div>

                <!-- Socket Right -->
                <div class="thriller-card-socket thriller-card-socket-right"
                     data-card-id="${card.id}"
                     data-property="${prop.key}"
                     data-side="right"
                     title="Créer une connexion">
                    <i data-lucide="circle" style="width: 12px; height: 12px;"></i>
                </div>
            </div>
        `;
    }).join('');
}

// [MVVM : Model/ViewModel]
// Définit les propriétés attendues pour chaque type de carte Thriller.
function getCardTypeProperties(cardType) {
    // Define which properties to show for each card type
    const propertyMap = {
        alibi: [
            { key: 'description', label: 'Description', type: 'description', showEmpty: false },
            { key: 'for_event', label: 'Événement', type: 'text', showEmpty: false },
            { key: 'witnesses', label: 'Témoin(s)', type: 'witnesses', showEmpty: false },
            { key: 'verified_scene', label: 'Vérifié dans', type: 'scene', showEmpty: false },
            { key: 'broken_scene', label: 'Brisé dans', type: 'scene', showEmpty: false }
        ],
        clue: [
            { key: 'clue_type', label: 'Type', type: 'select', showEmpty: false },
            { key: 'significance', label: 'Importance', type: 'select', showEmpty: false },
            { key: 'what_it_suggests', label: 'Ce que ça suggère', type: 'text', showEmpty: false },
            { key: 'is_genuine', label: 'Preuve authentique', type: 'boolean', showEmpty: true },
            { key: 'points_to_characters', label: 'Pointe vers', type: 'characters', showEmpty: false }
        ],
        motive_means_opportunity: [
            { key: 'character_name', label: 'Suspect', type: 'character', showEmpty: true },
            { key: 'for_crime', label: 'Pour crime', type: 'text', showEmpty: false },
            { key: 'actual_guilt', label: 'Culpabilité', type: 'select', showEmpty: false },
            { key: 'motive_strength', label: 'Mobile', type: 'select', showEmpty: false },
            { key: 'has_means', label: 'A les moyens', type: 'boolean', showEmpty: true },
            { key: 'has_opportunity', label: 'A l\'opportunité', type: 'boolean', showEmpty: true }
        ],
        red_herring: [
            { key: 'what_it_suggests', label: 'Ce que ça suggère', type: 'text', showEmpty: false },
            { key: 'misdirects_to_name', label: 'Dirige vers', type: 'character', showEmpty: false },
            { key: 'misleading_clues', label: 'Indices trompeurs', type: 'array', showEmpty: false },
            { key: 'intended_reader_impact', label: 'Impact lecteur', type: 'text', showEmpty: false }
        ],
        secret: [
            { key: 'secret_type', label: 'Type', type: 'select', showEmpty: false },
            { key: 'importance', label: 'Importance', type: 'select', showEmpty: false },
            { key: 'holder_name', label: 'Détenu par', type: 'character', showEmpty: false },
            { key: 'about_name', label: 'Concernant', type: 'character', showEmpty: false },
            { key: 'current_status', label: 'Statut', type: 'select', showEmpty: false }
        ],
        question: [
            { key: 'question', label: 'Question', type: 'text', showEmpty: false },
            { key: 'question_type', label: 'Type', type: 'select', showEmpty: false },
            { key: 'importance', label: 'Importance', type: 'select', showEmpty: false },
            { key: 'status', label: 'Statut', type: 'select', showEmpty: false },
            { key: 'answer', label: 'Réponse', type: 'text', showEmpty: false }
        ],
        knowledge_state: [
            { key: 'character_name', label: 'Personnage', type: 'character', showEmpty: true },
            { key: 'about', label: 'Concernant', type: 'text', showEmpty: false },
            { key: 'details', label: 'Détails', type: 'text', showEmpty: false }
        ],
        reversal: [
            { key: 'reversal_type', label: 'Type', type: 'select', showEmpty: false },
            { key: 'setup_belief', label: 'Croyance établie', type: 'text', showEmpty: false },
            { key: 'actual_truth', label: 'Vérité réelle', type: 'text', showEmpty: false },
            { key: 'impact', label: 'Impact', type: 'select', showEmpty: false }
        ],
        backstory: [
            { key: 'when_it_happened', label: 'Quand', type: 'text', showEmpty: false },
            { key: 'event_type', label: 'Type', type: 'select', showEmpty: false },
            { key: 'importance', label: 'Importance', type: 'select', showEmpty: false },
            { key: 'characters_involved', label: 'Personnages', type: 'characters', showEmpty: false }
        ],
        location: [
            { key: 'name', label: 'Nom', type: 'text', showEmpty: true },
            { key: 'coordinates', label: 'Coordonnées', type: 'text', showEmpty: false },
            { key: 'description', label: 'Description', type: 'text', showEmpty: false }
        ]
    };

    return propertyMap[cardType] || [];
}

// [MVVM : ViewModel]
// Formate une valeur brute en chaîne lisible pour l'interface utilisateur.
function formatPropertyValue(value, type) {
    if (!value && type !== 'boolean') {
        return '<em>Non défini</em>';
    }

    if (type === 'boolean') {
        return value ? '<span style="color: #27ae60;">✓ Vrai</span>' : '<span style="color: #e74c3c;">✗ Faux</span>';
    }

    if (type === 'array') {
        if (Array.isArray(value)) {
            return value.length > 0 ? value.slice(0, 3).join(', ') + (value.length > 3 ? '...' : '') : '<em>Aucun</em>';
        }
        return '<em>Aucun</em>';
    }

    if (type === 'character' || type === 'characters') {
        // Value should already be the character name(s) from the data
        if (Array.isArray(value)) {
            return value.length > 0 ? value.slice(0, 2).join(', ') + (value.length > 2 ? '...' : '') : '<em>Aucun</em>';
        }
        return value || '<em>Non défini</em>';
    }

    if (type === 'select') {
        // Format select values for better display
        const translations = {
            // Clue types
            'physical': 'Physique',
            'testimonial': 'Témoignage',
            'circumstantial': 'Circonstanciel',
            'digital': 'Numérique',
            'forensic': 'Médico-légal',
            'documentary': 'Documentaire',
            // Importance
            'minor': 'Mineur',
            'major': 'Majeur',
            'critical': 'Critique',
            // Motive strength
            'none': 'Aucun',
            'weak': 'Faible',
            'moderate': 'Modéré',
            'strong': 'Fort',
            'compelling': 'Convaincant',
            // Guilt
            'innocent': 'Innocent',
            'guilty': 'Coupable',
            'accomplice': 'Complice',
            'unknowing_participant': 'Involontaire',
            // Secret types
            'relationship': 'Relation',
            'identity': 'Identité',
            'crime': 'Crime',
            'past': 'Passé',
            'ability': 'Capacité',
            // Secret status
            'hidden': 'Caché',
            'partially_revealed': 'Partiellement révélé',
            'fully_revealed': 'Révélé',
            // Question types
            'whodunit': 'Qui l\'a fait',
            'how': 'Comment',
            'why': 'Pourquoi',
            'when': 'Quand',
            'where': 'Où',
            'what': 'Quoi',
            // Question status
            'open': 'Ouvert',
            'answered': 'Répondu',
            'partially_answered': 'Partiellement répondu',
            // Reversal types
            'motive': 'Mobile',
            'victim': 'Victime',
            'ally_is_enemy': 'Allié = Ennemi',
            'enemy_is_ally': 'Ennemi = Allié',
            'timeline': 'Chronologie',
            'method': 'Méthode',
            'location': 'Lieu',
            // Reversal impact
            'twist': 'Rebondissement',
            'revelation': 'Révélation',
            'game_changer': 'Changement majeur',
            // Backstory types
            'other': 'Autre',
            'original_crime': 'Crime d\'origine',
            'trauma': 'Traumatisme',
            'betrayal': 'Trahison',
            'relationship_start': 'Début relation',
            'death': 'Décès',
            'secret_formed': 'Secret formé'
        };
        return translations[value] || value;
    }

    if (type === 'description') {
        // Description can be longer
        if (!value) return '<em>Aucune description</em>';
        if (typeof value === 'string' && value.length > 150) {
            return value.substring(0, 150) + '...';
        }
        return value;
    }

    if (type === 'witnesses') {
        // Format witnesses list with character names
        if (!value || !Array.isArray(value) || value.length === 0) {
            return '<em>Aucun témoin</em>';
        }

        // Get character names from IDs
        const witnessNames = value.map(witnessId => {
            const char = project.characters.find(c => String(c.id) === String(witnessId));
            return char ? char.name : 'Inconnu';
        });

        return witnessNames.map(name => `<div style="padding: 2px 0;">• ${name}</div>`).join('');
    }

    if (type === 'scene') {
        // Format scene reference (Tome>Acte>Chapitre>Scène)
        if (!value) return '<em>Non défini</em>';

        // Value should be a scene ID
        let sceneRef = '<em>Scène introuvable</em>';

        if (project.acts) {
            for (const act of project.acts) {
                if (act.chapters) {
                    for (const chapter of act.chapters) {
                        if (chapter.scenes) {
                            const scene = chapter.scenes.find(s => String(s.id) === String(value));
                            if (scene) {
                                // Build reference string
                                const parts = [];
                                if (project.tomes && project.tomes.length > 1) {
                                    // Find tome containing this act
                                    const tome = project.tomes.find(t => t.acts && t.acts.includes(act.id));
                                    if (tome) parts.push(tome.title);
                                }
                                parts.push(act.title);
                                parts.push(chapter.title);
                                parts.push(scene.title || 'Scène');
                                sceneRef = `<em>${parts.join(' > ')}</em>`;
                                break;
                            }
                        }
                    }
                }
            }
        }

        return sceneRef;
    }

    if (typeof value === 'string' && value.length > 80) {
        return value.substring(0, 80) + '...';
    }

    return value;
}

// [MVVM : Model]
// Récupère les colonnes basées sur la structure narrative (Actes, Chapitres, Scènes).
function getNarrativeColumns() {
    // Generate columns from story structure (acts/chapters/scenes)
    const columns = [];

    // Add "Unassigned" column first
    columns.push({
        id: 'unassigned',
        title: 'Non assigné à une scène',
        type: 'unassigned'
    });

    if (project.acts && project.acts.length > 0) {
        project.acts.forEach(act => {
            if (act.chapters && act.chapters.length > 0) {
                act.chapters.forEach(chapter => {
                    if (chapter.scenes && chapter.scenes.length > 0) {
                        chapter.scenes.forEach(scene => {
                            columns.push({
                                id: `scene_${scene.id}`,
                                title: `${act.title} > ${chapter.title}: ${scene.title || 'Scène'}`,
                                type: 'scene',
                                sceneId: scene.id,
                                chapterId: chapter.id,
                                actId: act.id
                            });
                        });
                    }
                });
            }
        });
    }

    return columns.length > 1 ? columns : [
        { id: 'unassigned', title: 'Non assigné à une scène', type: 'unassigned' },
        { id: 'default', title: 'Aucune scène', type: 'placeholder' }
    ];
}

// [MVVM : Model]
// Génère automatiquement des lignes à partir des personnages et des lieux du projet.
function getAutoGeneratedRows() {
    const rows = [];

    // Add rows for each character
    if (project.characters && project.characters.length > 0) {
        project.characters.forEach(character => {
            rows.push({
                id: `character_${character.id}`,
                title: character.name || 'Personnage sans nom',
                type: 'character',
                icon: 'user',
                color: '#3498db',
                entityId: character.id
            });
        });
    }

    // Add rows for each location
    if (project.locations && project.locations.length > 0) {
        project.locations.forEach(location => {
            rows.push({
                id: `location_${location.id}`,
                title: location.name || 'Lieu sans nom',
                type: 'location',
                icon: 'map-pin',
                color: '#2ecc71',
                entityId: location.id
            });
        });
    }

    return rows;
}

// ============================================
// GRID VIEW ACTIONS
// ============================================

// [MVVM : ViewModel]
// Alterne entre la vue Canvas et la vue Grille.
function toggleThrillerViewMode() {
    thrillerBoardState.viewMode = thrillerBoardState.viewMode === 'canvas' ? 'grid' : 'canvas';
    localStorage.setItem('plume_thriller_view_mode', thrillerBoardState.viewMode);
    renderThrillerBoard();
}

// [MVVM : ViewModel]
// Définit le mode de colonnes (libre ou narratif) et rafraîchit la grille.
function setThrillerColumnMode(mode) {
    thrillerBoardState.gridConfig.columnMode = mode;
    project.thrillerGridConfig.columnMode = mode;
    saveProject();
    renderThrillerBoard();
}

// ============================================
// SIDEBAR RENDERING
// ============================================

// [MVVM : View]
// Affiche la liste des éléments Thriller dans la barre latérale.
function renderThrillerList() {
    const container = document.getElementById('thrillerList');
    if (!container) return;

    // Get collapsed state from localStorage
    const collapsedState = JSON.parse(localStorage.getItem('plume_treeview_collapsed') || '{}');

    let html = '';

    Object.entries(THRILLER_TYPES).forEach(([typeKey, typeData]) => {
        const elements = thrillerBoardState.elements.filter(el => el.type === typeKey);
        const count = elements.length;

        const groupKey = 'thriller_' + typeKey;
        const isCollapsed = collapsedState[groupKey] === true;

        html += `
            <div class="treeview-group">
                <div class="treeview-header" onclick="toggleTreeviewGroup('${groupKey}'); event.stopPropagation();">
                    <i data-lucide="${isCollapsed ? 'chevron-right' : 'chevron-down'}" class="treeview-chevron"></i>
                    <i data-lucide="${typeData.icon}" style="color: ${typeData.color}; width: 16px; height: 16px;"></i>
                    <span class="treeview-label">${typeData.label}</span>
                    <span class="treeview-count">${count}</span>
                    <button class="treeview-add-btn" onclick="event.stopPropagation(); addThrillerElement('${typeKey}')" title="Ajouter ${typeData.label.toLowerCase()}">
                        <i data-lucide="plus" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
                ${!isCollapsed && elements.length > 0 ? `
                    <div class="treeview-children">
                        ${elements.map(element => `
                            <div class="treeview-item ${thrillerBoardState.selectedElements.includes(element.id) ? 'selected' : ''}"
                                 draggable="true"
                                 data-element-id="${element.id}"
                                 data-element-type="${typeKey}"
                                 ondragstart="handleTreeviewDragStart(event, '${element.id}')"
                                 ondragend="handleTreeviewDragEnd(event)"
                                 onclick="selectAndViewThrillerElement('${element.id}')">
                                <i data-lucide="${typeData.icon}" style="color: ${typeData.color}; width: 14px; height: 14px;"></i>
                                <span class="treeview-item-name">${element.title}</span>
                                <button class="treeview-item-delete" onclick="event.stopPropagation(); deleteThrillerElement('${element.id}')" title="Supprimer">
                                    <i data-lucide="trash-2"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    });

    container.innerHTML = html;

    // Refresh icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// [MVVM : ViewModel]
// Sélectionne un élément et fait défiler la vue pour le rendre visible.
function selectAndViewThrillerElement(elementId) {
    const element = thrillerBoardState.elements.find(el => el.id === elementId);
    if (!element) return;

    // Switch to the element's type filter
    thrillerBoardState.currentFilter = element.type;

    // Select the element
    thrillerBoardState.selectedElements = [elementId];

    // Re-render to show the element
    renderThrillerBoard();

    // Open edit modal
    setTimeout(() => {
        editThrillerElement(elementId);
    }, 100);
}

// ============================================
// ELEMENT MANAGEMENT
// ============================================

// [MVVM : Mixte]
// Crée un nouvel élément (Model) et ouvre son modal d'édition (View).
function addThrillerElement(type = null) {
    // Use current filter if no type specified
    if (!type) {
        type = thrillerBoardState.currentFilter;
    }

    const elementType = THRILLER_TYPES[type];
    if (!elementType) return;

    // Count existing elements of this type
    const existingCount = thrillerBoardState.elements.filter(el => el.type === type).length;

    const newElement = {
        id: generateId(),
        type: type,
        title: `${elementType.label} ${existingCount + 1}`,
        description: '',
        position: { x: 100, y: 100 },
        size: { width: 280, height: 200 },
        color: elementType.color,
        data: {}, // Element-specific data
        connections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    thrillerBoardState.elements.push(newElement);
    project.thrillerElements = thrillerBoardState.elements;

    renderThrillerList(); // Update sidebar
    renderThrillerElements();
    saveProject();

    // Open edit modal for the new element
    editThrillerElement(newElement.id, true);
}

// [MVVM : ViewModel]
// Sélectionne l'onglet de filtrage dans la barre latérale.
function selectThrillerTab(type) {
    thrillerBoardState.currentFilter = type;
    renderThrillerBoard();
}

// [MVVM : View]
// Affiche les éléments sur le canvas.
function renderThrillerElements() {
    const content = document.getElementById('thrillerBoardContent');
    if (!content) return;

    const filteredElements = thrillerBoardState.elements.filter(el => el.type === thrillerBoardState.currentFilter);

    // Show empty state if no elements
    if (filteredElements.length === 0) {
        content.innerHTML = '';
        return;
    }

    content.innerHTML = filteredElements.map(element => {
        const typeData = THRILLER_TYPES[element.type];
        return `
            <div class="thriller-element-card"
                 id="thriller-element-${element.id}"
                 style="left: ${element.position.x}px; top: ${element.position.y}px; width: ${element.size.width}px; min-height: ${element.size.height}px;"
                 onclick="selectThrillerElement('${element.id}')"
                 ondblclick="editThrillerElement('${element.id}')">
                <div class="thriller-element-header" style="background-color: ${element.color}">
                    <div class="thriller-element-icon">
                        <i data-lucide="${typeData.icon}"></i>
                    </div>
                    <div class="thriller-element-title">${element.title}</div>
                    <div class="thriller-element-actions">
                        <button class="btn btn-ghost btn-xs" onclick="event.stopPropagation(); deleteThrillerElement('${element.id}')">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </div>
                <div class="thriller-element-content">
                    <div class="thriller-element-description">${element.description || 'Aucune description'}</div>
                </div>
            </div>
        `;
    }).join('');

    // Render connections
    renderThrillerConnections();

    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// [MVVM : View]
// Dessine les connexions entre les éléments sur le canvas (vue Canvas uniquement).
function renderThrillerConnections() {
    // Remove existing connection lines
    document.querySelectorAll('.thriller-connection').forEach(el => el.remove());

    const canvas = document.getElementById('thrillerBoardCanvas');
    if (!canvas) return;

    thrillerBoardState.connections.forEach(connection => {
        const fromElement = thrillerBoardState.elements.find(el => el.id === connection.from);
        const toElement = thrillerBoardState.elements.find(el => el.id === connection.to);

        if (!fromElement || !toElement) return;

        const fromRect = document.getElementById(`thriller-element-${connection.from}`).getBoundingClientRect();
        const toRect = document.getElementById(`thriller-element-${connection.to}`).getBoundingClientRect();
        const canvasRect = canvas.getBoundingClientRect();

        const x1 = fromRect.left + fromRect.width / 2 - canvasRect.left;
        const y1 = fromRect.top + fromRect.height / 2 - canvasRect.top;
        const x2 = toRect.left + toRect.width / 2 - canvasRect.left;
        const y2 = toRect.top + toRect.height / 2 - canvasRect.top;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', connection.color || '#666');
        line.setAttribute('stroke-width', '2');
        line.classList.add('thriller-connection');

        canvas.appendChild(line);
    });
}

// [MVVM : View]
// Affiche le modal d'édition d'un élément Thriller.
function editThrillerElement(elementId, isNew = false) {
    const element = thrillerBoardState.elements.find(el => el.id === elementId);
    if (!element) return;

    const typeData = THRILLER_TYPES[element.type];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 700px;">
            <div class="modal-header">
                <h3>${isNew ? 'Nouveau' : 'Modifier'} ${typeData.label}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="thrillerElementForm" onsubmit="saveThrillerElement(event, '${elementId}', ${isNew})">
                    <div class="form-group">
                        <label class="form-label" for="elementTitle">Titre</label>
                        <input type="text" class="form-input" id="elementTitle" value="${element.title}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="elementDescription">Description</label>
                        <textarea class="form-input" id="elementDescription" rows="4">${element.description}</textarea>
                    </div>
                    ${renderThrillerElementFields(element)}
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Annuler</button>
                        <button type="submit" class="btn btn-primary">Sauvegarder</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// [MVVM : View]
// Rendu dynamique des champs du formulaire selon le type d'élément Thriller.
function renderThrillerElementFields(element) {
    // Render specific fields based on element type
    switch (element.type) {
        case 'alibi':
            return `
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="characterId">Personnage</label>
                        <select class="form-input" id="characterId">
                            <option value="">Sélectionner un personnage</option>
                            ${project.characters.map(char => `<option value="${char.id}" ${String(element.data.character_id) === String(char.id) ? 'selected' : ''}>${char.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="forEvent">Pour l'événement</label>
                        <input type="text" class="form-input" id="forEvent" value="${element.data.for_event || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="isTrue" ${element.data.is_true ? 'checked' : ''}>
                        Cet alibi est-il vrai ?
                    </label>
                    <small style="color: #666; margin-left: 24px;">Décocher si c'est un faux alibi</small>
                </div>
                <div class="form-section">
                    <h4>Alibi déclaré</h4>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label class="form-label" for="claimedLocation">Lieu déclaré</label>
                            <input type="text" class="form-input" id="claimedLocation" placeholder="Où ils prétendent avoir été" value="${element.data.claimed_location || ''}">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label class="form-label" for="claimedActivity">Activité déclarée</label>
                            <input type="text" class="form-input" id="claimedActivity" placeholder="Ce qu'ils prétendent avoir fait" value="${element.data.claimed_activity || ''}">
                        </div>
                    </div>
                </div>
                <div class="form-section" style="background-color: #fff5f5;">
                    <h4 style="color: #c0392b;">Réalité (cachée)</h4>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label class="form-label" for="realLocation">Lieu réel</label>
                            <input type="text" class="form-input" id="realLocation" placeholder="Où ils étaient réellement" value="${element.data.real_location || ''}">
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label class="form-label" for="realActivity">Activité réelle</label>
                            <input type="text" class="form-input" id="realActivity" placeholder="Ce qu'ils ont réellement fait" value="${element.data.real_activity || ''}">
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Témoins</label>
                    <div class="character-pills-container" id="alibiWitnessesContainer">
                        ${renderCharacterPills(element.data.witnesses || [], 'alibiWitnesses')}
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Faiblesses / Failles de l'alibi</label>
                    <div id="weaknessesContainer">
                        ${renderListItems(element.data.weaknesses || [], 'weaknesses')}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="addListItem('weaknesses', 'Ajouter une faiblesse...')">
                        <i data-lucide="plus"></i> Ajouter
                    </button>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="verifiedScene">Vérifié dans la scène</label>
                        <select class="form-input" id="verifiedScene">
                            <option value="">Sélectionner une scène</option>
                            ${renderSceneOptions(element.data.verified_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="brokenScene">Brisé dans la scène</label>
                        <select class="form-input" id="brokenScene">
                            <option value="">Quand l'alibi est brisé</option>
                            ${renderSceneOptions(element.data.broken_scene)}
                        </select>
                    </div>
                </div>
            `;

        case 'clue':
            return `
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="clueType">Type *</label>
                        <select class="form-input" id="clueType">
                            <option value="physical" ${element.data.clue_type === 'physical' ? 'selected' : ''}>Physique</option>
                            <option value="testimonial" ${element.data.clue_type === 'testimonial' ? 'selected' : ''}>Témoignage</option>
                            <option value="circumstantial" ${element.data.clue_type === 'circumstantial' ? 'selected' : ''}>Circonstanciel</option>
                            <option value="digital" ${element.data.clue_type === 'digital' ? 'selected' : ''}>Numérique</option>
                            <option value="forensic" ${element.data.clue_type === 'forensic' ? 'selected' : ''}>Médico-légal</option>
                            <option value="documentary" ${element.data.clue_type === 'documentary' ? 'selected' : ''}>Documentaire</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="clueSignificance">Importance</label>
                        <select class="form-input" id="clueSignificance">
                            <option value="minor" ${element.data.significance === 'minor' ? 'selected' : ''}>Mineur</option>
                            <option value="major" ${element.data.significance === 'major' ? 'selected' : ''}>Majeur</option>
                            <option value="critical" ${element.data.significance === 'critical' ? 'selected' : ''}>Critique</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label style="display: flex; align-items: center; gap: 8px;">
                            <input type="checkbox" id="isGenuine" ${element.data.is_genuine !== false ? 'checked' : ''}>
                            Preuve authentique
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="whatItSuggests">Ce qu'il suggère</label>
                    <textarea class="form-input" id="whatItSuggests" rows="3">${element.data.what_it_suggests || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Pointe vers les personnages</label>
                    <div class="character-pills-container" id="clueCharactersContainer">
                        ${renderCharacterPills(element.data.points_to_characters || [], 'clueCharacters')}
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="plantedScene">Scène où il est planté</label>
                        <select class="form-input" id="plantedScene">
                            <option value="">Sélectionner</option>
                            ${renderSceneOptions(element.data.planted_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="discoveredScene">Scène de découverte</label>
                        <select class="form-input" id="discoveredScene">
                            <option value="">Sélectionner</option>
                            ${renderSceneOptions(element.data.discovered_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="readerSeesAt">Le lecteur voit à</label>
                        <select class="form-input" id="readerSeesAt">
                            <option value="">Sélectionner</option>
                            ${renderSceneOptions(element.data.reader_sees_at)}
                        </select>
                    </div>
                </div>
            `;

        case 'secret':
            return `
                <div class="form-group">
                    <label class="form-label" for="secretFullDescription">Description complète</label>
                    <textarea class="form-input" id="secretFullDescription" rows="3" placeholder="Décrire le secret en détail...">${element.data.full_description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="secretType">Type de secret</label>
                        <select class="form-input" id="secretType">
                            <option value="relationship" ${element.data.secret_type === 'relationship' ? 'selected' : ''}>Relation</option>
                            <option value="identity" ${element.data.secret_type === 'identity' ? 'selected' : ''}>Identité</option>
                            <option value="crime" ${element.data.secret_type === 'crime' ? 'selected' : ''}>Crime</option>
                            <option value="past" ${element.data.secret_type === 'past' ? 'selected' : ''}>Passé</option>
                            <option value="ability" ${element.data.secret_type === 'ability' ? 'selected' : ''}>Capacité</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="secretImportance">Importance</label>
                        <select class="form-input" id="secretImportance">
                            <option value="minor" ${element.data.importance === 'minor' ? 'selected' : ''}>Mineur</option>
                            <option value="major" ${element.data.importance === 'major' ? 'selected' : ''}>Majeur</option>
                            <option value="critical" ${element.data.importance === 'critical' ? 'selected' : ''}>Critique</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="holderCharacterId">Détenu par le personnage</label>
                        <select class="form-input" id="holderCharacterId">
                            <option value="">Qui connaît ce secret</option>
                            ${project.characters.map(char => `<option value="${char.id}" ${String(element.data.holder_character_id) === String(char.id) ? 'selected' : ''}>${char.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="aboutCharacterId">Concernant le personnage</label>
                        <select class="form-input" id="aboutCharacterId">
                            <option value="">Sélectionner</option>
                            ${project.characters.map(char => `<option value="${char.id}" ${String(element.data.about_character_id) === String(char.id) ? 'selected' : ''}>${char.name}</option>`).join('')}
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="secretPlantedScene">Planté dans la scène</label>
                        <select class="form-input" id="secretPlantedScene">
                            <option value="">Premiers indices apparaissent</option>
                            ${renderSceneOptions(element.data.planted_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="secretRevealedScene">Révélé dans la scène</label>
                        <select class="form-input" id="secretRevealedScene">
                            <option value="">Le secret est révélé</option>
                            ${renderSceneOptions(element.data.revealed_scene)}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="secretCurrentStatus">Statut actuel</label>
                    <select class="form-input" id="secretCurrentStatus">
                        <option value="hidden" ${element.data.current_status === 'hidden' ? 'selected' : ''}>Caché</option>
                        <option value="partially_revealed" ${element.data.current_status === 'partially_revealed' ? 'selected' : ''}>Partiellement révélé</option>
                        <option value="fully_revealed" ${element.data.current_status === 'fully_revealed' ? 'selected' : ''}>Complètement révélé</option>
                    </select>
                </div>
            `;

        case 'backstory':
            return `
                <div class="form-group">
                    <label class="form-label" for="whenItHappened">Quand c'est arrivé *</label>
                    <input type="text" class="form-input" id="whenItHappened" placeholder="ex: il y a 5 ans, juin 2019" value="${element.data.when_it_happened || ''}" required>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="backstoryType">Type</label>
                        <select class="form-input" id="backstoryType">
                            <option value="other" ${element.data.event_type === 'other' ? 'selected' : ''}>Autre</option>
                            <option value="original_crime" ${element.data.event_type === 'original_crime' ? 'selected' : ''}>Crime d'origine</option>
                            <option value="trauma" ${element.data.event_type === 'trauma' ? 'selected' : ''}>Traumatisme</option>
                            <option value="betrayal" ${element.data.event_type === 'betrayal' ? 'selected' : ''}>Trahison</option>
                            <option value="relationship_start" ${element.data.event_type === 'relationship_start' ? 'selected' : ''}>Début de relation</option>
                            <option value="death" ${element.data.event_type === 'death' ? 'selected' : ''}>Décès</option>
                            <option value="secret_formed" ${element.data.event_type === 'secret_formed' ? 'selected' : ''}>Secret formé</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="backstoryImportance">Importance</label>
                        <select class="form-input" id="backstoryImportance">
                            <option value="minor" ${element.data.importance === 'minor' ? 'selected' : ''}>Mineur</option>
                            <option value="major" ${element.data.importance === 'major' ? 'selected' : ''}>Majeur</option>
                            <option value="critical" ${element.data.importance === 'critical' ? 'selected' : ''}>Critique</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Personnages impliqués</label>
                    <div class="character-pills-container" id="backstoryCharactersContainer">
                        ${renderCharacterPills(element.data.characters_involved || [], 'backstoryCharacters')}
                    </div>
                </div>
            `;

        case 'knowledge_state':
            return `
                <div class="form-group">
                    <label class="form-label" for="ksCharacterId">Personnage</label>
                    <select class="form-input" id="ksCharacterId">
                        <option value="">Sélectionner un personnage</option>
                        ${project.characters.map(char => `<option value="${char.id}" ${String(element.data.character_id) === String(char.id) ? 'selected' : ''}>${char.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label" for="ksAbout">Connaissance concernant</label>
                    <input type="text" class="form-input" id="ksAbout" value="${element.data.about || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="ksDetails">Détails</label>
                    <textarea class="form-input" id="ksDetails" rows="3">${element.data.details || ''}</textarea>
                </div>
            `;

        case 'location':
            return `
                <div class="form-group">
                    <label class="form-label" for="locName">Nom du lieu</label>
                    <input type="text" class="form-input" id="locName" value="${element.data.name || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="locCoordinates">Coordonnées</label>
                    <input type="text" class="form-input" id="locCoordinates" value="${element.data.coordinates || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label" for="locDesc">Description</label>
                    <textarea class="form-input" id="locDesc" rows="3">${element.data.description || ''}</textarea>
                </div>
            `;

        case 'motive_means_opportunity':
            return `
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="mmCharacterId">Personnage *</label>
                        <select class="form-input" id="mmCharacterId" required>
                            <option value="">Sélectionner un personnage</option>
                            ${project.characters.map(char => `<option value="${char.id}" ${String(element.data.character_id) === String(char.id) ? 'selected' : ''}>${char.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="forCrimeEvent">Pour crime/événement *</label>
                        <input type="text" class="form-input" id="forCrimeEvent" placeholder="ex: Meurtre de Jean Dupont" value="${element.data.for_crime || ''}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="actualGuilt">Culpabilité réelle</label>
                    <select class="form-input" id="actualGuilt">
                        <option value="innocent" ${element.data.actual_guilt === 'innocent' ? 'selected' : ''}>Innocent</option>
                        <option value="guilty" ${element.data.actual_guilt === 'guilty' ? 'selected' : ''}>Coupable</option>
                        <option value="accomplice" ${element.data.actual_guilt === 'accomplice' ? 'selected' : ''}>Complice</option>
                        <option value="unknowing_participant" ${element.data.actual_guilt === 'unknowing_participant' ? 'selected' : ''}>Participant involontaire</option>
                    </select>
                </div>
                <div class="form-section" style="background-color: #fef5e7;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h4 style="margin: 0;">Mobile</h4>
                        <select class="form-input" id="motiveStrength" style="width: auto; font-size: 14px;">
                            <option value="none" ${element.data.motive_strength === 'none' ? 'selected' : ''}>Aucun</option>
                            <option value="weak" ${element.data.motive_strength === 'weak' ? 'selected' : ''}>Faible</option>
                            <option value="moderate" ${element.data.motive_strength === 'moderate' ? 'selected' : ''}>Modéré</option>
                            <option value="strong" ${element.data.motive_strength === 'strong' ? 'selected' : ''}>Fort</option>
                            <option value="compelling" ${element.data.motive_strength === 'compelling' ? 'selected' : ''}>Convaincant</option>
                        </select>
                    </div>
                    <textarea class="form-input" id="mmMotive" rows="3" placeholder="Pourquoi ils le feraient...">${element.data.motive || ''}</textarea>
                </div>
                <div class="form-section" style="background-color: #ebf5fb;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h4 style="margin: 0;">Moyens</h4>
                        <label style="display: flex; align-items: center; gap: 8px; margin: 0;">
                            <input type="checkbox" id="hasMeans" ${element.data.has_means ? 'checked' : ''}>
                            A les moyens
                        </label>
                    </div>
                    <textarea class="form-input" id="mmMeans" rows="3" placeholder="Outils, connaissances, capacité à le faire...">${element.data.means || ''}</textarea>
                </div>
                <div class="form-section" style="background-color: #e8f8f5;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <h4 style="margin: 0;">Opportunité</h4>
                        <label style="display: flex; align-items: center; gap: 8px; margin: 0;">
                            <input type="checkbox" id="hasOpportunity" ${element.data.has_opportunity ? 'checked' : ''}>
                            A l'opportunité
                        </label>
                    </div>
                    <textarea class="form-input" id="mmOpportunity" rows="3" placeholder="Quand/où ils auraient pu le faire...">${element.data.opportunity || ''}</textarea>
                </div>
            `;

        case 'question':
            return `
                <div class="form-group">
                    <label class="form-label" for="qText">Question *</label>
                    <textarea class="form-input" id="qText" rows="2" placeholder="Quelle question mystérieuse cela soulève-t-il ?" required>${element.data.question || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="qType">Type</label>
                        <select class="form-input" id="qType">
                            <option value="whodunit" ${element.data.question_type === 'whodunit' ? 'selected' : ''}>Qui l'a fait</option>
                            <option value="how" ${element.data.question_type === 'how' ? 'selected' : ''}>Comment</option>
                            <option value="why" ${element.data.question_type === 'why' ? 'selected' : ''}>Pourquoi</option>
                            <option value="when" ${element.data.question_type === 'when' ? 'selected' : ''}>Quand</option>
                            <option value="where" ${element.data.question_type === 'where' ? 'selected' : ''}>Où</option>
                            <option value="what" ${element.data.question_type === 'what' ? 'selected' : ''}>Quoi</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="qImportance">Importance</label>
                        <select class="form-input" id="qImportance">
                            <option value="minor" ${element.data.importance === 'minor' ? 'selected' : ''}>Mineur</option>
                            <option value="major" ${element.data.importance === 'major' ? 'selected' : ''}>Majeur</option>
                            <option value="critical" ${element.data.importance === 'critical' ? 'selected' : ''}>Critique</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="qStatus">Statut</label>
                        <select class="form-input" id="qStatus">
                            <option value="open" ${element.data.status === 'open' ? 'selected' : ''}>Ouvert</option>
                            <option value="answered" ${element.data.status === 'answered' ? 'selected' : ''}>Répondu</option>
                            <option value="partially_answered" ${element.data.status === 'partially_answered' ? 'selected' : ''}>Partiellement répondu</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="qRaisedScene">Soulevée dans la scène</label>
                        <select class="form-input" id="qRaisedScene">
                            <option value="">Sélectionner une scène</option>
                            ${renderSceneOptions(element.data.raised_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="qAnsweredScene">Répondue dans la scène</label>
                        <select class="form-input" id="qAnsweredScene">
                            <option value="">Sélectionner une scène</option>
                            ${renderSceneOptions(element.data.answered_scene)}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Scènes de préfiguration</label>
                    <div class="scene-pills-container" id="foreshadowingScenesContainer">
                        ${renderScenePills(element.data.foreshadowing_scenes || [], 'foreshadowingScenes')}
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="qAnswer">Réponse</label>
                    <textarea class="form-input" id="qAnswer" rows="3" placeholder="Quelle est la réponse à cette question ?">${element.data.answer || ''}</textarea>
                </div>
            `;

        case 'red_herring':
            return `
                <div class="form-group">
                    <label class="form-label" for="whatItSuggestsRH">Ce qu'il suggère</label>
                    <textarea class="form-input" id="whatItSuggestsRH" rows="3" placeholder="À quelle fausse conclusion cela mène-t-il...">${element.data.what_it_suggests || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="misdirectsTo">Dirige les soupçons vers</label>
                    <select class="form-input" id="misdirectsTo">
                        <option value="">Sélectionner un personnage</option>
                        ${project.characters.map(char => `<option value="${char.id}" ${element.data.misdirects_to === char.id ? 'selected' : ''}>${char.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Fausses preuves / Indices trompeurs</label>
                    <div id="misleadingCluesContainer">
                        ${renderListItems(element.data.misleading_clues || [], 'misleadingClues')}
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="addListItem('misleadingClues', 'Ajouter un indice trompeur...')">
                        <i data-lucide="plus"></i> Ajouter
                    </button>
                </div>
                <div class="form-group">
                    <label class="form-label" for="intendedReaderImpact">Impact prévu sur le lecteur</label>
                    <textarea class="form-input" id="intendedReaderImpact" rows="3" style="background-color: #f3e8ff;" placeholder="Que doit penser/ressentir le lecteur ?">${element.data.intended_reader_impact || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="introducedScene">Introduit dans la scène</label>
                        <select class="form-input" id="introducedScene">
                            <option value="">Sélectionner une scène</option>
                            ${renderSceneOptions(element.data.introduced_scene)}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="debunkedScene">Démenti dans la scène</label>
                        <select class="form-input" id="debunkedScene">
                            <option value="">Quand c'est prouvé faux</option>
                            ${renderSceneOptions(element.data.debunked_scene)}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="rhStatus">Statut</label>
                    <select class="form-input" id="rhStatus">
                        <option value="active" ${element.data.status === 'active' ? 'selected' : ''}>Actif</option>
                        <option value="resolved" ${element.data.status === 'resolved' ? 'selected' : ''}>Résolu</option>
                        <option value="abandoned" ${element.data.status === 'abandoned' ? 'selected' : ''}>Abandonné</option>
                    </select>
                </div>
            `;

        case 'reversal':
            return `
                <div class="form-group">
                    <label class="form-label" for="setupBelief">Croyance établie *</label>
                    <textarea class="form-input" id="setupBelief" rows="3" placeholder="Ce que les lecteurs ont été amenés à croire..." required>${element.data.setup_belief || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="form-label" for="actualTruth">Vérité réelle *</label>
                    <textarea class="form-input" id="actualTruth" rows="3" placeholder="Ce qui est réellement vrai..." required>${element.data.actual_truth || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="reversalType">Type</label>
                        <select class="form-input" id="reversalType">
                            <option value="identity" ${element.data.reversal_type === 'identity' ? 'selected' : ''}>Identité</option>
                            <option value="motive" ${element.data.reversal_type === 'motive' ? 'selected' : ''}>Mobile</option>
                            <option value="victim" ${element.data.reversal_type === 'victim' ? 'selected' : ''}>Victime</option>
                            <option value="ally_is_enemy" ${element.data.reversal_type === 'ally_is_enemy' ? 'selected' : ''}>L'allié est l'ennemi</option>
                            <option value="enemy_is_ally" ${element.data.reversal_type === 'enemy_is_ally' ? 'selected' : ''}>L'ennemi est l'allié</option>
                            <option value="timeline" ${element.data.reversal_type === 'timeline' ? 'selected' : ''}>Chronologie</option>
                            <option value="method" ${element.data.reversal_type === 'method' ? 'selected' : ''}>Méthode</option>
                            <option value="location" ${element.data.reversal_type === 'location' ? 'selected' : ''}>Lieu</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label" for="reversalImpact">Impact</label>
                        <select class="form-input" id="reversalImpact">
                            <option value="minor" ${element.data.impact === 'minor' ? 'selected' : ''}>Mineur</option>
                            <option value="medium" ${element.data.impact === 'medium' ? 'selected' : ''}>Moyen</option>
                            <option value="major_twist" ${element.data.impact === 'major_twist' ? 'selected' : ''}>Rebondissement majeur</option>
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1; display: flex; align-items: center; padding-top: 24px;">
                        <label style="display: flex; align-items: center; gap: 8px; margin: 0;">
                            <input type="checkbox" id="isEarned" ${element.data.is_earned ? 'checked' : ''}>
                            Bien mérité
                        </label>
                    </div>
                </div>
                <div class="form-section">
                    <h4>Scènes de mise en place</h4>
                    <div class="form-group">
                        <label>Scènes qui ont établi la fausse croyance</label>
                        <div class="scene-pills-container" id="setupScenesContainer">
                            ${renderScenePills(element.data.setup_scenes || [], 'setupScenes')}
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="reversalScene">Scène de révélation</label>
                        <select class="form-input" id="reversalScene">
                            <option value="">Sélectionner une scène</option>
                            ${renderSceneOptions(element.data.reversal_scene_id)}
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label" for="foreshadowingNotes">Notes de préfiguration</label>
                    <textarea class="form-input" id="foreshadowingNotes" rows="4" placeholder="Comment cela a été préfiguré...">${element.data.foreshadowing_notes || ''}</textarea>
                </div>
            `;

        default:
            return '';
    }
}

// [MVVM : Mixte]
// Récupère les données du formulaire, met à jour le modèle (project) et rafraîchit la vue.
function saveThrillerElement(event, elementId, isNew = false) {
    event.preventDefault();

    const element = thrillerBoardState.elements.find(el => el.id === elementId);
    if (!element) return;

    // Store old character_id before updating (for swimlane change detection)
    let oldCharacterId = null;
    switch (element.type) {
        case 'alibi':
        case 'knowledge_state':
        case 'motive_means_opportunity':
            oldCharacterId = element.data.character_id;
            break;
        case 'secret':
            oldCharacterId = element.data.holder_character_id;
            break;
        case 'backstory':
            if (element.data.characters_involved && element.data.characters_involved.length > 0) {
                oldCharacterId = element.data.characters_involved[0];
            }
            break;
    }

    element.title = document.getElementById('elementTitle').value;
    element.description = document.getElementById('elementDescription').value;
    element.updatedAt = new Date().toISOString();

    // Save type-specific data
    switch (element.type) {
        case 'alibi':
            const witnessesContainer = document.getElementById('alibiWitnessesContainer');
            const witnesses = witnessesContainer ?
                Array.from(witnessesContainer.querySelectorAll('.character-pill')).map(pill => pill.dataset.charId) : [];

            const weaknessesContainer = document.getElementById('weaknessesContainer');
            const weaknesses = weaknessesContainer ?
                Array.from(weaknessesContainer.querySelectorAll('.list-item-input')).map(input => input.value).filter(v => v) : [];

            element.data = {
                character_id: document.getElementById('characterId').value,
                for_event: document.getElementById('forEvent').value,
                is_true: document.getElementById('isTrue').checked,
                claimed_location: document.getElementById('claimedLocation').value,
                claimed_activity: document.getElementById('claimedActivity').value,
                real_location: document.getElementById('realLocation').value,
                real_activity: document.getElementById('realActivity').value,
                witnesses: witnesses,
                weaknesses: weaknesses,
                verified_scene: document.getElementById('verifiedScene').value,
                broken_scene: document.getElementById('brokenScene').value
            };
            break;
        case 'clue':
            const clueCharactersContainer = document.getElementById('clueCharactersContainer');
            const clueCharacters = clueCharactersContainer ?
                Array.from(clueCharactersContainer.querySelectorAll('.character-pill')).map(pill => pill.dataset.charId) : [];

            element.data = {
                clue_type: document.getElementById('clueType').value,
                significance: document.getElementById('clueSignificance').value,
                is_genuine: document.getElementById('isGenuine').checked,
                what_it_suggests: document.getElementById('whatItSuggests').value,
                points_to_characters: clueCharacters,
                planted_scene: document.getElementById('plantedScene').value,
                discovered_scene: document.getElementById('discoveredScene').value,
                reader_sees_at: document.getElementById('readerSeesAt').value
            };
            break;
        case 'secret':
            element.data = {
                full_description: document.getElementById('secretFullDescription').value,
                secret_type: document.getElementById('secretType').value,
                importance: document.getElementById('secretImportance').value,
                holder_character_id: document.getElementById('holderCharacterId').value,
                about_character_id: document.getElementById('aboutCharacterId').value,
                planted_scene: document.getElementById('secretPlantedScene').value,
                revealed_scene: document.getElementById('secretRevealedScene').value,
                current_status: document.getElementById('secretCurrentStatus').value
            };
            break;
        case 'backstory':
            const backstoryCharactersContainer = document.getElementById('backstoryCharactersContainer');
            const backstoryCharacters = backstoryCharactersContainer ?
                Array.from(backstoryCharactersContainer.querySelectorAll('.character-pill')).map(pill => pill.dataset.charId) : [];

            element.data = {
                when_it_happened: document.getElementById('whenItHappened') ? document.getElementById('whenItHappened').value : '',
                event_type: document.getElementById('backstoryType') ? document.getElementById('backstoryType').value : 'other',
                importance: document.getElementById('backstoryImportance') ? document.getElementById('backstoryImportance').value : 'minor',
                characters_involved: backstoryCharacters
            };
            break;

        case 'knowledge_state':
            element.data = {
                character_id: document.getElementById('ksCharacterId') ? document.getElementById('ksCharacterId').value : '',
                about: document.getElementById('ksAbout') ? document.getElementById('ksAbout').value : '',
                details: document.getElementById('ksDetails') ? document.getElementById('ksDetails').value : ''
            };
            break;

        case 'location':
            element.data = {
                name: document.getElementById('locName') ? document.getElementById('locName').value : '',
                coordinates: document.getElementById('locCoordinates') ? document.getElementById('locCoordinates').value : '',
                description: document.getElementById('locDesc') ? document.getElementById('locDesc').value : ''
            };
            break;

        case 'motive_means_opportunity':
            element.data = {
                character_id: document.getElementById('mmCharacterId') ? document.getElementById('mmCharacterId').value : '',
                for_crime: document.getElementById('forCrimeEvent') ? document.getElementById('forCrimeEvent').value : '',
                actual_guilt: document.getElementById('actualGuilt') ? document.getElementById('actualGuilt').value : 'innocent',
                motive: document.getElementById('mmMotive') ? document.getElementById('mmMotive').value : '',
                motive_strength: document.getElementById('motiveStrength') ? document.getElementById('motiveStrength').value : 'none',
                means: document.getElementById('mmMeans') ? document.getElementById('mmMeans').value : '',
                has_means: document.getElementById('hasMeans') ? document.getElementById('hasMeans').checked : false,
                opportunity: document.getElementById('mmOpportunity') ? document.getElementById('mmOpportunity').value : '',
                has_opportunity: document.getElementById('hasOpportunity') ? document.getElementById('hasOpportunity').checked : false
            };
            break;

        case 'question':
            const foreshadowingScenesContainer = document.getElementById('foreshadowingScenesContainer');
            const foreshadowingScenes = foreshadowingScenesContainer ?
                Array.from(foreshadowingScenesContainer.querySelectorAll('.scene-pill')).map(pill => pill.dataset.sceneId) : [];

            element.data = {
                question: document.getElementById('qText') ? document.getElementById('qText').value : '',
                question_type: document.getElementById('qType') ? document.getElementById('qType').value : 'whodunit',
                importance: document.getElementById('qImportance') ? document.getElementById('qImportance').value : 'minor',
                status: document.getElementById('qStatus') ? document.getElementById('qStatus').value : 'open',
                raised_scene: document.getElementById('qRaisedScene') ? document.getElementById('qRaisedScene').value : '',
                answered_scene: document.getElementById('qAnsweredScene') ? document.getElementById('qAnsweredScene').value : '',
                foreshadowing_scenes: foreshadowingScenes,
                answer: document.getElementById('qAnswer') ? document.getElementById('qAnswer').value : ''
            };
            break;

        case 'red_herring':
            const misleadingCluesContainer = document.getElementById('misleadingCluesContainer');
            const misleadingClues = misleadingCluesContainer ?
                Array.from(misleadingCluesContainer.querySelectorAll('.list-item-input')).map(input => input.value).filter(v => v) : [];

            element.data = {
                what_it_suggests: document.getElementById('whatItSuggestsRH') ? document.getElementById('whatItSuggestsRH').value : '',
                misdirects_to: document.getElementById('misdirectsTo') ? document.getElementById('misdirectsTo').value : '',
                misleading_clues: misleadingClues,
                intended_reader_impact: document.getElementById('intendedReaderImpact') ? document.getElementById('intendedReaderImpact').value : '',
                introduced_scene: document.getElementById('introducedScene') ? document.getElementById('introducedScene').value : '',
                debunked_scene: document.getElementById('debunkedScene') ? document.getElementById('debunkedScene').value : '',
                status: document.getElementById('rhStatus') ? document.getElementById('rhStatus').value : 'active'
            };
            break;

        case 'reversal':
            const setupScenesContainer = document.getElementById('setupScenesContainer');
            const setupScenes = setupScenesContainer ?
                Array.from(setupScenesContainer.querySelectorAll('.scene-pill')).map(pill => pill.dataset.sceneId) : [];

            element.data = {
                setup_belief: document.getElementById('setupBelief') ? document.getElementById('setupBelief').value : '',
                actual_truth: document.getElementById('actualTruth') ? document.getElementById('actualTruth').value : '',
                reversal_type: document.getElementById('reversalType') ? document.getElementById('reversalType').value : 'identity',
                impact: document.getElementById('reversalImpact') ? document.getElementById('reversalImpact').value : 'medium',
                is_earned: document.getElementById('isEarned') ? document.getElementById('isEarned').checked : false,
                setup_scenes: setupScenes,
                reversal_scene_id: document.getElementById('reversalScene') ? document.getElementById('reversalScene').value : '',
                foreshadowing_notes: document.getElementById('foreshadowingNotes') ? document.getElementById('foreshadowingNotes').value : ''
            };
            break;
    }

    project.thrillerElements = thrillerBoardState.elements;

    // Update all associated cards with new element data (except status)
    updateCardsFromElement(element.id);

    // Check if character changed and move cards to new swimlane
    let newCharacterId = null;
    switch (element.type) {
        case 'alibi':
        case 'knowledge_state':
        case 'motive_means_opportunity':
            newCharacterId = element.data.character_id;
            break;
        case 'secret':
            newCharacterId = element.data.holder_character_id;
            break;
        case 'backstory':
            if (element.data.characters_involved && element.data.characters_involved.length > 0) {
                newCharacterId = element.data.characters_involved[0];
            }
            break;
    }

    // If character changed and we're not creating a new element, move existing cards
    if (!isNew && oldCharacterId !== newCharacterId) {
        moveCardsToNewSwimlane(element.id, oldCharacterId, newCharacterId);
    }

    renderThrillerList(); // Update sidebar
    renderThrillerElements();
    renderThrillerBoard(); // Update grid view if applicable
    saveProject();

    // If this is a new element and we're in grid view mode, create a card on the grid
    if (isNew && thrillerBoardState.viewMode === 'grid') {
        createCardForElement(element);
    }

    event.target.closest('.modal-overlay').remove();
}

// [MVVM : Model/ViewModel]
// Met à jour toutes les cartes de la grille associées à un élément modifié.
function updateCardsFromElement(elementId) {
    // Find the element
    const element = thrillerBoardState.elements.find(el => el.id === elementId);
    if (!element) return;

    // Find all cards associated with this element
    const associatedCards = thrillerBoardState.gridConfig.cards.filter(
        card => card.elementId === elementId
    );

    if (associatedCards.length === 0) return;

    // Update each card with new element data (but keep card's own status)
    associatedCards.forEach(card => {
        card.title = element.title;
        card.description = element.description; // Copy description directly
        card.type = element.type;
        card.data = { ...element.data }; // Copy element data
        // card.status is kept unchanged - each card maintains its own status
    });

    // Duplicate cards to scene columns when element references scenes
    if (thrillerBoardState.gridConfig.columnMode === 'narrative') {
        duplicateCardsToScenes(elementId);
    }

    // Save updated cards
    project.thrillerGridConfig.cards = thrillerBoardState.gridConfig.cards;
}

// [MVVM : Model]
// Duplique les cartes vers les colonnes de scènes si des scènes sont référencées.
function duplicateCardsToScenes(elementId) {
    // Find the element
    const element = thrillerBoardState.elements.find(el => el.id === elementId);
    if (!element) return;

    // Extract scene references from element data
    const sceneRefs = [];

    // Check common scene reference fields
    const sceneFields = [
        'verified_scene', 'broken_scene', 'planted_scene', 'discovered_scene',
        'reader_sees_at', 'raised_scene', 'answered_scene', 'introduced_scene',
        'debunked_scene', 'reversal_scene_id'
    ];

    sceneFields.forEach(field => {
        if (element.data[field]) {
            sceneRefs.push(element.data[field]);
        }
    });

    // Also check for array fields like setup_scenes, foreshadowing_scenes
    const arrayFields = ['setup_scenes', 'foreshadowing_scenes'];
    arrayFields.forEach(field => {
        if (element.data[field] && Array.isArray(element.data[field])) {
            sceneRefs.push(...element.data[field]);
        }
    });

    // Remove duplicates
    const uniqueSceneRefs = [...new Set(sceneRefs)];

    // For each scene reference, ensure a card exists in that column
    uniqueSceneRefs.forEach(sceneId => {
        if (!sceneId) return;

        // Find the column for this scene
        const sceneColumn = thrillerBoardState.gridConfig.columns.find(col =>
            col.type === 'scene' && String(col.sceneId) === String(sceneId)
        );

        if (!sceneColumn) return; // Scene column doesn't exist

        // Find the original card (use the first one we find)
        const originalCard = thrillerBoardState.gridConfig.cards.find(
            card => card.elementId === elementId
        );

        if (!originalCard) return;

        // Check if a card for this element already exists in this scene column
        const existingCard = thrillerBoardState.gridConfig.cards.find(
            card => card.elementId === elementId &&
                card.columnId === sceneColumn.id
        );

        if (existingCard) {
            // Card already exists, just ensure it's on the same swimlane
            existingCard.rowId = originalCard.rowId;
            return;
        }

        // Get max zIndex in this cell
        const cellCards = thrillerBoardState.gridConfig.cards.filter(
            c => c.rowId === originalCard.rowId && c.columnId === sceneColumn.id
        );
        const maxZIndex = cellCards.length > 0 ? Math.max(...cellCards.map(c => c.zIndex || 0), 0) : 0;

        // Create a duplicate card in this scene column
        const duplicateCard = {
            id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            type: originalCard.type,
            elementId: originalCard.elementId,
            title: originalCard.title,
            description: originalCard.description,
            data: { ...originalCard.data },
            status: originalCard.status,
            rowId: originalCard.rowId, // Same swimlane
            columnId: sceneColumn.id,  // Scene column
            zIndex: maxZIndex + 1
        };

        thrillerBoardState.gridConfig.cards.push(duplicateCard);
    });
}

// [MVVM : Model]
// Déplace les cartes vers une nouvelle swimlane si le personnage change.
function moveCardsToNewSwimlane(elementId, oldCharacterId, newCharacterId) {
    // Find all cards associated with this element
    const associatedCards = thrillerBoardState.gridConfig.cards.filter(
        card => card.elementId === elementId
    );

    if (associatedCards.length === 0) return;

    // Determine new row ID based on new character
    let newRowId = null;
    if (newCharacterId) {
        newRowId = `character_${newCharacterId}`;
    } else {
        // If no character, use first available row
        const autoRows = getAutoGeneratedRows();
        const manualRows = thrillerBoardState.gridConfig.rows;
        const allRows = [...autoRows, ...manualRows];
        if (allRows.length > 0) {
            newRowId = allRows[0].id;
        }
    }

    if (!newRowId) return;

    // Move all associated cards to the new row
    associatedCards.forEach(card => {
        card.rowId = newRowId;
        // Keep the same columnId (scene assignment doesn't change)
        // Recalculate zIndex in new cell
        const cellCards = thrillerBoardState.gridConfig.cards.filter(
            c => c.rowId === newRowId && c.columnId === card.columnId && c.id !== card.id
        );
        const maxZIndex = cellCards.length > 0 ? Math.max(...cellCards.map(c => c.zIndex || 0), 0) : 0;
        card.zIndex = maxZIndex + 1;
    });

    project.thrillerGridConfig.cards = thrillerBoardState.gridConfig.cards;
}

// [MVVM : Mixte]
// Crée une ou plusieurs cartes sur la grille pour un élément donné.
function createCardForElement(element) {
    // Determine the row based on the character or location associated with the element
    let rowId = null;
    let characterId = null;

    // Extract character_id from element data based on element type
    switch (element.type) {
        case 'alibi':
        case 'knowledge_state':
        case 'motive_means_opportunity':
            characterId = element.data.character_id;
            break;
        case 'secret':
            characterId = element.data.holder_character_id;
            break;
        case 'backstory':
            // Use first character involved
            if (element.data.characters_involved && element.data.characters_involved.length > 0) {
                characterId = element.data.characters_involved[0];
            }
            break;
        // For other types, we'll place them in the first available row
    }

    // If we have a character, find the corresponding row
    if (characterId) {
        rowId = `character_${characterId}`;
    }

    // If no row found yet, use the first available row
    if (!rowId) {
        const autoRows = getAutoGeneratedRows();
        const manualRows = thrillerBoardState.gridConfig.rows;
        const allRows = [...autoRows, ...manualRows];
        if (allRows.length > 0) {
            rowId = allRows[0].id;
        }
    }

    // If still no row, we can't create the card
    if (!rowId) return;

    // Use "unassigned" column in narrative mode, or first column in free mode
    let columnId = 'unassigned';
    if (thrillerBoardState.gridConfig.columnMode === 'free') {
        if (thrillerBoardState.gridConfig.columns.length > 0) {
            columnId = thrillerBoardState.gridConfig.columns[0].id;
        } else {
            return; // No columns available
        }
    }

    // Calculate zIndex for new card
    const cellCards = thrillerBoardState.gridConfig.cards.filter(
        c => c.rowId === rowId && c.columnId === columnId
    );
    const maxZIndex = cellCards.length > 0 ? Math.max(...cellCards.map(c => c.zIndex || 0), 0) : 0;

    // Create a new card
    const newCard = {
        id: 'card_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        type: element.type,
        elementId: element.id,
        title: element.title,
        data: { ...element.data },
        status: 'pending',
        rowId: rowId,
        columnId: columnId,
        zIndex: maxZIndex + 1
    };

    thrillerBoardState.gridConfig.cards.push(newCard);
    project.thrillerGridConfig.cards = thrillerBoardState.gridConfig.cards;
    saveProject();
    renderThrillerBoard();
}

// [MVVM : Mixte]
// Supprime un élément, ses cartes associées et ses connexions.
function deleteThrillerElement(elementId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément et toutes ses cartes associées ?')) return;

    // Remove the element
    thrillerBoardState.elements = thrillerBoardState.elements.filter(el => el.id !== elementId);

    // Remove connections to/from this element
    thrillerBoardState.connections = thrillerBoardState.connections.filter(conn =>
        conn.from !== elementId && conn.to !== elementId
    );

    // Remove all cards associated with this element on the grid
    thrillerBoardState.gridConfig.cards = thrillerBoardState.gridConfig.cards.filter(
        card => card.elementId !== elementId
    );

    // Remove all SVG connections to/from cards of this element
    if (thrillerBoardState.gridConfig.connections) {
        thrillerBoardState.gridConfig.connections = thrillerBoardState.gridConfig.connections.filter(conn => {
            const fromCard = thrillerBoardState.gridConfig.cards.find(c => c.id === conn.from.cardId);
            const toCard = thrillerBoardState.gridConfig.cards.find(c => c.id === conn.to.cardId);
            return fromCard && toCard; // Keep only if both cards still exist
        });
    }

    project.thrillerElements = thrillerBoardState.elements;
    project.thrillerConnections = thrillerBoardState.connections;
    project.thrillerGridConfig.cards = thrillerBoardState.gridConfig.cards;
    if (thrillerBoardState.gridConfig.connections) {
        project.thrillerGridConfig.connections = thrillerBoardState.gridConfig.connections;
    }

    renderThrillerList(); // Update sidebar
    renderThrillerElements();
    renderThrillerBoard(); // Update grid view
    saveProject();
}

// [MVVM : ViewModel]
// Alias de filtrage pour compatibilité ascendante.
function filterThrillerElements(filterType) {
    selectThrillerTab(filterType);
}

// ============================================
// CANVAS INTERACTION
// ============================================

// [MVVM : ViewModel]
// Gère l'événement mousedown sur le canvas pour la navigation.
function handleThrillerCanvasMouseDown(event) {
    // Handle canvas panning and element interactions
    // Implementation similar to arc-board
}

// [MVVM : ViewModel]
// Gère l'événement mousemove pour le déplacement du canvas (panning).
function handleThrillerCanvasMouseMove(event) {
    // Handle dragging elements
}

// [MVVM : ViewModel]
// Gère l'événement mouseup pour terminer les interactions canvas.
function handleThrillerCanvasMouseUp(event) {
    // Handle mouse up events
}

// [MVVM : ViewModel]
// Gère l'événement wheel pour le zoom interactif sur le canvas.
function handleThrillerCanvasWheel(event) {
    // Handle zooming
}

// ============================================
// CONTEXT PANEL
// ============================================

// [MVVM : View]
// Met à jour le contenu du panneau de contexte basé sur l'élément sélectionné.
function updateThrillerContextPanel() {
    const content = document.getElementById('thrillerContextContent');
    if (!content) return;

    const elementCounts = {};
    thrillerBoardState.elements.forEach(element => {
        elementCounts[element.type] = (elementCounts[element.type] || 0) + 1;
    });

    content.innerHTML = `
        <div class="thriller-stats">
            <h4>Éléments (${thrillerBoardState.elements.length})</h4>
            ${Object.entries(THRILLER_TYPES).map(([key, type]) => `
                <div class="thriller-stat-item">
                    <span class="thriller-stat-icon" style="color: ${type.color}">
                        <i data-lucide="${type.icon}"></i>
                    </span>
                    <span class="thriller-stat-label">${type.label}</span>
                    <span class="thriller-stat-count">${elementCounts[key] || 0}</span>
                </div>
            `).join('')}
        </div>
        <div class="thriller-recent">
            <h4>Éléments récents</h4>
            ${thrillerBoardState.elements.slice(-5).reverse().map(element => {
        const typeData = THRILLER_TYPES[element.type];
        return `
                    <div class="thriller-recent-item" onclick="editThrillerElement('${element.id}')">
                        <span class="thriller-recent-icon" style="color: ${element.color}">
                            <i data-lucide="${typeData.icon}"></i>
                        </span>
                        <span class="thriller-recent-title">${element.title}</span>
                    </div>
                `;
    }).join('')}
        </div>
    `;

    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// [MVVM : ViewModel]
// Affiche ou masque le panneau latéral de contexte.
function toggleThrillerContextPanel() {
    thrillerBoardState.contextPanelOpen = !thrillerBoardState.contextPanelOpen;
    const panel = document.getElementById('thrillerContextPanel');
    if (panel) {
        panel.classList.toggle('collapsed', !thrillerBoardState.contextPanelOpen);
    }
}

// ============================================
// ZOOM AND NAVIGATION
// ============================================

// [MVVM : ViewModel]
// Ajuste le niveau de zoom du board.
function zoomThrillerBoard(direction) {
    const newZoom = Math.max(THRILLER_BOARD_CONFIG.minZoom,
        Math.min(THRILLER_BOARD_CONFIG.maxZoom, thrillerBoardState.zoom + direction * THRILLER_BOARD_CONFIG.zoomStep));

    thrillerBoardState.zoom = newZoom;
    updateThrillerZoomDisplay();

    const canvas = document.getElementById('thrillerBoardCanvas');
    if (canvas) {
        canvas.style.transform = `scale(${newZoom})`;
    }
}

// [MVVM : View]
// Met à jour l'affichage numérique du zoom dans l'interface.
function updateThrillerZoomDisplay() {
    const zoomDisplay = document.getElementById('thrillerZoomLevel');
    if (zoomDisplay) {
        zoomDisplay.textContent = `${Math.round(thrillerBoardState.zoom * 100)}%`;
    }
}

// [MVVM : ViewModel]
// Ajuste le zoom pour que tous les éléments soient visibles à l'écran.
function fitThrillerBoardToScreen() {
    // Implementation to fit all elements in view
    thrillerBoardState.zoom = 1;
    thrillerBoardState.canvasOffset = { x: 0, y: 0 };
    updateThrillerZoomDisplay();

    const canvas = document.getElementById('thrillerBoardCanvas');
    if (canvas) {
        canvas.style.transform = 'scale(1) translate(0, 0)';
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// [MVVM : ViewModel]
// Marque un élément comme sélectionné dans l'état global.
function selectThrillerElement(elementId) {
    // Handle element selection
    thrillerBoardState.selectedElements = [elementId];
    // Update visual selection
}

// [MVVM : Autre]
// Génère un identifiant unique aléatoire.
function generateId() {
    return 'thriller_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// [MVVM : View]
// Rendu visuel des étiquettes (pills) de personnages.
function renderCharacterPills(selectedCharacters, fieldName) {
    if (!project.characters || project.characters.length === 0) {
        return '<p style="color: #999; font-size: 13px;">Aucun personnage disponible. Créez d\'abord des personnages dans votre projet.</p>';
    }

    // Ensure selectedCharacters is an array of strings for consistent comparison
    const selectedCharsStr = selectedCharacters.map(id => String(id));

    let html = '<div class="pills-wrapper">';

    // Render selected character pills
    selectedCharsStr.forEach(charId => {
        const char = project.characters.find(c => String(c.id) === charId);
        if (char) {
            html += `
                <span class="character-pill" data-char-id="${charId}">
                    ${char.name}
                    <button type="button" class="pill-remove" onclick="removeCharacterPill('${fieldName}', '${charId}'); return false;">×</button>
                </span>
            `;
        }
    });

    html += '</div>';

    // Add character selector
    html += `
        <select class="pill-selector form-input" onchange="if(this.value) { addCharacterPill('${fieldName}', this.value); this.value=''; }">
            <option value="">Ajouter un personnage...</option>
            ${project.characters.filter(c => !selectedCharsStr.includes(String(c.id))).map(char =>
        `<option value="${char.id}">${char.name}</option>`
    ).join('')}
        </select>
    `;

    return html;
}

// [MVVM : View]
// Rendu des options de sélection de scène pour les menus déroulants.
function renderSceneOptions(selectedSceneId) {
    if (!project.acts || project.acts.length === 0) {
        return '<option value="" disabled>Aucun acte créé</option>';
    }

    let options = '';
    let hasScenes = false;

    project.acts.forEach(act => {
        if (act.chapters && act.chapters.length > 0) {
            act.chapters.forEach(chapter => {
                if (chapter.scenes && chapter.scenes.length > 0) {
                    hasScenes = true;
                    chapter.scenes.forEach(scene => {
                        const sceneLabel = `${act.title} > ${chapter.title}: ${scene.title || 'Scène ' + (chapter.scenes.indexOf(scene) + 1)}`;
                        const selected = String(selectedSceneId) === String(scene.id) ? 'selected' : '';
                        options += `<option value="${scene.id}" ${selected}>${sceneLabel}</option>`;
                    });
                }
            });
        }
    });

    if (!hasScenes) {
        return '<option value="" disabled>Aucune scène créée</option>';
    }

    return options;
}

// [MVVM : View]
// Rendu visuel des étiquettes (pills) de scènes.
function renderScenePills(selectedScenes, fieldName) {
    if (!project.acts || project.acts.length === 0) {
        return '<p style="color: #999; font-size: 13px;">Aucune scène disponible. Créez d\'abord des actes, chapitres et scènes dans votre projet.</p>';
    }

    // Ensure selectedScenes is an array of strings for consistent comparison
    const selectedScenesStr = selectedScenes.map(id => String(id));

    let html = '<div class="pills-wrapper">';

    // Render selected scene pills
    selectedScenesStr.forEach(sceneId => {
        let sceneLabel = '';
        project.acts.forEach(act => {
            if (act.chapters) {
                act.chapters.forEach(chapter => {
                    if (chapter.scenes) {
                        const scene = chapter.scenes.find(s => String(s.id) === sceneId);
                        if (scene) {
                            sceneLabel = `${act.title} > ${chapter.title}: ${scene.title || 'Scène ' + (chapter.scenes.indexOf(scene) + 1)}`;
                        }
                    }
                });
            }
        });

        if (sceneLabel) {
            html += `
                <span class="scene-pill" data-scene-id="${sceneId}">
                    ${sceneLabel}
                    <button type="button" class="pill-remove" onclick="removeScenePill('${fieldName}', '${sceneId}'); return false;">×</button>
                </span>
            `;
        }
    });

    html += '</div>';

    // Add scene selector
    html += `
        <select class="pill-selector form-input" onchange="if(this.value) { addScenePill('${fieldName}', this.value); this.value=''; }">
            <option value="">Ajouter une scène...</option>
    `;

    project.acts.forEach(act => {
        if (act.chapters && act.chapters.length > 0) {
            act.chapters.forEach(chapter => {
                if (chapter.scenes && chapter.scenes.length > 0) {
                    chapter.scenes.forEach(scene => {
                        if (!selectedScenesStr.includes(String(scene.id))) {
                            const sceneLabel = `${act.title} > ${chapter.title}: ${scene.title || 'Scène ' + (chapter.scenes.indexOf(scene) + 1)}`;
                            html += `<option value="${scene.id}">${sceneLabel}</option>`;
                        }
                    });
                }
            });
        }
    });

    html += '</select>';

    return html;
}

// [MVVM : View]
// Rendu générique de listes d'éléments modifiables (points pivots, indices trompeurs, etc.).
function renderListItems(items, fieldName) {
    if (!items || items.length === 0) {
        return '';
    }

    return items.map((item, index) => `
        <div class="list-item-row">
            <input type="text" class="list-item-input form-input" value="${item}" data-field="${fieldName}" data-index="${index}" onkeydown="if(event.key === 'Enter') event.preventDefault();" />
            <button type="button" class="btn btn-ghost btn-xs" onclick="removeListItem('${fieldName}', ${index})">
                <i data-lucide="x"></i>
            </button>
        </div>
    `).join('');
}

// [MVVM : ViewModel]
// Ajoute un personnage à la liste d'un champ et met à jour l'affichage.
function addCharacterPill(fieldName, charId) {
    if (!charId) return;

    const container = document.getElementById(fieldName + 'Container');
    if (!container) {
        console.error('Container not found:', fieldName + 'Container');
        return;
    }

    // Get current selected characters
    const currentPills = Array.from(container.querySelectorAll('.character-pill')).map(pill => pill.dataset.charId);

    // Ensure charId is string for consistency
    const charIdStr = String(charId);
    if (!currentPills.includes(charIdStr)) {
        currentPills.push(charIdStr);
    }

    // Re-render pills
    container.innerHTML = renderCharacterPills(currentPills, fieldName);

    // Refresh icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// [MVVM : ViewModel]
// Supprime un personnage de la liste d'un champ et met à jour l'affichage.
function removeCharacterPill(fieldName, charId) {
    const container = document.getElementById(fieldName + 'Container');
    if (!container) return;

    // Get current selected characters
    const currentPills = Array.from(container.querySelectorAll('.character-pill'))
        .map(pill => pill.dataset.charId)
        .filter(id => id !== charId);

    // Re-render pills
    container.innerHTML = renderCharacterPills(currentPills, fieldName);

    // Refresh icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// [MVVM : ViewModel]
// Ajoute une scène à la liste d'un champ et met à jour l'affichage.
function addScenePill(fieldName, sceneId) {
    if (!sceneId) return;

    const container = document.getElementById(fieldName + 'Container');
    if (!container) {
        console.error('Container not found:', fieldName + 'Container');
        return;
    }

    // Get current selected scenes
    const currentPills = Array.from(container.querySelectorAll('.scene-pill')).map(pill => pill.dataset.sceneId);

    // Ensure sceneId is string for consistency
    const sceneIdStr = String(sceneId);
    if (!currentPills.includes(sceneIdStr)) {
        currentPills.push(sceneIdStr);
    }

    // Re-render pills
    container.innerHTML = renderScenePills(currentPills, fieldName);

    // Refresh icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// [MVVM : ViewModel]
// Supprime une scène de la liste d'un champ et met à jour l'affichage.
function removeScenePill(fieldName, sceneId) {
    const container = document.getElementById(fieldName + 'Container');
    if (!container) return;

    // Get current selected scenes
    const currentPills = Array.from(container.querySelectorAll('.scene-pill'))
        .map(pill => pill.dataset.sceneId)
        .filter(id => id !== sceneId);

    // Re-render pills
    container.innerHTML = renderScenePills(currentPills, fieldName);

    // Refresh icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// [MVVM : ViewModel]
// Ajoute un élément textuel à une liste modifiable (ex: points pivots).
function addListItem(fieldName, placeholder) {
    const container = document.getElementById(fieldName + 'Container');
    if (!container) return;

    const newItem = document.createElement('div');
    newItem.className = 'list-item-row';
    newItem.innerHTML = `
        <input type="text" class="list-item-input form-input" placeholder="${placeholder}" data-field="${fieldName}" />
        <button type="button" class="btn btn-ghost btn-xs" onclick="this.parentElement.remove()">
            <i data-lucide="x"></i>
        </button>
    `;

    container.appendChild(newItem);

    // Focus the new input
    newItem.querySelector('input').focus();

    // Refresh icons
    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// [MVVM : ViewModel]
// Supprime un élément textuel d'une liste modifiable.
function removeListItem(fieldName, index) {
    const container = document.getElementById(fieldName + 'Container');
    if (!container) return;

    const items = container.querySelectorAll('.list-item-row');
    if (items[index]) {
        items[index].remove();
    }
}

// ============================================
// GRID VIEW - SWIMLANE ROW MANAGEMENT
// ============================================

// [MVVM : View]
// Affiche le modal de création d'une nouvelle ligne (swimlane) dans la grille.
function addThrillerSwimlaneRow() {
    // Show modal to configure row
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Ajouter une ligne de swimlane</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="swimlaneRowForm" onsubmit="saveThrillerSwimlaneRow(event)">
                    <div class="form-group">
                        <label class="form-label" for="rowType">Type de ligne</label>
                        <select class="form-input" id="rowType" onchange="updateRowTypeFields(this.value)">
                            <option value="character">Personnage</option>
                            <option value="location">Lieu</option>
                            <option value="custom">Personnalisé</option>
                        </select>
                    </div>
                    <div class="form-group" id="rowEntityField">
                        <label class="form-label" for="rowEntity">Personnage</label>
                        <select class="form-input" id="rowEntity">
                            <option value="">Sélectionner un personnage...</option>
                            ${project.characters ? project.characters.map(char => '<option value="' + char.id + '">' + char.name + '</option>').join('') : ''}
                        </select>
                    </div>
                    <div class="form-group" id="rowTitleField" style="display: none;">
                        <label class="form-label" for="rowTitle">Titre</label>
                        <input type="text" class="form-input" id="rowTitle" placeholder="Nom de la ligne">
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="rowColor">Couleur</label>
                        <input type="color" class="form-input" id="rowColor" value="#3498db">
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Annuler</button>
                        <button type="submit" class="btn btn-primary">Ajouter</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// [MVVM : View]
// Met à jour les champs du formulaire du modal de ligne selon le type sélectionné.
function updateRowTypeFields(type) {
    const entityField = document.getElementById('rowEntityField');
    const titleField = document.getElementById('rowTitleField');
    const entitySelect = document.getElementById('rowEntity');
    const entityLabel = entityField.querySelector('label');

    if (type === 'character') {
        entityField.style.display = 'block';
        titleField.style.display = 'none';
        entityLabel.textContent = 'Personnage';
        entitySelect.innerHTML = '<option value="">Sélectionner un personnage...</option>' +
            (project.characters ? project.characters.map(char => '<option value="' + char.id + '">' + char.name + '</option>').join('') : '');
    } else if (type === 'location') {
        entityField.style.display = 'block';
        titleField.style.display = 'none';
        entityLabel.textContent = 'Lieu';
        entitySelect.innerHTML = '<option value="">Sélectionner un lieu...</option>' +
            (project.world ? project.world.map(loc => '<option value="' + loc.id + '">' + loc.name + '</option>').join('') : '');
    } else {
        entityField.style.display = 'none';
        titleField.style.display = 'block';
    }
}

// [MVVM : Mixte]
// Enregistre une nouvelle ligne dans le modèle et rafraîchit la grille.
function saveThrillerSwimlaneRow(event) {
    event.preventDefault();

    const type = document.getElementById('rowType').value;
    const entity = document.getElementById('rowEntity').value;
    const title = document.getElementById('rowTitle').value;
    const color = document.getElementById('rowColor').value;

    let rowTitle = title;
    let icon = 'tag';
    let entityId = null;

    if (type === 'character' && entity) {
        const char = project.characters ? project.characters.find(c => String(c.id) === String(entity)) : null;
        if (char) {
            rowTitle = char.name;
            icon = 'user';
            entityId = entity;
        }
    } else if (type === 'location' && entity) {
        const loc = project.world ? project.world.find(l => String(l.id) === String(entity)) : null;
        if (loc) {
            rowTitle = loc.name;
            icon = 'map-pin';
            entityId = entity;
        }
    }

    if (!rowTitle) {
        alert('Veuillez saisir un titre ou sélectionner une entité');
        return;
    }

    const newRow = {
        id: generateId(),
        type: type,
        title: rowTitle,
        icon: icon,
        color: color,
        entityId: entityId
    };

    thrillerBoardState.gridConfig.rows.push(newRow);
    saveProject();

    document.querySelector('.modal-overlay').remove();
    renderThrillerBoard();
}

// [MVVM : View]
// Affiche le modal d'édition d'une ligne existante.
function editThrillerRow(rowId) {
    const row = thrillerBoardState.gridConfig.rows.find(r => r.id === rowId);
    if (!row) return;

    const newTitle = prompt('Nouveau titre:', row.title);
    if (newTitle && newTitle !== row.title) {
        row.title = newTitle;
        project.thrillerGridConfig.rows = thrillerBoardState.gridConfig.rows;
        saveProject();
        renderThrillerBoard();
    }
}

// [MVVM : Mixte]
// Supprime une ligne (Model) et rafraîchit la vue.
function deleteThrillerRow(rowId) {
    if (!confirm('Supprimer cette ligne et toutes ses cartes ?')) return;

    thrillerBoardState.gridConfig.rows = thrillerBoardState.gridConfig.rows.filter(r => r.id !== rowId);
    project.thrillerGridConfig.rows = thrillerBoardState.gridConfig.rows;

    thrillerBoardState.gridConfig.cards = thrillerBoardState.gridConfig.cards.filter(c => c.rowId !== rowId);
    project.thrillerGridConfig.cards = thrillerBoardState.gridConfig.cards;

    saveProject();
    renderThrillerBoard();
}

// ============================================
// GRID VIEW - COLUMN MANAGEMENT
// ============================================

// [MVVM : View]
// Affiche le modal de création d'une nouvelle colonne.
function addThrillerColumn() {
    const title = prompt('Titre de la colonne:');
    if (!title) return;

    const newColumn = {
        id: generateId(),
        title: title
    };

    thrillerBoardState.gridConfig.columns.push(newColumn);
    saveProject();
    renderThrillerBoard();
}

// [MVVM : View]
// Affiche le modal d'édition d'une colonne.
function editThrillerColumn(columnId) {
    const column = thrillerBoardState.gridConfig.columns.find(c => c.id === columnId);
    if (!column) return;

    const newTitle = prompt('Nouveau titre:', column.title);
    if (newTitle && newTitle !== column.title) {
        column.title = newTitle;
        project.thrillerGridConfig.columns = thrillerBoardState.gridConfig.columns;
        saveProject();
        renderThrillerBoard();
    }
}

// [MVVM : Mixte]
// Supprime une colonne (Model) et rafraîchit la vue.
function deleteThrillerColumn(columnId) {
    if (!confirm('Supprimer cette colonne et toutes ses cartes ?')) return;

    thrillerBoardState.gridConfig.columns = thrillerBoardState.gridConfig.columns.filter(c => c.id !== columnId);
    project.thrillerGridConfig.columns = thrillerBoardState.gridConfig.columns;

    thrillerBoardState.gridConfig.cards = thrillerBoardState.gridConfig.cards.filter(c => c.columnId !== columnId);
    project.thrillerGridConfig.cards = thrillerBoardState.gridConfig.cards;

    saveProject();
    renderThrillerBoard();
}

// ============================================
// GRID VIEW - CARD MANAGEMENT
// ============================================

// [MVVM : View]
// Affiche le modal pour ajouter une carte directement dans une cellule de la grille.
function addThrillerCardToCell(rowId, columnId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Nouvelle carte</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="cardForm" onsubmit="saveNewThrillerCard(event, '${rowId}', '${columnId}')">
                    <div class="form-group">
                        <label class="form-label" for="cardType">Type de carte</label>
                        <select class="form-input" id="cardType" onchange="updateCardFields(this.value)">
                            ${Object.entries(THRILLER_TYPES).map(([key, data]) => `
                                <option value="${key}">${data.label}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="cardTitle">Titre</label>
                        <input type="text" class="form-input" id="cardTitle" required>
                    </div>
                    <div id="cardFieldsContainer"></div>
                    <div class="form-group">
                        <label class="form-label" for="cardStatus">Statut</label>
                        <select class="form-input" id="cardStatus">
                            ${Object.entries(THRILLER_CARD_STATUS).map(([key, data]) => `
                                <option value="${key}">${data.label}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Annuler</button>
                        <button type="submit" class="btn btn-primary">Créer</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    updateCardFields(Object.keys(THRILLER_TYPES)[0]);

    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// [MVVM : View]
// Met à jour les champs du modal de création de carte selon le type choisi.
function updateCardFields(cardType) {
    const container = document.getElementById('cardFieldsContainer');

    let html = '';

    if (cardType === 'alibi') {
        html = `
            <div class="form-group">
                <label class="form-label" for="characterId">Personnage</label>
                <select class="form-input" id="characterId">
                    <option value="">Sélectionner un personnage</option>
                    ${project.characters ? project.characters.map(char => `<option value="${char.id}">${char.name}</option>`).join('') : ''}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" for="forEvent">Pour l'événement</label>
                <input type="text" class="form-input" id="forEvent">
            </div>
        `;
    } else if (cardType === 'clue') {
        html = `
            <div class="form-group">
                <label class="form-label" for="description">Description</label>
                <textarea class="form-input" id="description" rows="3"></textarea>
            </div>
        `;
    } else if (cardType === 'motive_means_opportunity') {
        html = `
            <div class="form-group">
                <label class="form-label" for="characterId">Suspect</label>
                <select class="form-input" id="characterId">
                    <option value="">Sélectionner un personnage</option>
                    ${project.characters ? project.characters.map(char => `<option value="${char.id}">${char.name}</option>`).join('') : ''}
                </select>
            </div>
        `;
    }

    container.innerHTML = html;
}

// [MVVM : Mixte]
// Enregistre une nouvelle carte dans la cellule (Model/ViewModel) et rafraîchit la grille.
function saveNewThrillerCard(event, rowId, columnId) {
    event.preventDefault();

    const cardType = document.getElementById('cardType').value;
    const title = document.getElementById('cardTitle').value;
    const status = document.getElementById('cardStatus').value;

    const data = {};

    if (cardType === 'alibi') {
        const charId = document.getElementById('characterId') ? document.getElementById('characterId').value : '';
        data.character_id = charId;
        data.for_event = document.getElementById('forEvent') ? document.getElementById('forEvent').value : '';
        if (charId && project.characters) {
            const char = project.characters.find(c => c.id === charId);
            if (char) data.character_name = char.name;
        }
    } else if (cardType === 'clue') {
        data.description = document.getElementById('description') ? document.getElementById('description').value : '';
    } else if (cardType === 'motive_means_opportunity') {
        const charId = document.getElementById('characterId') ? document.getElementById('characterId').value : '';
        data.character_id = charId;
        if (charId && project.characters) {
            const char = project.characters.find(c => c.id === charId);
            if (char) data.character_name = char.name;
        }
    }

    // Calculate zIndex for new card (should be on top)
    const cellCards = thrillerBoardState.gridConfig.cards.filter(
        c => c.rowId === rowId && c.columnId === columnId
    );
    const maxZIndex = cellCards.length > 0 ? Math.max(...cellCards.map(c => c.zIndex || 0), 0) : 0;

    const newCard = {
        id: generateId(),
        rowId: rowId,
        columnId: columnId,
        type: cardType,
        title: title,
        status: status,
        data: data,
        connections: [],
        zIndex: maxZIndex + 1
    };

    thrillerBoardState.gridConfig.cards.push(newCard);
    saveProject();

    document.querySelector('.modal-overlay').remove();
    renderThrillerBoard();
}

// ============================================================================
// DEPRECATED CARD-SPECIFIC MODAL FUNCTIONS
// These functions are no longer used. Cards now use element modals instead.
// Header click → opens element modal (editThrillerElement)
// Footer click → opens status popover (handleCardFooterClick)
// ============================================================================

/*
// [MVVM : View (Déprécié)]
// Ancien modal d'édition de carte (maintenant remplacé par le modal d'élément).
function editThrillerCard(cardId) {
    const card = thrillerBoardState.gridConfig.cards.find(c => c.id === cardId);
    if (!card) return;

    const typeData = THRILLER_TYPES[card.type];

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>Modifier ${typeData ? typeData.label : 'Carte'}</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="cardEditForm" onsubmit="saveEditedThrillerCard(event, '${cardId}')">
                    <div class="form-group">
                        <label class="form-label" for="cardType">Type de carte</label>
                        <select class="form-input" id="cardType" onchange="updateCardFieldsForEdit(this.value, '${cardId}')">
                            ${Object.entries(THRILLER_TYPES).map(([key, data]) => `
                                <option value="${key}" ${key === card.type ? 'selected' : ''}>${data.label}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label" for="cardTitle">Titre</label>
                        <input type="text" class="form-input" id="cardTitle" value="${card.title || ''}" required>
                    </div>
                    <div id="cardFieldsContainer"></div>
                    <div class="form-group">
                        <label class="form-label" for="cardStatus">Statut</label>
                        <select class="form-input" id="cardStatus">
                            ${Object.entries(THRILLER_CARD_STATUS).map(([key, data]) => `
                                <option value="${key}" ${key === card.status ? 'selected' : ''}>${data.label}</option>
                            `).join('')}
                        </select>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-danger" onclick="deleteThrillerCard('${cardId}')">
                            <i data-lucide="trash-2"></i> Supprimer
                        </button>
                        <div style="flex: 1;"></div>
                        <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Annuler</button>
                        <button type="submit" class="btn btn-primary">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Pre-populate fields based on card type
    updateCardFieldsForEdit(card.type, cardId);

    setTimeout(() => {
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 50);
}

// [MVVM : View (Déprécié)]
// Mise à jour des champs de l'ancien modal d'édition de carte.
function updateCardFieldsForEdit(cardType, cardId) {
    const container = document.getElementById('cardFieldsContainer');
    const card = thrillerBoardState.gridConfig.cards.find(c => c.id === cardId);
    if (!card) return;

    const data = card.data || {};
    let html = '';

    if (cardType === 'alibi') {
        html = `
            <div class="form-group">
                <label class="form-label" for="characterId">Personnage</label>
                <select class="form-input" id="characterId">
                    <option value="">Sélectionner un personnage</option>
                    ${project.characters ? project.characters.map(char => `
                        <option value="${char.id}" ${data.character_id === char.id ? 'selected' : ''}>${char.name}</option>
                    `).join('') : ''}
                </select>
            </div>
            <div class="form-group">
                <label class="form-label" for="forEvent">Pour l'événement</label>
                <input type="text" class="form-input" id="forEvent" value="${data.for_event || ''}">
            </div>
        `;
    } else if (cardType === 'clue') {
        html = `
            <div class="form-group">
                <label class="form-label" for="description">Description</label>
                <textarea class="form-input" id="description" rows="3">${data.description || ''}</textarea>
            </div>
        `;
    } else if (cardType === 'motive_means_opportunity') {
        html = `
            <div class="form-group">
                <label class="form-label" for="characterId">Suspect</label>
                <select class="form-input" id="characterId">
                    <option value="">Sélectionner un personnage</option>
                    ${project.characters ? project.characters.map(char => `
                        <option value="${char.id}" ${data.character_id === char.id ? 'selected' : ''}>${char.name}</option>
                    `).join('') : ''}
                </select>
            </div>
        `;
    }

    container.innerHTML = html;
}

// [MVVM : Mixte (Déprécié)]
// Enregistrement des modifications via l'ancien modal de carte.
function saveEditedThrillerCard(event, cardId) {
    event.preventDefault();

    const card = thrillerBoardState.gridConfig.cards.find(c => c.id === cardId);
    if (!card) return;

    const cardType = document.getElementById('cardType').value;
    const title = document.getElementById('cardTitle').value;
    const status = document.getElementById('cardStatus').value;

    const data = {};

    if (cardType === 'alibi') {
        const charId = document.getElementById('characterId') ? document.getElementById('characterId').value : '';
        data.character_id = charId;
        data.for_event = document.getElementById('forEvent') ? document.getElementById('forEvent').value : '';
        if (charId && project.characters) {
            const char = project.characters.find(c => c.id === charId);
            if (char) data.character_name = char.name;
        }
    } else if (cardType === 'clue') {
        data.description = document.getElementById('description') ? document.getElementById('description').value : '';
    } else if (cardType === 'motive_means_opportunity') {
        const charId = document.getElementById('characterId') ? document.getElementById('characterId').value : '';
        data.character_id = charId;
        if (charId && project.characters) {
            const char = project.characters.find(c => c.id === charId);
            if (char) data.character_name = char.name;
        }
    }

    // Update the card
    card.type = cardType;
    card.title = title;
    card.status = status;
    card.data = data;

    saveProject();

    document.querySelector('.modal-overlay').remove();
    renderThrillerBoard();
}
*/

// [MVVM : Mixte]
// Supprime une carte de la grille (Model) et rafraîchit l'affichage.
function deleteThrillerCard(cardId) {
    if (!confirm('Supprimer cette carte et toutes ses connexions ?')) return;

    // Remove the card
    thrillerBoardState.gridConfig.cards = thrillerBoardState.gridConfig.cards.filter(c => c.id !== cardId);

    // Remove all connections to/from this card
    if (thrillerBoardState.gridConfig.connections) {
        thrillerBoardState.gridConfig.connections = thrillerBoardState.gridConfig.connections.filter(
            conn => conn.from.cardId !== cardId && conn.to.cardId !== cardId
        );
    }

    saveProject();

    // Close modal if open
    const modal = document.querySelector('.modal-overlay');
    if (modal) modal.remove();

    renderThrillerBoard();
}

// ============================================
// GRID VIEW - CONNECTION MANAGEMENT
// ============================================

let connectionState = {
    isDrawing: false,
    fromCardId: null,
    fromProperty: null,
    tempLine: null,
    startPos: null,
    dragOverlay: null
};

// [MVVM : Mixte]
// Initialise le dessin d'une connexion entre deux sockets de cartes.
function startThrillerConnection(event, cardId, property) {
    console.log('=== START CONNECTION ===');
    console.log('From card:', cardId, 'Property:', property);

    event.stopPropagation();
    event.preventDefault();

    connectionState.isDrawing = true;
    connectionState.fromCardId = cardId;
    connectionState.fromProperty = property;

    // Get starting socket position
    const socket = event.target.closest('.thriller-card-socket');
    if (!socket) {
        console.error('Socket not found!');
        return;
    }

    socket.classList.add('active-socket');
    connectionState.startPos = getSocketPosition(socket);
    console.log('Start position:', connectionState.startPos);

    // Create transparent overlay to prevent cell hover interference
    const overlay = document.createElement('div');
    overlay.className = 'connection-drag-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 9999;
        cursor: crosshair;
        pointer-events: all;
        background: transparent;
    `;
    document.body.appendChild(overlay);
    connectionState.dragOverlay = overlay;
    console.log('Overlay created');

    // Create temporary line
    const svg = document.getElementById('thrillerGridConnections');
    console.log('SVG found:', !!svg);
    if (svg) {
        const tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tempLine.setAttribute('class', 'temp-connection');
        tempLine.setAttribute('x1', connectionState.startPos.x);
        tempLine.setAttribute('y1', connectionState.startPos.y);
        tempLine.setAttribute('x2', connectionState.startPos.x);
        tempLine.setAttribute('y2', connectionState.startPos.y);
        tempLine.setAttribute('stroke', 'var(--accent-gold)');
        tempLine.setAttribute('stroke-width', '2');
        tempLine.setAttribute('stroke-dasharray', '5,5');
        svg.appendChild(tempLine);
        connectionState.tempLine = tempLine;
        console.log('Temp line created');
    }

    overlay.addEventListener('mousemove', handleConnectionDrag);
    overlay.addEventListener('mouseup', endThrillerConnection);
    console.log('Event listeners attached to overlay');
}

// [MVVM : View]
// Met à jour visuellement la ligne temporaire pendant le glissement d'une connexion.
function handleConnectionDrag(event) {
    if (!connectionState.isDrawing || !connectionState.tempLine) return;

    // Update temporary line to follow cursor
    const container = document.getElementById('thrillerGridContainer');
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left + container.scrollLeft;
    const y = event.clientY - rect.top + container.scrollTop;

    connectionState.tempLine.setAttribute('x2', x);
    connectionState.tempLine.setAttribute('y2', y);

    // Highlight socket under cursor
    if (connectionState.dragOverlay) {
        connectionState.dragOverlay.style.pointerEvents = 'none';
    }
    const elementAtPoint = document.elementFromPoint(event.clientX, event.clientY);
    const hoveredSocket = elementAtPoint ? elementAtPoint.closest('.thriller-card-socket') : null;
    if (connectionState.dragOverlay) {
        connectionState.dragOverlay.style.pointerEvents = 'all';
    }

    // Remove all hover highlights
    document.querySelectorAll('.thriller-card-socket.hover-target').forEach(el => {
        el.classList.remove('hover-target');
    });

    // Add hover highlight to valid target
    if (hoveredSocket && hoveredSocket.dataset.cardId !== connectionState.fromCardId) {
        hoveredSocket.classList.add('hover-target');
    }
}

// [MVVM : Mixte]
// Finalise la création d'une connexion entre deux cartes au relâchement de la souris.
function endThrillerConnection(event) {
    console.log('=== END CONNECTION ===');
    console.log('Is drawing:', connectionState.isDrawing);

    if (!connectionState.isDrawing) return;

    // Remove temporary line
    if (connectionState.tempLine) {
        connectionState.tempLine.remove();
        connectionState.tempLine = null;
        console.log('Temp line removed');
    }

    // Hide overlay temporarily to get element underneath
    if (connectionState.dragOverlay) {
        connectionState.dragOverlay.style.pointerEvents = 'none';
    }

    // Get the element at the mouse position (since overlay blocks direct access)
    const elementAtPoint = document.elementFromPoint(event.clientX, event.clientY);
    console.log('Element at point:', elementAtPoint);
    const targetSocket = elementAtPoint ? elementAtPoint.closest('.thriller-card-socket') : null;
    console.log('Target socket:', targetSocket);

    if (targetSocket) {
        console.log('Target card ID:', targetSocket.dataset.cardId);
        console.log('Target property:', targetSocket.dataset.property);
        console.log('From card ID:', connectionState.fromCardId);

        if (targetSocket.dataset.cardId !== connectionState.fromCardId) {
            console.log('Creating connection...');
            createThrillerConnection(
                connectionState.fromCardId,
                connectionState.fromProperty,
                targetSocket.dataset.cardId,
                targetSocket.dataset.property
            );
        } else {
            console.log('Same card - connection not created');
        }
    } else {
        console.log('No target socket found');
    }

    // Remove overlay
    if (connectionState.dragOverlay) {
        connectionState.dragOverlay.remove();
        connectionState.dragOverlay = null;
        console.log('Overlay removed');
    }

    // Cleanup
    connectionState.isDrawing = false;
    connectionState.fromCardId = null;
    connectionState.fromProperty = null;
    connectionState.startPos = null;

    document.querySelectorAll('.active-socket').forEach(el => el.classList.remove('active-socket'));
    document.querySelectorAll('.hover-target').forEach(el => el.classList.remove('hover-target'));
    console.log('Cleanup complete');
}

// [MVVM : Model/ViewModel]
// Crée une nouvelle connexion logique entre deux éléments et l'ajoute au projet.
function createThrillerConnection(fromCardId, fromProperty, toCardId, toProperty) {
    console.log('=== CREATE CONNECTION ===');
    console.log('From:', fromCardId, fromProperty);
    console.log('To:', toCardId, toProperty);

    // Check if connection already exists
    const exists = thrillerBoardState.gridConfig.connections &&
        thrillerBoardState.gridConfig.connections.some(conn =>
            conn.from.cardId === fromCardId &&
            conn.from.property === fromProperty &&
            conn.to.cardId === toCardId &&
            conn.to.property === toProperty
        );

    if (exists) {
        console.log('Connection already exists, skipping');
        return; // Don't create duplicate connections
    }

    const connection = {
        id: generateId(),
        from: {
            cardId: fromCardId,
            property: fromProperty
        },
        to: {
            cardId: toCardId,
            property: toProperty
        }
    };

    if (!thrillerBoardState.gridConfig.connections) {
        thrillerBoardState.gridConfig.connections = [];
    }

    thrillerBoardState.gridConfig.connections.push(connection);
    console.log('Connection added. Total connections:', thrillerBoardState.gridConfig.connections.length);
    console.log('Connections:', thrillerBoardState.gridConfig.connections);

    saveProject();
    renderThrillerBoard();
}

// [MVVM : Mixte]
// Supprime une connexion logique entre deux éléments.
function deleteThrillerConnection(connectionId) {
    if (!thrillerBoardState.gridConfig.connections) return;

    thrillerBoardState.gridConfig.connections = thrillerBoardState.gridConfig.connections.filter(
        conn => conn.id !== connectionId
    );

    saveProject();
    renderThrillerBoard();
}

// ============================================
// SVG CONNECTION RENDERING
// ============================================

// [MVVM : View]
// Dessine toutes les connexions SVG entre les cartes dans la vue Grille.
function renderThrillerConnections() {
    console.log('=== RENDER CONNECTIONS ===');
    const svg = document.getElementById('thrillerGridConnections');
    console.log('SVG element:', svg);
    if (!svg) {
        console.log('SVG not found!');
        return;
    }

    const svgRect = svg.getBoundingClientRect();
    console.log('SVG bounding rect:', svgRect);
    console.log('SVG width x height:', svgRect.width, 'x', svgRect.height);

    const wrapper = svg.parentElement;
    if (wrapper) {
        const wrapperRect = wrapper.getBoundingClientRect();
        console.log('Wrapper bounding rect:', wrapperRect);
        console.log('Wrapper width x height:', wrapperRect.width, 'x', wrapperRect.height);
    }

    // Clear existing connections (except defs)
    const existingLines = svg.querySelectorAll('path, line:not(.temp-connection)');
    existingLines.forEach(line => line.remove());
    console.log('Cleared existing lines:', existingLines.length);

    if (!thrillerBoardState.gridConfig.connections) {
        console.log('No connections in state');
        return;
    }

    console.log('Number of connections to draw:', thrillerBoardState.gridConfig.connections.length);

    // Draw each connection
    thrillerBoardState.gridConfig.connections.forEach(connection => {
        console.log('Drawing connection:', connection);
        drawConnectionLine(svg, connection);
    });
}

// [MVVM : ViewModel]
// Détermine la meilleure paire de sockets pour relier deux cartes (proximité).
function chooseBestSocketPair(fromCardId, fromProperty, toCardId, toProperty) {
    // Find all sockets (left and right) for both properties
    const fromSockets = {
        left: document.querySelector(`.thriller-card-socket[data-card-id="${fromCardId}"][data-property="${fromProperty}"][data-side="left"]`),
        right: document.querySelector(`.thriller-card-socket[data-card-id="${fromCardId}"][data-property="${fromProperty}"][data-side="right"]`)
    };
    const toSockets = {
        left: document.querySelector(`.thriller-card-socket[data-card-id="${toCardId}"][data-property="${toProperty}"][data-side="left"]`),
        right: document.querySelector(`.thriller-card-socket[data-card-id="${toCardId}"][data-property="${toProperty}"][data-side="right"]`)
    };

    if (!fromSockets.left || !fromSockets.right || !toSockets.left || !toSockets.right) {
        console.warn('Not all sockets found, falling back to first available');
        return {
            from: fromSockets.left || fromSockets.right,
            to: toSockets.left || toSockets.right
        };
    }

    // Get positions of all sockets
    const fromLeftPos = getSocketPosition(fromSockets.left);
    const fromRightPos = getSocketPosition(fromSockets.right);
    const toLeftPos = getSocketPosition(toSockets.left);
    const toRightPos = getSocketPosition(toSockets.right);

    // Calculate which combination gives the most horizontal direct path
    // Option 1: from-right → to-left (destination is to the right)
    // Option 2: from-left → to-right (destination is to the left)

    const isToTheRight = toLeftPos.x > fromRightPos.x;

    if (isToTheRight) {
        // Destination is to the right: use from-right → to-left
        return { from: fromSockets.right, to: toSockets.left };
    } else {
        // Destination is to the left: use from-left → to-right
        return { from: fromSockets.left, to: toSockets.right };
    }
}

// [MVVM : View]
// Dessine une ligne SVG complexe (courbe) entre deux points de connexion.
function drawConnectionLine(svg, connection) {
    console.log('  Drawing line for connection:', connection.id);

    // Choose best socket pair automatically
    const sockets = chooseBestSocketPair(
        connection.from.cardId,
        connection.from.property,
        connection.to.cardId,
        connection.to.property
    );

    const fromSocket = sockets.from;
    const toSocket = sockets.to;

    console.log('  From socket:', fromSocket);
    console.log('  To socket:', toSocket);

    if (!fromSocket || !toSocket) {
        console.log('  ❌ Sockets not found, skipping connection');
        return;
    }

    // Get card type to determine color
    const fromCard = thrillerBoardState.gridConfig.cards.find(c => c.id === connection.from.cardId);
    const cardType = fromCard ? fromCard.type : 'clue';
    const typeData = THRILLER_TYPES[cardType];
    const connectionColor = typeData ? typeData.color : '#d4af37';

    const fromPos = getSocketPosition(fromSocket);
    const toPos = getSocketPosition(toSocket);

    // Create curved path
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

    // Determine socket sides for horizontal exit/entry
    const fromSide = fromSocket.dataset.side; // 'left' or 'right'
    const toSide = toSocket.dataset.side;

    // Calculate control points for horizontal cubic bezier curve
    const dx = toPos.x - fromPos.x;
    const dy = toPos.y - fromPos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Offset determines how far horizontally the curve extends
    const minOffset = 50;
    const offset = Math.max(Math.abs(dx) * 0.4, minOffset);

    // Control points extend horizontally from sockets
    const cp1x = fromSide === 'right' ? fromPos.x + offset : fromPos.x - offset;
    const cp1y = fromPos.y;
    const cp2x = toSide === 'left' ? toPos.x - offset : toPos.x + offset;
    const cp2y = toPos.y;

    const pathData = `M ${fromPos.x} ${fromPos.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${toPos.x} ${toPos.y}`;

    path.setAttribute('d', pathData);
    path.setAttribute('stroke', connectionColor);
    path.setAttribute('stroke-width', '2');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', 'url(#arrowhead-' + cardType + ')');
    path.setAttribute('class', 'thriller-connection-line');
    path.setAttribute('data-connection-id', connection.id);
    path.setAttribute('data-card-type', cardType);
    path.style.cursor = 'pointer';
    path.style.pointerEvents = 'stroke';
    path.style.transition = 'all 0.2s ease';

    // Add hover effect with tooltip
    path.addEventListener('mouseenter', function () {
        this.setAttribute('stroke-width', '4');
        this.style.filter = 'drop-shadow(0 0 6px ' + connectionColor + ')';

        // Highlight connected sockets
        fromSocket.classList.add('connected-highlight');
        toSocket.classList.add('connected-highlight');
    });

    path.addEventListener('mouseleave', function () {
        this.setAttribute('stroke-width', '2');
        this.style.filter = 'none';

        // Remove highlight
        fromSocket.classList.remove('connected-highlight');
        toSocket.classList.remove('connected-highlight');
    });

    // Add click to delete
    path.addEventListener('click', function (e) {
        e.stopPropagation();
        if (confirm('Supprimer cette connexion ?\n\n' + typeData.label + ': ' + fromCard.title + ' → ' + connection.to.property)) {
            deleteThrillerConnection(connection.id);
        }
    });

    svg.appendChild(path);
    console.log('  ✅ Path added to SVG:', pathData);
    console.log('  SVG dimensions:', svg.getBoundingClientRect());
    console.log('  SVG children count:', svg.children.length);
    console.log('  Path computed style stroke:', window.getComputedStyle(path).stroke);
    console.log('  Path computed style stroke-width:', window.getComputedStyle(path).strokeWidth);
}

// [MVVM : ViewModel]
// Calcule les coordonnées absolues d'un socket dans le DOM.
function getSocketPosition(socket) {
    const svg = document.getElementById('thrillerGridConnections');
    if (!svg) return { x: 0, y: 0 };

    const svgRect = svg.getBoundingClientRect();
    const socketRect = socket.getBoundingClientRect();

    // Calculate position relative to SVG overlay
    const x = socketRect.left - svgRect.left + socketRect.width / 2;
    const y = socketRect.top - svgRect.top + socketRect.height / 2;

    return { x, y };
}

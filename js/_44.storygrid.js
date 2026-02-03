// ============================================
// Module: views/storygrid
// Story Grid - Tableau de bord narratif
// ============================================

// ============================================
// CONSTANTS & CONFIGURATION
// ============================================

const STORYGRID_ROW_TYPES = {
    character: {
        icon: 'user',
        label: 'Personnage',
        defaultColor: 'var(--accent-blue)',
        source: 'characters'
    },
    arc: {
        icon: 'drama',
        label: 'Arc narratif',
        defaultColor: 'var(--accent-red)',
        source: 'narrativeArcs'
    },
    location: {
        icon: 'map-pin',
        label: 'Lieu',
        defaultColor: 'var(--accent-green)',
        source: 'world'
    },
    theme: {
        icon: 'lightbulb',
        label: 'Thème / Motif',
        defaultColor: 'var(--accent-purple)',
        source: 'custom'
    },
    structure: {
        icon: 'layout',
        label: 'Structure narrative',
        defaultColor: 'var(--accent-gold)',
        source: 'custom'
    },
    custom: {
        icon: 'tag',
        label: 'Personnalisé',
        defaultColor: 'var(--text-muted)',
        source: 'custom'
    }
};

const STORYGRID_ZOOM_LEVELS = {
    ultra: {
        name: 'Scènes',
        unit: 'scene',
        label: 'Scènes',
        minWidth: 160
    },
    micro: {
        name: 'Chapitres',
        unit: 'chapter',
        label: 'Chapitres',
        minWidth: 200
    },
    macro: {
        name: 'Actes',
        unit: 'act',
        label: 'Actes',
        minWidth: 220
    }
};

const CARD_STATUSES = {
    draft: { label: 'Brouillon', color: 'var(--text-muted)', icon: 'file' },
    inProgress: { label: 'En cours', color: 'var(--accent-gold)', icon: 'edit-3' },
    review: { label: 'A réviser', color: 'var(--accent-blue)', icon: 'eye' },
    done: { label: 'Finalisé', color: 'var(--accent-green)', icon: 'check-circle' }
};

// ============================================
// STATE MANAGEMENT
// ============================================

let storyGridState = {
    rows: [],
    zoomLevel: 'ultra',
    columnWidth: 160,
    viewMode: 'chronological', // chronological, character, arc, location, structure
    filters: {
        rowTypes: Object.keys(STORYGRID_ROW_TYPES),
        showHiddenRows: false
    },
    dragState: null,
    panState: {
        isPanning: false,
        startX: 0,
        scrollLeft: 0
    },
    selectedCard: null,
    hoveredCardId: null, // Pour la surbrillance des cards jumelles
    links: [] // Links between cards
};

// ============================================
// INITIALIZATION
// ============================================

// Fonction closeModal pour toutes les modales
// Supprime du DOM uniquement les modales dynamiques (créées par JS avec data-dynamic="true")
// [MVVM : View]
// Ferme une modale et la supprime du DOM si elle est dynamique.
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Supprimer du DOM uniquement si c'est une modale dynamique
        if (modal.dataset.dynamic === 'true') {
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 200);
        }
    }
}

// [MVVM : Model]
// Initialise les données du Story Grid dans le projet si nécessaire et charge l'état.
function initStoryGrid() {
    // Initialize story grid data in project if not exists
    if (!project.storyGrid) {
        project.storyGrid = {
            rows: [],
            links: [],
            settings: {
                defaultZoom: 'micro',
                showEmptyCells: true,
                snapToGrid: true
            }
        };
    }

    // Load rows from project
    storyGridState.rows = project.storyGrid.rows || [];
    storyGridState.links = project.storyGrid.links || [];

    // Migrate old cards to new hierarchical system
    migrateOldCards();

    // Auto-create rows from existing data if none exist
    if (storyGridState.rows.length === 0) {
        autoCreateRowsFromProject();
    }
}

// [MVVM : Model]
// Migre les anciennes cartes vers le nouveau système hiérarchique et ajoute les champs de liaison.
function migrateOldCards() {
    // Migrate cards that only have columnId to the new hierarchical system
    // AND add new multi-link fields (characters, arcs, locations)
    let needsSave = false;

    storyGridState.rows.forEach(row => {
        row.cards.forEach(card => {
            // Migration des nouveaux champs de liaison multiple
            if (!card.characters) {
                card.characters = [];
                needsSave = true;
            }
            if (!card.arcs) {
                card.arcs = [];
                needsSave = true;
            }
            if (!card.locations) {
                card.locations = [];
                needsSave = true;
            }

            // If card doesn't have actId/chapterId, try to extract from columnId
            if (card.columnId && (!card.actId || !card.chapterId)) {
                const columnIdParts = card.columnId.split('_');

                if (columnIdParts[0] === 'col' && columnIdParts[1]) {
                    const type = columnIdParts[1]; // 'act', 'chapter', or 'scene'
                    const id = columnIdParts[2];

                    // Find the corresponding structural element
                    for (const act of project.acts || []) {
                        if (type === 'act' && act.id === id) {
                            card.actId = act.id;
                            needsSave = true;
                        }

                        for (const chapter of act.chapters || []) {
                            if (type === 'chapter' && chapter.id === id) {
                                card.actId = act.id;
                                card.chapterId = chapter.id;
                                needsSave = true;
                            }

                            for (const scene of chapter.scenes || []) {
                                if (type === 'scene' && scene.id === id) {
                                    card.actId = act.id;
                                    card.chapterId = chapter.id;
                                    card.sceneId = scene.id;
                                    needsSave = true;
                                }
                            }
                        }
                    }
                }
            }
        });
    });

    if (needsSave) {
        saveStoryGridData();
    }
}

// [MVVM : Model]
// Crée automatiquement des lignes de base à partir des personnages, arcs et lieux du projet.
function autoCreateRowsFromProject() {
    // Auto-create character rows
    if (project.characters && project.characters.length > 0) {
        project.characters.forEach((char, index) => {
            storyGridState.rows.push({
                id: 'row_char_' + char.id,
                type: 'character',
                sourceId: char.id,
                title: char.name,
                color: char.color || STORYGRID_ROW_TYPES.character.defaultColor,
                order: index,
                visible: true,
                cards: []
            });
        });
    }

    // Auto-create arc rows
    if (project.narrativeArcs && project.narrativeArcs.length > 0) {
        project.narrativeArcs.forEach((arc, index) => {
            storyGridState.rows.push({
                id: 'row_arc_' + arc.id,
                type: 'arc',
                sourceId: arc.id,
                title: arc.title,
                color: arc.color || STORYGRID_ROW_TYPES.arc.defaultColor,
                order: storyGridState.rows.length + index,
                visible: true,
                cards: []
            });
        });
    }

    // Auto-create location rows from world elements
    if (project.world && project.world.length > 0) {
        const locations = project.world.filter(w => w.type === 'location' || w.type === 'Lieu');
        locations.forEach((loc, index) => {
            storyGridState.rows.push({
                id: 'row_loc_' + loc.id,
                type: 'location',
                sourceId: loc.id,
                title: loc.name,
                color: loc.color || STORYGRID_ROW_TYPES.location.defaultColor,
                order: storyGridState.rows.length + index,
                visible: true,
                cards: []
            });
        });
    }

    // Add default structure row
    storyGridState.rows.push({
        id: 'row_struct_default',
        type: 'structure',
        sourceId: null,
        title: 'Structure narrative',
        color: STORYGRID_ROW_TYPES.structure.defaultColor,
        order: storyGridState.rows.length,
        visible: true,
        cards: []
    });

    saveStoryGridData();
}

// [MVVM : Model]
// Sauvegarde les données du Story Grid dans l'objet projet global.
function saveStoryGridData() {
    project.storyGrid = {
        rows: storyGridState.rows,
        links: storyGridState.links,
        settings: project.storyGrid?.settings || {
            defaultZoom: 'micro',
            showEmptyCells: true,
            snapToGrid: true
        }
    };
    saveProject();
}

// ============================================
// COLUMN (TIMELINE) MANAGEMENT
// ============================================

// [MVVM : ViewModel]
// Génère la structure des colonnes de la timeline en fonction du niveau de zoom (Acte, Chapitre, Scène).
function getTimelineColumns() {
    const columns = [];
    const zoom = STORYGRID_ZOOM_LEVELS[storyGridState.zoomLevel];

    if (!project.acts || project.acts.length === 0) {
        return [{
            id: 'empty',
            type: 'placeholder',
            title: 'Aucun contenu',
            items: []
        }];
    }

    switch (zoom.unit) {
        case 'act':
            project.acts.forEach((act, actIndex) => {
                columns.push({
                    id: 'col_act_' + act.id,
                    type: 'act',
                    actId: act.id,
                    title: act.title,
                    order: actIndex,
                    items: getAllScenesFromAct(act)
                });
            });
            break;

        case 'chapter':
            project.acts.forEach((act, actIndex) => {
                if (act.chapters) {
                    act.chapters.forEach((chapter, chapterIndex) => {
                        columns.push({
                            id: 'col_chapter_' + chapter.id,
                            type: 'chapter',
                            actId: act.id,
                            chapterId: chapter.id,
                            title: chapter.title,
                            actTitle: act.title,
                            order: actIndex * 1000 + chapterIndex,
                            items: chapter.scenes || []
                        });
                    });
                }
            });
            break;

        case 'scene':
            project.acts.forEach((act, actIndex) => {
                if (act.chapters) {
                    act.chapters.forEach((chapter, chapterIndex) => {
                        if (chapter.scenes) {
                            chapter.scenes.forEach((scene, sceneIndex) => {
                                columns.push({
                                    id: 'col_scene_' + scene.id,
                                    type: 'scene',
                                    actId: act.id,
                                    chapterId: chapter.id,
                                    sceneId: scene.id,
                                    title: scene.title,
                                    chapterTitle: chapter.title,
                                    actTitle: act.title,
                                    order: actIndex * 100000 + chapterIndex * 1000 + sceneIndex,
                                    items: [scene]
                                });
                            });
                        }
                    });
                }
            });
            break;
    }

    return columns.sort((a, b) => a.order - b.order);
}

// [MVVM : ViewModel]
// Récupère toutes les scènes appartenant à un acte donné.
function getAllScenesFromAct(act) {
    const scenes = [];
    if (act.chapters) {
        act.chapters.forEach(chapter => {
            if (chapter.scenes) {
                scenes.push(...chapter.scenes);
            }
        });
    }
    return scenes;
}

// ============================================
// ROW MANAGEMENT
// ============================================

// [MVVM : Other]
// Group: Use Case | Naming: AddRowUseCase
// Ajoute une nouvelle ligne au Story Grid, sauvegarde et déclenche le rendu.
function addStoryGridRow(type, options = {}) {
    const typeData = STORYGRID_ROW_TYPES[type];
    if (!typeData) return null;

    const newRow = {
        id: 'row_' + Date.now(),
        type: type,
        sourceId: options.sourceId || null,
        title: options.title || `Nouveau ${typeData.label}`,
        color: options.color || typeData.defaultColor,
        order: storyGridState.rows.length,
        visible: true,
        cards: []
    };

    storyGridState.rows.push(newRow);
    saveStoryGridData();
    renderStoryGrid();

    return newRow;
}

// [MVVM : Other]
// Group: Use Case | Naming: DeleteRowUseCase
// Supprime une ligne et ses cartes associées, sauvegarde et redessine la grille.
function deleteStoryGridRow(rowId) {
    const index = storyGridState.rows.findIndex(r => r.id === rowId);
    if (index === -1) return;

    // Also remove any links involving cards from this row
    const rowCards = storyGridState.rows[index].cards.map(c => c.id);
    storyGridState.links = storyGridState.links.filter(link =>
        !rowCards.includes(link.fromCard) && !rowCards.includes(link.toCard)
    );

    storyGridState.rows.splice(index, 1);

    // Reorder remaining rows
    storyGridState.rows.forEach((row, idx) => {
        row.order = idx;
    });

    saveStoryGridData();
    renderStoryGrid();
}

// [MVVM : Other]
// Group: Use Case | Naming: UpdateRowUseCase
// Met à jour les propriétés d'une ligne, sauvegarde et redessine la grille.
function updateStoryGridRow(rowId, updates) {
    const row = storyGridState.rows.find(r => r.id === rowId);
    if (!row) return;

    Object.assign(row, updates);
    saveStoryGridData();
    renderStoryGrid();
}

// [MVVM : Other]
// Group: Use Case | Naming: ToggleRowVisibilityUseCase
// Alterne la visibilité d'une ligne, sauvegarde et redessine la grille.
function toggleRowVisibility(rowId) {
    const row = storyGridState.rows.find(r => r.id === rowId);
    if (row) {
        row.visible = !row.visible;
        saveStoryGridData();
        renderStoryGrid();
    }
}

// [MVVM : Other]
// Group: Use Case | Naming: ReorderRowsUseCase
// Réordonne les lignes du Story Grid, met à jour les ordres, sauvegarde et redessine.
function reorderRows(fromIndex, toIndex) {
    const [removed] = storyGridState.rows.splice(fromIndex, 1);
    storyGridState.rows.splice(toIndex, 0, removed);

    storyGridState.rows.forEach((row, idx) => {
        row.order = idx;
    });

    saveStoryGridData();
    renderStoryGrid();
}

// ============================================
// CARD MANAGEMENT
// ============================================

// [MVVM : Other]
// Group: Use Case | Naming: AddCardUseCase
// Crée et ajoute une nouvelle carte dans une cellule spécifique, sauvegarde et redessine.
function addCardToGrid(rowId, columnId, sceneData = null) {
    const row = storyGridState.rows.find(r => r.id === rowId);
    if (!row) return null;

    // Extract hierarchical references from column
    const column = getColumnFromId(columnId);
    if (!column) return null;

    const card = {
        id: 'card_' + Date.now(),
        rowId: rowId,
        columnId: columnId, // Keep for backward compatibility
        // Store hierarchical references for dynamic column matching
        actId: column.actId || null,
        chapterId: column.chapterId || null,
        sceneId: sceneData?.id || column.sceneId || null,
        title: sceneData?.title || 'Nouvelle carte',
        summary: sceneData?.summary || '',
        status: 'draft',
        intensity: 3, // 1-5
        objective: '',
        conflict: '',
        pov: '',
        notes: '',
        color: null, // Uses row color if null
        order: row.cards.filter(c => matchesColumn(c, column)).length,
        // Nouveaux champs pour liaisons multiples
        characters: [],
        arcs: [],
        locations: []
    };

    // Auto-liaison ÃƒÂ  la ligne de création
    autoLinkCardToRow(card, row);

    row.cards.push(card);
    saveStoryGridData();
    renderStoryGrid();

    return card;
}

// Auto-liaison d'une card ÃƒÂ  une ligne selon son type
// [MVVM : Model]
// Lie automatiquement une carte à une entité (personnage, arc, lieu) selon le type de ligne.
function autoLinkCardToRow(card, row) {
    if (!row.sourceId) return;

    switch (row.type) {
        case 'character':
            if (!card.characters.includes(row.sourceId)) {
                card.characters.push(row.sourceId);
            }
            break;
        case 'arc':
            if (!card.arcs.includes(row.sourceId)) {
                card.arcs.push(row.sourceId);
            }
            break;
        case 'location':
            if (!card.locations.includes(row.sourceId)) {
                card.locations.push(row.sourceId);
            }
            break;
    }
}

// [MVVM : ViewModel]
// Retrouve une colonne de la timeline par son identifiant.
function getColumnFromId(columnId) {
    const columns = getTimelineColumns();
    return columns.find(col => col.id === columnId);
}

// [MVVM : ViewModel]
// Vérifie si une carte correspond à une colonne selon la structure hiérarchique.
function matchesColumn(card, column) {
    // Match card to column based on hierarchical structure
    switch (column.type) {
        case 'act':
            // Card matches if it belongs to this act
            return card.actId === column.actId;
        case 'chapter':
            // Card matches if it belongs to this chapter
            return card.chapterId === column.chapterId;
        case 'scene':
            // Card matches if it's specifically for this scene, or if it's in this scene's chapter
            return card.sceneId === column.sceneId ||
                (card.chapterId === column.chapterId && !card.sceneId);
        default:
            return false;
    }
}

// [MVVM : Other]
// Group: Use Case | Naming: UpdateCardUseCase
// Met à jour les données d'une carte par son ID, sauvegarde et redessine la grille.
function updateCard(cardId, updates) {
    for (const row of storyGridState.rows) {
        const card = row.cards.find(c => c.id === cardId);
        if (card) {
            Object.assign(card, updates);
            saveStoryGridData();
            renderStoryGrid();
            return;
        }
    }
}

// [MVVM : Other]
// Group: Use Case | Naming: DeleteCardUseCase
// Supprime une carte et ses liens, sauvegarde et redessine la grille.
function deleteCard(cardId) {
    for (const row of storyGridState.rows) {
        const index = row.cards.findIndex(c => c.id === cardId);
        if (index !== -1) {
            row.cards.splice(index, 1);

            // Remove any links involving this card
            storyGridState.links = storyGridState.links.filter(link =>
                link.fromCard !== cardId && link.toCard !== cardId
            );

            saveStoryGridData();
            renderStoryGrid();
            return;
        }
    }
}

// [MVVM : Other]
// Group: Use Case | Naming: MoveCardUseCase
// Déplace une carte vers une nouvelle position (ligne/colonne) et met à jour ses références.
function moveCard(cardId, newRowId, newColumnId) {
    // Find and remove card from current location
    let card = null;
    for (const row of storyGridState.rows) {
        const index = row.cards.findIndex(c => c.id === cardId);
        if (index !== -1) {
            card = row.cards.splice(index, 1)[0];
            break;
        }
    }

    if (!card) return;

    // Add to new location
    const newRow = storyGridState.rows.find(r => r.id === newRowId);
    if (!newRow) return;

    // Get new column to extract hierarchical references
    const newColumn = getColumnFromId(newColumnId);
    if (!newColumn) return;

    card.rowId = newRowId;
    card.columnId = newColumnId;
    card.actId = newColumn.actId || card.actId;
    card.chapterId = newColumn.chapterId || card.chapterId;
    // Only update sceneId if the new column is a scene column
    if (newColumn.type === 'scene') {
        card.sceneId = newColumn.sceneId;
    }
    card.order = newRow.cards.filter(c => matchesColumn(c, newColumn)).length;

    // Auto-liaison ÃƒÂ  la nouvelle ligne
    autoLinkCardToRow(card, newRow);

    newRow.cards.push(card);
    saveStoryGridData();
    renderStoryGrid();
}

/**
 * Gère la suppression d'une carte de manière contextuelle.
 * - Si c'est un duplicata, retire uniquement l'association avec la ligne.
 * - Si c'est la carte originale, effectue une suppression complète (avec suppression des liens inter-cartes).
 * @param {string} cardId - L'ID de la carte ÃƒÂ  supprimer.
 * @param {string} displayRowId - L'ID de la ligne sur laquelle le bouton de suppression a été cliqué.
 */
// [MVVM : ViewModel]
// Gère la suppression d'une carte en distinguant l'originale d'un duplicata (jumelle).
function deleteCardContextual(cardId, displayRowId) {
    const card = findCardById(cardId);
    if (!card) return;

    // Déterminer si la carte est l'originale pour cette ligne.
    const isOriginal = card.rowId === displayRowId;

    // Si ce n'est pas la ligne d'origine, c'est un "duplicata" (carte jumelle)
    const isDuplicate = !isOriginal;

    if (isDuplicate) {
        // C'est un duplicata : on retire l'association avec la ligne.
        // La carte originale et les liaisons inter-cartes restent intactes.
        removeCardAssociation(cardId, displayRowId);
    } else {
        // C'est la carte originale : on effectue la suppression complète.
        // C'est ici que l'appel ÃƒÂ  deleteCard(cardId) supprime l'objet carte et toutes ses liaisons.
        deleteCard(cardId);
    }
}

// ============================================
// FONCTIONS DE LIAISON MULTIPLE (TWINS)
// ============================================

// Recherche globale d'une card par ID
// [MVVM : Model]
// Recherche une carte par son identifiant dans toutes les lignes.
function findCardById(cardId) {
    for (const row of storyGridState.rows) {
        const card = row.cards.find(c => c.id === cardId);
        if (card) return card;
    }
    return null;
}

// Détermine si une card doit apparaÃ®tre sur une ligne donnée
// [MVVM : ViewModel]
// Détermine si une carte doit être affichée sur une ligne donnée (carte originale ou jumelle).
function shouldCardAppearOnRow(card, row) {
    // La card apparaÃ®t toujours sur sa ligne d'origine
    if (card.rowId === row.id) return true;

    // Si la ligne n'a pas de sourceId, pas de jumelle
    if (!row.sourceId) return false;

    // Vérifier selon le type de ligne
    switch (row.type) {
        case 'character':
            return card.characters && card.characters.includes(row.sourceId);
        case 'arc':
            return card.arcs && card.arcs.includes(row.sourceId);
        case 'location':
            return card.locations && card.locations.includes(row.sourceId);
    }
    return false;
}

// Récupère toutes les cards (originales + jumelles) pour une cellule
// [MVVM : ViewModel]
// Récupère la liste de toutes les cartes à afficher pour une cellule (incluant les jumelles).
function getCardsForCell(row, column) {
    const cards = [];

    // Cards directes de cette ligne
    const directCards = row.cards.filter(c => matchesColumn(c, column));
    directCards.forEach(card => {
        cards.push({
            ...card,
            isOriginal: true,
            isTwin: false,
            displayRowId: row.id,
            originalRowId: card.rowId
        });
    });

    // Cards jumelles (cards d'autres lignes qui doivent apparaÃ®tre ici)
    storyGridState.rows.forEach(otherRow => {
        if (otherRow.id === row.id) return; // Pas la mÃªme ligne

        otherRow.cards.forEach(card => {
            if (matchesColumn(card, column) && shouldCardAppearOnRow(card, row)) {
                // Vérifier qu'on n'a pas déjÃƒÂ  cette card
                if (!cards.find(c => c.id === card.id)) {
                    cards.push({
                        ...card,
                        isOriginal: false,
                        isTwin: true,
                        displayRowId: row.id,
                        originalRowId: card.rowId
                    });
                }
            }
        });
    });

    return cards;
}

// Compte le nombre total d'apparitions d'une card (incluant jumelles)
// [MVVM : ViewModel]
// Compte le nombre total d'occurrences d'une carte dans la grille.
function getCardTwinCount(cardId) {
    const card = findCardById(cardId);
    if (!card) return 1;

    let count = 1; // L'originale

    storyGridState.rows.forEach(row => {
        if (row.id !== card.rowId && shouldCardAppearOnRow(card, row)) {
            count++;
        }
    });

    return count;
}

// Ajouter un personnage à une card
// [MVVM : Other]
// Group: Use Case | Naming: AddCharacterToCardUseCase
// Associe un personnage à une carte, sauvegarde et redessine.
function addCharacterToCard(cardId, characterId) {
    const card = findCardById(cardId);
    if (!card) return;

    // Initialiser le tableau si nécessaire
    if (!card.characters) card.characters = [];

    if (!card.characters.includes(characterId)) {
        card.characters.push(characterId);
        saveStoryGridData();
        renderStoryGrid();
    }
}

// Retirer un personnage d'une card
// [MVVM : Other]
// Retire un personnage d'une carte, sauvegarde et redessine.
function removeCharacterFromCard(cardId, characterId) {
    const card = findCardById(cardId);
    if (!card || !card.characters) return;

    const idx = card.characters.indexOf(characterId);
    if (idx !== -1) {
        card.characters.splice(idx, 1);
        saveStoryGridData();
        renderStoryGrid();
    }
}

// Ajouter un arc à une card
// [MVVM : Other]
// Associe un arc narratif à une carte, sauvegarde et redessine.
function addArcToCard(cardId, arcId) {
    const card = findCardById(cardId);
    if (!card) return;

    // Initialiser le tableau si nécessaire
    if (!card.arcs) card.arcs = [];

    if (!card.arcs.includes(arcId)) {
        card.arcs.push(arcId);
        saveStoryGridData();
        renderStoryGrid();
    }
}

// Retirer un arc d'une card
// [MVVM : Other]
// Retire un arc narratif d'une carte, sauvegarde et redessine.
function removeArcFromCard(cardId, arcId) {
    const card = findCardById(cardId);
    if (!card || !card.arcs) return;

    const idx = card.arcs.indexOf(arcId);
    if (idx !== -1) {
        card.arcs.splice(idx, 1);
        saveStoryGridData();
        renderStoryGrid();
    }
}

// Supprime l'association d'une carte avec la source d'une ligne (ex: enlève un personnage de la carte)
// [MVVM : ViewModel]
// Supprime l'association d'une carte avec l'entité source d'une ligne donnée.
function removeCardAssociation(cardId, rowId) {
    const card = findCardById(cardId);
    const row = storyGridState.rows.find(r => r.id === rowId);

    if (!card || !row || !row.sourceId) return;

    // Détermine le type de la ligne pour savoir quelle liaison retirer (caractère, arc, lieu)
    switch (row.type) {
        case 'character':
            // Utilise la fonction existante pour retirer l'ID de la source de la carte
            removeCharacterFromCard(cardId, row.sourceId);
            break;
        case 'arc':
            // Utilise la fonction existante pour retirer l'ID de la source de la carte
            removeArcFromCard(cardId, row.sourceId);
            break;
        case 'location':
            // Utilise la fonction existante pour retirer l'ID de la source de la carte
            removeLocationFromCard(cardId, row.sourceId);
            break;
        default:
            // Pour les types sans sourceId, il ne devrait pas y avoir de carte jumelle.
            return;
    }
}

// Ajouter un lieu à une card
// [MVVM : Other]
// Associe un lieu à une carte, sauvegarde et redessine.
function addLocationToCard(cardId, locationId) {
    const card = findCardById(cardId);
    if (!card) return;

    // Initialiser le tableau si nécessaire
    if (!card.locations) card.locations = [];

    if (!card.locations.includes(locationId)) {
        card.locations.push(locationId);
        saveStoryGridData();
        renderStoryGrid();
    }
}

// Retirer un lieu d'une card
// [MVVM : Other]
// Retire un lieu d'une carte, sauvegarde et redessine.
function removeLocationFromCard(cardId, locationId) {
    const card = findCardById(cardId);
    if (!card || !card.locations) return;

    const idx = card.locations.indexOf(locationId);
    if (idx !== -1) {
        card.locations.splice(idx, 1);
        saveStoryGridData();
        renderStoryGrid();
    }
}

// Surbrillance synchronisée des cards jumelles
// [MVVM : View]
// Applique un style de surbrillance aux cartes jumelles d'une carte donnée.
function highlightTwinCards(cardId) {
    storyGridState.hoveredCardId = cardId;
    document.querySelectorAll(`[data-card-id="${cardId}"]`).forEach(el => {
        el.classList.add('twin-highlight');
    });
}

// [MVVM : View]
// Retire la surbrillance de toutes les cartes jumelles.
function unhighlightTwinCards() {
    if (storyGridState.hoveredCardId) {
        document.querySelectorAll(`[data-card-id="${storyGridState.hoveredCardId}"]`).forEach(el => {
            el.classList.remove('twin-highlight');
        });
        storyGridState.hoveredCardId = null;
    }
}

// ============================================
// LINKS MANAGEMENT
// ============================================

const LINK_TYPES = {
    depends: { label: 'Dépend de', color: '#3498db', icon: 'link' },
    flashback: { label: 'Flashback de', color: '#9b59b6', icon: 'rewind' },
    consequence: { label: 'Conséquence de', color: '#e74c3c', icon: 'arrow-right' },
    parallel: { label: 'Parallèle ÃƒÂ ', color: '#f39c12', icon: 'columns' },
    foreshadow: { label: 'Préfigure', color: '#27ae60', icon: 'eye' }
};

// [MVVM : Other]
// Crée un lien entre deux cartes, sauvegarde et redessine.
function addCardLink(fromCardId, toCardId, linkType) {
    // Prevent duplicate links
    const exists = storyGridState.links.some(l =>
        l.fromCard === fromCardId && l.toCard === toCardId
    );

    if (exists) return null;

    const link = {
        id: 'link_' + Date.now(),
        fromCard: fromCardId,
        toCard: toCardId,
        type: linkType,
        notes: ''
    };

    storyGridState.links.push(link);
    saveStoryGridData();
    renderStoryGrid();

    return link;
}

// [MVVM : Other]
// Supprime un lien entre deux cartes, sauvegarde et redessine.
function deleteCardLink(linkId) {
    storyGridState.links = storyGridState.links.filter(l => l.id !== linkId);
    saveStoryGridData();
    renderStoryGrid();
}

// ============================================
// VIEW MODES
// ============================================

// Stockage des filtres manuels pour les restaurer en mode chronologique
let storyGridManualFilters = null;

// [MVVM : Other]
// Change le mode de vue de la grille et applique les filtres correspondants.
function setStoryGridViewMode(mode) {
    const previousMode = storyGridState.viewMode;
    storyGridState.viewMode = mode;

    // Appliquer les filtres selon le mode de vue
    switch (mode) {
        case 'chronological':
            // Restaurer les filtres manuels ou afficher tous les types
            if (storyGridManualFilters) {
                storyGridState.filters.rowTypes = [...storyGridManualFilters];
            } else {
                storyGridState.filters.rowTypes = Object.keys(STORYGRID_ROW_TYPES);
            }
            break;

        case 'character':
            // Sauvegarder les filtres actuels si on quitte le mode chronologique
            if (previousMode === 'chronological') {
                storyGridManualFilters = [...storyGridState.filters.rowTypes];
            }
            storyGridState.filters.rowTypes = ['character'];
            break;

        case 'arc':
            if (previousMode === 'chronological') {
                storyGridManualFilters = [...storyGridState.filters.rowTypes];
            }
            storyGridState.filters.rowTypes = ['arc'];
            break;

        case 'location':
            if (previousMode === 'chronological') {
                storyGridManualFilters = [...storyGridState.filters.rowTypes];
            }
            storyGridState.filters.rowTypes = ['location'];
            break;

        default:
            storyGridState.filters.rowTypes = Object.keys(STORYGRID_ROW_TYPES);
    }

    renderStoryGrid();
}

// [MVVM : Other]
// Définit le niveau de zoom de la grille et redessine.
function setStoryGridZoom(level) {
    if (!STORYGRID_ZOOM_LEVELS[level]) return;
    storyGridState.zoomLevel = level;
    storyGridState.columnWidth = STORYGRID_ZOOM_LEVELS[level].minWidth;
    renderStoryGrid();
}

// [MVVM : Other]
// Filtre les lignes affichées par type et redessine.
function filterStoryGridRows(rowTypes) {
    storyGridState.filters.rowTypes = rowTypes;
    renderStoryGrid();
}

// ============================================
// RENDERING
// ============================================

// [MVVM : View]
// Fonction de rendu principale qui génère l'ensemble de l'interface du Story Grid.
function renderStoryGrid() {
    initStoryGrid();

    const container = document.getElementById('editorView');
    if (!container) return;

    const columns = getTimelineColumns();
    const visibleRows = storyGridState.rows
        .filter(r => r.visible && storyGridState.filters.rowTypes.includes(r.type))
        .sort((a, b) => a.order - b.order);

    container.innerHTML = `
        <div class="storygrid-container">
            ${renderStoryGridToolbar()}
            <div class="storygrid-main">
                ${renderStoryGridRowHeaders(visibleRows)}
                <div class="storygrid-content" id="storyGridContent">
                    ${renderStoryGridColumnHeaders(columns)}
                    ${renderStoryGridBody(visibleRows, columns)}
                    <svg class="storygrid-links-svg" id="storyGridLinks"></svg>
                </div>
            </div>
        </div>
    `;

    // Initialize event listeners
    initStoryGridEventListeners();

    // Render links
    renderStoryGridLinks();

    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// [MVVM : View]
// Génère le HTML de la barre d'outils (navigation, zoom, actions).
function renderStoryGridToolbar() {
    const zoom = STORYGRID_ZOOM_LEVELS[storyGridState.zoomLevel];

    return `
        <div class="storygrid-toolbar">
            <div class="storygrid-toolbar-left">
                <div class="storygrid-toolbar-title">
                    <i data-lucide="layout-grid"></i>
                    <span>Story Grid</span>
                </div>
                
                <div class="storygrid-view-modes">
                    <button class="storygrid-view-btn ${storyGridState.viewMode === 'chronological' ? 'active' : ''}" 
                            onclick="setStoryGridViewMode('chronological')" title="Vue chronologique">
                        <i data-lucide="calendar"></i>
                    </button>
                    <button class="storygrid-view-btn ${storyGridState.viewMode === 'character' ? 'active' : ''}" 
                            onclick="setStoryGridViewMode('character')" title="Par personnage">
                        <i data-lucide="user"></i>
                    </button>
                    <button class="storygrid-view-btn ${storyGridState.viewMode === 'arc' ? 'active' : ''}" 
                            onclick="setStoryGridViewMode('arc')" title="Par arc">
                        <i data-lucide="drama"></i>
                    </button>
                    <button class="storygrid-view-btn ${storyGridState.viewMode === 'location' ? 'active' : ''}" 
                            onclick="setStoryGridViewMode('location')" title="Par lieu">
                        <i data-lucide="map-pin"></i>
                    </button>
                </div>
            </div>
            
            <div class="storygrid-toolbar-center">
                <div class="storygrid-zoom-control">
                    <button class="storygrid-zoom-btn" onclick="zoomStoryGrid(-1)" title="Dézoomer">
                        <i data-lucide="zoom-out"></i>
                    </button>
                    <div class="storygrid-zoom-label">
                        <i data-lucide="layers"></i>
                        <span>${zoom.name}</span>
                    </div>
                    <button class="storygrid-zoom-btn" onclick="zoomStoryGrid(1)" title="Zoomer">
                        <i data-lucide="zoom-in"></i>
                    </button>
                </div>
            </div>
            
            <div class="storygrid-toolbar-right">
                <button class="storygrid-action-btn" onclick="openAddRowModal()" title="Ajouter une ligne">
                    <i data-lucide="plus"></i>
                    <span>Ligne</span>
                </button>
                <button class="storygrid-action-btn" onclick="openStoryGridSettings()" title="Paramètres">
                    <i data-lucide="settings"></i>
                </button>
                <button class="storygrid-action-btn ${storyGridState.viewMode !== 'chronological' ? 'disabled' : ''}" 
                        onclick="${storyGridState.viewMode === 'chronological' ? 'toggleStoryGridFilters()' : ''}" 
                        title="${storyGridState.viewMode === 'chronological' ? 'Filtres' : 'Filtres désactivés en mode vue spécifique'}"
                        ${storyGridState.viewMode !== 'chronological' ? 'disabled' : ''}>
                    <i data-lucide="filter"></i>
                </button>
            </div>
        </div>
        
        ${storyGridState.viewMode === 'chronological' ? `
        <div class="storygrid-filters" id="storyGridFilters" style="display: none;">
            <div class="storygrid-filters-title">Filtrer par type</div>
            <div class="storygrid-filters-options">
                ${Object.entries(STORYGRID_ROW_TYPES).map(([type, data]) => `
                    <label class="storygrid-filter-option">
                        <input type="checkbox" 
                               ${storyGridState.filters.rowTypes.includes(type) ? 'checked' : ''}
                               onchange="toggleRowTypeFilter('${type}')">
                        <i data-lucide="${data.icon}" style="color: ${data.defaultColor}"></i>
                        <span>${data.label}</span>
                    </label>
                `).join('')}
            </div>
        </div>
        ` : `
        <div class="storygrid-view-mode-info">
            <i data-lucide="info"></i>
            <span>Vue filtrée : ${getViewModeLabel(storyGridState.viewMode)}</span>
        </div>
        `}
    `;
}

// [MVVM : View]
// Génère le HTML des en-têtes de lignes (titres et icônes à gauche).
function renderStoryGridRowHeaders(rows) {
    const zoom = STORYGRID_ZOOM_LEVELS[storyGridState.zoomLevel];

    // Hauteurs des barres d'en-tÃªtes COLONNE (ÃƒÂ  aligner avec ton CSS colonne)
    const ACT_HEADER_HEIGHT = 33;       // .storygrid-act-groups height
    const CHAPTER_HEADER_HEIGHT = 33;   // .storygrid-chapter-groups height
    const COLUMN_HEADER_HEIGHT = 49;    // .storygrid-columns header height

    let cornerHeight;

    if (zoom.unit === 'act') {
        // En vue acte : une seule ligne d'en-tÃªte colonne (les actes)
        cornerHeight = COLUMN_HEADER_HEIGHT;
    } else if (zoom.unit === 'chapter') {
        // En vue chapitre : actes + ligne de chapitres
        cornerHeight = ACT_HEADER_HEIGHT + COLUMN_HEADER_HEIGHT;
    } else if (zoom.unit === 'scene') {
        // En vue scène : actes + chapitres + scènes
        cornerHeight = ACT_HEADER_HEIGHT + CHAPTER_HEADER_HEIGHT + COLUMN_HEADER_HEIGHT;
    } else {
        // fallback raisonnable
        cornerHeight = COLUMN_HEADER_HEIGHT;
    }

    if (rows.length === 0) {
        return `
            <div class="storygrid-row-headers">
                <div class="storygrid-corner" style="height: ${cornerHeight}px;"></div>
                <div class="storygrid-empty-rows">
                    <i data-lucide="layers"></i>
                    <p>Aucune ligne</p>
                    <button class="btn btn-sm" onclick="openAddRowModal()">Ajouter</button>
                </div>
            </div>
        `;
    }

    return `
        <div class="storygrid-row-headers">
            <div class="storygrid-corner" style="height: ${cornerHeight}px;">
            </div>
            ${rows.map((row, index) => {
        const typeData = STORYGRID_ROW_TYPES[row.type];
        return `
                    <div class="storygrid-row-header" 
                         data-row-id="${row.id}"
                         data-row-index="${index}"
                         draggable="true"
                         style="--row-color: ${row.color}">
                        <div class="storygrid-row-drag">
                            <i data-lucide="grip-vertical"></i>
                        </div>
                        <div class="storygrid-row-icon" style="color: ${row.color}">
                            <i data-lucide="${typeData.icon}"></i>
                        </div>
                        <div class="storygrid-row-title" 
                             ondblclick="editRowTitle('${row.id}', this)">
                            ${row.title}
                        </div>
                        <div class="storygrid-row-actions">
                            <button class="storygrid-row-action" 
                                    onclick="openRowOptionsMenu('${row.id}', event)"
                                    title="Options">
                                <i data-lucide="more-horizontal"></i>
                            </button>
                        </div>
                    </div>
                `;
    }).join('')}
        </div>
    `;
}






// [MVVM : View]
// Génère le HTML des en-têtes de colonnes (Actes, Chapitres, Scènes en haut).
function renderStoryGridColumnHeaders(columns) {
    const zoom = STORYGRID_ZOOM_LEVELS[storyGridState.zoomLevel];

    if (columns.length === 0 || columns[0].type === 'placeholder') {
        return `
            <div class="storygrid-column-headers">
                <div class="storygrid-empty-columns">
                    <i data-lucide="file-text"></i>
                    <p>Aucun contenu dans le manuscrit</p>
                </div>
            </div>
        `;
    }

    // Helper pour récupérer le titre d'un chapitre ÃƒÂ  partir de son ID
    function getChapterTitleById(chapterId) {
        if (!chapterId) return 'Chapitre';

        // On cherche dans tous les actes, dans leurs chapitres
        const allActs = project.acts || [];
        for (const act of allActs) {
            const chapters = act.chapters || [];
            const chapter = chapters.find(c => c.id == chapterId);
            if (chapter) {
                return chapter.title || 'Chapitre';
            }
        }

        // Si jamais rien trouvé, on met un libellé générique
        return 'Chapitre';
    }

    let html = '<div class="storygrid-column-headers">';

    // 1. Ligne des actes (affichée sauf en zoom "acte")
    if (zoom.unit !== 'act') {
        const actGroups = {};
        columns.forEach(col => {
            const actId = col.actId ?? 'unknown-act';
            if (!actGroups[actId]) actGroups[actId] = [];
            actGroups[actId].push(col);
        });

        html += '<div class="storygrid-act-groups">';
        Object.entries(actGroups).forEach(([actId, cols]) => {
            const act = (project.acts || []).find(a => a.id == actId);
            const width = cols.length * storyGridState.columnWidth;
            html += `
                <div class="storygrid-act-group" style="width: ${width}px;">
                    ${act?.title || ''}
                </div>
            `;
        });
        html += '</div>';
    }

    // 2. Ligne des chapitres (affichée uniquement en zoom "scene")
    if (zoom.unit === 'scene') {
        const chapterGroups = {};
        columns.forEach(col => {
            const chapterId = col.chapterId ?? 'unknown-chapter';
            if (!chapterGroups[chapterId]) chapterGroups[chapterId] = [];
            chapterGroups[chapterId].push(col);
        });

        html += '<div class="storygrid-chapter-groups">';
        Object.entries(chapterGroups).forEach(([chapterId, cols]) => {
            const width = cols.length * storyGridState.columnWidth;
            const title = chapterId === 'unknown-chapter'
                ? 'Chapitre'
                : getChapterTitleById(chapterId);

            html += `
                <div class="storygrid-chapter-group" style="width: ${width}px;">
                    ${title}
                </div>
            `;
        });
        html += '</div>';
    }

    // 3. Ligne des colonnes (chapitres ou scènes selon le zoom)
    html += '<div class="storygrid-columns">';
    columns.forEach(col => {
        html += `
            <div class="storygrid-column-header" 
                 data-column-id="${col.id}"
                 style="width: ${storyGridState.columnWidth}px;">
                <div class="storygrid-column-title">${col.title}</div>
                ${col.items?.length > 0 ? `
                    <div class="storygrid-column-count">${col.items.length} scène${col.items.length > 1 ? 's' : ''}</div>
                ` : ''}
            </div>
        `;
    });
    html += '</div>';

    html += '</div>'; // Fin du conteneur principal
    return html;
}






// [MVVM : View]
// Génère le corps de la grille contenant les cellules et les cartes.
function renderStoryGridBody(rows, columns) {
    if (rows.length === 0 || columns.length === 0 || columns[0].type === 'placeholder') {
        return `<div class="storygrid-body empty"></div>`;
    }

    let html = '<div class="storygrid-body">';

    rows.forEach(row => {
        html += `<div class="storygrid-row" data-row-id="${row.id}">`;

        // Track which columns are already covered by a spanning card
        const coveredColumns = new Set();

        columns.forEach((col, colIndex) => {
            // Check if this column is covered by a previous spanning card
            const isCovered = coveredColumns.has(col.id);

            if (isCovered) {
                // Render an empty cell for covered columns
                html += `
                    <div class="storygrid-cell storygrid-cell-covered"
                         data-row-id="${row.id}"
                         data-column-id="${col.id}"
                         style="width: ${storyGridState.columnWidth}px;">
                    </div>
                `;
                return;
            }

            // Utiliser getCardsForCell pour obtenir les cards + jumelles
            const cellCards = getCardsForCell(row, col);
            const hasContent = checkRowColumnContent(row, col);

            // Check if any card should span multiple columns
            let spanningCard = null;
            let columnSpan = 1;

            if (cellCards.length > 0) {
                // Check if this card should span multiple columns
                const card = cellCards[0]; // Take first card
                const spanInfo = calculateCardSpan(card, col, columns, colIndex);
                if (spanInfo.span > 1) {
                    spanningCard = card;
                    columnSpan = spanInfo.span;
                    // Mark covered columns
                    for (let i = 1; i < columnSpan; i++) {
                        if (columns[colIndex + i]) {
                            coveredColumns.add(columns[colIndex + i].id);
                        }
                    }
                }
            }

            const spanWidth = storyGridState.columnWidth * columnSpan;

            // Style de fond coloré si contenu présent
            const cellBgStyle = hasContent ? `background-color: ${row.color}20; border-color: ${row.color}40;` : '';

            html += `
                <div class="storygrid-cell ${hasContent ? 'has-content' : ''} ${cellCards.length > 0 ? 'has-cards' : ''} ${spanningCard ? 'has-spanning-card' : ''}"
                     data-row-id="${row.id}"
                     data-column-id="${col.id}"
                     style="width: ${storyGridState.columnWidth}px; ${cellBgStyle}">
                    ${hasContent && cellCards.length === 0 ? renderAutoCard(row, col) : ''}
                    ${spanningCard ?
                    renderStoryGridCard(spanningCard, row, spanWidth) :
                    cellCards.map(card => renderStoryGridCard(card, row)).join('')
                }
                    ${!isCovered ? `
                        <div class="storygrid-cell-add" 
                             onclick="quickAddCard('${row.id}', '${col.id}')">
                            <i data-lucide="plus"></i>
                        </div>
                    ` : ''}
                </div>
            `;
        });

        html += '</div>';
    });

    html += '</div>';
    return html;
}

// [MVVM : ViewModel]
// Calcule combien de colonnes une carte doit occuper (span) selon son contexte.
function calculateCardSpan(card, currentColumn, allColumns, currentColumnIndex) {
    // Determine how many consecutive columns this card should span
    let span = 1;

    // Only span if we're in scene view and card belongs to chapter (not specific scene)
    if (currentColumn.type === 'scene' && card.chapterId && !card.sceneId) {
        // Count consecutive scene columns in the same chapter
        for (let i = currentColumnIndex + 1; i < allColumns.length; i++) {
            const nextCol = allColumns[i];
            if (nextCol.type === 'scene' && nextCol.chapterId === card.chapterId) {
                span++;
            } else {
                break;
            }
        }
    }

    return { span };
}

// [MVVM : ViewModel]
// Vérifie si une entité est présente dans une scène spécifique du projet.
function checkRowColumnContent(row, column) {
    // Check if this row has content in this column based on type
    // Utilise linkedCharacters et linkedElements de auto-detect.js
    switch (row.type) {
        case 'character':
            return column.items?.some(scene =>
                scene.linkedCharacters?.includes(row.sourceId) ||
                scene.characters?.includes(row.sourceId) ||
                scene.pov === row.sourceId
            );

        case 'arc':
            const arc = project.narrativeArcs?.find(a => a.id === row.sourceId);
            if (arc?.scenePresence) {
                return column.items?.some(scene =>
                    arc.scenePresence.some(p => p.sceneId === scene.id)
                );
            }
            // Vérifier aussi linkedArcs si implémenté
            return column.items?.some(scene =>
                scene.linkedArcs?.includes(row.sourceId)
            );

        case 'location':
            return column.items?.some(scene =>
                scene.linkedElements?.includes(row.sourceId) ||
                scene.location === row.sourceId ||
                scene.locations?.includes(row.sourceId)
            );

        default:
            return false;
    }
}

// [MVVM : View]
// Génère l'indicateur visuel pour le contenu détecté automatiquement dans le projet.
function renderAutoCard(row, column) {
    // Render automatic indicator for content that exists in the project
    const typeData = STORYGRID_ROW_TYPES[row.type];

    // Bouton de navigation (seulement si c'est une scène)
    let navButton = '';
    if (column.type === 'scene' && column.sceneId) {
        navButton = `
            <button class="storygrid-auto-nav" 
                    onclick="event.stopPropagation(); showSceneNavigationModal('${column.actId}', '${column.chapterId}', '${column.sceneId}')"
                    title="Ouvrir la scène">
                <i data-lucide="eye"></i>
            </button>
        `;
    }

    return `
        <div class="storygrid-auto-card" 
             style="border-color: ${row.color}40; background: ${row.color}15;">
            ${navButton}
            <div class="storygrid-auto-card-icon" style="color: ${row.color}">
                <i data-lucide="${typeData.icon}"></i>
            </div>
        </div>
    `;
}

// [MVVM : View]
// Génère le HTML d'une carte individuelle (originale ou jumelle).
function renderStoryGridCard(card, row, spanWidth = null) {
    const status = CARD_STATUSES[card.status] || CARD_STATUSES.draft;
    const cardColor = card.color || row.color;
    const isSpanning = spanWidth !== null;
    const widthStyle = isSpanning ? `width: ${spanWidth}px;` : '';

    // Détecter si c'est une jumelle
    const isTwin = card.isTwin === true;
    const isOriginal = card.isOriginal !== false;
    const twinCount = getCardTwinCount(card.id);
    const hasTwins = twinCount > 1;

    // Badges de liaisons
    const linkBadges = renderCardLinkBadges(card);

    return `
        <div class="storygrid-card ${isSpanning ? 'spanning' : ''} ${isTwin ? 'is-twin' : ''} ${hasTwins && isOriginal ? 'has-twins' : ''}" 
             data-card-id="${card.id}"
             draggable="true"
             onclick="openCardDetail('${card.id}')"
             onmouseenter="highlightTwinCards('${card.id}')"
             onmouseleave="unhighlightTwinCards()"
             style="--card-color: ${cardColor}; --status-color: ${status.color}; ${widthStyle}">
            <button class="storygrid-card-delete" 
                    onclick="event.stopPropagation(); deleteCardContextual('${card.id}', '${card.displayRowId}')" 
                    title="Supprimer la carte">
                x
            </button>
            <div class="storygrid-card-header">
                <div class="storygrid-card-status" title="${status.label}">
                    <i data-lucide="${status.icon}"></i>
                </div>
                ${hasTwins && isOriginal ? `
                    <div class="storygrid-card-twins" title="${twinCount} apparitions">
                        <i data-lucide="copy"></i>
                        <span>${twinCount}</span>
                    </div>
                ` : ''}
                ${isTwin ? `
                    <div class="storygrid-card-twin-badge" title="Carte jumelle">
                        <i data-lucide="link"></i>
                    </div>
                ` : ''}
                <div class="storygrid-card-intensity">
                    ${renderIntensityDots(card.intensity)}
                </div>
            </div>
            <div class="storygrid-card-title">${card.title}</div>
            ${card.summary ? `<div class="storygrid-card-summary">${card.summary}</div>` : ''}
            ${card.conflict ? `
                <div class="storygrid-card-conflict">
                    <i data-lucide="zap"></i> ${truncateText(card.conflict, 40)}
                </div>
            ` : ''}
            ${linkBadges ? `<div class="storygrid-card-badges">${linkBadges}</div>` : ''}
        </div>
    `;
}

// Rendu des badges de liaison sur une card
// [MVVM : View]
// Génère les badges de liaison (personnages, arcs, lieux) affichés sur une carte.
function renderCardLinkBadges(card) {
    let badges = '';

    const charCount = card.characters?.length || 0;
    const arcCount = card.arcs?.length || 0;
    const locCount = card.locations?.length || 0;

    if (charCount > 0) {
        badges += `<span class="card-badge card-badge-character" title="${charCount} personnage(s)">
            <i data-lucide="user"></i>${charCount}
        </span>`;
    }
    if (arcCount > 0) {
        badges += `<span class="card-badge card-badge-arc" title="${arcCount} arc(s)">
            <i data-lucide="git-branch"></i>${arcCount}
        </span>`;
    }
    if (locCount > 0) {
        badges += `<span class="card-badge card-badge-location" title="${locCount} lieu(x)">
            <i data-lucide="map-pin"></i>${locCount}
        </span>`;
    }

    return badges;
}

// [MVVM : View]
// Génère les indicateurs visuels de l'intensité dramatique.
function renderIntensityDots(intensity) {
    let dots = '';
    for (let i = 1; i <= 5; i++) {
        dots += `<span class="intensity-dot ${i <= intensity ? 'active' : ''}"></span>`;
    }
    return dots;
}

// [MVVM : Other]
// Tronque un texte s'il dépasse une longueur maximale.
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// ============================================
// SVG LINKS RENDERING
// ============================================

// [MVVM : View]
// Dessine les liens SVG entre les cartes dans la grille.
function renderStoryGridLinks() {
    const svg = document.getElementById('storyGridLinks');
    if (!svg) return;

    svg.innerHTML = '';

    storyGridState.links.forEach(link => {
        const fromCard = document.querySelector(`[data-card-id="${link.fromCard}"]`);
        const toCard = document.querySelector(`[data-card-id="${link.toCard}"]`);

        if (!fromCard || !toCard) return;

        const fromRect = fromCard.getBoundingClientRect();
        const toRect = toCard.getBoundingClientRect();
        const svgRect = svg.getBoundingClientRect();

        const fromX = fromRect.right - svgRect.left;
        const fromY = fromRect.top + fromRect.height / 2 - svgRect.top;
        const toX = toRect.left - svgRect.left;
        const toY = toRect.top + toRect.height / 2 - svgRect.top;

        const linkTypeData = LINK_TYPES[link.type] || LINK_TYPES.depends;

        // Create curved path
        const midX = (fromX + toX) / 2;
        const path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;

        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', path);
        pathEl.setAttribute('stroke', linkTypeData.color);
        pathEl.setAttribute('stroke-width', '2');
        pathEl.setAttribute('fill', 'none');
        pathEl.setAttribute('class', 'storygrid-link-path');
        pathEl.setAttribute('data-link-id', link.id);

        // Add arrow marker
        pathEl.setAttribute('marker-end', `url(#arrow-${link.type})`);

        svg.appendChild(pathEl);
    });

    // Add markers for arrows
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    Object.entries(LINK_TYPES).forEach(([type, data]) => {
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', `arrow-${type}`);
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3, 0 6');
        polygon.setAttribute('fill', data.color);

        marker.appendChild(polygon);
        defs.appendChild(marker);
    });
    svg.insertBefore(defs, svg.firstChild);
}

// ============================================
// DRAG & DROP
// ============================================

// [MVVM : Other]
// Initialise le drag & drop d'une carte vers une autre cellule.
function handleCardDragStart(event) {
    const card = event.currentTarget;
    const cardId = card.dataset.cardId;
    if (!cardId) {
        return;
    }

    event.dataTransfer.setData('text/plain', cardId);
    event.dataTransfer.effectAllowed = 'move';
    card.classList.add('dragging');
    storyGridState.dragState = { cardId };
}

// [MVVM : Other]
// Nettoie l'état de drag & drop à la fin du déplacement d'une carte.
function handleCardDragEnd(event) {
    event.currentTarget.classList.remove('dragging');
    storyGridState.dragState = null;

    // Remove all drag-over states
    document.querySelectorAll('.storygrid-cell.drag-over').forEach(cell => {
        cell.classList.remove('drag-over');
    });
}

// [MVVM : Other]
// Gère le survol d'une zone de dépôt lors du glissement d'une carte.
function handleCardDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.currentTarget.classList.add('drag-over');
}

// [MVVM : Other]
// Gère la sortie d'une zone de dépôt lors du glissement d'une carte.
function handleCardDragLeave(event) {
    event.currentTarget.classList.remove('drag-over');
}

// Drop handlers for cards - propagate to parent cell
// [MVVM : Other]
// Gère le dépôt d'une carte sur une autre carte, redirige vers la cellule parente.
function handleCardDropOnCard(event) {
    event.preventDefault();
    event.stopPropagation();

    // Find the parent cell
    const cell = event.currentTarget.closest('.storygrid-cell');
    if (!cell) return;

    cell.classList.remove('drag-over');

    const cardId = event.dataTransfer.getData('text/plain');
    const draggedCardId = event.currentTarget.dataset.cardId;

    // Don't drop on itself
    if (cardId === draggedCardId) return;

    const newRowId = cell.dataset.rowId;
    const newColumnId = cell.dataset.columnId;

    if (cardId && newRowId && newColumnId) {
        moveCard(cardId, newRowId, newColumnId);
    }
}

// [MVVM : Other]
// Gère le survol d'une carte lors du glissement d'une autre carte.
function handleCardDragOverOnCard(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';

    // Highlight the parent cell
    const cell = event.currentTarget.closest('.storygrid-cell');
    if (cell) {
        cell.classList.add('drag-over');
    }
}

// [MVVM : Other]
// Gère la sortie du survol d'une carte lors du glissement.
function handleCardDragLeaveOnCard(event) {
    event.stopPropagation();

    // Remove highlight from parent cell
    const cell = event.currentTarget.closest('.storygrid-cell');
    if (cell) {
        // Only remove if we're not still over the cell
        const relatedTarget = event.relatedTarget;
        if (!cell.contains(relatedTarget)) {
            cell.classList.remove('drag-over');
        }
    }
}

// Generic drop handlers for cell children (add button, auto-cards, etc.)
// [MVVM : Other]
// Gère le dépôt d'une carte sur un élément enfant d'une cellule.
function handleCellChildDrop(event) {
    event.preventDefault();
    event.stopPropagation();

    // Find the parent cell
    const cell = event.currentTarget.closest('.storygrid-cell');
    if (!cell) return;

    cell.classList.remove('drag-over');

    const cardId = event.dataTransfer.getData('text/plain');
    const newRowId = cell.dataset.rowId;
    const newColumnId = cell.dataset.columnId;

    if (cardId && newRowId && newColumnId) {
        moveCard(cardId, newRowId, newColumnId);
    }
}

// [MVVM : Other]
// Gère le survol d'un élément enfant d'une cellule lors du glissement.
function handleCellChildDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';

    // Highlight the parent cell
    const cell = event.currentTarget.closest('.storygrid-cell');
    if (cell) {
        cell.classList.add('drag-over');
    }
}

// [MVVM : Other]
// Gère la sortie du survol d'un élément enfant d'une cellule.
function handleCellChildDragLeave(event) {
    event.stopPropagation();

    // Remove highlight from parent cell only if leaving the cell entirely
    const cell = event.currentTarget.closest('.storygrid-cell');
    if (cell) {
        const relatedTarget = event.relatedTarget;
        if (!cell.contains(relatedTarget)) {
            cell.classList.remove('drag-over');
        }
    }
}

// [MVVM : Other]
// Gère le dépôt effectif d'une carte dans une cellule.
function handleCardDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    const cardId = event.dataTransfer.getData('text/plain');
    const newRowId = event.currentTarget.dataset.rowId;
    const newColumnId = event.currentTarget.dataset.columnId;

    if (cardId && newRowId && newColumnId) {
        moveCard(cardId, newRowId, newColumnId);
    }
}

// Row drag & drop
// [MVVM : View]
// Initialise les écouteurs d'événements pour le glisser-déposer des lignes.
function initRowDragDrop() {
    const rowHeaders = document.querySelectorAll('.storygrid-row-header');

    rowHeaders.forEach(header => {
        header.addEventListener('dragstart', handleRowDragStart);
        header.addEventListener('dragend', handleRowDragEnd);
        header.addEventListener('dragover', handleRowDragOver);
        header.addEventListener('drop', handleRowDrop);
    });
}

// [MVVM : Other]
// Démarre le glissement d'une ligne (réordonnancement).
function handleRowDragStart(event) {
    event.dataTransfer.setData('text/plain', event.target.dataset.rowIndex);
    event.target.classList.add('dragging');
}

// [MVVM : Other]
// Termine le glissement d'une ligne et nettoie les styles.
function handleRowDragEnd(event) {
    event.target.classList.remove('dragging');
    document.querySelectorAll('.storygrid-row-header.drag-over').forEach(el => {
        el.classList.remove('drag-over');
    });
}

// [MVVM : Other]
// Gère le survol d'une ligne lors du réordonnancement.
function handleRowDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('drag-over');
}

// [MVVM : Other]
// Gère le dépôt d'une ligne pour changer son ordre.
function handleRowDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    const fromIndex = parseInt(event.dataTransfer.getData('text/plain'));
    const toIndex = parseInt(event.currentTarget.dataset.rowIndex);

    if (!isNaN(fromIndex) && !isNaN(toIndex) && fromIndex !== toIndex) {
        reorderRows(fromIndex, toIndex);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

// [MVVM : View]
// Initialise tous les écouteurs d'événements (pan, zoom, drag & drop délégué).
function initStoryGridEventListeners() {
    const content = document.getElementById('storyGridContent');
    if (!content) {
        return;
    }

    // Pan functionality
    content.addEventListener('mousedown', handlePanStart);
    content.addEventListener('mousemove', handlePanMove);
    content.addEventListener('mouseup', handlePanEnd);
    content.addEventListener('mouseleave', handlePanEnd);

    // Wheel zoom
    content.addEventListener('wheel', handleWheelZoom, { passive: false });

    // Initialize row drag/drop
    initRowDragDrop();

    // Delegated drag and drop for cards - captures events at container level
    content.addEventListener('dragstart', handleDelegatedDragStart);
    content.addEventListener('dragend', handleDelegatedDragEnd);
    content.addEventListener('dragover', handleDelegatedDragOver);
    content.addEventListener('dragleave', handleDelegatedDragLeave);
    content.addEventListener('drop', handleDelegatedDrop);
}

// Delegated dragstart - find the card being dragged
// [MVVM : Other]
// Gère le début du glissement d'une carte via délégation d'événements.
function handleDelegatedDragStart(event) {
    const card = event.target.closest('.storygrid-card');
    if (!card) {
        return;
    }

    const cardId = card.dataset.cardId;

    if (!cardId) {
        return;
    }

    event.dataTransfer.setData('text/plain', cardId);
    event.dataTransfer.effectAllowed = 'move';
    card.classList.add('dragging');
    storyGridState.dragState = { cardId };
}

// [MVVM : Other]
// Gère la fin du glissement d'une carte via délégation.
function handleDelegatedDragEnd(event) {
    const card = event.target.closest('.storygrid-card');
    if (card) {
        card.classList.remove('dragging');
    }
    storyGridState.dragState = null;

    // Remove all drag-over states
    document.querySelectorAll('.storygrid-cell.drag-over').forEach(cell => {
        cell.classList.remove('drag-over');
    });
}

// Delegated drag handlers - work regardless of which child element is hovered
// [MVVM : Other]
// Gère le survol des cellules lors d'un glissement délégué.
function handleDelegatedDragOver(event) {
    // Find the closest cell
    const cell = event.target.closest('.storygrid-cell');
    if (!cell) {
        return;
    }

    // Check if we're dragging a card (not a row)
    if (!storyGridState.dragState) {
        return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';

    // Remove drag-over from all cells and add to current
    document.querySelectorAll('.storygrid-cell.drag-over').forEach(c => {
        if (c !== cell) c.classList.remove('drag-over');
    });
    cell.classList.add('drag-over');
}

// [MVVM : Other]
// Gère la sortie d'une cellule lors d'un glissement délégué.
function handleDelegatedDragLeave(event) {
    // Only handle if leaving a cell
    const cell = event.target.closest('.storygrid-cell');
    if (!cell) return;

    // Check if we're really leaving the cell (not just moving to a child)
    const relatedTarget = event.relatedTarget;
    if (relatedTarget && cell.contains(relatedTarget)) return;

    cell.classList.remove('drag-over');
}

// [MVVM : Other]
// Gère le dépôt d'une carte dans une cellule via délégation.
function handleDelegatedDrop(event) {

    // Find the closest cell
    const cell = event.target.closest('.storygrid-cell');
    if (!cell) {
        return;
    }

    // Check if we have drag state
    if (!storyGridState.dragState) {
        return;
    }

    event.preventDefault();
    event.stopPropagation();

    // Remove all drag-over states
    document.querySelectorAll('.storygrid-cell.drag-over').forEach(c => {
        c.classList.remove('drag-over');
    });

    const cardId = storyGridState.dragState.cardId;
    const newRowId = cell.dataset.rowId;
    const newColumnId = cell.dataset.columnId;

    if (!cardId || !newRowId || !newColumnId) {
        return;
    }

    // Find the original card to check its current position
    const card = findCardById(cardId);
    if (!card) {
        return;
    }

    // Check if we're dropping in the exact same position (same row AND same column)
    // Allow drop if either row or column is different
    const currentColumnId = getCardColumnId(card);

    if (card.rowId === newRowId && currentColumnId === newColumnId) {
        return;
    }
    moveCard(cardId, newRowId, newColumnId);
}

// Helper to get the column ID for a card based on its hierarchical position
// [MVVM : ViewModel]
// Détermine l'ID de colonne approprié pour une carte selon le niveau de zoom actuel.
function getCardColumnId(card) {
    const zoom = STORYGRID_ZOOM_LEVELS[storyGridState.zoomLevel];
    switch (zoom.unit) {
        case 'act':
            return card.actId ? 'col_act_' + card.actId : null;
        case 'chapter':
            return card.chapterId ? 'col_chapter_' + card.chapterId : null;
        case 'scene':
            return card.sceneId ? 'col_scene_' + card.sceneId :
                (card.chapterId ? 'col_chapter_' + card.chapterId : null);
        default:
            return null;
    }
}

// [MVVM : Other]
// Démarre le déplacement panoramique (pan) de la grille.
function handlePanStart(event) {
    // Only pan when clicking on empty space
    if (event.target.closest('.storygrid-card') || event.target.closest('.storygrid-cell-add')) {
        return;
    }

    if (event.button === 1 || (event.button === 0 && event.altKey)) { // Middle click or Alt+Left click
        storyGridState.panState.isPanning = true;
        storyGridState.panState.startX = event.pageX;
        storyGridState.panState.scrollLeft = event.currentTarget.scrollLeft;
        event.currentTarget.style.cursor = 'grabbing';
    }
}

// [MVVM : Other]
// Gère le mouvement panoramique de la grille.
function handlePanMove(event) {
    if (!storyGridState.panState.isPanning) return;

    event.preventDefault();
    const x = event.pageX;
    const walk = (x - storyGridState.panState.startX) * 1.5;
    event.currentTarget.scrollLeft = storyGridState.panState.scrollLeft - walk;
}

// [MVVM : Other]
// Arrête le déplacement panoramique de la grille.
function handlePanEnd(event) {
    storyGridState.panState.isPanning = false;
    event.currentTarget.style.cursor = '';
}

// [MVVM : Other]
// Gère le zoom à la molette (Ctrl + Wheel).
function handleWheelZoom(event) {
    if (event.ctrlKey || event.metaKey) {
        event.preventDefault();

        if (event.deltaY < 0) {
            zoomStoryGrid(1);
        } else {
            zoomStoryGrid(-1);
        }
    }
}

// [MVVM : ViewModel]
// Gère la logique de passage d'un niveau de zoom à l'autre.
function zoomStoryGrid(direction) {
    const levels = Object.keys(STORYGRID_ZOOM_LEVELS);
    const currentIndex = levels.indexOf(storyGridState.zoomLevel);
    const newIndex = Math.max(0, Math.min(levels.length - 1, currentIndex + direction));

    if (newIndex !== currentIndex) {
        setStoryGridZoom(levels[newIndex]);
    }
}

// ============================================
// UI HELPERS
// ============================================

// [MVVM : View]
// Affiche ou masque le panneau des filtres de la grille.
function toggleStoryGridFilters() {
    const filters = document.getElementById('storyGridFilters');
    if (filters) {
        filters.style.display = filters.style.display === 'none' ? 'flex' : 'none';
    }
}

// [MVVM : Other]
// Active ou désactive un filtre de type de ligne et redessine la grille.
function toggleRowTypeFilter(type) {
    // Ne rien faire si on n'est pas en mode chronologique
    if (storyGridState.viewMode !== 'chronological') {
        return;
    }

    const index = storyGridState.filters.rowTypes.indexOf(type);
    if (index === -1) {
        storyGridState.filters.rowTypes.push(type);
    } else {
        storyGridState.filters.rowTypes.splice(index, 1);
    }

    // Mettre à jour les filtres manuels
    storyGridManualFilters = [...storyGridState.filters.rowTypes];

    renderStoryGrid();

    // ===============================================
    // NOUVEAU CODE AJOUTÉ POUR GARDER LA BARRE VISIBLE
    // ===============================================
    const filters = document.getElementById('storyGridFilters');
    if (filters) {
        // Force l'affichage du panneau des filtres sur 'flex'
        filters.style.display = 'flex';
    }
    // ===============================================
}

// [MVVM : ViewModel]
// Récupère le libellé textuel correspondant à un mode de vue.
function getViewModeLabel(mode) {
    const labels = {
        chronological: 'Vue chronologique',
        character: 'Personnages',
        arc: 'Arcs narratifs',
        location: 'Lieux'
    };
    return labels[mode] || mode;
}

// [MVVM : Other]
// Active l'édition interactive du titre d'une ligne via un champ input temporaire.
function editRowTitle(rowId, element) {
    const row = storyGridState.rows.find(r => r.id === rowId);
    if (!row) return;

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'storygrid-row-title-input';
    input.value = row.title;

    element.textContent = '';
    element.appendChild(input);
    input.focus();
    input.select();

    const finishEditing = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== row.title) {
            row.title = newTitle;
            saveStoryGridData();
        }
        renderStoryGrid();
    };

    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') finishEditing();
        if (e.key === 'Escape') renderStoryGrid();
    });
}

// [MVVM : ViewModel]
// Crée une carte et ouvre immédiatement sa modale de détail.
function quickAddCard(rowId, columnId) {
    const card = addCardToGrid(rowId, columnId);
    if (card) {
        openCardDetail(card.id);
    }
}

// ============================================
// MODALS
// ============================================

// [MVVM : View]
// Ouvre la modale permettant d'ajouter une nouvelle ligne à la grille.
function openAddRowModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'addStoryGridRowModal';
    modal.dataset.dynamic = 'true';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header">
                <div class="modal-title">Ajouter une ligne</div>
                <button class="modal-close" onclick="closeModal('addStoryGridRowModal')">x</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Type de ligne</label>
                    <div class="storygrid-row-type-selector">
                        ${Object.entries(STORYGRID_ROW_TYPES).map(([type, data]) => `
                            <label class="storygrid-row-type-option">
                                <input type="radio" name="rowType" value="${type}" ${type === 'character' ? 'checked' : ''}>
                                <div class="storygrid-row-type-card">
                                    <i data-lucide="${data.icon}" style="color: ${data.defaultColor}"></i>
                                    <span>${data.label}</span>
                                </div>
                            </label>
                        `).join('')}
                    </div>
                </div>
                
                <div class="form-group" id="rowSourceSelector" style="display: none;">
                    <label class="form-label">Source</label>
                    <select class="form-input" id="rowSourceSelect">
                        <option value="">-- Sélectionner --</option>
                    </select>
                </div>
                
                <div class="form-group" id="rowCustomTitle">
                    <label class="form-label">Titre</label>
                    <input type="text" class="form-input" id="newRowTitle" placeholder="Nom de la ligne...">
                </div>
                
                <div class="form-group">
                    <label class="form-label">Couleur</label>
                    <input type="color" class="form-input" id="newRowColor" value="#3498db" style="height: 40px;">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('addStoryGridRowModal')">Annuler</button>
                <button class="btn btn-primary" onclick="confirmAddRow()">Ajouter</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Setup type selector change
    modal.querySelectorAll('input[name="rowType"]').forEach(radio => {
        radio.addEventListener('change', updateRowSourceOptions);
    });

    updateRowSourceOptions();

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// [MVVM : View]
// Met à jour les options de source (personnages, arcs...) dans la modale d'ajout de ligne.
function updateRowSourceOptions() {
    const type = document.querySelector('input[name="rowType"]:checked')?.value;
    const sourceSelector = document.getElementById('rowSourceSelector');
    const sourceSelect = document.getElementById('rowSourceSelect');
    const customTitle = document.getElementById('rowCustomTitle');
    const colorInput = document.getElementById('newRowColor');
    const typeData = STORYGRID_ROW_TYPES[type];

    colorInput.value = typeData?.defaultColor || '#3498db';

    if (!typeData || typeData.source === 'custom') {
        sourceSelector.style.display = 'none';
        customTitle.style.display = 'block';
        return;
    }

    let options = '<option value="">-- Sélectionner --</option>';
    let items = [];

    switch (type) {
        case 'character':
            items = project.characters || [];
            items.forEach(char => {
                // Check if not already a row
                const exists = storyGridState.rows.some(r => r.type === 'character' && r.sourceId === char.id);
                if (!exists) {
                    options += `<option value="${char.id}">${char.name}</option>`;
                }
            });
            break;
        case 'arc':
            items = project.narrativeArcs || [];
            items.forEach(arc => {
                const exists = storyGridState.rows.some(r => r.type === 'arc' && r.sourceId === arc.id);
                if (!exists) {
                    options += `<option value="${arc.id}">${arc.title}</option>`;
                }
            });
            break;
        case 'location':
            // Les lieux sont dans project.world, filtrés par type
            const worldItems = project.world || [];
            items = worldItems.filter(w => w.type === 'location' || w.type === 'Lieu');
            items.forEach(loc => {
                const exists = storyGridState.rows.some(r => r.type === 'location' && r.sourceId === loc.id);
                if (!exists) {
                    options += `<option value="${loc.id}">${loc.name}</option>`;
                }
            });
            break;
    }

    sourceSelect.innerHTML = options;
    sourceSelector.style.display = 'block';
    customTitle.style.display = 'none';

    // Update title when source changes
    sourceSelect.onchange = function () {
        const titleInput = document.getElementById('newRowTitle');
        if (this.value) {
            const selectedOption = this.options[this.selectedIndex];
            titleInput.value = selectedOption.text;
        }
    };
}

// [MVVM : Other]
// Valide et crée la ligne demandée via la modale.
function confirmAddRow() {
    const type = document.querySelector('input[name="rowType"]:checked')?.value;
    const sourceSelect = document.getElementById('rowSourceSelect');
    const titleInput = document.getElementById('newRowTitle');
    const colorInput = document.getElementById('newRowColor');

    const typeData = STORYGRID_ROW_TYPES[type];
    let title = titleInput.value.trim();
    let sourceId = null;

    if (typeData.source !== 'custom' && sourceSelect.value) {
        sourceId = sourceSelect.value;
        const selectedOption = sourceSelect.options[sourceSelect.selectedIndex];
        title = selectedOption.text;
    }

    if (!title) {
        alert('Veuillez saisir un titre pour la ligne.');
        return;
    }

    addStoryGridRow(type, {
        sourceId: sourceId,
        title: title,
        color: colorInput.value
    });

    closeModal('addStoryGridRowModal');
}

// [MVVM : View]
// Ouvre le menu contextuel (options) d'une ligne à l'emplacement du clic.
function openRowOptionsMenu(rowId, event) {
    event.stopPropagation();

    // Remove any existing menu
    const existingMenu = document.querySelector('.storygrid-context-menu');
    if (existingMenu) existingMenu.remove();

    const row = storyGridState.rows.find(r => r.id === rowId);
    if (!row) return;

    const menu = document.createElement('div');
    menu.className = 'storygrid-context-menu';
    menu.innerHTML = `
        <div class="context-menu-item" onclick="editRowProperties('${rowId}')">
            <i data-lucide="edit-3"></i> Modifier
        </div>
        <div class="context-menu-item" onclick="toggleRowVisibility('${rowId}'); this.parentElement.remove();">
            <i data-lucide="${row.visible ? 'eye-off' : 'eye'}"></i> 
            ${row.visible ? 'Masquer' : 'Afficher'}
        </div>
        <div class="context-menu-divider"></div>
        <div class="context-menu-item danger" onclick="confirmDeleteRow('${rowId}')">
            <i data-lucide="trash-2"></i> Supprimer
        </div>
    `;

    // Position menu
    const rect = event.target.getBoundingClientRect();
    menu.style.top = rect.bottom + 'px';
    menu.style.left = rect.left + 'px';

    document.body.appendChild(menu);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Close menu on click outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target)) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 10);
}

// [MVVM : View]
// Ouvre la modale de modification des propriétés d'une ligne.
function editRowProperties(rowId) {
    const row = storyGridState.rows.find(r => r.id === rowId);
    if (!row) return;

    // Close context menu
    const existingMenu = document.querySelector('.storygrid-context-menu');
    if (existingMenu) existingMenu.remove();

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'editRowModal';
    modal.dataset.dynamic = 'true';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <div class="modal-title">Modifier la ligne</div>
                <button class="modal-close" onclick="closeModal('editRowModal')">x</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Titre</label>
                    <input type="text" class="form-input" id="editRowTitle" value="${row.title}">
                </div>
                <div class="form-group">
                    <label class="form-label">Couleur</label>
                    <input type="color" class="form-input" id="editRowColor" value="${row.color}" style="height: 40px;">
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('editRowModal')">Annuler</button>
                <button class="btn btn-primary" onclick="saveRowProperties('${rowId}')">Enregistrer</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// [MVVM : Other]
// Sauvegarde les modifications apportées aux propriétés d'une ligne.
function saveRowProperties(rowId) {
    const title = document.getElementById('editRowTitle').value.trim();
    const color = document.getElementById('editRowColor').value;

    if (title) {
        updateStoryGridRow(rowId, { title, color });
    }

    closeModal('editRowModal');
}

// [MVVM : Other]
// Demande confirmation avant de supprimer une ligne.
function confirmDeleteRow(rowId) {
    // Close context menu
    const existingMenu = document.querySelector('.storygrid-context-menu');
    if (existingMenu) existingMenu.remove();

    if (confirm('ÃŠtes-vous sÃƒÂ»r de vouloir supprimer cette ligne et toutes ses cartes ?')) {
        deleteStoryGridRow(rowId);
    }
}

// ============================================
// CARD DETAIL MODAL
// ============================================

// [MVVM : View]
// Ouvre la modale de détail d'une carte pour édition complète.
function openCardDetail(cardId) {
    let card = null;
    let row = null;

    for (const r of storyGridState.rows) {
        const c = r.cards.find(c => c.id === cardId);
        if (c) {
            card = c;
            row = r;
            break;
        }
    }

    if (!card || !row) return;

    storyGridState.selectedCard = cardId;

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'cardDetailModal';
    modal.dataset.dynamic = 'true';
    modal.innerHTML = `
        <div class="modal-content storygrid-card-modal">
            <div class="modal-header" style="border-left: 4px solid ${row.color};">
                <div class="modal-title">
                    <input type="text" class="storygrid-card-title-input" 
                           value="${card.title}" 
                           onchange="updateCard('${cardId}', {title: this.value})">
                </div>
                <button class="modal-close" onclick="closeModal('cardDetailModal')">x</button>
            </div>
            <div class="modal-body">
                <div class="storygrid-card-detail-grid">
                    <div class="storygrid-card-detail-main">
                        <div class="form-group">
                            <label class="form-label">Résumé</label>
                            <textarea class="form-input" rows="3" 
                                      onchange="updateCard('${cardId}', {summary: this.value})"
                                      placeholder="Résumé de la scène...">${card.summary || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Objectif dramatique</label>
                            <textarea class="form-input" rows="2" 
                                      onchange="updateCard('${cardId}', {objective: this.value})"
                                      placeholder="Que doit accomplir cette scène ?">${card.objective || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">
                                <i data-lucide="zap" style="width: 14px; height: 14px;"></i> Conflit
                            </label>
                            <textarea class="form-input" rows="2" 
                                      onchange="updateCard('${cardId}', {conflict: this.value})"
                                      placeholder="Tension, obstacle, enjeu...">${card.conflict || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Notes</label>
                            <textarea class="form-input" rows="3" 
                                      onchange="updateCard('${cardId}', {notes: this.value})"
                                      placeholder="Notes personnelles...">${card.notes || ''}</textarea>
                        </div>
                        
                        <!-- Section Liaisons Multiples -->
                        <div class="storygrid-card-links-section">
                            <div class="section-title">
                                <i data-lucide="link-2"></i>
                                <span>Liaisons (Cards Jumelles)</span>
                            </div>
                            <div class="storygrid-links-grid" id="cardLinksGrid">
                                ${renderCardEntityLinks(card)}
                            </div>
                        </div>
                    </div>
                    
                    <div class="storygrid-card-detail-side">
                        <div class="form-group">
                            <label class="form-label">Statut</label>
                            <select class="form-input" onchange="updateCard('${cardId}', {status: this.value})">
                                ${Object.entries(CARD_STATUSES).map(([key, data]) => `
                                    <option value="${key}" ${card.status === key ? 'selected' : ''}>
                                        ${data.label}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Intensité</label>
                            <div class="storygrid-intensity-selector">
                                ${[1, 2, 3, 4, 5].map(i => `
                                    <button class="intensity-btn ${card.intensity >= i ? 'active' : ''}"
                                            onclick="updateCardIntensity('${cardId}', ${i})">
                                        ${i}
                                    </button>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Point de vue</label>
                            <select class="form-input" onchange="updateCard('${cardId}', {pov: this.value})">
                                <option value="">-- Aucun --</option>
                                ${(project.characters || []).map(char => `
                                    <option value="${char.id}" ${card.pov === char.id ? 'selected' : ''}>
                                        ${char.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Couleur personnalisée</label>
                            <div class="storygrid-color-picker">
                                <input type="color" value="${card.color || row.color}" 
                                       onchange="updateCard('${cardId}', {color: this.value})">
                                <button class="btn btn-sm" onclick="updateCard('${cardId}', {color: null}); this.previousElementSibling.value='${row.color}';">
                                    Reset
                                </button>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Liens entre cartes</label>
                            <div class="storygrid-card-links">
                                ${renderCardLinks(cardId)}
                            </div>
                            <button class="btn btn-sm btn-outline" onclick="openAddLinkModal('${cardId}')">
                                <i data-lucide="link"></i> Ajouter un lien
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-danger" onclick="confirmDeleteCard('${cardId}')">
                    <i data-lucide="trash-2"></i> Supprimer
                </button>
                <button class="btn btn-primary" onclick="closeModal('cardDetailModal')">Fermer</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Rendu des liaisons d'entités (personnages, arcs, lieux) dans la modale
// [MVVM : View]
// Génère le HTML de la section des liaisons (personnages, arcs, lieux) dans la modale.
function renderCardEntityLinks(card) {
    return `
        <!-- Personnages liés -->
        <div class="storygrid-link-group">
            <div class="storygrid-link-group-header">
                <i data-lucide="user" style="color: #3498db;"></i>
                <span>Personnages</span>
                <button class="btn btn-xs btn-ghost" onclick="openAddCharacterToCardModal('${card.id}')">
                    <i data-lucide="plus"></i>
                </button>
            </div>
            <div class="storygrid-link-group-items" id="cardCharacterLinks">
                ${renderCardCharacters(card)}
            </div>
        </div>
        
        <!-- Arcs liés -->
        <div class="storygrid-link-group">
            <div class="storygrid-link-group-header">
                <i data-lucide="git-branch" style="color: #e74c3c;"></i>
                <span>Arcs narratifs</span>
                <button class="btn btn-xs btn-ghost" onclick="openAddArcToCardModal('${card.id}')">
                    <i data-lucide="plus"></i>
                </button>
            </div>
            <div class="storygrid-link-group-items" id="cardArcLinks">
                ${renderCardArcs(card)}
            </div>
        </div>
        
        <!-- Lieux liés -->
        <div class="storygrid-link-group">
            <div class="storygrid-link-group-header">
                <i data-lucide="map-pin" style="color: #27ae60;"></i>
                <span>Lieux</span>
                <button class="btn btn-xs btn-ghost" onclick="openAddLocationToCardModal('${card.id}')">
                    <i data-lucide="plus"></i>
                </button>
            </div>
            <div class="storygrid-link-group-items" id="cardLocationLinks">
                ${renderCardLocations(card)}
            </div>
        </div>
    `;
}

// [MVVM : View]
// Génère le HTML de la liste des personnages liés à une carte.
function renderCardCharacters(card) {
    if (!card.characters || card.characters.length === 0) {
        return '<div class="storygrid-no-links">Aucun personnage</div>';
    }

    return card.characters.map(charId => {
        const char = (project.characters || []).find(c => c.id === charId);
        if (!char) return '';
        return `
            <div class="storygrid-link-tag" style="--tag-color: ${char.color || '#3498db'}">
                <span>${char.name}</span>
                <button class="tag-remove" onclick="event.stopPropagation(); removeCharacterFromCard('${card.id}', '${charId}'); refreshCardDetailLinks('${card.id}');">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `;
    }).join('');
}

// [MVVM : View]
// Génère le HTML de la liste des arcs narratifs liés à une carte.
function renderCardArcs(card) {
    if (!card.arcs || card.arcs.length === 0) {
        return '<div class="storygrid-no-links">Aucun arc</div>';
    }

    return card.arcs.map(arcId => {
        const arc = (project.narrativeArcs || []).find(a => a.id === arcId);
        if (!arc) return '';
        return `
            <div class="storygrid-link-tag" style="--tag-color: ${arc.color || '#e74c3c'}">
                <span>${arc.title}</span>
                <button class="tag-remove" onclick="event.stopPropagation(); removeArcFromCard('${card.id}', '${arcId}'); refreshCardDetailLinks('${card.id}');">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `;
    }).join('');
}

// [MVVM : View]
// Génère le HTML de la liste des lieux liés à une carte.
function renderCardLocations(card) {
    if (!card.locations || card.locations.length === 0) {
        return '<div class="storygrid-no-links">Aucun lieu</div>';
    }

    // Lieux dans world
    const locations = (project.world || []).filter(w => w.type === 'location' || w.type === 'Lieu');

    return card.locations.map(locId => {
        const loc = locations.find(l => l.id === locId);
        if (!loc) return '';
        return `
            <div class="storygrid-link-tag" style="--tag-color: ${loc.color || '#27ae60'}">
                <span>${loc.name}</span>
                <button class="tag-remove" onclick="event.stopPropagation(); removeLocationFromCard('${card.id}', '${locId}'); refreshCardDetailLinks('${card.id}');">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `;
    }).join('');
}

// RafraÃ®chir les liens dans la modale sans la fermer
// [MVVM : View]
// Rafraîchit l'affichage des liens dans la modale de détail d'une carte.
function refreshCardDetailLinks(cardId) {
    const card = findCardById(cardId);
    if (!card) return;

    const linksGrid = document.getElementById('cardLinksGrid');
    if (linksGrid) {
        linksGrid.innerHTML = renderCardEntityLinks(card);
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Modale pour ajouter un personnage
// [MVVM : View]
// Ouvre une modale pour sélectionner et ajouter un personnage à une carte.
function openAddCharacterToCardModal(cardId) {
    // Fermer si déjà ouverte
    const existing = document.getElementById('addCharacterModal');
    if (existing) existing.remove();

    const card = findCardById(cardId);
    if (!card) return;

    const availableChars = (project.characters || []).filter(c =>
        !card.characters || !card.characters.includes(c.id)
    );

    if (availableChars.length === 0) {
        alert('Tous les personnages sont déjà liés à cette carte.');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'addCharacterModal';
    modal.dataset.dynamic = 'true';
    modal.style.zIndex = '10001';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <div class="modal-title"><i data-lucide="user"></i> Ajouter un personnage</div>
                <button class="modal-close" onclick="closeModal('addCharacterModal')">X</button>
            </div>
            <div class="modal-body">
                <div class="storygrid-add-link-list">
                    ${availableChars.map(char => `
                        <div class="storygrid-add-link-item" onclick="selectCharacterForCard('${cardId}', '${char.id}')">
                            <div class="item-icon" style="background: ${char.color || '#3498db'}20; color: ${char.color || '#3498db'}">
                                <i data-lucide="user"></i>
                            </div>
                            <span>${char.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Fermer en cliquant sur le fond
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal('addCharacterModal');
        }
    });

    document.body.appendChild(modal);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// [MVVM : Other]
// Sélectionne un personnage pour l'ajouter à une carte et rafraîchit la vue.
function selectCharacterForCard(cardId, characterId) {
    addCharacterToCard(cardId, characterId);
    closeModal('addCharacterModal');
    refreshCardDetailLinks(cardId);
}

// Modale pour ajouter un arc
// [MVVM : View]
// Ouvre une modale pour sélectionner et ajouter un arc narratif à une carte.
function openAddArcToCardModal(cardId) {
    // Fermer si déjà ouverte
    const existing = document.getElementById('addArcModal');
    if (existing) existing.remove();

    const card = findCardById(cardId);
    if (!card) return;

    const availableArcs = (project.narrativeArcs || []).filter(a =>
        !card.arcs || !card.arcs.includes(a.id)
    );

    if (availableArcs.length === 0) {
        alert('Tous les arcs sont déjÃƒÂ  liés ÃƒÂ  cette carte.');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'addArcModal';
    modal.dataset.dynamic = 'true';
    modal.style.zIndex = '10001';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <div class="modal-title"><i data-lucide="git-branch"></i> Ajouter un arc</div>
                <button class="modal-close" onclick="closeModal('addArcModal')">x</button>
            </div>
            <div class="modal-body">
                <div class="storygrid-add-link-list">
                    ${availableArcs.map(arc => `
                        <div class="storygrid-add-link-item" onclick="selectArcForCard('${cardId}', '${arc.id}')">
                            <div class="item-icon" style="background: ${arc.color || '#e74c3c'}20; color: ${arc.color || '#e74c3c'}">
                                <i data-lucide="git-branch"></i>
                            </div>
                            <span>${arc.title}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Fermer en cliquant sur le fond
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal('addArcModal');
        }
    });

    document.body.appendChild(modal);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// [MVVM : Other]
// Sélectionne un arc pour l'ajouter à une carte et rafraîchit la vue.
function selectArcForCard(cardId, arcId) {
    addArcToCard(cardId, arcId);
    closeModal('addArcModal');
    refreshCardDetailLinks(cardId);
}

// Modale pour ajouter un lieu
// [MVVM : View]
// Ouvre une modale pour sélectionner et ajouter un lieu à une carte.
function openAddLocationToCardModal(cardId) {
    // Fermer si déjà ouverte
    const existing = document.getElementById('addLocationModal');
    if (existing) existing.remove();

    const card = findCardById(cardId);
    if (!card) return;

    const locations = (project.world || []).filter(w => w.type === 'location' || w.type === 'Lieu');
    const availableLocs = locations.filter(l =>
        !card.locations || !card.locations.includes(l.id)
    );

    if (availableLocs.length === 0) {
        alert('Tous les lieux sont déjÃƒÂ  liés ÃƒÂ  cette carte.');
        return;
    }

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'addLocationModal';
    modal.dataset.dynamic = 'true';
    modal.style.zIndex = '10001';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <div class="modal-title"><i data-lucide="map-pin"></i> Ajouter un lieu</div>
                <button class="modal-close" onclick="closeModal('addLocationModal')">x</button>
            </div>
            <div class="modal-body">
                <div class="storygrid-add-link-list">
                    ${availableLocs.map(loc => `
                        <div class="storygrid-add-link-item" onclick="selectLocationForCard('${cardId}', '${loc.id}')">
                            <div class="item-icon" style="background: ${loc.color || '#27ae60'}20; color: ${loc.color || '#27ae60'}">
                                <i data-lucide="map-pin"></i>
                            </div>
                            <span>${loc.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    // Fermer en cliquant sur le fond
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal('addLocationModal');
        }
    });

    document.body.appendChild(modal);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// [MVVM : Other]
// Sélectionne un lieu pour l'ajouter à une carte et rafraîchit la vue.
function selectLocationForCard(cardId, locationId) {
    addLocationToCard(cardId, locationId);
    closeModal('addLocationModal');
    refreshCardDetailLinks(cardId);
}

// [MVVM : View]
// Génère le HTML de la liste des liens entre cartes pour la modale de détail.
function renderCardLinks(cardId) {
    const links = storyGridState.links.filter(l => l.fromCard === cardId || l.toCard === cardId);

    if (links.length === 0) {
        return '<div class="storygrid-no-links">Aucun lien</div>';
    }

    return links.map(link => {
        const linkType = LINK_TYPES[link.type];
        const isFrom = link.fromCard === cardId;
        const otherCardId = isFrom ? link.toCard : link.fromCard;

        // Find other card
        let otherCard = null;
        for (const row of storyGridState.rows) {
            otherCard = row.cards.find(c => c.id === otherCardId);
            if (otherCard) break;
        }

        return `
            <div class="storygrid-link-item" style="border-left-color: ${linkType.color}">
                <div class="storygrid-link-info">
                    <span class="storygrid-link-type">${isFrom ? linkType.label : 'Lié ÃƒÂ '}</span>
                    <span class="storygrid-link-target">${otherCard?.title || 'Carte inconnue'}</span>
                </div>
                <button class="storygrid-link-remove" onclick="deleteCardLink('${link.id}'); openCardDetail('${cardId}');">
                    <i data-lucide="x"></i>
                </button>
            </div>
        `;
    }).join('');
}

// [MVVM : Other]
// Met à jour l'intensité d'une carte et modifie l'UI sans rendu complet.
function updateCardIntensity(cardId, intensity) {
    updateCard(cardId, { intensity });

    // Update UI without full re-render
    const buttons = document.querySelectorAll('.storygrid-intensity-selector .intensity-btn');
    buttons.forEach((btn, index) => {
        btn.classList.toggle('active', index < intensity);
    });
}

// [MVVM : Other]
// Demande confirmation avant de supprimer une carte.
function confirmDeleteCard(cardId) {
    if (confirm('ÃŠtes-vous sÃƒÂ»r de vouloir supprimer cette carte ?')) {
        deleteCard(cardId);
        closeModal('cardDetailModal');
    }
}

// [MVVM : View]
// Ouvre la modale pour créer un lien entre la carte actuelle et une autre carte.
function openAddLinkModal(fromCardId) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'addLinkModal';
    modal.dataset.dynamic = 'true';
    modal.style.zIndex = '10001';

    // Get all cards except the current one
    const allCards = [];
    storyGridState.rows.forEach(row => {
        row.cards.forEach(card => {
            if (card.id !== fromCardId) {
                allCards.push({ ...card, rowTitle: row.title });
            }
        });
    });

    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <div class="modal-title">Ajouter un lien</div>
                <button class="modal-close" onclick="closeModal('addLinkModal')">x</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Type de lien</label>
                    <select class="form-input" id="linkTypeSelect">
                        ${Object.entries(LINK_TYPES).map(([type, data]) => `
                            <option value="${type}">${data.label}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Vers la carte</label>
                    <select class="form-input" id="linkTargetSelect">
                        <option value="">-- Sélectionner --</option>
                        ${allCards.map(card => `
                            <option value="${card.id}">[${card.rowTitle}] ${card.title}</option>
                        `).join('')}
                    </select>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('addLinkModal')">Annuler</button>
                <button class="btn btn-primary" onclick="confirmAddLink('${fromCardId}')">Ajouter</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// [MVVM : Other]
// Valide et crée le lien entre cartes suite à la sélection en modale.
function confirmAddLink(fromCardId) {
    const linkType = document.getElementById('linkTypeSelect').value;
    const toCardId = document.getElementById('linkTargetSelect').value;

    if (!toCardId) {
        alert('Veuillez sélectionner une carte cible.');
        return;
    }

    addCardLink(fromCardId, toCardId, linkType);
    closeModal('addLinkModal');
    openCardDetail(fromCardId); // Refresh detail modal
}

// [MVVM : View]
// Ouvre la modale des paramètres généraux du Story Grid.
function openStoryGridSettings() {
    const settings = project.storyGrid?.settings || {};

    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'storyGridSettingsModal';
    modal.dataset.dynamic = 'true';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <div class="modal-title">Paramètres du Story Grid</div>
                <button class="modal-close" onclick="closeModal('storyGridSettingsModal')">x</button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label class="form-label">Zoom par défaut</label>
                    <select class="form-input" id="sgDefaultZoom">
                        ${Object.entries(STORYGRID_ZOOM_LEVELS).map(([key, data]) => `
                            <option value="${key}" ${settings.defaultZoom === key ? 'selected' : ''}>
                                ${data.name} (${data.label})
                            </option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label class="toggle-label">
                        <input type="checkbox" id="sgShowEmptyCells" ${settings.showEmptyCells ? 'checked' : ''}>
                        <span>Afficher les cellules vides</span>
                    </label>
                </div>
                <div class="form-group">
                    <label class="toggle-label">
                        <input type="checkbox" id="sgSnapToGrid" ${settings.snapToGrid ? 'checked' : ''}>
                        <span>Alignement automatique</span>
                    </label>
                </div>
                <hr style="margin: 16px 0;">
                <div class="form-group">
                    <button class="btn btn-outline btn-block" onclick="resetStoryGrid()">
                        <i data-lucide="refresh-cw"></i> Réinitialiser le Story Grid
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('storyGridSettingsModal')">Annuler</button>
                <button class="btn btn-primary" onclick="saveStoryGridSettings()">Enregistrer</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// [MVVM : Other]
// Sauvegarde les paramètres de la grille et ferme la modale.
function saveStoryGridSettings() {
    project.storyGrid.settings = {
        defaultZoom: document.getElementById('sgDefaultZoom').value,
        showEmptyCells: document.getElementById('sgShowEmptyCells').checked,
        snapToGrid: document.getElementById('sgSnapToGrid').checked
    };

    saveProject();
    closeModal('storyGridSettingsModal');
}

// [MVVM : Other]
// Réinitialise complètement le Story Grid (supprime tout et recrée les lignes de base).
function resetStoryGrid() {
    if (confirm('ÃŠtes-vous sÃƒÂ»r de vouloir réinitialiser le Story Grid ? Toutes les lignes personnalisées et cartes seront supprimées.')) {
        storyGridState.rows = [];
        storyGridState.links = [];
        autoCreateRowsFromProject();
        closeModal('storyGridSettingsModal');
        renderStoryGrid();
    }
}

// ============================================
// WELCOME VIEW
// ============================================

// [MVVM : View]
// Affiche l'écran d'accueil vide du Story Grid quand aucun contenu n'est ouvert.
function renderStoryGridWelcome() {
    const container = document.getElementById('editorView');
    if (!container) return;

    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="layout-grid"></i></div>
            <div class="empty-state-title">Story Grid</div>
            <div class="empty-state-text">
                Visualisez et organisez votre récit avec le tableau de bord narratif.<br>
                Suivez vos personnages, arcs et lieux ÃƒÂ  travers chaque scène.
            </div>
            <button class="btn btn-primary" onclick="renderStoryGrid()">
                <i data-lucide="play"></i> Ouvrir le Story Grid
            </button>
        </div>
    `;

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// ============================================
// SCENE LINKING
// ============================================

// [MVVM : Other]
// Lie une scène du manuscrit à une carte existante et synchronise les données.
function linkSceneToCard(sceneId, cardId) {
    for (const row of storyGridState.rows) {
        const card = row.cards.find(c => c.id === cardId);
        if (card) {
            // Find scene data
            let sceneData = null;
            for (const act of project.acts) {
                for (const chapter of act.chapters || []) {
                    const scene = (chapter.scenes || []).find(s => s.id === sceneId);
                    if (scene) {
                        sceneData = scene;
                        break;
                    }
                }
                if (sceneData) break;
            }

            if (sceneData) {
                card.sceneId = sceneId;
                card.title = sceneData.title;
                card.summary = sceneData.summary || '';
                saveStoryGridData();
                renderStoryGrid();
            }
            return;
        }
    }
}

// ============================================
// EXPORT/IMPORT
// ============================================

// [MVVM : Model]
// Exporte les données du Story Grid au format JSON pour téléchargement.
function exportStoryGridData() {
    const data = {
        rows: storyGridState.rows,
        links: storyGridState.links,
        settings: project.storyGrid?.settings || {},
        exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `storygrid_${project.title || 'export'}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// [MVVM : Other]
// Importe des données Story Grid à partir d'un fichier JSON.
function importStoryGridData(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.rows && Array.isArray(data.rows)) {
                storyGridState.rows = data.rows;
                storyGridState.links = data.links || [];
                if (data.settings) {
                    project.storyGrid.settings = data.settings;
                }
                saveStoryGridData();
                renderStoryGrid();
            }
        } catch (error) {
            alert('Erreur lors de l\'importation: ' + error.message);
        }
    };
    reader.readAsText(file);
}

// ============================================
// SCENE NAVIGATION MODAL
// ============================================

// [MVVM : View]
// Ouvre la modale de navigation pour choisir comment visualiser une scène liée.
function showSceneNavigationModal(actId, chapterId, sceneId) {
    // Trouver le titre de la scène
    let sceneTitle = 'Scène';
    const act = project.acts?.find(a => a.id === actId);
    if (act) {
        const chapter = act.chapters?.find(c => c.id === chapterId);
        if (chapter) {
            const scene = chapter.scenes?.find(s => s.id === sceneId);
            if (scene) {
                sceneTitle = scene.title || 'Scène sans titre';
            }
        }
    }

    // Créer la modale
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'sceneNavigationModal';
    modal.dataset.dynamic = 'true';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <div class="modal-title">Ouvrir la scène</div>
                <button class="modal-close" onclick="closeModal('sceneNavigationModal')">Ã—</button>
            </div>
            <div class="modal-body">
                <p style="margin-bottom: 16px; color: var(--text-secondary);">
                    <strong>${sceneTitle}</strong>
                </p>
                <p style="margin-bottom: 20px; color: var(--text-secondary);">
                    Comment souhaitez-vous visualiser cette scène ?
                </p>
                
                <div class="scene-nav-options">
                    <div class="scene-nav-option" onclick="navigateToSceneFromGrid('${actId}', '${chapterId}', '${sceneId}')">
                        <div class="scene-nav-option-icon" style="color: #3498db;">
                            <i data-lucide="external-link"></i>
                        </div>
                        <div class="scene-nav-option-content">
                            <div class="scene-nav-option-title">Vue complète</div>
                            <div class="scene-nav-option-desc">Basculer vers la vue Structure (quitte la vue actuelle)</div>
                        </div>
                    </div>
                    
                    <div class="scene-nav-option" onclick="openSceneInSplitViewFromGrid('${actId}', '${chapterId}', '${sceneId}')">
                        <div class="scene-nav-option-icon" style="color: #27ae60;">
                            <i data-lucide="columns-2"></i>
                        </div>
                        <div class="scene-nav-option-content">
                            <div class="scene-nav-option-title">Split-view</div>
                            <div class="scene-nav-option-desc">Ouvrir la scène en vue séparée (conserve le Story Grid)</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-secondary" onclick="closeModal('sceneNavigationModal')">Annuler</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// [MVVM : ViewModel]
// Ferme la modale et navigue vers la vue Structure pour éditer une scène.
function navigateToSceneFromGrid(actId, chapterId, sceneId) {
    closeModal('sceneNavigationModal');

    // Utiliser la navigation existante
    currentActId = actId;
    currentChapterId = chapterId;
    currentSceneId = sceneId;

    switchToView('structure');

    // Ouvrir la scène dans l'éditeur après un court délai
    setTimeout(() => {
        if (typeof openSceneEditor === 'function') {
            openSceneEditor(actId, chapterId, sceneId);
        }
    }, 100);
}

// [MVVM : ViewModel]
// Ouvre une scène en mode vue séparée (Split-View) tout en gardant la grille visible.
function openSceneInSplitViewFromGrid(actId, chapterId, sceneId) {
    closeModal('sceneNavigationModal');

    // Utiliser le système de split-view existant
    if (typeof openSplitView === 'function') {
        openSplitView('editor', {
            actId: actId,
            chapterId: chapterId,
            sceneId: sceneId
        });
    } else {
        // Fallback si la fonction n'existe pas
        navigateToSceneFromGrid(actId, chapterId, sceneId);
    }
}
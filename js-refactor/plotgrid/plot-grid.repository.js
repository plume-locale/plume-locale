/**
 * [MVVM : Plot Grid Repository]
 * Persistence and Structure Synchronization.
 */

const PlotGridRepository = {
    /**
     * Initialize the repository.
     */
    init: function () {
        if (!project.plotGrid) {
            project.plotGrid = PlotGridModel.createState();
        }
        this.ensureStructureColumns();
    },

    /**
     * Ensure the mandatory "Structure" column exists.
     */
    ensureStructureColumns: function () {
        if (!project.plotGrid.columns.find(c => c.type === 'structure')) {
            const structCol = PlotGridModel.createColumn({
                titulo: 'Structure Narrative',
                type: 'structure',
                order: -1
            });
            project.plotGrid.columns.unshift(structCol);
        }
    },

    /**
     * Sync rows with project Acts/Chapters/Scenes.
     * Preserves existing rows and their IDs to keep card connections stable.
     */
    syncWithStructure: function () {
        if (!project.plotGrid) this.init();

        const structureRows = [];

        // Walk the structure - ONLY Scenes get rows
        project.acts.forEach(act => {
            act.chapters.forEach(chapter => {
                chapter.scenes.forEach((scene, sIdx) => {
                    let row = project.plotGrid.rows.find(r => r.structureId === scene.id && r.structureType === 'scene');
                    if (!row) {
                        row = PlotGridModel.createRow({
                            structureId: scene.id,
                            structureType: 'scene',
                            type: 'structure',
                            title: scene.title
                        });
                        // Calculate an order for the new row? 
                        // For now, if it's new, we'll append it logically in the next step
                    } else {
                        row.title = scene.title;
                    }
                    row.parentChapterTitle = chapter.title;
                    row.isFirstInChapter = (sIdx === 0);
                    row.synopsis = scene.synopsis || scene.title;
                    structureRows.push(row);
                });
            });
        });

        // Current rows in project.plotGrid.rows that are NOT in the new structureRows list
        // are either custom rows OR deleted scene rows.
        const customRows = project.plotGrid.rows.filter(r => r.type === 'custom');

        // Final list: all structure rows + current custom rows
        project.plotGrid.rows = [...structureRows, ...customRows];

        // IMPORTANT: We must ensure orders are unique and sequential for the first pass,
        // then subsequent inserts will use fractional orders.
        // If ALL rows have order 0 or similar, we fix it.
        const needsReorder = project.plotGrid.rows.length > 0 &&
            project.plotGrid.rows.every(r => r.order === 0);

        if (needsReorder) {
            // Give them a default order 0, 10, 20... to allow room for interleaving
            project.plotGrid.rows.sort((a, b) => {
                // This is tricky because we don't have a reliable sort key for custom rows yet
                // during a "clean" reorder. 
                // Let's just use current array index as a fallback.
                return 0;
            }).forEach((r, idx) => r.order = idx * 10);
        }
    },

    // --- CRUD Columns ---

    getColumns: function () {
        return project.plotGrid.columns.sort((a, b) => a.order - b.order);
    },

    addColumn: function (column) {
        project.plotGrid.columns.push(column);
        saveProject(); // Global save
        return column;
    },

    removeColumn: function (colId) {
        const idx = project.plotGrid.columns.findIndex(c => c.id === colId);
        if (idx !== -1) {
            project.plotGrid.columns.splice(idx, 1);
            // Also remove cards in this column
            project.plotGrid.cards = project.plotGrid.cards.filter(c => c.colId !== colId);
            saveProject();
        }
    },

    updateColumn: function (colId, updates) {
        const col = project.plotGrid.columns.find(c => c.id === colId);
        if (col) {
            Object.assign(col, updates);
            saveProject();
        }
        return col;
    },

    // --- CRUD Rows (Custom) ---

    getRows: function () {
        return project.plotGrid.rows.sort((a, b) => a.order - b.order);
    },

    addCustomRow: function (row) {
        project.plotGrid.rows.push(row);
        saveProject();
        return row;
    },

    removeRow: function (rowId) {
        const idx = project.plotGrid.rows.findIndex(r => r.id === rowId);
        if (idx !== -1) {
            project.plotGrid.rows.splice(idx, 1);
            // Also remove cards in this row
            project.plotGrid.cards = project.plotGrid.cards.filter(c => c.rowId !== rowId);
            saveProject();
        }
    },

    // --- CRUD Cards ---

    getCards: function () {
        return project.plotGrid.cards;
    },

    getCardsByRow: function (rowId) {
        return project.plotGrid.cards.filter(c => c.rowId === rowId);
    },

    /**
     * Ensure columns exist up to a certain count/index.
     */
    ensureColumnsUntil: function (count) {
        const currentCount = project.plotGrid.columns.length;
        if (currentCount >= count) return;

        for (let i = currentCount; i < count; i++) {
            this.addColumn(PlotGridModel.createColumn({
                title: 'Ligne sans titre',
                type: 'custom',
                order: i
            }));
        }
    },

    addCard: function (card) {
        // Find or create column if needed (if colId is an index)
        // Note: For simplicity, if colId is not found, we might need a way to target by index.
        // I'll adjust the view to pass both if available or use a better strategy.
        project.plotGrid.cards.push(card);
        saveProject();
        return card;
    },

    updateCard: function (cardId, updates) {
        const card = project.plotGrid.cards.find(c => c.id === cardId);
        if (card) {
            Object.assign(card, updates);
            card.updatedAt = new Date().toISOString();
            saveProject();
        }
        return card;
    },

    removeCard: function (cardId) {
        const idx = project.plotGrid.cards.findIndex(c => c.id === cardId);
        if (idx !== -1) {
            project.plotGrid.cards.splice(idx, 1);
            saveProject();
        }
    },

    /**
     * Special delete for Structure Rows: Only delete cards, do NOT delete the row itself (it's managed by sync).
     */
    clearRowCards: function (rowId) {
        const row = project.plotGrid.rows.find(r => r.id === rowId);
        if (!row) return;

        // Keep cards in the first column (structure column) ?? 
        // Actually, structure col usually doesn't have "Cards", it displays the scene.
        // But if we allowed cards there, we should be careful.
        // For now, let's assume cards are only in other columns.

        project.plotGrid.cards = project.plotGrid.cards.filter(c => c.rowId !== rowId);
        saveProject();
    }
};

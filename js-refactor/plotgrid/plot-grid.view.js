/**
 * [MVVM : Plot Grid View]
 * DOM Rendering for the Plot Grid.
 */

const PlotGridUI = {
    activeModalCardId: null,
    activeModalSceneId: null,
    draggedCardId: null,

    /**
     * Helper to rerender the Plot Grid ONLY if it's currently visible.
     * Also refreshes the sidebar if it's open.
     */
    conditionalRender: function () {
        const isPlotGridView = (typeof currentView !== 'undefined' && (currentView === 'plotgrid' || currentView === 'plot-grid' || currentView === 'plot'));
        const isSplitPlotGrid = (typeof splitViewActive !== 'undefined' && splitViewActive &&
            (splitViewState.left.view === 'plotgrid' || splitViewState.left.view === 'plot' ||
                splitViewState.right.view === 'plotgrid' || splitViewState.right.view === 'plot'));

        if (isPlotGridView || isSplitPlotGrid) {
            this.render();
        }

        // Always refresh sidebar if it's open
        const sidebar = document.getElementById('sidebarPlot');
        if (sidebar && !sidebar.classList.contains('hidden')) {
            this.renderSidebar(typeof currentSceneId !== 'undefined' ? currentSceneId : null);
        }
    },

    render: function () {
        const container = document.getElementById('editorView');
        if (!container) return;

        PlotGridViewModel.init();
        const data = PlotGridViewModel.getGridData();

        // Ensure we always have at least some columns/rows for the "Ghost" effect
        const ghostColumnCount = Math.max(data.columns.length + 5, 10);

        container.innerHTML = `
            <div class="plot-grid-container">
                <style>
                    .plot-grid-container {
                        display: flex;
                        flex-direction: column;
                        height: 100%;
                        background: #d4d4d4;
                        overflow: hidden;
                        position: relative;
                    }
                    .plot-grid-toolbar {
                        padding: 10px 20px;
                        background: #f0f0f0;
                        display: flex;
                        gap: 15px;
                        border-bottom: 1px solid #ccc;
                        align-items: center;
                    }
                    .plot-grid-wrapper {
                        flex: 1;
                        overflow: auto;
                        display: grid;
                        grid-template-columns: 30px 200px repeat(${ghostColumnCount - 1}, 180px); 
                        padding: 20px 40px;
                        gap: 20px 30px; /* Dabble spacing */
                    }
                    
                    /* Headers */
                    .pg-header-cell {
                        background: transparent;
                        padding: 10px;
                        font-size: 1.1rem;
                        font-weight: bolder;
                        color: #666;
                        text-align: center;
                        position: sticky;
                        top: 0;
                        z-index: 10;
                    }
                    .pg-col-header-container {
                        display: flex;
                        align-items: center;
                        gap: 5px;
                        justify-content: center;
                    }
                    .pg-header-input {
                        background: transparent;
                        border: none;
                        border-bottom: 1px solid transparent;
                        color: inherit;
                        text-align: center;
                        width: 100%;
                        font-family: inherit;
                        font-size: 1.1rem;
                        font-weight: bolder;
                    }
                    .pg-header-input:hover, .pg-header-input:focus {
                        border-bottom-color: #aaa;
                        outline: none;
                    }
                    .pg-col-delete-btn {
                        opacity: 0;
                        cursor: pointer;
                        color: #ccc;
                        transition: opacity 0.2s, color 0.2s;
                        font-size: 0.8rem;
                        display: flex;
                        align-items: center;
                    }
                    .pg-header-cell:hover .pg-col-delete-btn {
                        opacity: 1;
                    }
                    .pg-col-delete-btn:hover {
                        color: #e74c3c;
                    }
                    .pg-gutter-cell {
                        width: 30px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                    }

                    /* Cards */
                    .pg-cell {
                        min-height: 110px;
                        position: relative;
                    }
                    .dabble-chapter-label {
                        font-size: 0.7rem;
                        font-weight: bold;
                        color: #333;
                        background: #fff;
                        border: 1px solid #ccc;
                        /* border-bottom: none; */
                        padding: 3px 10px;
                        display: inline-block;
                        border-radius: 4px;
                        margin-bottom: -1px;
                        position: absolute;
                        top: -25px;
                        left: -50px;
                    }

                    .pg-card {
                        background: #fff;
                        border: 1px solid #ccc;
                        border-radius: 2px;
                        padding: 12px;
                        height: 90px; /* Fixed height for all cards */
                        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        cursor: pointer;
                        display: flex;
                        flex-direction: column;
                        justify-content: flex-start;
                        text-align: left;
                        font-size: 0.85rem;
                        color: #444;
                        position: relative;
                        transition: transform 0.2s, box-shadow 0.2s;
                        overflow: hidden;
                    }
                    .pg-card:hover {
                        box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                        transform: translateY(-2px);
                    }
                    .pg-card.structure-card {
                        font-style: italic;
                        color: #777;
                        border-top: 5px solid #f39c12;
                    }
                    .pg-card-title {
                        font-weight: bold;
                        margin-bottom: 4px;
                        padding-right: 15px; /* Space for X */
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    .pg-card-delete {
                        position: absolute;
                        top: 5px;
                        right: 5px;
                        width: 16px;
                        height: 16px;
                        background: rgba(0,0,0,0.05);
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 10px;
                        color: #999;
                        opacity: 0;
                        transition: opacity 0.2s, background 0.2s;
                        cursor: pointer;
                        z-index: 5;
                    }
                    .pg-card:hover .pg-card-delete {
                        opacity: 1;
                    }
                    .pg-card-delete:hover {
                        background: #e74c3c;
                        color: #fff;
                    }
                    .pg-card-content {
                        font-size: 0.8rem;
                        color: #888;
                        display: -webkit-box;
                        -webkit-line-clamp: 2;
                        -webkit-box-orient: vertical;
                        overflow: hidden;
                    }
                    
                    .pg-add-btn:hover { color: #666; }
                    
                    /* Cell addition button - BOXED STYLE */
                    .pg-cell.ghost { background: transparent; }
                    .pg-add-btn {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 18px;
                        height: 18px;
                        border: 1px solid #ccc;
                        border-radius: 2px;
                        background: #fff;
                        color: #999;
                        font-size: 14px;
                        cursor: pointer;
                        opacity: 0;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        z-index: 2;
                    }
                    .pg-cell:hover .pg-add-btn { opacity: 1; }
                    .pg-add-btn:hover {
                        border-color: #999;
                        color: #444;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    }

                    /* Row Insertion Handle - GUTTER STYLE */
                    .pg-row-divider {
                        grid-column: 1; /* Only in gutter */
                        width: 30px;
                        height: 100%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: relative;
                    }
                    .pg-row-insert-btn {
                        width: 18px;
                        height: 18px;
                        background: #fff;
                        border: 1px solid #ccc;
                        border-radius: 2px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #999;
                        cursor: pointer;
                        opacity: 0;
                        transition: all 0.2s;
                        font-size: 14px;
                        font-weight: bold;
                        z-index: 21;
                    }
                    .pg-gutter-cell:hover .pg-row-insert-btn,
                    .pg-row-divider:hover .pg-row-insert-btn {
                        opacity: 1;
                    }
                    .pg-row-insert-btn:hover {
                        border-color: #999;
                        color: #444;
                        transform: scale(1.1);
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    }

                    /* Scene Ghost */
                    .pg-scene-ghost {
                        border: 2px dashed #ccc !important;
                        background: rgba(255,255,255,0.5) !important;
                        justify-content: center !important;
                        align-items: center !important;
                        color: #bbb !important;
                        font-style: italic;
                    }

                    /* MODAL Dabble Style */

                    /* MODAL Dabble Style */
                    #pgModalOverlay {
                        position: fixed;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: rgba(0,0,0,0.4);
                        z-index: 1000;
                        display: none;
                        align-items: center;
                        justify-content: center;
                        backdrop-filter: blur(2px);
                    }
                    #pgModal {
                        background: #fff;
                        width: 500px;
                        height: 600px;
                        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                        display: flex;
                        flex-direction: column;
                        padding: 40px;
                        border-radius: 4px;
                        position: relative;
                        transform: scale(0.5);
                        opacity: 0;
                        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                    }
                    #pgModal.open {
                        transform: scale(1);
                        opacity: 1;
                    }
                    .pg-modal-title {
                        font-size: 1.5rem;
                        font-weight: bold;
                        border: none;
                        border-bottom: 2px solid #f39c12;
                        outline: none;
                        width: 100%;
                        margin-bottom: 20px;
                        background: transparent;
                        line-height: 1.2;
                    }
                    .pg-modal-content {
                        flex: 1;
                        border: none;
                        outline: none;
                        width: 100%;
                        resize: none;
                        background: transparent;
                        font-family: inherit;
                        font-size: 1rem;
                    }
                    .pg-modal-footer {
                        display: flex;
                        justify-content: flex-end;
                        padding-top: 10px;
                        gap: 10px;
                    }
                    .pg-modal-close {
                        position: absolute;
                        top: 10px; right: 10px;
                        cursor: pointer;
                        font-size: 24px;
                        color: #999;
                    }
                </style>

                <div class="plot-grid-toolbar">
                    <h2 style="margin: 0; font-size: 1.2rem; color: #444; flex: 1;">Grille d'intrigue pour ${project.title || 'Livre sans titre'}</h2>
                    <button class="btn btn-secondary" onclick="renderPlotGridView()">🔄 Rafraîchir</button>
                    ${typeof lucide !== 'undefined' ? '<i data-lucide="help-circle" title="Faites glisser les cartes (col 2+); Cliquez pour éditer; Les scènes éditent le résumé."></i>' : ''}
                </div>

                <div class="plot-grid-wrapper" id="pgWrapper">
                    ${this.generateGridHTML(data, ghostColumnCount)}
                </div>

                <div id="pgModalOverlay" onclick="PlotGridUI.closeCardModal(event)">
                    <div id="pgModal" onclick="event.stopPropagation()">
                        <span class="pg-modal-close" onclick="PlotGridUI.closeCardModal()">×</span>
                        <input type="text" id="pgModalTitleInput" class="pg-modal-title" placeholder="Titre">
                        <textarea id="pgModalContentInput" class="pg-modal-content" placeholder="Zone d'écriture..."></textarea>
                        <div class="pg-modal-footer">
                            <button id="pgModalDeleteBtn" class="btn btn-danger btn-sm" style="display:none;" onclick="PlotGridUI.deleteActiveCard()">Supprimer la Carte</button>
                            <button class="btn btn-primary btn-sm" onclick="PlotGridUI.closeCardModal(null, true)">Enregistrer & Fermer</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    /**
     * Ensures the plot modal HTML exists in the DOM.
     * Needed when opening cards from the sidebar outside the Plot Grid view.
     */
    ensureModalExists: function () {
        if (document.getElementById('pgModalOverlay')) return;

        const modalHTML = `
            <div id="pgModalOverlay" onclick="PlotGridUI.closeCardModal(event)">
                <div id="pgModal" onclick="event.stopPropagation()">
                    <span class="pg-modal-close" onclick="PlotGridUI.closeCardModal()">×</span>
                    <input type="text" id="pgModalTitleInput" class="pg-modal-title" placeholder="Titre">
                    <textarea id="pgModalContentInput" class="pg-modal-content" placeholder="Zone d'écriture..."></textarea>
                    <div class="pg-modal-footer">
                        <button id="pgModalDeleteBtn" class="btn btn-danger btn-sm" style="display:none;" onclick="PlotGridUI.deleteActiveCard()">Supprimer la Carte</button>
                        <button class="btn btn-primary btn-sm" onclick="PlotGridUI.closeCardModal(null, true)">Enregistrer & Fermer</button>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Inject styles if they don't exist
        if (!document.getElementById('pgModalStyles')) {
            const style = document.createElement('style');
            style.id = 'pgModalStyles';
            style.textContent = `
                #pgModalOverlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.4);
                    z-index: 10000;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(2px);
                }
                #pgModal {
                    background: #fff;
                    width: 500px;
                    max-height: 90vh;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                    display: flex;
                    flex-direction: column;
                    padding: 40px;
                    border-radius: 4px;
                    position: relative;
                    transform: scale(0.5);
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                #pgModal.open {
                    transform: scale(1);
                    opacity: 1;
                }
                .pg-modal-title {
                    font-size: 1.5rem;
                    font-weight: bold;
                    border: none;
                    border-bottom: 2px solid #f39c12;
                    outline: none;
                    width: 100%;
                    margin-bottom: 20px;
                    background: transparent;
                    line-height: 1.2;
                    color: #333;
                }
                .pg-modal-content {
                    flex: 1;
                    border: none;
                    outline: none;
                    width: 100%;
                    min-height: 300px;
                    resize: none;
                    background: transparent;
                    font-family: inherit;
                    font-size: 1rem;
                    color: #444;
                }
                .pg-modal-footer {
                    display: flex;
                    justify-content: flex-end;
                    padding-top: 20px;
                    gap: 10px;
                }
                .pg-modal-close {
                    position: absolute;
                    top: 10px; right: 10px;
                    cursor: pointer;
                    font-size: 24px;
                    color: #999;
                    line-height: 1;
                }
            `;
            document.head.appendChild(style);
        }
    },

    generateGridHTML: function (data, ghostColumnCount) {
        let html = '';

        // Headers
        html += `<div class="pg-header-cell pg-gutter-cell"></div>`;
        for (let i = 0; i < ghostColumnCount; i++) {
            const col = data.columns[i];
            let content = '';
            if (col) {
                const title = col.type === 'structure' ? 'Scènes' : col.title;
                const editable = col.type !== 'structure';
                content = `
                    <div class="pg-col-header-container">
                        ${editable ? `<input class="pg-header-input" value="${title}" onblur="PlotGridUI.updateColTitle('${col.id}', this.value)">` : `<span>${title}</span>`}
                        ${editable ? `<span class="pg-col-delete-btn" onclick="PlotGridUI.deleteColumn('${col.id}')" title="Supprimer la ligne d'intrigue"><i data-lucide="trash-2"></i></span>` : ''}
                    </div>
                `;
            } else {
                content = `
                    <div class="pg-col-header-container">
                        <span style="color: #bbb; font-style: italic;">Ligne sans titre</span>
                    </div>
                `;
            }
            html += `<div class="pg-header-cell ${col?.type === 'structure' ? 'structure' : ''}">${content}</div>`;
        }

        // Rows
        data.rows.forEach((row, rIdx) => {
            // Column 0 : Gutter
            html += `
                <div class="pg-gutter-cell">
                    <div class="pg-row-insert-btn" style="position: absolute; top: -10px;" onclick="PlotGridUI.insertRowBefore('${row.id}')" title="Insérer une ligne au-dessus">+</div>
                    ${rIdx === data.rows.length - 1 ? `<div class="pg-row-insert-btn" style="position: absolute; bottom: -10px;" onclick="PlotGridUI.insertRowAfter('${row.id}')" title="Insérer une ligne en dessous">+</div>` : ''}
                </div>
            `;

            for (let i = 0; i < ghostColumnCount; i++) {
                const col = data.columns[i];
                if (i === 0) {
                    // STRUCTURE Column
                    if (row.type === 'structure') {
                        html += `
                            <div class="pg-cell" ondragover="event.preventDefault()">
                                ${row.isFirstInChapter ? `<div class="dabble-chapter-label">${row.parentChapterTitle}</div>` : ''}
                                <div class="pg-card structure-card" onclick="PlotGridUI.openSceneModal('${row.structureId}', this)">
                                    <div class="pg-card-title">${row.title}</div>
                                    <div class="pg-card-content">${row.synopsis || "Pas de résumé."}</div>
                                </div>
                            </div>
                        `;
                    } else {
                        // Custom Row Structural Column -> GHOST SCENE
                        html += `
                            <div class="pg-cell">
                                <div class="pg-card structure-card pg-scene-ghost" onclick="PlotGridUI.createSceneFromRow('${row.id}')">
                                    <span class="pg-card-delete" onclick="event.stopPropagation(); PlotGridUI.deleteCustomRow('${row.id}')" title="Supprimer la ligne">×</span>
                                    <div style="font-size: 18px; margin-bottom: 5px;">+</div>
                                    <div style="font-size: 0.8rem;">Scène sans titre</div>
                                </div>
                            </div>
                        `;
                    }
                } else {
                    // DATA or GHOST
                    const cellCards = col ? data.cards.filter(c => c.rowId === row.id && c.colId === col.id) : [];
                    html += `
                        <div class="pg-cell ${!col ? 'ghost' : ''}" 
                             ondragover="PlotGridUI.handleDragOver(event)" 
                             ondragleave="PlotGridUI.handleDragLeave(event)"
                             ondrop="PlotGridUI.handleDrop(event, '${row.id}', ${i})">
                            ${cellCards.map(card => `
                                <div class="pg-card" 
                                    draggable="true" 
                                    ondragstart="PlotGridUI.handleDragStart(event, '${card.id}')"
                                    onclick="PlotGridUI.openCardModal('${card.id}', this)">
                                    <span class="pg-card-delete" onclick="event.stopPropagation(); PlotGridUI.deleteCardQuickly('${card.id}')" title="Supprimer la carte">×</span>
                                    <div class="pg-card-title">${card.title}</div>
                                    <div class="pg-card-content">${card.content || ""}</div>
                                </div>
                            `).join('')}
                            ${cellCards.length === 0 ? `<button class="pg-add-btn" onclick="PlotGridUI.addCardAt('${row.id}', ${i})">+</button>` : ''}
                        </div>
                    `;
                }
            }
        });

        return html;
    },

    // --- Actions ---

    updateColTitle: function (colId, newTitle) {
        if (PlotGridViewModel.updateColumnTitle(colId, newTitle)) {
            this.conditionalRender();
        }
    },

    addCardAt: function (rowId, colIndex) {
        // Will create columns if necessary thanks to ViewModel update
        const title = "Sans titre";
        const card = PlotGridViewModel.addCard(rowId, colIndex, title, "");
        this.conditionalRender(); // Rerender
        // Optionnal: open modal immediately
        this.openCardModal(card.id);
    },

    insertRowBefore: function (rowId) {
        const rows = PlotGridViewModel.getGridData().rows;
        const idx = rows.findIndex(r => r.id === rowId);
        if (idx === -1) return;

        let newOrder;
        if (idx === 0) {
            newOrder = rows[0].order - 10;
        } else {
            newOrder = (rows[idx - 1].order + rows[idx].order) / 2;
        }

        const newRow = PlotGridModel.createRow({
            title: 'Nouvelle ligne',
            type: 'custom',
            order: newOrder
        });
        PlotGridRepository.addCustomRow(newRow);
        this.conditionalRender();
    },

    insertRowAfter: function (rowId) {
        PlotGridViewModel.insertRowAfter(rowId);
        this.conditionalRender();
    },

    createSceneFromRow: function (rowId) {
        if (PlotGridViewModel.convertRowToScene(rowId)) {
            this.conditionalRender();
        }
    },

    deleteCustomRow: function (rowId) {
        if (PlotGridViewModel.deleteRow(rowId).action === 'deleted') {
            this.conditionalRender();
        }
    },

    openCardModal: function (cardId, element) {
        const card = PlotGridViewModel.getGridData().cards.find(c => c.id === cardId);
        if (!card) return;

        this.activeModalCardId = cardId;
        this.activeModalSceneId = null;
        this.showModal(card.title, card.content, element);
    },

    openSceneModal: function (sceneId, element) {
        let foundScene = null;
        project.acts.forEach(a => { a.chapters.forEach(c => { const s = c.scenes.find(sc => sc.id === sceneId); if (s) foundScene = s; }); });
        if (!foundScene) return;

        this.activeModalSceneId = sceneId;
        this.activeModalCardId = null;
        this.showModal(foundScene.title, foundScene.synopsis || "", element);

        // Disable title editing for scenes, they are structural.
        document.getElementById('pgModalTitleInput').readOnly = true;
        document.getElementById('pgModalDeleteBtn').style.display = 'none';
    },

    showModal: function (title, content, element) {
        const overlay = document.getElementById('pgModalOverlay');
        const modal = document.getElementById('pgModal');
        const titleInput = document.getElementById('pgModalTitleInput');
        const contentInput = document.getElementById('pgModalContentInput');
        const delBtn = document.getElementById('pgModalDeleteBtn');

        titleInput.value = title;
        titleInput.readOnly = false;
        contentInput.value = content;
        delBtn.style.display = this.activeModalCardId ? 'block' : 'none';

        if (element) {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            modal.style.transformOrigin = `${centerX}px ${centerY}px`;
        } else {
            modal.style.transformOrigin = 'center center';
        }

        overlay.style.display = "flex";
        setTimeout(() => modal.classList.add('open'), 10);
    },

    closeCardModal: function (event, forceSave = false) {
        if (!forceSave && event && event.target !== document.getElementById('pgModalOverlay') && event.target.className !== 'pg-modal-close') return;

        const modal = document.getElementById('pgModal');
        const overlay = document.getElementById('pgModalOverlay');
        const newTitle = document.getElementById('pgModalTitleInput').value;
        const newContent = document.getElementById('pgModalContentInput').value;

        if (this.activeModalCardId) {
            PlotGridViewModel.updateCard(this.activeModalCardId, { title: newTitle, content: newContent });
        } else if (this.activeModalSceneId) {
            PlotGridViewModel.updateSceneSynopsis(this.activeModalSceneId, newContent);
        }

        modal.classList.remove('open');
        setTimeout(() => {
            overlay.style.display = "none";
            this.activeModalCardId = null;
            this.activeModalSceneId = null;
            this.conditionalRender();
        }, 300);
    },

    deleteActiveCard: function () {
        if (this.activeModalCardId && PlotGridViewModel.deleteCard(this.activeModalCardId)) {
            this.activeModalCardId = null;
            this.closeCardModal(null, true);
        }
    },

    deleteCardQuickly: function (cardId) {
        if (PlotGridViewModel.deleteCard(cardId)) {
            this.conditionalRender();
        }
    },

    deleteColumn: function (colId) {
        if (PlotGridViewModel.deleteColumn(colId)) {
            this.conditionalRender();
        }
    },

    // --- Sidebar Integration ---
    toggleSidebar: function () {
        const sidebar = document.getElementById('sidebarPlot');
        const toolBtn = document.getElementById('toolPlotBtn');
        const sidebarBtn = document.getElementById('sidebarPlotBtn');
        if (!sidebar) return;

        const isHidden = sidebar.classList.toggle('hidden');
        if (!isHidden && currentSceneId) {
            this.renderSidebar(currentSceneId);
            if (toolBtn) toolBtn.classList.add('active');
            if (sidebarBtn) sidebarBtn.classList.add('active');
        } else {
            if (toolBtn) toolBtn.classList.remove('active');
            if (sidebarBtn) sidebarBtn.classList.remove('active');
        }

        // Refresh icons
        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    renderSidebar: function (sceneId) {
        const container = document.getElementById('plotSidebarList');
        const sceneNameEl = document.getElementById('plotSidebarSceneName');
        if (!container) return;

        // Ensure data is synced and initialized
        PlotGridViewModel.init();

        // Ensure modal HTML and styles are available for sidebar interactions
        this.ensureModalExists();

        // Update scene name in header
        const act = project.acts.find(a => a.id === currentActId);
        const chapter = act?.chapters.find(c => c.id === currentChapterId);
        const scene = chapter?.scenes.find(s => s.id == sceneId);
        if (sceneNameEl) {
            sceneNameEl.textContent = scene ? scene.title : 'Aucune scène sélectionnée';
        }

        if (!sceneId) {
            container.innerHTML = '<div class="empty-state">Sélectionnez une scène pour voir son intrigue.</div>';
            return;
        }

        // Map sceneId to PlotGrid rowId
        const rows = PlotGridViewModel.getGridData().rows;
        const structuralRow = rows.find(r => r.type === 'structure' && r.structureId == sceneId);

        if (!structuralRow) {
            container.innerHTML = '<div class="empty-state">Cette scène n’est pas encore synchronisée avec la grille d’intrigue.</div>';
            return;
        }

        const cards = PlotGridViewModel.getCardsByRow(structuralRow.id);
        const columns = PlotGridViewModel.getGridData().columns;

        if (cards.length === 0) {
            container.innerHTML = '<div class="empty-state">Aucun élément d’intrigue lié à cette scène.</div>';
            return;
        }

        container.innerHTML = cards.map(card => {
            const col = columns.find(c => c.id === card.colId);
            const lineTitle = col ? col.title : 'Ligne inconnue';

            return `
                <div class="sidebar-plot-card" onclick="PlotGridUI.openCardModal('${card.id}')">
                    <div class="sidebar-plot-card-line">${lineTitle}</div>
                    <div class="sidebar-plot-card-title">${card.title}</div>
                    <div class="sidebar-plot-card-content">${card.content || ''}</div>
                </div>
            `;
        }).join('');
    },

    // --- Drag & Drop ---
    handleDragStart: function (e, cardId) {
        this.draggedCardId = cardId;
        e.dataTransfer.setData('text/plain', cardId);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => {
            const cards = document.querySelectorAll(`[draggable="true"]`);
            cards.forEach(card => {
                if (card.outerHTML.includes(cardId)) card.style.opacity = '0.4';
            });
        }, 0);
    },

    handleDragOver: function (e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    },

    handleDragLeave: function (e) {
        e.currentTarget.classList.remove('drag-over');
    },

    handleDrop: function (e, rowId, colIndex) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        if (this.draggedCardId) {
            PlotGridViewModel.updateCardPosition(this.draggedCardId, rowId, colIndex);
            this.conditionalRender();
        }
        this.draggedCardId = null;
    }
};

function renderPlotGridView() {
    console.log('=== RENDER PLOT GRID VIEW (DABBLE MODE) ===');
    PlotGridUI.render();
}

// --- Menu Integration ---

function initPlotGridMenu() {
    // 1. Check if button already exists
    if (document.getElementById('header-tab-plotgrid')) return;

    // 2. Find the target group (Writing group)
    const writingGroup = document.querySelector('.nav-group');
    if (!writingGroup) return;

    // 3. Create the desktop button
    const btn = document.createElement('button');
    btn.id = 'header-tab-plotgrid';
    btn.className = 'nav-btn';

    btn.innerHTML = `
        <span class="nav-btn-icon"><i data-lucide="layout-grid"></i></span>
        <span class="nav-btn-text">Plot Grid</span>
    `;
    btn.onclick = () => switchView('plotgrid');

    // 4. Insert it after the 'Intrigue' button if possible
    // Note: There's a duplicate ID header-tab-plot in the HTML,
    // but getElementById usually returns the first one (Intrigue).
    const plotBtn = document.getElementById('header-tab-plot');
    if (plotBtn) {
        plotBtn.parentNode.insertBefore(btn, plotBtn.nextSibling);
    } else {
        writingGroup.appendChild(btn);
    }

    // 5. Add to mobile menu as well
    const mobileNavPlotBtn = document.querySelector('.mobile-nav-item[data-view="plot"]');
    if (mobileNavPlotBtn && !document.querySelector('.mobile-nav-item[data-view="plotgrid"]')) {
        const mobileBtn = document.createElement('button');
        mobileBtn.className = 'mobile-nav-item';
        mobileBtn.setAttribute('data-view', 'plotgrid');
        mobileBtn.onclick = () => switchViewMobile('plotgrid');
        mobileBtn.innerHTML = `
            <span class="mobile-nav-item-icon"><i data-lucide="layout-grid"></i></span>
            <span>Plot Grid</span>
        `;
        mobileNavPlotBtn.parentNode.insertBefore(mobileBtn, mobileNavPlotBtn.nextSibling);
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// --- Initialization ---

// Initialize Menu integration on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlotGridMenu);
} else {
    initPlotGridMenu();
}

// Hook into the global switchView if possible, or ensure it's handled.
// The default switchView in 00.app.view.js handles 'plot' but not 'plotgrid'.
// We monkey-patch renderViewContent to add our new view case.

if (typeof renderViewContent === 'function') {
    const originalRender = renderViewContent;
    renderViewContent = function (view, containerId) {
        if (view === 'plotgrid' || view === 'plot-grid') {
            renderPlotGridView();
        } else {
            originalRender(view, containerId);
        }
    };
} else {
    // If renderViewContent is not yet defined, wait for it or use an alternative hook
    window.addEventListener('load', () => {
        if (typeof renderViewContent === 'function') {
            const originalRender = renderViewContent;
            renderViewContent = function (view, containerId) {
                if (view === 'plotgrid' || view === 'plot-grid') {
                    renderPlotGridView();
                } else {
                    originalRender(view, containerId);
                }
            };
        }
    });
}

// Fallback for switchView which updates button states
if (typeof switchView === 'function') {
    const originalSwitchView = switchView;
    switchView = function (view) {
        originalSwitchView(view);

        // Handle button active state if it's our view
        if (view === 'plotgrid') {
            document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
            const pgBtn = document.getElementById('header-tab-plotgrid');
            if (pgBtn) pgBtn.classList.add('active');
        }
    };
}

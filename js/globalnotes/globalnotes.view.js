/**
 * [MVVM : globalnotes View]
 * Main entry point for the globalnotes module UI.
 */

const GlobalNotesView = {
    /**
     * Main render function
     * @param {HTMLElement} container 
     */
    render: function (container) {
        this.container = container || document.getElementById('editorView');
        if (!this.container) return;

        let activeBoard = GlobalNotesViewModel.getActiveBoard();
        if (!activeBoard) {
            GlobalNotesViewModel.init();
            activeBoard = GlobalNotesViewModel.getActiveBoard();
        }

        this.container.innerHTML = `
            <div class="globalnotes-container">
                ${this.renderHeader()}
                <div class="globalnotes-canvas-wrapper" style="flex: 1; position: relative; overflow: hidden; background: #f8fafc;">
                    ${this.renderToolbar()}
                    <div id="globalnotesCanvas" class="globalnotes-canvas" style="width:100%; height:100%;">
                        <div id="globalnotesBoardContent" class="globalnotes-board-content">
                            <svg id="globalnotesConnectionsLayer" class="connections-layer"></svg>
                            <div id="globalnotesItemsLayer" class="items-layer"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.renderContent();
        this.setupEvents();

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    renderHeader: function () {
        const board = GlobalNotesViewModel.getActiveBoard();
        if (!board) return '<div class="globalnotes-header"></div>';

        const hierarchy = this.getBoardHierarchy(board);

        return `
            <div class="globalnotes-header">
                <div class="globalnotes-breadcrumb">
                    <div class="breadcrumb-item" onclick="GlobalNotesViewModel.setActiveBoard(null)">
                        <i data-lucide="home" style="width:16px; height:16px;"></i>
                        <span>${Localization.t('globalnotes.breadcrumb.root') || 'GlobalNotes'}</span>
                    </div>
                    
                    ${hierarchy.map((b, idx) => `
                        <i data-lucide="chevron-right" class="breadcrumb-separator" style="width:14px; height:14px;"></i>
                        <div class="breadcrumb-item ${idx === hierarchy.length - 1 ? 'active' : ''}" 
                             onclick="GlobalNotesViewModel.setActiveBoard('${b.id}')">
                            ${b.title}
                        </div>
                    `).join('')}
                </div>
                <div class="globalnotes-header-actions">
                    <div class="btn-go-up" onclick="GlobalNotesViewModel.goUp()" title="${Localization.t('globalnotes.action.go_up') || 'Go Up'}">
                         <i data-lucide="corner-left-up"></i>
                    </div>
                </div>
            </div>
        `;
    },

    renderToolbar: function () {
        return `
            <div class="globalnotes-toolbar vertical">
                <div class="tool-item" onclick="GlobalNotesView.addNewItem('board')" title="${Localization.t('globalnotes.tool.board')}">
                    <i data-lucide="layout-grid"></i>
                    <span class="tool-label">Board</span>
                </div>
                <div class="tool-item" onclick="GlobalNotesView.addNewItem('column')" title="${Localization.t('globalnotes.tool.column')}">
                    <i data-lucide="columns"></i>
                    <span class="tool-label">Column</span>
                </div>
                <div class="tool-item" onclick="GlobalNotesView.addNewItem('note')" title="${Localization.t('globalnotes.tool.note')}">
                    <i data-lucide="sticky-note"></i>
                    <span class="tool-label">Note</span>
                </div>
                <div class="tool-item" onclick="GlobalNotesView.addNewItem('link')" title="${Localization.t('globalnotes.tool.link')}">
                    <i data-lucide="link"></i>
                    <span class="tool-label">Link</span>
                </div>
                <div class="tool-item" onclick="GlobalNotesView.addNewItem('checklist')" title="To-do">
                    <i data-lucide="list-checks"></i>
                    <span class="tool-label">To-do</span>
                </div>
                <div class="tool-item" onclick="GlobalNotesView.addNewItem('line')" title="Line">
                    <i data-lucide="minus" style="transform: rotate(-45deg);"></i>
                    <span class="tool-label">Line</span>
                </div>
                <div class="tool-item" onclick="GlobalNotesView.addNewItem('comment')" title="Comment">
                    <i data-lucide="message-square"></i>
                    <span class="tool-label">Comment</span>
                </div>
                <div class="tool-item" onclick="GlobalNotesView.addNewItem('table')" title="Table">
                    <i data-lucide="table"></i>
                    <span class="tool-label">Table</span>
                </div>
                
                <div class="tool-item more-tools" onclick="GlobalNotesHandlers.toggleMoreMenu(event)" title="More">
                    <i data-lucide="more-horizontal"></i>
                </div>

                <div class="tool-divider"></div>

                <div class="tool-item" onclick="GlobalNotesView.addNewItem('image')" title="${Localization.t('globalnotes.tool.image')}">
                    <i data-lucide="image"></i>
                    <span class="tool-label">Image</span>
                </div>
                <div class="tool-item" onclick="GlobalNotesView.addNewItem('file')" title="${Localization.t('globalnotes.tool.file')}">
                    <i data-lucide="upload"></i>
                    <span class="tool-label">Upload</span>
                </div>
                <div class="tool-item" onclick="GlobalNotesView.addNewItem('sketch')" title="Draw">
                    <i data-lucide="pen"></i>
                    <span class="tool-label">Draw</span>
                </div>

                <div class="spacer"></div>

                <div class="tool-item delete" onclick="GlobalNotesViewModel.deleteSelectedItem()" title="${Localization.t('globalnotes.tool.delete')}">
                    <i data-lucide="trash-2"></i>
                </div>

                <div id="globalnotesMoreMenu" class="more-tools-popup hidden">
                    <div class="more-grid">
                        <div class="more-item" onclick="GlobalNotesView.addNewItem('sketch')">
                            <i data-lucide="brush" class="icon-sketch"></i><span>Sketch</span>
                        </div>
                        <div class="more-item" onclick="GlobalNotesView.addNewItem('color')">
                            <i data-lucide="palette" class="icon-color"></i><span>Color</span>
                        </div>
                        <div class="more-item" onclick="GlobalNotesView.addNewItem('document')">
                            <i data-lucide="file-text" class="icon-doc"></i><span>Document</span>
                        </div>
                        <div class="more-item" onclick="GlobalNotesView.addNewItem('audio')">
                            <i data-lucide="mic" class="icon-audio"></i><span>Audio</span>
                        </div>
                        <div class="more-item" onclick="GlobalNotesView.addNewItem('map')">
                            <i data-lucide="map-pin" class="icon-map"></i><span>Map</span>
                        </div>
                        <div class="more-item" onclick="GlobalNotesView.addNewItem('video')">
                            <i data-lucide="video" class="icon-video"></i><span>Video</span>
                        </div>
                         <div class="more-item" onclick="GlobalNotesView.addNewItem('heading')">
                            <i data-lucide="type" class="icon-heading"></i><span>Heading</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderContent: function () {
        const boardContent = document.getElementById('globalnotesBoardContent');
        if (!boardContent) return;

        GlobalNotesViewModel.applyTransform();

        const items = GlobalNotesViewModel.getItemsInActiveBoard();
        const itemsLayer = document.getElementById('globalnotesItemsLayer');

        if (items.length === 0) {
            itemsLayer.innerHTML = `
                <div class="empty-board-message">
                    <i data-lucide="layout" style="width: 48px; height: 48px; margin-bottom: 1rem;"></i>
                    <div>${Localization.t('globalnotes.empty.board') || 'Click on the toolbar to add your first note'}</div>
                </div>
            `;
        } else {
            itemsLayer.innerHTML = items.map(item => GlobalNotesItemView.render(item)).join('');
        }

        this.renderConnections();

        if (typeof lucide !== 'undefined') lucide.createIcons({ root: boardContent });

        // Init sketches
        items.forEach(item => {
            if (item.type === 'sketch') {
                const canvas = document.querySelector(`.globalnotes-item[data-id="${item.id}"] canvas`);
                if (canvas) GlobalNotesHandlers.initSketch(item.id, canvas);
            }
        });

        this.updateSelection();
    },

    renderConnections: function () {
        const svg = document.getElementById('globalnotesConnectionsLayer');
        if (!svg) return;

        const board = GlobalNotesViewModel.getActiveBoard();
        if (!board || !board.connections) {
            svg.innerHTML = '';
            return;
        }

        const items = GlobalNotesRepository.getItems();
        let pathsHtml = '';

        board.connections.forEach(conn => {
            const fromItem = items.find(i => i.id == conn.from);
            const toItem = items.find(i => i.id == conn.to);

            if (fromItem && toItem) {
                // Calculate centers
                const x1 = fromItem.x + fromItem.width / 2;
                const y1 = fromItem.y + (fromItem.height === 'auto' ? 50 : fromItem.height / 2);
                const x2 = toItem.x + toItem.width / 2;
                const y2 = toItem.y + (toItem.height === 'auto' ? 50 : toItem.height / 2);

                // Bezier path
                const dx = Math.abs(x1 - x2);
                const dy = Math.abs(y1 - y2);
                const offset = Math.min(dx, dy, 100);

                const pathData = `M ${x1} ${y1} C ${x1 + (x1 < x2 ? offset : -offset)} ${y1}, ${x2 + (x2 < x1 ? offset : -offset)} ${y2}, ${x2} ${y2}`;

                pathsHtml += `
                    <!-- Hit area for better click detection -->
                    <path d="${pathData}" 
                          stroke="transparent" 
                          stroke-width="15" 
                          fill="none" 
                          style="pointer-events: stroke; cursor: pointer;"
                          oncontextmenu="GlobalNotesHandlers.showConnectionContextMenu(event, '${conn.id}')" />
                          
                    <path d="${pathData}" 
                          stroke="${conn.color || '#64748b'}" 
                          stroke-width="${conn.thickness || 2}" 
                          fill="none" 
                          stroke-linecap="round" 
                          class="connection-line"
                          style="pointer-events: none;" />
                `;
            }
        });

        svg.innerHTML = pathsHtml;
    },

    updateSelection: function () {
        const selectedIds = GlobalNotesViewModel.state.selectedItemIds;
        document.querySelectorAll('.globalnotes-item').forEach(el => {
            const id = el.getAttribute('data-id');
            if (selectedIds.includes(id)) {
                el.classList.add('selected');
            } else {
                el.classList.remove('selected');
            }
        });
    },

    addNewItem: function (type) {
        console.log('GlobalNotesView.addNewItem', type);
        const canvas = document.getElementById('globalnotesCanvas');
        if (!canvas) {
            console.error('Cannot find globalnotesCanvas to position item');
            return;
        }

        // Place in viewport center
        const rect = canvas.getBoundingClientRect();
        const centerX = (rect.width / 2 - GlobalNotesViewModel.state.panX) / GlobalNotesViewModel.state.zoom;
        const centerY = (rect.height / 2 - GlobalNotesViewModel.state.panY) / GlobalNotesViewModel.state.zoom;

        const x = centerX - 100;
        const y = centerY - 50;

        console.log('Calculated position relative to pan/zoom:', x, y);

        if (type === 'board') {
            GlobalNotesViewModel.createNewBoard(null, x, y);
        } else if (type === 'line') {
            GlobalNotesViewModel.state.isConnectionMode = true;
            GlobalNotesViewModel.state.connectionStartId = null;
            document.body.style.cursor = 'crosshair';
            alert('Connection Mode Active: Click the starting item, then the ending item.');
        } else {
            GlobalNotesViewModel.addItem(type, x, y);
        }
    },

    getBoardHierarchy: function (board) {
        const hierarchy = [];
        let current = board;
        const allBoards = GlobalNotesRepository.getBoards();

        while (current) {
            hierarchy.unshift(current);
            current = allBoards.find(b => b.id === current.parentId);
        }

        return hierarchy;
    },

    setupEvents: function () {
        // Handlers will be attached here or in a separate file
        if (window.GlobalNotesHandlers) {
            window.GlobalNotesHandlers.init();
        }
    }
};

window.GlobalNotesView = GlobalNotesView;

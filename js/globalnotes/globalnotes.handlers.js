/**
 * [MVVM : globalnotes Handlers]
 * Handles user interactions (drag, resize, selection, navigation).
 */

const GlobalNotesHandlers = {
    dragData: {
        isDragging: false,
        type: null,
        startX: 0,
        startY: 0,
        targetId: null,
        items: [] // { id, initialX, initialY, el }
    },

    // Bound listeners for easy removal
    _bounds: {},

    init: function () {
        console.log('GlobalNotesHandlers.init() - canvas:', !!document.getElementById('globalnotesCanvas'));
        const canvas = document.getElementById('globalnotesCanvas');
        if (!canvas) return;

        // Create bound function proxies if they don't exist
        if (!this._bounds.onCanvasMouseDown) this._bounds.onCanvasMouseDown = this.onCanvasMouseDown.bind(this);
        if (!this._bounds.onWheel) this._bounds.onWheel = this.onWheel.bind(this);
        if (!this._bounds.onMouseMove) this._bounds.onMouseMove = this.onMouseMove.bind(this);
        if (!this._bounds.onMouseUp) this._bounds.onMouseUp = this.onMouseUp.bind(this);
        if (!this._bounds.onContextMenu) this._bounds.onContextMenu = this.onContextMenu.bind(this);

        // Remove old listeners to avoid duplicates
        canvas.removeEventListener('mousedown', this._bounds.onCanvasMouseDown);
        canvas.addEventListener('mousedown', this._bounds.onCanvasMouseDown);

        canvas.removeEventListener('wheel', this._bounds.onWheel);
        canvas.addEventListener('wheel', this._bounds.onWheel, { passive: false });

        canvas.removeEventListener('contextmenu', this._bounds.onContextMenu);
        canvas.addEventListener('contextmenu', this._bounds.onContextMenu);

        if (!this._windowListenersAttached) {
            window.addEventListener('mousemove', this._bounds.onMouseMove);
            window.addEventListener('mouseup', this._bounds.onMouseUp);
            window.addEventListener('click', () => this.hideContextMenu());
            this._windowListenersAttached = true;
            console.log('GlobalNotesHandlers: window listeners attached');
        }

        // Prevent default browser drag on images
        canvas.addEventListener('dragstart', (e) => e.preventDefault());
    },

    showConnectionContextMenu: function (e, connId) {
        e.preventDefault();
        e.stopPropagation();

        const menu = document.createElement('div');
        menu.className = 'globalnotes-context-menu';
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';

        menu.innerHTML = `
            <div class="context-menu-title">Line Style</div>
            <div class="context-color-grid">
                <div class="color-dot" style="background:#64748b" onclick="GlobalNotesHandlers.setConnectionColor('${connId}', '#64748b')"></div>
                <div class="color-dot" style="background:#ef4444" onclick="GlobalNotesHandlers.setConnectionColor('${connId}', '#ef4444')"></div>
                <div class="color-dot" style="background:#3b82f6" onclick="GlobalNotesHandlers.setConnectionColor('${connId}', '#3b82f6')"></div>
                <div class="color-dot" style="background:#10b981" onclick="GlobalNotesHandlers.setConnectionColor('${connId}', '#10b981')"></div>
                <div class="color-dot" style="background:#f59e0b" onclick="GlobalNotesHandlers.setConnectionColor('${connId}', '#f59e0b')"></div>
                <div class="color-dot" style="background:#8b5cf6" onclick="GlobalNotesHandlers.setConnectionColor('${connId}', '#8b5cf6')"></div>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-group horizontal">
                <div class="context-menu-btn" onclick="GlobalNotesHandlers.setConnectionThickness('${connId}', 1)">Thin</div>
                <div class="context-menu-btn" onclick="GlobalNotesHandlers.setConnectionThickness('${connId}', 3)">Medium</div>
                <div class="context-menu-btn" onclick="GlobalNotesHandlers.setConnectionThickness('${connId}', 6)">Wide</div>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item delete" onclick="GlobalNotesHandlers.deleteConnection('${connId}')">
                <i data-lucide="trash-2"></i> Delete Line
            </div>
        `;

        document.body.appendChild(menu);
        if (typeof lucide !== 'undefined') lucide.createIcons({ root: menu });

        const closeMenu = () => {
            if (menu) menu.remove();
            document.removeEventListener('mousedown', closeMenu);
        };
        setTimeout(() => document.addEventListener('mousedown', closeMenu), 10);
    },

    deleteConnection: function (connId) {
        if (confirm('Delete this connection?')) {
            GlobalNotesViewModel.deleteConnection(connId);
        }
    },

    setConnectionColor: function (connId, color) {
        GlobalNotesViewModel.updateConnection(connId, { color });
    },

    setConnectionThickness: function (connId, thickness) {
        GlobalNotesViewModel.updateConnection(connId, { thickness });
    },

    onContextMenu: function (e) {
        e.preventDefault();
        const itemEl = e.target.closest('.globalnotes-item');
        if (itemEl) {
            const itemId = itemEl.getAttribute('data-id');
            GlobalNotesViewModel.selectItem(itemId);
            this.showContextMenu(e.clientX, e.clientY, itemId);
        }
    },

    showContextMenu: function (x, y, itemId) {
        this.hideContextMenu();
        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        if (!item) return;

        const menu = document.createElement('div');
        menu.id = 'globalnotesContextMenu';
        menu.className = 'globalnotes-context-menu';
        menu.style.left = x + 'px';
        menu.style.top = y + 'px';

        menu.innerHTML = `
            <div class="context-menu-group">
                <div class="context-menu-item" onclick="GlobalNotesHandlers.duplicateItem('${itemId}')">
                    <i data-lucide="copy"></i> Duplicate
                </div>
                <div class="context-menu-item" onclick="GlobalNotesHandlers.toggleLock('${itemId}')">
                    <i data-lucide="${item.config.isLocked ? 'unlock' : 'lock'}"></i> ${item.config.isLocked ? 'Unlock' : 'Lock'}
                </div>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-title">Background Color</div>
            <div class="context-color-grid">
                <div class="color-dot" style="background:#fff9c4" onclick="GlobalNotesHandlers.setItemColor('${itemId}', '#fff9c4')"></div>
                <div class="color-dot" style="background:#e3f2fd" onclick="GlobalNotesHandlers.setItemColor('${itemId}', '#e3f2fd')"></div>
                <div class="color-dot" style="background:#e8f5e9" onclick="GlobalNotesHandlers.setItemColor('${itemId}', '#e8f5e9')"></div>
                <div class="color-dot" style="background:#fce4ec" onclick="GlobalNotesHandlers.setItemColor('${itemId}', '#fce4ec')"></div>
                <div class="color-dot" style="background:#ffffff" onclick="GlobalNotesHandlers.setItemColor('${itemId}', '#ffffff')"></div>
                <div class="color-dot" style="background:#f3e5f5" onclick="GlobalNotesHandlers.setItemColor('${itemId}', '#f3e5f5')"></div>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-title">Border Style</div>
            <div class="context-color-grid">
                <div class="color-dot" style="border:2px solid #000" onclick="GlobalNotesHandlers.setItemBorderColor('${itemId}', '#000000')"></div>
                <div class="color-dot" style="border:2px solid #cbd5e1" onclick="GlobalNotesHandlers.setItemBorderColor('${itemId}', '#cbd5e1')"></div>
                <div class="color-dot" style="border:2px solid #ef4444" onclick="GlobalNotesHandlers.setItemBorderColor('${itemId}', '#ef4444')"></div>
                <div class="color-dot" style="border:2px solid #3b82f6" onclick="GlobalNotesHandlers.setItemBorderColor('${itemId}', '#3b82f6')"></div>
                <div class="color-dot" style="border:2px solid transparent" onclick="GlobalNotesHandlers.setItemBorderColor('${itemId}', 'transparent')"></div>
            </div>
            <div class="context-menu-group horizontal">
                <div class="context-menu-btn" onclick="GlobalNotesHandlers.setItemBorderThickness('${itemId}', 0)">None</div>
                <div class="context-menu-btn" onclick="GlobalNotesHandlers.setItemBorderThickness('${itemId}', 2)">Thin</div>
                <div class="context-menu-btn" onclick="GlobalNotesHandlers.setItemBorderThickness('${itemId}', 5)">Thick</div>
            </div>
            <div class="context-menu-divider"></div>
            <div class="context-menu-item delete" onclick="GlobalNotesViewModel.deleteSelectedItem()">
                <i data-lucide="trash-2"></i> Delete
            </div>
        `;

        document.body.appendChild(menu);
        if (typeof lucide !== 'undefined') lucide.createIcons({ root: menu });
    },

    hideContextMenu: function () {
        const menu = document.getElementById('globalnotesContextMenu');
        if (menu) menu.remove();
    },

    duplicateItem: function (itemId) {
        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        if (item) {
            const newItem = GlobalNotesModel.createItem({
                ...item,
                id: null, // Force new ID
                x: item.x + 20,
                y: item.y + 20
            });
            GlobalNotesRepository.saveItem(newItem);
            GlobalNotesView.renderContent();
        }
    },

    toggleLock: function (itemId) {
        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        if (item) {
            item.config.isLocked = !item.config.isLocked;
            GlobalNotesRepository.saveItem(item);
            GlobalNotesView.renderContent();
        }
    },

    setItemColor: function (itemId, color) {
        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        if (item) {
            item.config.color = color;
            GlobalNotesRepository.saveItem(item);
            GlobalNotesView.renderContent();
        }
    },

    promptImageUrl: function (itemId) {
        const url = prompt('Enter Image URL:');
        if (url) GlobalNotesViewModel.updateItemData(itemId, { url: url });
        GlobalNotesView.renderContent();
    },

    promptVideoUrl: function (itemId) {
        const url = prompt('Enter YouTube Video URL:');
        if (url) GlobalNotesViewModel.updateItemData(itemId, { url: url });
        GlobalNotesView.renderContent();
    },

    promptColorChange: function (itemId) {
        this.openColorPalette(itemId);
    },

    openColorPalette: function (itemId) {
        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        if (!item) return;

        // Clean up any existing palette
        this.hideColorPalette();

        const colors = ColorPaletteModel.colors;
        const picker = document.createElement('div');
        picker.id = 'globalnotesColorPalette';
        picker.className = 'color-picker-dropdown active';

        const itemEl = document.querySelector(`.globalnotes-item[data-id="${itemId}"]`);
        const rect = itemEl.getBoundingClientRect();

        picker.style.left = rect.left + 'px';
        picker.style.top = (rect.bottom + 5) + 'px';
        picker.style.display = 'block';
        picker.style.opacity = '1';
        picker.style.pointerEvents = 'auto';

        let colorsHtml = colors.map(color => `
            <div class="color-swatch" 
                 style="background: ${color}" 
                 onmousedown="event.stopPropagation(); GlobalNotesHandlers.applyItemColor('${itemId}', '${color}')"
                 title="${color}"></div>
        `).join('');

        picker.innerHTML = `
            <div class="color-picker-header">
                <i data-lucide="palette"></i>
                <span>${Localization.t('globalnotes.color_palette') || 'Color Palette'}</span>
            </div>
            <div class="color-grid">
                ${colorsHtml}
            </div>
            <div class="color-input-wrapper">
                <div class="color-manual-input">
                    <input type="color" value="${item.config.color || '#4361ee'}" 
                           oninput="event.stopPropagation(); GlobalNotesHandlers.applyItemColor('${itemId}', this.value)"
                           onmousedown="event.stopPropagation()">
                    <input type="text" value="${item.config.color || '#4361ee'}" 
                           onchange="event.stopPropagation(); GlobalNotesHandlers.applyItemColor('${itemId}', this.value)"
                           onmousedown="event.stopPropagation()">
                </div>
            </div>
        `;

        document.body.appendChild(picker);
        if (typeof lucide !== 'undefined') lucide.createIcons({ root: picker });

        // Close on outside click
        const closePalette = (e) => {
            if (!picker.contains(e.target) && !e.target.closest('.color-preview-circle')) {
                this.hideColorPalette();
                document.removeEventListener('mousedown', closePalette, true);
            }
        };
        setTimeout(() => document.addEventListener('mousedown', closePalette, true), 10);
    },

    hideColorPalette: function () {
        const picker = document.getElementById('globalnotesColorPalette');
        if (picker) picker.remove();
    },

    applyItemColor: function (itemId, color) {
        if (!color.startsWith('#')) color = '#' + color;
        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        if (item) {
            item.config.color = color;
            GlobalNotesRepository.saveItem(item);
            GlobalNotesView.renderContent();
            this.hideColorPalette();
        }
    },

    editMapItem: function (itemId) {
        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        if (!item) return;

        const title = prompt('Map Title:', item.data.title || 'Location');
        if (title === null) return;

        const lat = prompt('Latitude:', item.data.lat || 48.8566);
        if (lat === null) return;

        const lng = prompt('Longitude:', item.data.lng || 2.3522);
        if (lng === null) return;

        GlobalNotesViewModel.updateItemData(itemId, {
            title: title,
            lat: parseFloat(lat),
            lng: parseFloat(lng)
        });
    },

    setItemBorderColor: function (itemId, color) {
        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        if (item) {
            item.config.borderColor = color;
            GlobalNotesRepository.saveItem(item);
            GlobalNotesView.renderContent();
        }
    },

    setItemBorderThickness: function (itemId, thickness) {
        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        if (item) {
            item.config.borderThickness = thickness;
            GlobalNotesRepository.saveItem(item);
            GlobalNotesView.renderContent();
        }
    },

    toggleMoreMenu: function (e) {
        e.stopPropagation();
        const menu = document.getElementById('globalnotesMoreMenu');
        if (menu) {
            menu.classList.toggle('hidden');
        }
    },

    updateTableData: function (itemId, row, col, val) {
        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        if (item && item.data.data) {
            item.data.data[row][col] = val;
            GlobalNotesRepository.saveItem(item);
        }
    },

    openDocument: function (itemId) {
        alert('Opening document editor for ' + itemId);
    },

    renameBoard: function (itemId, newTitle, event) {
        if (event) event.stopPropagation();
        const item = GlobalNotesRepository.getItems().find(i => i.id === itemId);
        if (item && item.type === 'board') {
            // Update the item on the parent board
            GlobalNotesViewModel.updateItemData(itemId, { title: newTitle });
            // Update the actual board name
            const targetBoardId = item.data.targetBoardId;
            const board = GlobalNotesRepository.getBoards().find(b => b.id == targetBoardId);
            if (board) {
                board.title = newTitle;
                GlobalNotesRepository.saveBoard(board);
            }
            GlobalNotesView.renderHeader();
        }
    },

    moveToColumn: function (itemId, columnId) {
        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        if (item) {
            item.columnId = columnId;
            GlobalNotesRepository.saveItem(item);
        }
    },

    removeFromColumn: function (itemId) {
        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        const el = document.querySelector(`.globalnotes-item[data-id="${itemId}"]`);
        if (item && el) {
            // Get current visual position relative to the board content
            const contentRect = document.getElementById('globalnotesBoardContent').getBoundingClientRect();
            const itemRect = el.getBoundingClientRect();
            const zoom = GlobalNotesViewModel.state.zoom;

            item.columnId = null;
            item.x = (itemRect.left - contentRect.left) / zoom;
            item.y = (itemRect.top - contentRect.top) / zoom;

            GlobalNotesRepository.saveItem(item);
        }
    },

    onWheel: function (e) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const zoomSpeed = 0.001;
            const delta = -e.deltaY;
            const factor = Math.pow(1.1, delta / 100);

            const oldZoom = GlobalNotesViewModel.state.zoom;
            const newZoom = oldZoom * factor;

            // To zoom towards mouse, we need to adjust panX/panY but for now let's keep it simple
            GlobalNotesViewModel.setZoom(newZoom);
        }
    },

    onCanvasMouseDown: function (e) {
        if (e.target.id === 'globalnotesCanvas' || e.target.id === 'globalnotesBoardContent') {
            GlobalNotesViewModel.clearSelection();

            // Start canvas panning
            this.dragData = {
                isDragging: true,
                type: 'canvas',
                startX: e.clientX,
                startY: e.clientY,
                initialX: GlobalNotesViewModel.state.panX,
                initialY: GlobalNotesViewModel.state.panY
            };
        }
    },

    onItemMouseDown: function (e, itemId) {
        // Handle Connection Mode
        if (GlobalNotesViewModel.state.isConnectionMode) {
            e.stopPropagation(); // Restored to allow nested items to be selected as sources
            if (!GlobalNotesViewModel.state.connectionStartId) {
                GlobalNotesViewModel.state.connectionStartId = itemId;
                // Highlight the selected item or provide feedback
                const el = document.querySelector(`.globalnotes-item[data-id="${itemId}"]`);
                if (el) el.classList.add('connection-source');
                console.log('Connection start item selected:', itemId);
            } else {
                const startId = GlobalNotesViewModel.state.connectionStartId;
                GlobalNotesViewModel.addConnection(startId, itemId);

                // Reset mode
                GlobalNotesViewModel.state.isConnectionMode = false;
                GlobalNotesViewModel.state.connectionStartId = null;
                document.body.style.cursor = 'default';
                document.querySelectorAll('.connection-source').forEach(el => el.classList.remove('connection-source'));
                console.log('Connection created between', startId, 'and', itemId);
            }
            return;
        }

        // If clicking on an interactive element, don't start dragging
        const interactiveSelectors = 'button, input, select, textarea, [contenteditable="true"], .color-preview-circle, .checklist-text, .check-box, .item-table-container td, .map-info';
        if (e.target.closest(interactiveSelectors)) {
            return;
        }

        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        if (item && item.config.isLocked) return;

        console.log('onItemMouseDown', itemId);
        e.stopPropagation(); // Restored to prevent parent column from stealing selection

        const isMulti = e.shiftKey || e.ctrlKey || e.metaKey;
        GlobalNotesViewModel.selectItem(itemId, isMulti);

        const itemsToDrag = [];
        GlobalNotesViewModel.state.selectedItemIds.forEach(id => {
            const el = document.querySelector(`.globalnotes-item[data-id="${id}"]`);
            if (el) {
                // Determine if we should drag this item (don't drag child if parent is also being dragged)
                // Actually, for simplicity, we drag anything selected. 
                // BUT if it's in a column, it should only move if its parent column is NOT in selection
                const itm = GlobalNotesRepository.getItems().find(i => i.id == id);
                if (itm && itm.columnId && GlobalNotesViewModel.state.selectedItemIds.includes(itm.columnId)) {
                    // Parent is moving, don't move child explicitly
                    return;
                }

                itemsToDrag.push({
                    id: id,
                    el: el,
                    initialX: parseInt(el.style.left) || 0,
                    initialY: parseInt(el.style.top) || 0
                });
            }
        });

        this.dragData = {
            isDragging: true,
            hasMoved: false,
            type: 'item',
            startX: e.clientX,
            startY: e.clientY,
            targetId: itemId,
            items: itemsToDrag
        };
    },

    onResizeStart: function (e, itemId) {
        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        if (item && item.config.isLocked) return;

        e.stopPropagation();
        e.preventDefault();

        const el = document.querySelector(`.globalnotes-item[data-id="${itemId}"]`);
        if (!el) return;

        this.dragData = {
            isDragging: true,
            type: 'resize',
            startX: e.clientX,
            startY: e.clientY,
            initialWidth: el.offsetWidth,
            initialHeight: el.offsetHeight,
            targetId: itemId
        };
    },

    onMouseMove: function (e) {
        if (!this.dragData.isDragging) return;

        const dx = e.clientX - this.dragData.startX;
        const dy = e.clientY - this.dragData.startY;

        // Threshold for dragging (avoid intercepting clicks/dblclicks)
        if (!this.dragData.hasMoved) {
            if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
                this.dragData.hasMoved = true;
                // Add dragging class only after threshold
                this.dragData.items.forEach(dragItem => {
                    dragItem.el.classList.add('dragging');
                });
            } else {
                return;
            }
        }

        if (this.dragData.type === 'item') {
            const zoom = GlobalNotesViewModel.state.zoom;
            this.dragData.items.forEach(dragItem => {
                dragItem.el.style.left = (dragItem.initialX + dx / zoom) + 'px';
                dragItem.el.style.top = (dragItem.initialY + dy / zoom) + 'px';
            });

            // Highlight dropzone if dragging a single item
            if (this.dragData.items.length === 1) {
                document.querySelectorAll('.column-items-dropzone').forEach(dz => dz.classList.remove('drag-over'));
                const dropzone = document.elementFromPoint(e.clientX, e.clientY)?.closest('.column-items-dropzone');
                if (dropzone) {
                    const columnId = dropzone.getAttribute('data-column-id');
                    if (columnId !== this.dragData.targetId) {
                        dropzone.classList.add('drag-over');
                    }
                }
            }
        }
        else if (this.dragData.type === 'canvas') {
            GlobalNotesViewModel.setPan(
                this.dragData.initialX + dx,
                this.dragData.initialY + dy
            );
        }
        else if (this.dragData.type === 'resize') {
            const el = document.querySelector(`.globalnotes-item[data-id="${this.dragData.targetId}"]`);
            if (el) {
                const zoom = GlobalNotesViewModel.state.zoom;
                const newWidth = Math.max(50, this.dragData.initialWidth + dx / zoom);
                const newHeight = Math.max(30, this.dragData.initialHeight + dy / zoom);
                el.style.width = newWidth + 'px';
                el.style.height = newHeight + 'px';
            }
        }
    },

    onMouseUp: function (e) {
        if (!this.dragData.isDragging) return;

        if (this.dragData.type === 'item') {
            document.querySelectorAll('.column-items-dropzone').forEach(dz => dz.classList.remove('drag-over'));

            const targetEl = document.elementFromPoint(e.clientX, e.clientY);
            let dropColumnId = null;
            const dropzone = targetEl?.closest('.column-items-dropzone') || targetEl?.closest('.globalnotes-item-column')?.querySelector('.column-items-dropzone');

            if (dropzone) {
                dropColumnId = dropzone.getAttribute('data-column-id');
            }

            // Process all dragged items
            this.dragData.items.forEach(dragItem => {
                dragItem.el.classList.remove('dragging');
                if (!this.dragData.hasMoved) return;

                const item = GlobalNotesRepository.getItems().find(i => i.id == dragItem.id);
                if (!item) return;

                if (dropColumnId) {
                    // Prevent moving a column into itself or into another column (columns are top-level only in this model)
                    if (item.type !== 'column' && item.id !== dropColumnId) {
                        this.moveToColumn(item.id, dropColumnId);
                    } else if (!item.columnId) {
                        // If it's a column or it can't enter, just update position
                        GlobalNotesViewModel.updateItemPosition(item.id, parseInt(dragItem.el.style.left), parseInt(dragItem.el.style.top));
                    }
                } else if (item.columnId) {
                    // Pulling out of a column
                    this.removeFromColumn(item.id);
                } else {
                    // Standard update
                    GlobalNotesViewModel.updateItemPosition(item.id, parseInt(dragItem.el.style.left), parseInt(dragItem.el.style.top));
                }
            });

            if (this.dragData.hasMoved) {
                GlobalNotesView.renderContent();
            }
        }
        else if (this.dragData.type === 'resize') {
            const el = document.querySelector(`.globalnotes-item[data-id="${this.dragData.targetId}"]`);
            if (el) {
                const item = GlobalNotesRepository.getItems().find(i => i.id == this.dragData.targetId);
                if (item) {
                    GlobalNotesRepository.saveItem({
                        ...item,
                        width: parseInt(el.style.width),
                        height: parseInt(el.style.height)
                    });
                }
            }
        }

        this.dragData.isDragging = false;
        this.dragData.type = null;
    },

    onItemDbClick: function (e, itemId) {
        // If clicking on an editable element, don't trigger navigation
        if (e.target.isContentEditable || e.target.closest('[contenteditable="true"]')) {
            return;
        }

        const item = GlobalNotesRepository.getItems().find(i => i.id === itemId);
        if (item && item.type === 'board') {
            GlobalNotesViewModel.setActiveBoard(item.data.targetBoardId);
        }
    },

    // --- Checklist Handlers ---

    toggleChecklistItem: function (itemId, index) {
        const item = GlobalNotesRepository.getItems().find(i => i.id === itemId);
        if (item && item.data.items) {
            item.data.items[index].checked = !item.data.items[index].checked;
            GlobalNotesRepository.saveItem(item);
            GlobalNotesView.renderContent();
        }
    },

    updateChecklistItem: function (itemId, index, text) {
        const item = GlobalNotesRepository.getItems().find(i => i.id === itemId);
        if (item && item.data.items) {
            item.data.items[index].text = text;
            GlobalNotesRepository.saveItem(item);
        }
    },

    addChecklistItem: function (itemId) {
        const item = GlobalNotesRepository.getItems().find(i => i.id === itemId);
        if (item && item.data.items) {
            item.data.items.push({ id: 'cli_' + Math.random().toString(36).substr(2, 5), text: '', checked: false });
            GlobalNotesRepository.saveItem(item);
            GlobalNotesView.renderContent();
        }
    },

    triggerFileUpload: function (itemId) {
        const input = document.createElement('input');
        input.type = 'file';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const data = {
                    name: file.name,
                    size: (file.size / 1024).toFixed(1) + ' KB',
                    type: file.type || 'File'
                };
                GlobalNotesViewModel.updateItemData(itemId, data);
            }
        };
        input.click();
    },

    // --- SKETCH LOGIC ---
    sketchData: {}, // Store temporary context for active sketches

    initSketch: function (itemId, canvas) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();

        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        ctx.strokeStyle = canvas.getAttribute('data-color') || '#333';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        this.sketchData[itemId] = {
            ctx: ctx,
            isDrawing: false,
            points: []
        };

        // Load existing image if any
        const item = GlobalNotesRepository.getItems().find(i => i.id == itemId);
        if (item && item.data.image) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height);
            img.src = item.data.image;
        }
    },

    setSketchColor: function (itemId, color, el) {
        const data = this.sketchData[itemId];
        if (data) data.ctx.strokeStyle = color;

        // Update UI
        const container = el.closest('.sketch-tools');
        container.querySelectorAll('.sketch-color').forEach(c => c.classList.remove('active'));
        el.classList.add('active');

        const canvas = el.closest('.item-sketch').querySelector('canvas');
        if (canvas) canvas.setAttribute('data-color', color);
    },

    clearSketch: function (itemId) {
        const data = this.sketchData[itemId];
        if (!data) return;

        const canvas = data.ctx.canvas;
        data.ctx.clearRect(0, 0, canvas.width, canvas.height);
        GlobalNotesViewModel.updateItemData(itemId, { image: null });
    },

    startSketch: function (e, itemId) {
        e.stopPropagation(); // Don't drag while drawing
        const data = this.sketchData[itemId];
        if (!data) return;

        data.isDrawing = true;
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        data.points = [{ x, y }];
    },

    drawSketch: function (e, itemId) {
        e.stopPropagation();
        const data = this.sketchData[itemId];
        if (!data || !data.isDrawing) return;

        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        data.points.push({ x, y });

        // Draw smoothing line
        if (data.points.length > 2) {
            const ctx = data.ctx;
            ctx.beginPath();
            ctx.moveTo(data.points[data.points.length - 2].x, data.points[data.points.length - 2].y);

            // Quadratic curve to midpoint
            const midPoint = {
                x: (data.points[data.points.length - 2].x + x) / 2,
                y: (data.points[data.points.length - 2].y + y) / 2
            };

            ctx.quadraticCurveTo(data.points[data.points.length - 2].x, data.points[data.points.length - 2].y, midPoint.x, midPoint.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    },

    endSketch: function (itemId, canvas) {
        const data = this.sketchData[itemId];
        if (!data || !data.isDrawing) return;

        data.isDrawing = false;
        data.points = [];

        // Save to item data
        if (canvas) {
            const dataUrl = canvas.toDataURL();
            GlobalNotesViewModel.updateItemData(itemId, { image: dataUrl });
        }
    }
};

window.GlobalNotesHandlers = GlobalNotesHandlers;

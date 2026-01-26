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
                    const isSceneItem = item.type === 'scene' && item.sceneId;

                    // Supprimer l'item flottant (cela met columnId à null pour les scenes)
                    BoardItemRepository.delete(arc.id, this._state.itemId);

                    const column = BoardItemRepository.getById(arc.id, targetColumnId);
                    if (column) {
                        if (!column.cards) column.cards = [];
                        column.cards.push(card);

                        // Si c'est un item scene, mettre à jour scenePresence.columnId APRÈS la suppression
                        if (isSceneItem && arc.scenePresence) {
                            const presence = arc.scenePresence.find(p => p.sceneId == item.sceneId);
                            if (presence) {
                                presence.columnId = targetColumnId;
                            }
                        }

                        saveProject();
                    }

                    // Rafraîchir le panneau arcScenePanel s'il est visible
                    const arcPanel = document.getElementById('arcScenePanel');
                    if (arcPanel && !arcPanel.classList.contains('hidden') && typeof renderArcScenePanel === 'function') {
                        renderArcScenePanel();
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

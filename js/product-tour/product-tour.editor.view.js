/**
 * [MVVM : Product Tour Editor View]
 * Interface WYSIWYG pour éditer les étapes du tour.
 */

const ProductTourEditorView = {
    /**
     * Cache des éléments DOM
     */
    elements: {
        overlay: null,
        highlight: null,
        modal: null,
        sidebar: null
    },

    /**
     * Initialise l'interface de l'éditeur.
     */
    init: function () {
        this._injectStyles();
        this._createOverlay();
        this._createModal();
        this._createSidebar();
        this._initShortcuts();
    },

    /**
     * Injecte dynamiquement le CSS de l'éditeur.
     */
    _injectStyles: function () {
        if (document.getElementById('tour-editor-styles')) return;
        const link = document.createElement('link');
        link.id = 'tour-editor-styles';
        link.rel = 'stylesheet';
        link.href = 'css/product-tour-editor.css';
        document.head.appendChild(link);
    },

    /**
     * Crée l'overlay de sélection d'éléments.
     */
    _createOverlay: function () {
        if (document.getElementById('tour-selector-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'tour-selector-overlay';

        const highlight = document.createElement('div');
        highlight.className = 'tour-element-highlight';
        highlight.innerHTML = '<div class="tour-element-label"></div>';

        document.body.appendChild(overlay);
        document.body.appendChild(highlight);

        this.elements.overlay = overlay;
        this.elements.highlight = highlight;

        overlay.addEventListener('mousemove', (e) => this._onMouseMove(e));
        overlay.addEventListener('click', (e) => this._onClick(e));
    },

    /**
     * Crée le modal d'édition de step.
     */
    _createModal: function () {
        if (document.getElementById('tour-editor-modal')) return;

        const modal = document.createElement('div');
        modal.id = 'tour-editor-modal';
        modal.className = 'tour-editor-modal';
        modal.innerHTML = `
            <div class="tour-editor-header">
                <h3>Édition de l'étape</h3>
                <button class="tour-step-btn" onclick="ProductTourEditorView.hideModal()">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="tour-editor-body">
                <div class="tour-editor-field">
                    <label>Sélecteur CSS</label>
                    <input type="text" id="tour-edit-selector" readonly>
                </div>
                <div class="tour-editor-field">
                    <label>Titre de l'étape</label>
                    <input type="text" id="tour-edit-title" placeholder="Ex: Bienvenue sur l'éditeur">
                </div>
                <div class="tour-editor-field">
                    <label>Description (HTML supporté)</label>
                    <textarea id="tour-edit-desc" rows="4" placeholder="Décrivez ce que fait cet élément..."></textarea>
                </div>
                <div class="tour-editor-field">
                    <label>URL Image (optionnel)</label>
                    <input type="text" id="tour-edit-image" placeholder="https://...">
                </div>
                <div style="display: flex; gap: 1rem;">
                    <div class="tour-editor-field" style="flex: 1;">
                        <label>Position</label>
                        <select id="tour-edit-side">
                            <option value="bottom">En bas</option>
                            <option value="top">En haut</option>
                            <option value="left">À gauche</option>
                            <option value="right">À droite</option>
                        </select>
                    </div>
                    <div class="tour-editor-field" style="flex: 1;">
                        <label>Alignement</label>
                        <select id="tour-edit-align">
                            <option value="start">Début</option>
                            <option value="center">Centre</option>
                            <option value="end">Fin</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="tour-editor-footer">
                <button class="tour-editor-btn tour-editor-btn-secondary" onclick="ProductTourEditorView.hideModal()">Annuler</button>
                <button class="tour-editor-btn tour-editor-btn-primary" id="tour-save-step">Enregistrer l'étape</button>
            </div>
        `;

        document.body.appendChild(modal);
        this.elements.modal = modal;

        if (typeof lucide !== 'undefined') lucide.createIcons();

        document.getElementById('tour-save-step').addEventListener('click', () => {
            this._saveCurrentStep();
        });
    },

    /**
     * Crée la barre latérale des étapes.
     */
    _createSidebar: function () {
        if (document.getElementById('tour-steps-sidebar')) return;

        const sidebar = document.createElement('div');
        sidebar.id = 'tour-steps-sidebar';
        sidebar.innerHTML = `
            <div class="tour-sidebar-header">
                <span style="font-weight: 600; color: var(--tour-editor-primary);">Étapes du Tour</span>
                <button class="tour-editor-btn tour-editor-btn-primary" style="font-size: 0.8rem; padding: 4px 10px;" onclick="ProductTourEditorView.toggleSelectionMode()">+ Ajouter</button>
            </div>
            <div class="tour-sidebar-list" id="tour-sidebar-list">
                <!-- Les étapes seront injectées ici -->
            </div>
            <div class="tour-editor-footer" style="padding: 10px;">
                <button class="tour-editor-btn tour-editor-btn-primary" style="width: 100%;" onclick="ProductTourEditorViewModel.saveTour()">Sauvegarder le Tour</button>
            </div>
        `;

        document.body.appendChild(sidebar);
        this.elements.sidebar = sidebar;
    },

    /**
     * Initialise les raccourcis clavier.
     */
    _initShortcuts: function () {
        window.addEventListener('keydown', (e) => {
            // Ctrl + Alt + T pour basculer l'éditeur
            if (e.ctrlKey && e.altKey && e.key === 't') {
                e.preventDefault();
                ProductTourEditorViewModel.toggleEditor();
            }

            // Échap pour quitter le mode sélection
            if (e.key === 'Escape' && this.isSelectionModeActive()) {
                this.toggleSelectionMode();
            }
        });
    },

    /**
     * Bascule le mode de sélection.
     */
    toggleSelectionMode: function () {
        const isActive = this.elements.overlay.classList.toggle('active');
        if (!isActive) {
            this.elements.highlight.style.display = 'none';
        } else {
            ProductTourNotificationView.showInfo("Cliquez sur un élément de l'interface pour créer une étape.");
        }
    },

    isSelectionModeActive: function () {
        return this.elements.overlay.classList.contains('active');
    },

    /**
     * Gère le mouvement de la souris en mode sélection.
     */
    _onMouseMove: function (e) {
        if (!this.isSelectionModeActive()) return;

        // Cacher l'overlay temporairement pour trouver l'élément en dessous
        this.elements.overlay.style.pointerEvents = 'none';
        const el = document.elementFromPoint(e.clientX, e.clientY);
        this.elements.overlay.style.pointerEvents = 'auto';

        if (el && el !== document.body && el !== document.documentElement) {
            const rect = el.getBoundingClientRect();
            const highlight = this.elements.highlight;

            highlight.style.display = 'block';
            highlight.style.width = `${rect.width}px`;
            highlight.style.height = `${rect.height}px`;
            highlight.style.top = `${rect.top + window.scrollY}px`;
            highlight.style.left = `${rect.left + window.scrollX}px`;

            const selector = ProductTourStepModel.getUniqueSelector(el);
            highlight.querySelector('.tour-element-label').textContent = selector;
        }
    },

    /**
     * Gère le clic en mode sélection.
     */
    _onClick: function (e) {
        if (!this.isSelectionModeActive()) return;

        this.elements.overlay.style.pointerEvents = 'none';
        const el = document.elementFromPoint(e.clientX, e.clientY);
        this.elements.overlay.style.pointerEvents = 'auto';

        if (el) {
            const selector = ProductTourStepModel.getUniqueSelector(el);
            this.toggleSelectionMode();
            this.showModal(selector);
        }
    },

    /**
     * Affiche le modal d'édition.
     */
    showModal: function (selector, data = null) {
        document.getElementById('tour-edit-selector').value = selector;
        document.getElementById('tour-edit-title').value = data?.title || '';
        document.getElementById('tour-edit-desc').value = data?.description || '';
        document.getElementById('tour-edit-image').value = data?.image || '';
        document.getElementById('tour-edit-side').value = data?.side || 'bottom';
        document.getElementById('tour-edit-align').value = data?.align || 'start';

        this.elements.modal.classList.add('active');
        document.getElementById('tour-edit-title').focus();
    },

    hideModal: function () {
        this.elements.modal.classList.remove('active');
    },

    /**
     * Envoie les données du step au ViewModel.
     */
    _saveCurrentStep: function () {
        const stepData = {
            element: document.getElementById('tour-edit-selector').value,
            popover: {
                title: document.getElementById('tour-edit-title').value,
                description: document.getElementById('tour-edit-desc').value,
                image: document.getElementById('tour-edit-image').value,
                side: document.getElementById('tour-edit-side').value,
                align: document.getElementById('tour-edit-align').value
            }
        };

        ProductTourEditorViewModel.addOrUpdateStep(stepData);
        this.hideModal();
    },

    /**
     * Met à jour la liste des étapes dans la sidebar.
     */
    renderSidebar: function (steps) {
        const listContainer = document.getElementById('tour-sidebar-list');
        if (!listContainer) return;

        listContainer.innerHTML = '';

        steps.forEach((step, index) => {
            const card = document.createElement('div');
            card.className = 'tour-step-card';
            card.innerHTML = `
                <div class="tour-step-card-header">
                    <span class="tour-step-title">${index + 1}. ${step.popover.title || 'Sans titre'}</span>
                    <div class="tour-step-actions">
                        <button class="tour-step-btn" onclick="ProductTourEditorViewModel.editStep(${index})"><i data-lucide="edit-2" style="width:14px;"></i></button>
                        <button class="tour-step-btn" onclick="ProductTourEditorViewModel.removeStep(${index})"><i data-lucide="trash-2" style="width:14px;"></i></button>
                    </div>
                </div>
                <div class="tour-step-selector">${step.element}</div>
            `;
            listContainer.appendChild(card);
        });

        if (typeof lucide !== 'undefined') lucide.createIcons();
    },

    /**
     * Active/Désactive la barre latérale.
     */
    toggleSidebar: function (show) {
        if (show) {
            this.elements.sidebar.classList.add('active');
        } else {
            this.elements.sidebar.classList.remove('active');
        }
    }
};

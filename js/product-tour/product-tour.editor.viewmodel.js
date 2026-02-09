/**
 * [MVVM : Product Tour Editor ViewModel]
 * Logique de gestion de l'édition du tour.
 */

const ProductTourEditorViewModel = {
    state: {
        isActive: false,
        currentTour: [], // Liste des steps pour la vue actuelle
        currentView: 'editor'
    },

    /**
     * Initialise l'éditeur.
     */
    init: function () {
        ProductTourEditorView.init();
        this.state.currentView = typeof currentView !== 'undefined' ? currentView : 'editor';
        this.loadCurrentTour();
    },

    /**
     * Bascule l'état de l'éditeur.
     */
    toggleEditor: function () {
        this.state.isActive = !this.state.isActive;
        ProductTourEditorView.toggleSidebar(this.state.isActive);

        if (this.state.isActive) {
            ProductTourNotificationView.showSuccess("Mode Édition du Tour activé (Ctrl+Alt+T pour quitter)");
            this.loadCurrentTour();
        } else {
            ProductTourNotificationView.showInfo("Mode Édition du Tour désactivé");
            if (ProductTourEditorView.isSelectionModeActive()) {
                ProductTourEditorView.toggleSelectionMode();
            }
        }
    },

    /**
     * Bascule le mode de sélection d'élément.
     */
    toggleSelectionMode: function () {
        ProductTourEditorView.toggleSelectionMode();
    },

    /**
     * Charge le tour pour la vue actuelle depuis le repository (ou défaut).
     */
    loadCurrentTour: async function () {
        this.state.currentView = typeof currentView !== 'undefined' ? currentView : 'editor';

        // Pour l'instant on récupère les steps par défaut du modèle
        // Plus tard on chargera depuis storage
        const steps = await ProductTourStepsRepository.getAllSteps(this.state.currentView);
        this.state.currentTour = [...steps];

        ProductTourEditorView.renderSidebar(this.state.currentTour);
    },

    /**
     * Ajoute ou met à jour une étape.
     */
    addOrUpdateStep: function (stepData) {
        // On vérifie si une étape avec le même sélecteur existe déjà
        const index = this.state.currentTour.findIndex(s => s.element === stepData.element);

        if (index !== -1) {
            this.state.currentTour[index] = ProductTourStepModel.create(stepData);
        } else {
            this.state.currentTour.push(ProductTourStepModel.create(stepData));
        }

        ProductTourEditorView.renderSidebar(this.state.currentTour);
    },

    /**
     * Supprime une étape.
     */
    removeStep: function (index) {
        this.state.currentTour.splice(index, 1);
        ProductTourEditorView.renderSidebar(this.state.currentTour);
    },

    /**
     * Ouvre le modal pour éditer une étape existante.
     */
    editStep: function (index) {
        const step = this.state.currentTour[index];
        ProductTourEditorView.showModal(step.element, {
            title: step.popover.title,
            description: step.popover.description,
            image: step.popover.image,
            side: step.popover.side,
            align: step.popover.align
        });
    },

    /**
     * Sauvegarde le tour actuel (simulation pour l'instant).
     */
    saveTour: async function () {
        try {
            await ProductTourStepsRepository.saveCustomTour(this.state.currentView, this.state.currentTour);
            ProductTourNotificationView.showSuccess("Le tour a été sauvegardé avec succès.");
        } catch (error) {
            console.error('Error saving tour:', error);
            ProductTourNotificationView.showError("Erreur lors de la sauvegarde du tour.");
        }
    }
};

// Initialiser l'éditeur quand le DOM est prêt
setTimeout(() => {
    ProductTourEditorViewModel.init();
}, 2000);

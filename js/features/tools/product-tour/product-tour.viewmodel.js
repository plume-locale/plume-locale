/**
 * [MVVM : Product Tour ViewModel]
 * Logique métier et coordination entre Repository et View.
 */

console.log('🎓 Product Tour ViewModel loaded');

// ============================================
// INITIALIZATION
// ============================================

/**
 * Initialise le système de visite guidée.
 * @returns {Promise<Object>} Résultat de l'initialisation.
 */
async function initProductTourVM() {
    console.log('Initializing Product Tour...');

    try {
        // Charger l'état du tour
        await ProductTourStateRepository.loadState();

        // Créer le bouton de tour dans le header
        ProductTourButtonView.create(() => {
            // Au lieu de démarrer directement, on affiche le tour global de l'interface
            startProductTourVM('app_overview');
        });

        // Vérifier si on doit afficher le modal de bienvenue
        if (ProductTourStateRepository.shouldShowOnStartup()) {
            // Attendre que la page soit complètement chargée (y compris les scripts externes)
            const waitForPageLoad = () => {
                if (document.readyState === 'complete') {
                    setTimeout(() => {
                        showWelcomeModalVM();
                    }, 1000);
                } else {
                    window.addEventListener('load', () => {
                        setTimeout(() => {
                            showWelcomeModalVM();
                        }, 1000);
                    });
                }
            };

            waitForPageLoad();
        }

        return {
            success: true,
            message: 'Product tour initialized'
        };
    } catch (error) {
        console.error('Error initializing product tour:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================
// WELCOME MODAL
// ============================================

/**
 * Affiche le modal de bienvenue.
 * @returns {Object} Résultat de l'opération.
 */
function showWelcomeModalVM() {
    try {
        ProductTourWelcomeView.show(
            // onStart
            () => {
                // Pour le modal de bienvenue, on peut garder le tour par défaut de la vue
                startProductTourVM();
            },
            // onSkip
            async () => {
                await ProductTourStateRepository.markSkipped();
                ProductTourNotificationView.showInfo(Localization.t('tour.notification.start_anytime'));
            },
            // onDontShowAgain
            async () => {
                await ProductTourStateRepository.updatePreferences({
                    showOnStartup: false
                });
            }
        );

        return {
            success: true,
            message: 'Welcome modal shown'
        };
    } catch (error) {
        console.error('Error showing welcome modal:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Cache le modal de bienvenue.
 * @returns {Object} Résultat de l'opération.
 */
function hideWelcomeModalVM() {
    try {
        ProductTourWelcomeView.hide();
        return {
            success: true,
            message: 'Welcome modal hidden'
        };
    } catch (error) {
        console.error('Error hiding welcome modal:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================
// TOUR CONTROL
// ============================================

/**
 * Démarre la visite guidée.
 * @param {string} forcedView - Vue forcée (optionnel).
 * @returns {Promise<Object>} Résultat de l'opération.
 */
async function startProductTourVM(forcedView = null) {
    console.log('Starting product tour...', forcedView || 'current view');

    try {
        // Réinitialiser le step sauvegardé pour recommencer du début
        await ProductTourStateRepository.updateCurrentStep(0);

        // Fermer le modal de bienvenue s'il est ouvert
        if (ProductTourWelcomeView.isVisible()) {
            ProductTourWelcomeView.hide();
        }

        // Récupérer les steps
        const view = forcedView || (typeof currentView !== 'undefined' ? currentView : 'editor');
        let steps = await ProductTourStepsRepository.getAllSteps(view);

        // Filtrer les steps valides d'abord pour éviter d'enrichir des steps malformés
        steps = ProductTourStepsRepository.filterValidSteps(steps);

        if (steps.length === 0) {
            ProductTourNotificationView.showError(Localization.t('tour.notification.no_steps'));
            return {
                success: false,
                error: 'No tour steps available'
            };
        }

        // Enricher les steps avec les actions automatiques (ex: clickBefore) et les médias (images)
        steps.forEach((step, index) => {
            if (!step) {
                console.warn(`🎓 Step at index ${index} is undefined or null`);
                return;
            }

            // Support des images : injection dans la description
            // On vérifie que popover existe et est bien un objet avant d'accéder à image
            if (step.popover && typeof step.popover === 'object' && step.popover.image) {
                const imgHtml = `<img src="${step.popover.image}" class="driver-popover-image">`;
                step.popover.description = imgHtml + (step.popover.description || '');
            }

            if (step.clickBefore) {
                const originalOnHighlightStarted = step.onHighlightStarted;
                step.onHighlightStarted = (element) => {
                    const elToClick = document.querySelector(step.clickBefore);
                    if (elToClick) {
                        console.log('🎓 Auto-clicking element before step:', step.clickBefore);
                        elToClick.click();
                    }
                    if (typeof originalOnHighlightStarted === 'function') {
                        originalOnHighlightStarted(element);
                    }
                };
            }

            if (step.clickAfter) {
                const originalOnDeselected = step.onDeselected;
                step.onDeselected = (element) => {
                    const elToClick = document.querySelector(step.clickAfter);
                    if (elToClick) {
                        console.log('🎓 Auto-clicking element after step:', step.clickAfter);
                        elToClick.click();
                    }
                    if (typeof originalOnDeselected === 'function') {
                        originalOnDeselected(element);
                    }
                };
            }
        });


        // Créer la configuration Driver.js
        const isMobile = window.innerWidth < 768;
        const config = isMobile
            ? ProductTourConfigModel.createMobileConfig()
            : ProductTourConfigModel.createDriverConfig();

        // Créer l'instance Driver.js (async)
        const driverInstance = await ProductTourDriverRepository.createDriver(config, steps);
        if (!driverInstance) {
            ProductTourNotificationView.showError(Localization.t('tour.notification.start_error'));
            return {
                success: false,
                error: 'Failed to create driver instance'
            };
        }

        // Démarrer le tour
        const started = ProductTourDriverRepository.startTour();
        if (!started) {
            ProductTourNotificationView.showError(Localization.t('tour.notification.start_error'));
            return {
                success: false,
                error: 'Failed to start tour'
            };
        }

        return {
            success: true,
            message: 'Tour started',
            stepCount: steps.length
        };
    } catch (error) {
        console.error('Error starting tour:', error);
        ProductTourNotificationView.showError(Localization.t('tour.notification.start_error'));
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Arrête la visite guidée.
 * @returns {Object} Résultat de l'opération.
 */
function stopProductTourVM() {
    try {
        ProductTourDriverRepository.stopTour();
        ProductTourDriverView.cleanup();

        return {
            success: true,
            message: 'Tour stopped'
        };
    } catch (error) {
        console.error('Error stopping tour:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Réinitialise la visite guidée.
 * @returns {Promise<Object>} Résultat de l'opération.
 */
async function resetProductTourVM() {
    try {
        // Arrêter le tour s'il est actif
        if (ProductTourDriverRepository.isActive()) {
            stopProductTourVM();
        }

        // Réinitialiser l'état
        await ProductTourStateRepository.reset();

        ProductTourNotificationView.showSuccess(Localization.t('tour.notification.reset_success'));

        return {
            success: true,
            message: 'Tour reset'
        };
    } catch (error) {
        console.error('Error resetting tour:', error);
        ProductTourNotificationView.showError(Localization.t('tour.notification.reset_error'));
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================
// TOUR CALLBACKS
// ============================================

/**
 * Callback appelé quand le tour est complété.
 * @returns {Promise<void>}
 */
async function onTourCompleteVM() {
    console.log('Tour completed');

    try {
        // Marquer comme complété
        await ProductTourStateRepository.markCompleted();

        // Afficher un message de succès
        ProductTourNotificationView.showSuccess(Localization.t('tour.notification.complete'));

        // Nettoyer
        ProductTourDriverView.cleanup();
    } catch (error) {
        console.error('Error completing tour:', error);
    }
}

/**
 * Callback appelé quand le tour est détruit.
 */
function onTourDestroyedVM() {
    console.log('Tour destroyed');

    try {
        // Nettoyer les ressources
        ProductTourDriverView.cleanup();
    } catch (error) {
        console.error('Error in tour destroyed callback:', error);
    }
}

/**
 * Callback appelé quand un step change.
 * @param {Object} element - Élément du step.
 * @param {Object} step - Définition du step.
 * @param {Object} options - Options du step.
 */
function onTourStepChangeVM(element, step, options) {
    try {
        // Sauvegarder le step actuel
        const currentIndex = ProductTourDriverRepository.getCurrentStepIndex();
        ProductTourStateRepository.updateCurrentStep(currentIndex);

        // Préparer la vue pour le step
        ProductTourDriverView.prepareForStep(step);
    } catch (error) {
        console.error('Error in step change callback:', error);
    }
}

// ============================================
// TOUR STATE QUERIES
// ============================================

/**
 * Vérifie si le tour est actif.
 * @returns {boolean} True si actif.
 */
function isProductTourActiveVM() {
    return ProductTourDriverRepository.isActive();
}

/**
 * Récupère l'état du tour.
 * @returns {Object} État du tour.
 */
function getProductTourStateVM() {
    return ProductTourStateRepository.getState();
}

/**
 * Vérifie si c'est la première visite.
 * @returns {boolean} True si première visite.
 */
function isFirstVisitVM() {
    return ProductTourStateRepository.isFirstVisit();
}

// ============================================
// TOUR NAVIGATION
// ============================================

/**
 * Passe au step suivant.
 * @returns {Object} Résultat de l'opération.
 */
function nextTourStepVM() {
    try {
        const success = ProductTourDriverRepository.moveNext();
        return {
            success,
            message: success ? 'Moved to next step' : 'Failed to move to next step'
        };
    } catch (error) {
        console.error('Error moving to next step:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Revient au step précédent.
 * @returns {Object} Résultat de l'opération.
 */
function previousTourStepVM() {
    try {
        const success = ProductTourDriverRepository.movePrevious();
        return {
            success,
            message: success ? 'Moved to previous step' : 'Failed to move to previous step'
        };
    } catch (error) {
        console.error('Error moving to previous step:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Va à un step spécifique.
 * @param {number} index - Index du step.
 * @returns {Object} Résultat de l'opération.
 */
function goToTourStepVM(index) {
    try {
        const success = ProductTourDriverRepository.moveTo(index);
        return {
            success,
            message: success ? `Moved to step ${index}` : `Failed to move to step ${index}`
        };
    } catch (error) {
        console.error('Error moving to step:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================
// PREFERENCES
// ============================================

/**
 * Met à jour les préférences du tour.
 * @param {Object} preferences - Nouvelles préférences.
 * @returns {Promise<Object>} Résultat de l'opération.
 */
async function updateTourPreferencesVM(preferences) {
    try {
        await ProductTourStateRepository.updatePreferences(preferences);
        return {
            success: true,
            message: 'Preferences updated'
        };
    } catch (error) {
        console.error('Error updating preferences:', error);
        return {
            success: false,
            error: error.message
        };
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Vérifie si Driver.js est chargé.
 * @returns {boolean} True si chargé.
 */
function isDriverJsLoadedVM() {
    return typeof driver !== 'undefined';
}

/**
 * Récupère les informations du tour.
 * @returns {Object} Informations du tour.
 */
function getTourInfoVM() {
    const state = ProductTourStateRepository.getState();
    const steps = ProductTourStepsRepository.getAllSteps();
    const isActive = ProductTourDriverRepository.isActive();

    return {
        state,
        stepCount: steps.length,
        isActive,
        driverLoaded: isDriverJsLoadedVM(),
        isMobile: window.innerWidth < 768
    };
}

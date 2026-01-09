/**
 * Mobile Gestures Service
 * Gestion des gestes tactiles pour les appareils mobiles
 */

const MobileGesturesService = (() => {
    'use strict';

    // État du swipe
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    /**
     * Toggle la sidebar mobile
     */
    function toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        // Utiliser l'ancien système si disponible
        if (typeof window.toggleMobileSidebar === 'function') {
            window.toggleMobileSidebar();
        } else {
            // Implémentation basique
            sidebar.classList.toggle('mobile-open');
        }
    }

    /**
     * Gère le début du swipe
     * @param {TouchEvent} e - Événement tactile
     */
    function handleTouchStart(e) {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    }

    /**
     * Gère la fin du swipe
     * @param {TouchEvent} e - Événement tactile
     */
    function handleTouchEnd(e) {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }

    /**
     * Détecte et traite le geste de swipe
     */
    function handleSwipe() {
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;

        // Vérifier que c'est un swipe horizontal (pas vertical)
        if (Math.abs(diffX) > Math.abs(diffY)) {
            const sidebar = document.querySelector('.sidebar');
            if (!sidebar) return;

            // Swipe depuis le bord gauche (moins de 50px du bord)
            if (touchStartX < 50 && diffX > 50) {
                // Swipe vers la droite depuis le bord gauche - Ouvrir
                if (!sidebar.classList.contains('mobile-open')) {
                    toggleMobileSidebar();
                }
            }
            // Swipe vers la gauche pour fermer
            else if (diffX < -50) {
                if (sidebar.classList.contains('mobile-open')) {
                    toggleMobileSidebar();
                }
            }
        }
    }

    /**
     * Initialise le service de gestes mobiles
     */
    function init() {
        // Activer seulement sur mobile
        if (window.innerWidth <= 768) {
            document.addEventListener('touchstart', handleTouchStart, { passive: true });
            document.addEventListener('touchend', handleTouchEnd, { passive: true });
            console.log('[MobileGestures] Service initialisé');
        }

        // Réinitialiser lors du redimensionnement
        window.addEventListener('resize', () => {
            const isMobile = window.innerWidth <= 768;
            if (isMobile) {
                // Réactiver si pas déjà actif
                document.removeEventListener('touchstart', handleTouchStart);
                document.removeEventListener('touchend', handleTouchEnd);
                document.addEventListener('touchstart', handleTouchStart, { passive: true });
                document.addEventListener('touchend', handleTouchEnd, { passive: true });
            }
        });
    }

    /**
     * Nettoie les écouteurs d'événements
     */
    function destroy() {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchend', handleTouchEnd);
    }

    // API publique
    return {
        init,
        destroy,
        toggleMobileSidebar
    };
})();

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MobileGesturesService.init());
} else {
    MobileGesturesService.init();
}

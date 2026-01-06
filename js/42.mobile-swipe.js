        // ============================================
        // MOBILE SWIPE GESTURE SUPPORT
        // ============================================
        
        let touchStartX = 0;
        let touchStartY = 0;
        let touchEndX = 0;
        let touchEndY = 0;
        
        // Détecter le swipe depuis le bord gauche
        document.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        }, false);
        
        document.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            handleSwipe();
        }, false);
        
        function handleSwipe() {
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;
            
            // Vérifier que c'est un swipe horizontal (pas vertical)
            if (Math.abs(diffX) > Math.abs(diffY)) {
                // Swipe depuis le bord gauche (moins de 50px du bord)
                if (touchStartX < 50 && diffX > 50) {
                    // Swipe vers la droite depuis le bord gauche
                    const sidebar = document.querySelector('.sidebar');
                    if (sidebar && !sidebar.classList.contains('mobile-open')) {
                        toggleMobileSidebar();
                    }
                }
                // Swipe vers la gauche pour fermer
                else if (diffX < -50) {
                    const sidebar = document.querySelector('.sidebar');
                    if (sidebar && sidebar.classList.contains('mobile-open')) {
                        toggleMobileSidebar();
                    }
                }
            }
        }
        
        // ============================================
        // END MOBILE SWIPE GESTURE SUPPORT
        // ============================================
/**
 * Mobile Menu Service
 * Gestion des menus mobiles, sidebar et toolbar
 */

const MobileMenuService = (() => {
    'use strict';

    // Icons SVG
    const ICONS = {
        menu: `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="4" x2="20" y1="12" y2="12"/>
                <line x1="4" x2="20" y1="6" y2="6"/>
                <line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
        `,
        close: `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
            </svg>
        `
    };

    /**
     * Toggle la sidebar mobile
     */
    function toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        const handle = document.querySelector('.mobile-menu-handle');

        console.log('[MobileMenu] toggleMobileSidebar appelé');

        if (!sidebar || !overlay) {
            console.warn('[MobileMenu] Éléments sidebar ou overlay introuvables');
            return;
        }

        // Toggle sidebar
        sidebar.classList.toggle('mobile-open');

        // Toggle overlay and handle
        if (sidebar.classList.contains('mobile-open')) {
            overlay.style.display = 'block';
            setTimeout(() => overlay.classList.add('active'), 10);
            if (handle) handle.classList.add('hidden');
            document.body.style.overflow = 'hidden';
            console.log('[MobileMenu] Sidebar ouverte');
        } else {
            overlay.classList.remove('active');
            setTimeout(() => overlay.style.display = 'none', 300);
            if (handle) handle.classList.remove('hidden');
            document.body.style.overflow = '';
            console.log('[MobileMenu] Sidebar fermée');
        }

        // Émettre un événement
        if (window.EventBus) {
            EventBus.emit('mobile-sidebar:toggled', {
                isOpen: sidebar.classList.contains('mobile-open')
            });
        }
    }

    /**
     * Ferme la sidebar mobile
     */
    function closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        const handle = document.querySelector('.mobile-menu-handle');

        if (sidebar && sidebar.classList.contains('mobile-open')) {
            sidebar.classList.remove('mobile-open');
            if (overlay) {
                overlay.classList.remove('active');
                setTimeout(() => overlay.style.display = 'none', 300);
            }
            if (handle) handle.classList.remove('hidden');
            document.body.style.overflow = '';

            if (window.EventBus) {
                EventBus.emit('mobile-sidebar:closed');
            }
        }
    }

    /**
     * Toggle le menu de navigation mobile
     */
    function toggleMobileNav() {
        const dropdown = document.getElementById('mobileNavDropdown');
        const toggleBtn = document.getElementById('mobileNavToggleBtn');
        const sidebar = document.querySelector('.sidebar');

        if (!dropdown || !toggleBtn) return;

        // Déterminer si le menu est actif (ouvert)
        if (dropdown.classList.contains('active')) {
            // Fermer le menu
            dropdown.classList.remove('active');
            toggleBtn.innerHTML = ICONS.menu;
            if (sidebar) sidebar.style.visibility = '';
        } else {
            // Ouvrir le menu
            dropdown.classList.add('active');
            toggleBtn.innerHTML = ICONS.close;
            if (sidebar) sidebar.style.visibility = 'hidden';
        }
    }

    /**
     * Ferme le menu de navigation mobile
     */
    function closeMobileNav() {
        const dropdown = document.getElementById('mobileNavDropdown');
        const toggleBtn = document.getElementById('mobileNavToggleBtn');
        const sidebar = document.querySelector('.sidebar');

        if (dropdown && dropdown.classList.contains('active')) {
            dropdown.classList.remove('active');
            if (toggleBtn) toggleBtn.innerHTML = ICONS.menu;
            if (sidebar) sidebar.style.visibility = '';
        }
    }

    /**
     * Switche la vue depuis le menu mobile
     * @param {string} view - Nom de la vue
     */
    function switchViewMobile(view) {
        // Update active state in mobile menu
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        const activeItem = document.querySelector(`[data-view="${view}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Close mobile nav
        closeMobileNav();

        // Switch to the view
        if (window.switchView) {
            switchView(view);
        } else if (window.Router) {
            Router.navigate(view);
        }
    }

    /**
     * Toggle le toolbar de l'éditeur (mobile)
     */
    function toggleEditorToolbar() {
        const toolbar = document.getElementById('editorToolbar');
        const toggleText = document.getElementById('toolbarToggleText');
        const toggleBtn = document.querySelector('.toolbar-mobile-toggle');

        if (!toolbar) return;

        if (toolbar.classList.contains('expanded')) {
            toolbar.classList.remove('expanded');
            if (toggleText) {
                toggleText.innerHTML = '<i data-lucide="pen-line" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Afficher les outils de formatage';
            }
            if (toggleBtn) toggleBtn.classList.remove('expanded');
        } else {
            toolbar.classList.add('expanded');
            if (toggleText) {
                toggleText.innerHTML = '<i data-lucide="x" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Masquer les outils de formatage';
            }
            if (toggleBtn) toggleBtn.classList.add('expanded');
        }

        // Rafraîchir les icônes Lucide si disponible
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Toggle le panneau de liens (personnages & lieux)
     */
    function toggleLinksPanel() {
        const panel = document.getElementById('linksPanel');
        const toggleText = document.getElementById('linksPanelToggleText');
        const toggleBtn = document.querySelector('.links-panel-toggle');

        if (!panel) return;

        if (panel.classList.contains('expanded')) {
            panel.classList.remove('expanded');
            if (toggleText) {
                toggleText.innerHTML = '<i data-lucide="chevron-right" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Afficher personnages & lieux liés';
            }
            if (toggleBtn) toggleBtn.classList.remove('expanded');
        } else {
            panel.classList.add('expanded');
            if (toggleText) {
                toggleText.innerHTML = '<i data-lucide="chevron-down" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i>Masquer personnages & lieux liés';
            }
            if (toggleBtn) toggleBtn.classList.add('expanded');
        }

        // Rafraîchir les icônes Lucide
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Toggle le toolbar depuis le menu flottant
     */
    function toggleToolbarFromFloating() {
        // Fermer le menu flottant
        const floatingMenu = document.getElementById('floatingEditorMenu');
        const floatingToggle = document.getElementById('floatingEditorToggle');

        if (floatingMenu && floatingMenu.classList.contains('active')) {
            floatingMenu.classList.remove('active');
            if (floatingToggle) floatingToggle.textContent = '⚙️';
        }

        // Ouvrir le toolbar complet
        const toolbar = document.getElementById('editorToolbar');
        const toggleText = document.getElementById('toolbarToggleText');
        const toggleBtn = document.querySelector('.toolbar-mobile-toggle');

        if (toolbar && !toolbar.classList.contains('expanded')) {
            toolbar.classList.add('expanded');
            if (toggleText) toggleText.textContent = '✕ Masquer les outils de formatage';
            if (toggleBtn) toggleBtn.classList.add('expanded');
        }

        // Scroll vers le toolbar
        setTimeout(() => {
            if (toolbar) {
                toolbar.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 100);
    }

    /**
     * Toggle le menu avancé
     */
    function toggleAdvancedMenu() {
        const advancedBar = document.getElementById('advancedMenuBar');
        const advancedBtn = document.getElementById('advancedMenuBtn');

        if (!advancedBar) return;

        if (advancedBar.classList.contains('active')) {
            advancedBar.classList.remove('active');
            if (advancedBtn) advancedBtn.style.background = '';
        } else {
            advancedBar.classList.add('active');
            if (advancedBtn) advancedBtn.style.background = 'rgba(255,215,0,0.3)';
        }
    }

    /**
     * Vérifie si le header déborde (menu trop large)
     */
    function checkHeaderOverflow() {
        const header = document.querySelector('.app-header');
        const headerNav = document.querySelector('.header-nav');
        const body = document.body;

        if (!header || !headerNav) return;

        // Temporairement forcer le mode desktop pour mesurer
        body.classList.remove('force-mobile-nav');

        // Attendre le reflow
        requestAnimationFrame(() => {
            const headerWidth = header.offsetWidth;
            const logoWidth = document.querySelector('.app-logo')?.offsetWidth || 0;
            const actionsWidth = document.querySelector('.header-actions')?.offsetWidth || 0;
            const navWidth = headerNav.scrollWidth;
            const availableSpace = headerWidth - logoWidth - actionsWidth - 60; // 60px de marge

            if (navWidth > availableSpace) {
                body.classList.add('force-mobile-nav');
            } else {
                body.classList.remove('force-mobile-nav');
            }
        });
    }

    /**
     * Gestion du redimensionnement de la fenêtre
     */
    function handleResize() {
        // Vérifier le débordement du header
        checkHeaderOverflow();

        // Si redimensionnement vers desktop, réinitialiser
        if (window.innerWidth > 900 && !document.body.classList.contains('force-mobile-nav')) {
            const sidebar = document.querySelector('.sidebar');
            const overlay = document.querySelector('.sidebar-overlay');
            const menuBtn = document.querySelector('.mobile-menu-toggle');

            if (sidebar) sidebar.classList.remove('mobile-open');
            if (overlay) {
                overlay.classList.remove('active');
                overlay.style.display = 'none';
            }
            if (menuBtn) menuBtn.innerHTML = ICONS.menu;
            document.body.style.overflow = '';
        }
    }

    /**
     * Initialise le service de menu mobile
     */
    function init() {
        // Override switchView pour fermer la sidebar mobile
        const originalSwitchView = window.switchView;
        if (originalSwitchView) {
            window.switchView = function(view) {
                if (window.innerWidth <= 900) {
                    closeMobileSidebar();
                }
                originalSwitchView(view);
            };
        }

        // Écouter le redimensionnement
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 100);
        });

        // Vérifier au chargement
        setTimeout(checkHeaderOverflow, 100);

        console.log('[MobileMenu] Service initialisé');
    }

    // API publique
    return {
        init,
        toggleMobileSidebar,
        closeMobileSidebar,
        toggleMobileNav,
        closeMobileNav,
        switchViewMobile,
        toggleEditorToolbar,
        toggleLinksPanel,
        toggleToolbarFromFloating,
        toggleAdvancedMenu,
        checkHeaderOverflow
    };
})();

// Exposer globalement pour compatibilité
window.MobileMenuService = MobileMenuService;
window.toggleMobileSidebar = () => MobileMenuService.toggleMobileSidebar();
window.closeMobileSidebar = () => MobileMenuService.closeMobileSidebar();
window.toggleMobileNav = () => MobileMenuService.toggleMobileNav();
window.closeMobileNav = () => MobileMenuService.closeMobileNav();
window.switchViewMobile = (view) => MobileMenuService.switchViewMobile(view);
window.toggleEditorToolbar = () => MobileMenuService.toggleEditorToolbar();
window.toggleLinksPanel = () => MobileMenuService.toggleLinksPanel();
window.toggleToolbarFromFloating = () => MobileMenuService.toggleToolbarFromFloating();
window.toggleAdvancedMenu = () => MobileMenuService.toggleAdvancedMenu();
window.insertLink = () => {
    const url = prompt('Entrez l\'URL du lien:');
    if (url && typeof formatText === 'function') {
        formatText('createLink', url);
    }
};

// Auto-initialisation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        MobileMenuService.init();
        window.addEventListener('load', () => MobileMenuService.checkHeaderOverflow());
    });
} else {
    MobileMenuService.init();
    window.addEventListener('load', () => MobileMenuService.checkHeaderOverflow());
}

/**
 * [MVVM : View]
 * Gère l'affichage du mode édition et les interactions UI.
 */
const InterfaceCustomizerView = {
    /**
     * Affiche ou masque la barre d'outils d'édition
     */
    renderEditModeUI: (active) => {
        let bar = document.getElementById('interfaceEditBar');

        if (active) {
            document.body.classList.add('interface-edit-mode');
            if (!bar) {
                bar = document.createElement('div');
                bar.id = 'interfaceEditBar';
                bar.className = 'interface-edit-bar';
                bar.innerHTML = `
                    <div class="edit-bar-content">
                        <button class="btn btn-secondary" onclick="InterfaceCustomizerViewModel.cancelEditing()">
                            <i data-lucide="x"></i> ${Localization.t('btn.cancel')}
                        </button>
                        <div class="edit-bar-title">
                            <i data-lucide="layers"></i> <span>Configuration de l'Interface</span>
                        </div>
                        <button class="btn btn-primary" onclick="InterfaceCustomizerViewModel.saveAndExit()">
                            <i data-lucide="check"></i> ${Localization.t('btn.apply')}
                        </button>
                    </div>
                `;
                document.body.appendChild(bar);
                if (typeof lucide !== 'undefined') lucide.createIcons({ root: bar });
            }
            // Intercepter les clics sur les éléments du header
            InterfaceCustomizerView._bindInteraction();
        } else {
            document.body.classList.remove('interface-edit-mode');
            if (bar) bar.remove();
            InterfaceCustomizerView._unbindInteraction();
        }
    },

    /**
     * Met à jour l'aspect visuel des icônes selon leur état temporaire
     */
    refreshComponentsVisuals: () => {
        InterfaceCustomizerViewModel.applySettings();
    },

    /**
     * Intercepte les clics pour basculer la visibilité au lieu d'exécuter l'action
     */
    _bindInteraction: () => {
        const components = InterfaceCustomizerModel.components;
        components.forEach(comp => {
            const el = document.getElementById(comp.id);
            if (el) {
                el.setAttribute('data-original-onclick', el.getAttribute('onclick'));
                el.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    InterfaceCustomizerViewModel.toggleComponent(comp.id);
                };
            }

            // Mobile items
            const mobileItem = document.querySelector(`.mobile-nav-item[data-view="${comp.id.replace('header-tab-', '')}"]`);
            if (mobileItem) {
                mobileItem.setAttribute('data-original-onclick', mobileItem.getAttribute('onclick'));
                mobileItem.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    InterfaceCustomizerViewModel.toggleComponent(comp.id);
                };
            }
        });
    },

    /**
     * Restaure les clics originaux
     */
    _unbindInteraction: () => {
        const components = InterfaceCustomizerModel.components;
        components.forEach(comp => {
            const el = document.getElementById(comp.id);
            if (el && el.hasAttribute('data-original-onclick')) {
                const originalOnClick = el.getAttribute('data-original-onclick');
                // On restaure via setAttribute car c'est du code string dans le HTML
                el.setAttribute('onclick', originalOnClick);
                el.removeAttribute('data-original-onclick');
                // Re-init the function property correctly if needed
                el.onclick = new Function('event', originalOnClick);
            }

            const mobileItem = document.querySelector(`.mobile-nav-item[data-view="${comp.id.replace('header-tab-', '')}"]`);
            if (mobileItem && mobileItem.hasAttribute('data-original-onclick')) {
                const originalOnClick = mobileItem.getAttribute('data-original-onclick');
                mobileItem.setAttribute('onclick', originalOnClick);
                mobileItem.removeAttribute('data-original-onclick');
                mobileItem.onclick = new Function('event', originalOnClick);
            }
        });
    }
};

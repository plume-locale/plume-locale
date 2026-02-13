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
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-secondary" onclick="InterfaceCustomizerView.toggleAdvancedSettings()" id="advancedSettingsBtn">
                                <i data-lucide="settings-2"></i> Paramètres avancés
                            </button>
                            <button class="btn btn-primary" onclick="InterfaceCustomizerViewModel.saveAndExit()">
                                <i data-lucide="check"></i> ${Localization.t('btn.apply')}
                            </button>
                        </div>
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
            const panel = document.getElementById('interfaceAdvancedPanel');
            if (panel) panel.remove();
            InterfaceCustomizerView._unbindInteraction();
        }
    },

    /**
     * Affiche/masque le panneau latéral de réglages avancés
     */
    toggleAdvancedSettings: () => {
        let panel = document.getElementById('interfaceAdvancedPanel');
        if (!panel) {
            panel = InterfaceCustomizerView._renderAdvancedPanel();
            document.body.appendChild(panel);
            if (typeof lucide !== 'undefined') lucide.createIcons({ root: panel });
        }

        const isVisible = panel.style.display === 'block';
        panel.style.display = isVisible ? 'none' : 'block';

        const btn = document.getElementById('advancedSettingsBtn');
        if (btn) btn.classList.toggle('active', !isVisible);
    },

    /**
     * Génère le HTML du panneau avancé
     */
    _renderAdvancedPanel: () => {
        const settings = InterfaceCustomizerViewModel.state.tempSettings;
        const panel = document.createElement('div');
        panel.id = 'interfaceAdvancedPanel';
        panel.className = 'interface-advanced-panel';
        panel.style.display = 'none';

        panel.innerHTML = `
            <div class="advanced-panel-header">
                <span>PARAMÈTRES AVANCÉS</span>
                <i data-lucide="settings-2" style="width:16px;height:16px;opacity:0.5;"></i>
            </div>

            <div class="setting-group">
                <label class="setting-label">Largeur de la barre de progression</label>
                <div class="setting-row">
                    <input type="range" min="4" max="24" value="${settings.progressBarWidth || 8}" 
                           oninput="InterfaceCustomizerViewModel.updateSetting('progressBarWidth', parseInt(this.value)); this.nextElementSibling.textContent = this.value + 'px'"
                           style="flex:1;">
                    <span style="min-width: 35px; font-size: 0.8rem;">${settings.progressBarWidth || 8}px</span>
                </div>
            </div>

            <div class="setting-group">
                <label class="setting-label">Couleurs des statuts</label>
                
                <div class="setting-row">
                    <div class="color-input-wrapper">
                        <input type="color" value="${settings.statusDraftColor || '#ff6b6b'}" 
                               oninput="InterfaceCustomizerViewModel.updateSetting('statusDraftColor', this.value)">
                    </div>
                    <span style="font-size: 0.85rem;">Brouillon</span>
                </div>

                <div class="setting-row">
                    <div class="color-input-wrapper">
                        <input type="color" value="${settings.statusProgressColor || '#ffd93d'}" 
                               oninput="InterfaceCustomizerViewModel.updateSetting('statusProgressColor', this.value)">
                    </div>
                    <span style="font-size: 0.85rem;">En cours</span>
                </div>

                <div class="setting-row">
                    <div class="color-input-wrapper">
                        <input type="color" value="${settings.statusCompleteColor || '#51cf66'}" 
                               oninput="InterfaceCustomizerViewModel.updateSetting('statusCompleteColor', this.value)">
                    </div>
                    <span style="font-size: 0.85rem;">Terminé</span>
                </div>

                <div class="setting-row">
                    <div class="color-input-wrapper">
                        <input type="color" value="${settings.statusReviewColor || '#4a9eff'}" 
                               oninput="InterfaceCustomizerViewModel.updateSetting('statusReviewColor', this.value)">
                    </div>
                    <span style="font-size: 0.85rem;">À réviser</span>
                </div>
            </div>
        `;

        return panel;
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
                const currentOnClick = el.getAttribute('onclick');
                if (currentOnClick) {
                    el.setAttribute('data-original-onclick', currentOnClick);
                }
                el.onclick = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    InterfaceCustomizerViewModel.toggleComponent(comp.id);
                };
            }

            // Mobile items
            const viewKey = comp.id.replace('header-tab-', '');
            const mobileItem = document.querySelector(`.mobile-nav-item[data-view="${viewKey}"]`);
            if (mobileItem) {
                const mobileOnClick = mobileItem.getAttribute('onclick');
                if (mobileOnClick) {
                    mobileItem.setAttribute('data-original-onclick', mobileOnClick);
                }
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
            if (el) {
                if (el.hasAttribute('data-original-onclick')) {
                    const originalOnClick = el.getAttribute('data-original-onclick');
                    el.setAttribute('onclick', originalOnClick);
                    el.removeAttribute('data-original-onclick');
                    el.onclick = new Function('event', originalOnClick);
                } else {
                    el.onclick = null;
                }
            }

            const viewKey = comp.id.replace('header-tab-', '');
            const mobileItem = document.querySelector(`.mobile-nav-item[data-view="${viewKey}"]`);
            if (mobileItem) {
                if (mobileItem.hasAttribute('data-original-onclick')) {
                    const originalOnClick = mobileItem.getAttribute('data-original-onclick');
                    mobileItem.setAttribute('onclick', originalOnClick);
                    mobileItem.removeAttribute('data-original-onclick');
                    mobileItem.onclick = new Function('event', originalOnClick);
                } else {
                    mobileItem.onclick = null;
                }
            }
        });
    }
};

/**
 * [MVVM : ViewModel]
 * Gère la logique d'édition live et l'application des réglages.
 */
const InterfaceCustomizerViewModel = {
    state: {
        isEditing: false,
        settings: {}, // Réglages persistés
        tempSettings: {} // Réglages en cours d'édition
    },

    /**
     * Initialisation globale
     */
    init: () => {
        const settings = InterfaceCustomizerRepository.loadSettings();
        const defaults = InterfaceCustomizerModel.getDefaultSettings();

        // Rétrocompatibilité : S'assurer que les nouveaux champs existent
        if (!settings.activeModules) settings.activeModules = defaults.activeModules;
        if (!settings.mandatoryModules) settings.mandatoryModules = defaults.mandatoryModules;

        InterfaceCustomizerViewModel.state.settings = settings;
        InterfaceCustomizerViewModel.applySettings();
    },

    /**
     * Entre en mode édition live
     */
    startEditing: () => {
        InterfaceCustomizerViewModel.state.isEditing = true;
        InterfaceCustomizerViewModel.state.tempSettings = { ...InterfaceCustomizerViewModel.state.settings };
        InterfaceCustomizerView.renderEditModeUI(true);
        InterfaceCustomizerView.refreshComponentsVisuals();
    },

    /**
     * Quitte le mode édition sans sauvegarder
     */
    cancelEditing: () => {
        InterfaceCustomizerViewModel.state.isEditing = false;
        InterfaceCustomizerViewModel.state.tempSettings = {};
        InterfaceCustomizerView.renderEditModeUI(false);
        InterfaceCustomizerViewModel.applySettings(); // Revenir aux réglages originaux
    },

    /**
     * Sauvegarde et applique les réglages
     */
    saveAndExit: () => {
        InterfaceCustomizerViewModel.state.settings = { ...InterfaceCustomizerViewModel.state.tempSettings };
        InterfaceCustomizerRepository.saveSettings(InterfaceCustomizerViewModel.state.settings);
        InterfaceCustomizerViewModel.state.isEditing = false;
        InterfaceCustomizerView.renderEditModeUI(false);
        InterfaceCustomizerViewModel.applySettings();
        if (typeof showNotification === 'function') showNotification('✓ Interface personnalisée');
    },

    /**
     * Bascule l'activation d'un module
     */
    toggleModuleActive: (moduleId) => {
        const settings = InterfaceCustomizerViewModel.state.settings;
        const mandatory = settings.mandatoryModules || [];

        // Impossible de désactiver un module obligatoire
        if (mandatory.includes(moduleId)) return;

        const active = settings.activeModules || [];
        if (active.includes(moduleId)) {
            settings.activeModules = active.filter(id => id !== moduleId);
        } else {
            settings.activeModules = [...active, moduleId];
        }

        InterfaceCustomizerRepository.saveSettings(settings);
        InterfaceCustomizerViewModel.applySettings();
    },

    /**
     * [ADMIN ONLY] Bascule le statut obligatoire d'un module
     */
    toggleModuleMandatory: (moduleId) => {
        const settings = InterfaceCustomizerViewModel.state.settings;
        if (!settings.mandatoryModules) settings.mandatoryModules = [];

        if (settings.mandatoryModules.includes(moduleId)) {
            settings.mandatoryModules = settings.mandatoryModules.filter(id => id !== moduleId);
        } else {
            settings.mandatoryModules = [...settings.mandatoryModules, moduleId];
            // Si on le rend obligatoire, on doit aussi l'activer
            if (!settings.activeModules.includes(moduleId)) {
                settings.activeModules.push(moduleId);
            }
        }

        InterfaceCustomizerRepository.saveSettings(settings);
        InterfaceCustomizerViewModel.applySettings();
    },

    /**
     * Applique un preset global
     */
    applyPreset: (presetId) => {
        const preset = InterfaceCustomizerModel.presets.find(p => p.id === presetId);
        if (!preset) return;

        const settings = InterfaceCustomizerViewModel.state.settings;

        // Mix mandatory with preset choices
        const mandatory = settings.mandatoryModules || [];
        settings.activeModules = [...new Set([...mandatory, ...preset.modules])];
        settings.shortcuts = preset.shortcuts;

        InterfaceCustomizerRepository.saveSettings(settings);
        InterfaceCustomizerViewModel.applySettings();

        if (typeof showNotification === 'function') {
            showNotification(`✓ Preset ${presetId} appliqué`);
        }
    },

    /**
     * Bascule la visibilité d'un composant (en mode tempo ou réel)
     */
    toggleComponent: (componentId) => {
        // Sécurité : ne jamais masquer les boutons d'entrée du customizer
        if (componentId === 'headerInterfaceBtn' || componentId === 'sidebarCustomizeBtn') return;

        if (InterfaceCustomizerViewModel.state.isEditing) {
            InterfaceCustomizerViewModel.state.tempSettings[componentId] = !InterfaceCustomizerViewModel.state.tempSettings[componentId];
            InterfaceCustomizerView.refreshComponentsVisuals();
        }
    },

    /**
     * Met à jour un réglage spécifique (couleur, largeur, etc) - mode édition
     */
    updateSetting: (key, value) => {
        if (InterfaceCustomizerViewModel.state.isEditing) {
            InterfaceCustomizerViewModel.state.tempSettings[key] = value;
            InterfaceCustomizerViewModel.applySettings();
        }
    },

    /**
     * Met à jour un réglage structure et sauvegarde immédiatement (hors mode édition)
     */
    updateStructureSetting: (key, value) => {
        InterfaceCustomizerViewModel.state.settings[key] = value;
        InterfaceCustomizerRepository.saveSettings(InterfaceCustomizerViewModel.state.settings);
        InterfaceCustomizerViewModel.applySettings();
    },

    /**
     * Applique les réglages actuels au DOM
     */
    applySettings: () => {
        const settings = InterfaceCustomizerViewModel.state.isEditing
            ? InterfaceCustomizerViewModel.state.tempSettings
            : InterfaceCustomizerViewModel.state.settings;
        const isEditing = InterfaceCustomizerViewModel.state.isEditing;

        // 0. Déterminer quels composants sont masqués par les modules désactivés
        // Un composant n'est masqué que si TOUS les modules auxquels il appartient sont inactifs.
        const activeComponentIds = new Set(
            InterfaceCustomizerModel.modules
                .filter(m => settings.activeModules.includes(m.id))
                .flatMap(m => m.components)
        );

        const allModuleComponentIds = new Set(
            InterfaceCustomizerModel.modules.flatMap(m => m.components)
        );

        const forceHiddenComponentIds = [...allModuleComponentIds].filter(id => !activeComponentIds.has(id));

        // Render Shortcuts if defined
        if (typeof renderSidebarShortcuts === 'function') {
            // Filtrer les raccourcis : un raccourci ne peut être affiché que si son module est actif
            const filteredShortcuts = settings.shortcuts.filter(shortcutId => {
                const module = InterfaceCustomizerModel.modules.find(m => m.components.includes(`header-tab-${shortcutId}`) || m.components.includes(`nav-item-${shortcutId}`));
                return module ? settings.activeModules.includes(module.id) : true;
            });
            renderSidebarShortcuts(filteredShortcuts, isEditing);
        }

        // 1. Appliquer les variables CSS de personnalisation
        const root = document.documentElement;
        if (settings.progressBarWidth) root.style.setProperty('--progress-bar-width', `${settings.progressBarWidth}px`);
        if (settings.statusDraftColor) root.style.setProperty('--status-draft-color', settings.statusDraftColor);
        if (settings.statusProgressColor) root.style.setProperty('--status-progress-color', settings.statusProgressColor);
        if (settings.statusCompleteColor) root.style.setProperty('--status-complete-color', settings.statusCompleteColor);
        if (settings.statusReviewColor) root.style.setProperty('--status-review-color', settings.statusReviewColor);

        // 2. Appliquer aux éléments du header et autres éléments par ID
        // On fusionne les réglages individuels et les contraintes modules
        const allComponentIds = new Set([
            ...InterfaceCustomizerModel.components.map(c => c.id),
            ...InterfaceCustomizerModel.modules.flatMap(m => m.components)
        ]);

        allComponentIds.forEach(id => {
            if (id === 'headerInterfaceBtn' || id === 'sidebarCustomizeBtn') return;

            const el = document.getElementById(id);
            if (!el) return;

            // Un composant est visible si :
            // 1. Son module parent est actif (ou s'il n'en a pas)
            // 2. ET Son réglage individuel est true (s'il s'agit d'un composant débrayable individuellement)
            const isModuleActive = !forceHiddenComponentIds.includes(id);
            const isIndividualVisible = settings[id] !== false;
            const shouldShow = isModuleActive && isIndividualVisible;

            if (isEditing) {
                el.style.display = '';
                el.classList.toggle('interface-hidden-preview', !shouldShow);
            } else {
                el.style.display = shouldShow ? '' : 'none';
                el.classList.remove('interface-hidden-preview');
            }
        });

        // 3. Appliquer aux éléments du menu mobile
        const mobileButtons = document.querySelectorAll('.mobile-nav-item, .mobile-nav-btn');
        mobileButtons.forEach(btn => {
            const onClick = btn.getAttribute('onclick') || '';
            if (onClick.includes('startEditing')) {
                btn.style.display = '';
                btn.classList.remove('interface-hidden-preview');
                return;
            }

            let targetId = null;
            const viewMatch = onClick.match(/switchView(?:Mobile)?\(['"]([^'"]+)['"]\)/);
            if (viewMatch) {
                const view = viewMatch[1];
                const component = InterfaceCustomizerModel.components.find(c => c.id.includes(view));
                if (component) targetId = component.id;
            } else if (onClick.includes('openThemeManager')) targetId = 'headerThemesBtn';
            else if (onClick.includes('togglePomodoroPopup')) targetId = 'pomodoroHeaderBtn';
            else if (onClick.includes('openImportChapterModal')) targetId = 'headerImportBtn';
            else if (onClick.includes('KeyboardShortcutsHandlers.openShortcutsModal')) targetId = 'headerShortcutsBtn';
            else if (onClick.includes('toggleSplitView')) targetId = 'splitModeToggle';
            else if (onClick.includes('showStorageDetails')) targetId = 'storage-badge';

            if (!targetId) return;

            const isModuleActive = !forceHiddenComponentIds.includes(targetId);
            const isIndividualVisible = settings[targetId] !== false;
            const shouldShow = isModuleActive && isIndividualVisible;

            if (isEditing) {
                btn.style.display = '';
                btn.classList.toggle('interface-hidden-preview', !shouldShow);
            } else {
                btn.style.display = shouldShow ? '' : 'none';
                btn.classList.remove('interface-hidden-preview');
            }
        });

        // 4. Masquer les sections de l'accordéon (Sidebar) si le module est inactif
        // Note: L'accordéon utilise des IDs comme 'nav-item-stats'
        InterfaceCustomizerModel.modules.forEach(m => {
            const isModuleActive = settings.activeModules.includes(m.id);
            m.components.forEach(compId => {
                if (compId.startsWith('nav-item-')) {
                    const el = document.getElementById(compId);
                    if (el) el.style.display = isModuleActive ? '' : 'none';
                }
            });
        });
    }
};

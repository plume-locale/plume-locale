/**
 * [MVVM : Handlers]
 * Gestionnaires d'événements pour le système d'Undo/Redo
 */

const UndoRedoHandlers = {
    /**
     * Installe les hooks automatiques sur les éléments éditables
     */
    installTextEditHooks() {
        // Focusin : Sauvegarder l'état avant de commencer l'édition
        document.addEventListener('focusin', (e) => {
            const target = e.target;
            if (this._isSignificantEditable(target)) {
                if (!window.isUndoRedoAction) {
                    UndoRedoViewModel.saveToHistoryImmediate('text-edit-start');
                }
            }
        }, true);

        // Input : Sauvegarder avec debounce
        document.addEventListener('input', (e) => {
            const target = e.target;
            if (this._isSignificantEditable(target) || target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && target.type === 'text')) {
                if (UndoRedoViewModel._textEditDebounceTimer) {
                    clearTimeout(UndoRedoViewModel._textEditDebounceTimer);
                }

                UndoRedoViewModel._textEditDebounceTimer = setTimeout(() => {
                    if (!window.isUndoRedoAction) {
                        UndoRedoViewModel.saveToHistory('text-edit');
                    }
                    UndoRedoViewModel._textEditDebounceTimer = null;
                }, UndoRedoViewModel._textEditDebounceDelay);
            }
        }, true);

        // Focusout : Sauvegarder immédiatement à la fin de l'édition
        document.addEventListener('focusout', (e) => {
            const target = e.target;
            if (this._isSignificantEditable(target)) {
                if (UndoRedoViewModel._textEditDebounceTimer) {
                    clearTimeout(UndoRedoViewModel._textEditDebounceTimer);
                    UndoRedoViewModel._textEditDebounceTimer = null;
                }

                if (!window.isUndoRedoAction) {
                    UndoRedoViewModel.saveToHistoryImmediate('text-edit-end');
                }
            }
        }, true);

        // Change : Sauvegarder les changements de sélection (dropdowns)
        document.addEventListener('change', (e) => {
            const target = e.target;
            // Support spécifique pour les select de l'Arc Board et autres selects importants
            if (target.tagName === 'SELECT' && (target.classList.contains('arc-column-select') || this._isSignificantSelect(target))) {
                if (!window.isUndoRedoAction) {
                    // On laisse un petit délai pour que le handler métier ait mis à jour le modèle
                    setTimeout(() => {
                        UndoRedoViewModel.saveToHistoryImmediate('select-change');
                    }, 50);
                }
            }
        }, true);

        console.log('[UndoRedo] Hooks de texte et selection installés');
    },

    /**
     * Vérifie si un élément est un champ éditable "important"
     */
    _isSignificantEditable(target) {
        if (!target) return false;
        return (
            target.classList.contains('editor-textarea') ||
            target.classList.contains('synopsis-input') ||
            target.classList.contains('scene-separator-synopsis') ||
            target.id === 'sceneContent' ||
            target.id === 'sceneTitle' ||
            target.getAttribute('contenteditable') === 'true'
        );
    },

    /**
     * Vérifie si un élément est un select "important"
     */
    _isSignificantSelect(target) {
        if (!target) return false;
        // Ajouter d'autres classes de select importants ici si nécessaire
        return target.classList.contains('important-select');
    }
};

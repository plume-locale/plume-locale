// ============================================================
// word-repetition.handlers.js - Gestionnaires d'événements
// ============================================================

/**
 * [MVVM : Handlers]
 * Gestionnaires d'événements pour l'analyseur de répétitions
 */
const WordRepetitionHandlers = {
    /**
     * [MVVM : Handlers]
     * Gestionnaire de rafraîchissement/analyse
     */
    onRefresh() {
        const state = WordRepetitionViewModel.getState();
        const result = WordRepetitionViewModel.analyze(state.currentScope);

        this._refreshPanel();

        if (result.success) {
            WordRepetitionView.notify(result.message, 'success');
        } else {
            WordRepetitionView.notify(result.message, 'error');
        }
    },

    /**
     * [MVVM : Handlers]
     * Gestionnaire de changement de scope
     * @param {string} scope - Nouveau scope
     */
    onScopeChange(scope) {
        WordRepetitionState.currentScope = scope;
        const result = WordRepetitionViewModel.analyze(scope);

        this._refreshPanel();

        if (result.success) {
            WordRepetitionView.notify(result.message, 'info');
        }
    },

    /**
     * [MVVM : Handlers]
     * Gestionnaire d'ouverture/fermeture des paramètres
     */
    onToggleSettings() {
        WordRepetitionView.toggleSettings();
    },

    /**
     * [MVVM : Handlers]
     * Gestionnaire de changement de préférence
     * @param {string} key - Clé de préférence
     * @param {*} value - Nouvelle valeur
     */
    onPrefChange(key, value) {
        WordRepetitionRepository.updatePreference(key, value);
        WordRepetitionView.notify('Préférence mise à jour', 'info');
    },

    /**
     * [MVVM : Handlers]
     * Gestionnaire de sélection d'une répétition
     * @param {string} repId - ID de la répétition
     */
    onSelectRepetition(repId) {
        const rep = WordRepetitionViewModel.selectRepetition(repId);
        if (rep) {
            WordRepetitionView.showDetail(rep);
        }
    },

    /**
     * [MVVM : Handlers]
     * Gestionnaire de fermeture du détail
     */
    onCloseDetail() {
        WordRepetitionState.selectedRepetition = null;
        WordRepetitionView.closeDetail();
    },

    /**
     * [MVVM : Handlers]
     * Gestionnaire d'affichage des suggestions
     * @param {string} repId - ID de la répétition
     */
    onShowSuggestions(repId) {
        const rep = WordRepetitionViewModel.selectRepetition(repId);
        if (rep) {
            WordRepetitionView.showDetail(rep);
        }
    },

    /**
     * [MVVM : Handlers]
     * Gestionnaire d'affichage des occurrences
     * @param {string} repId - ID de la répétition
     */
    onShowOccurrences(repId) {
        const rep = WordRepetitionViewModel.selectRepetition(repId);
        if (rep) {
            WordRepetitionView.showDetail(rep);
        }
    },

    /**
     * [MVVM : Handlers]
     * Gestionnaire d'ignorance d'un mot
     * @param {string} word - Mot à ignorer
     */
    onIgnoreWord(word) {
        const result = WordRepetitionViewModel.ignoreWord(word);
        if (result.success) {
            WordRepetitionView.markAsIgnored(word);
            WordRepetitionView.notify(result.message, 'success');
        }
    },

    /**
     * [MVVM : Handlers]
     * Gestionnaire de copie d'une suggestion
     * @param {string} suggestion - Mot suggéré
     */
    onCopySuggestion(suggestion) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(suggestion).then(() => {
                WordRepetitionView.notify(`"${suggestion}" copié !`, 'success');
            });
        } else {
            // Fallback
            const textarea = document.createElement('textarea');
            textarea.value = suggestion;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            WordRepetitionView.notify(`"${suggestion}" copié !`, 'success');
        }
    },

    /**
     * [MVVM : Handlers]
     * Gestionnaire de chargement de plus de suggestions
     * @param {string} word - Mot à rechercher
     */
    async onLoadMoreSuggestions(word) {
        const suggestions = await WordRepetitionViewModel.getSuggestions(word);

        if (suggestions.length > 0) {
            // Mettre à jour la répétition avec les nouvelles suggestions
            const report = WordRepetitionViewModel.getCurrentReport();
            if (report) {
                const rep = report.repetitions.find(r => r.word === word);
                if (rep) {
                    rep.suggestions = suggestions;
                    WordRepetitionView.showDetail(rep);
                }
            }
        } else {
            WordRepetitionView.notify('Aucune suggestion supplémentaire', 'info');
        }
    },

    /**
     * [MVVM : Handlers]
     * Gestionnaire de navigation vers une occurrence
     * @param {Object} occurrence - Occurrence
     */
    onNavigateToOccurrence(occurrence) {
        const navResult = WordRepetitionViewModel.navigateToOccurrence(occurrence);

        if (navResult.success && navResult.action === 'openScene') {
            const { actId, chapterId, sceneId, highlightWord } = navResult.params;

            // Ouvrir la scène
            if (typeof openScene === 'function') {
                openScene(actId, chapterId, sceneId);

                // Après ouverture, surligner le mot
                setTimeout(() => {
                    this._highlightWordInEditor(highlightWord);
                }, 300);
            }
        }
    },

    /**
     * [MVVM : Handlers]
     * Gestionnaire d'ajout de mot ignoré
     */
    onAddIgnoredWord() {
        const word = prompt('Mot à ignorer :');
        if (word && word.trim()) {
            const success = WordRepetitionRepository.addIgnoredWord(word.trim());
            if (success) {
                WordRepetitionView.notify(`"${word.trim()}" ajouté aux mots ignorés`, 'success');
                this._refreshPanel();
            }
        }
    },

    /**
     * [MVVM : Handlers]
     * Gestionnaire de suppression de mot ignoré
     * @param {string} word - Mot à retirer
     */
    onRemoveIgnoredWord(word) {
        const success = WordRepetitionRepository.removeIgnoredWord(word);
        if (success) {
            WordRepetitionView.notify(`"${word}" retiré des mots ignorés`, 'success');
            this._refreshPanel();
        }
    },

    /**
     * [MVVM : Handlers]
     * Surligne un mot dans l'éditeur
     * @param {string} word - Mot à surligner
     * @private
     */
    _highlightWordInEditor(word) {
        const editor = document.querySelector('.editor-textarea');
        if (!editor) return;

        // Utiliser l'API de sélection
        const selection = window.getSelection();
        const range = document.createRange();

        // Trouver le premier mot correspondant
        const walker = document.createTreeWalker(
            editor,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );

        const regex = new RegExp(`\\b${word}\\b`, 'i');
        let node;
        while (node = walker.nextNode()) {
            const match = node.textContent.match(regex);
            if (match) {
                const startIndex = node.textContent.indexOf(match[0]);
                range.setStart(node, startIndex);
                range.setEnd(node, startIndex + match[0].length);
                selection.removeAllRanges();
                selection.addRange(range);

                // Scroll vers la sélection
                const rect = range.getBoundingClientRect();
                editor.scrollTop = rect.top - editor.getBoundingClientRect().top - 100;

                break;
            }
        }
    },

    /**
     * [MVVM : Handlers]
     * Rafraîchit le panneau
     * @private
     */
    _refreshPanel() {
        const container = document.getElementById('wordRepetitionContainer');
        if (container) {
            WordRepetitionView.renderPanel(container);
        }
    }
};

/**
 * [MVVM : Handlers]
 * Initialise le panneau de répétitions
 * @param {string} containerId - ID du conteneur
 */
function initWordRepetitionPanel(containerId = 'wordRepetitionContainer') {
    const container = document.getElementById(containerId);
    if (container) {
        WordRepetitionView.renderPanel(container);
    }
}

/**
 * [MVVM : Handlers]
 * Rafraîchit le panneau de répétitions si une scène change
 */
function refreshWordRepetitionOnSceneChange() {
    const state = WordRepetitionViewModel.getState();
    if (state.currentScope === WordRepetitionConfig.scope.SCENE) {
        // Clear le rapport pour forcer une nouvelle analyse
        WordRepetitionViewModel.clearReport();
        const container = document.getElementById('wordRepetitionContainer');
        if (container) {
            WordRepetitionView.renderPanel(container);
        }
    }
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        WordRepetitionHandlers,
        initWordRepetitionPanel,
        refreshWordRepetitionOnSceneChange
    };
}

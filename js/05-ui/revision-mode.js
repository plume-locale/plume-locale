/**
 * Revision Mode UI
 * Mode révision avec surlignage et annotations
 */

const RevisionModeUI = (() => {
    'use strict';

    let isActive = false;
    let selectedHighlightColor = 'yellow';
    let selectedAnnotationType = 'comment';
    let currentSelection = null;

    function toggle() {
        isActive = !isActive;
        
        if (isActive) {
            activateRevisionMode();
        } else {
            deactivateRevisionMode();
        }
        
        if (window.EventBus) EventBus.emit('revision:toggled', isActive);
    }

    function activateRevisionMode() {
        const editor = document.querySelector('.editor-textarea');
        if (editor) {
            editor.contentEditable = 'false';
        }
        
        updateToolbar(true);
        console.log('[Revision] Mode activé');
    }

    function deactivateRevisionMode() {
        const editor = document.querySelector('.editor-textarea');
        if (editor) {
            editor.contentEditable = 'true';
        }
        
        updateToolbar(false);
        console.log('[Revision] Mode désactivé');
    }

    function updateToolbar(active) {
        // Mise à jour de la toolbar (à implémenter selon le HTML)
    }

    function selectHighlightColor(color) {
        selectedHighlightColor = color;
    }

    function applyHighlight() {
        const sel = window.getSelection();
        if (!sel.rangeCount || sel.isCollapsed) {
            alert('Sélectionnez du texte à surligner');
            return;
        }

        const range = sel.getRangeAt(0);
        const span = document.createElement('span');
        span.className = 'highlight-' + selectedHighlightColor;
        
        try {
            range.surroundContents(span);
            if (window.updateSceneContent) updateSceneContent();
        } catch (e) {
            alert('Impossible de surligner cette sélection');
        }
        
        sel.removeAllRanges();
    }

    function removeHighlight() {
        const sel = window.getSelection();
        if (!sel.rangeCount) {
            alert('Sélectionnez un texte surligné');
            return;
        }

        const range = sel.getRangeAt(0);
        let node = range.commonAncestorContainer;
        
        if (node.nodeType === 3) {
            node = node.parentElement;
        }

        if (node.className && node.className.includes('highlight-')) {
            const parent = node.parentNode;
            while (node.firstChild) {
                parent.insertBefore(node.firstChild, node);
            }
            parent.removeChild(node);
            if (window.updateSceneContent) updateSceneContent();
        }

        sel.removeAllRanges();
    }

    function createAnnotation(text, type, context) {
        const state = StateManager.getState();
        const project = state.project;
        
        // Logique d'ajout d'annotation simplifiée
        const annotation = {
            id: Date.now(),
            type: type || selectedAnnotationType,
            text,
            context,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        // À implémenter: ajout à la scène courante
        
        if (window.EventBus) EventBus.emit('annotation:created', annotation);
        return annotation;
    }

    function deleteAnnotation(annotationId) {
        // Logique de suppression d'annotation
        if (window.EventBus) EventBus.emit('annotation:deleted', annotationId);
    }

    return {
        toggle,
        isActive: () => isActive,
        selectHighlightColor,
        applyHighlight,
        removeHighlight,
        createAnnotation,
        deleteAnnotation
    };
})();

window.RevisionModeUI = RevisionModeUI;
window.toggleRevisionMode = () => RevisionModeUI.toggle();
window.selectHighlightColor = (color) => RevisionModeUI.selectHighlightColor(color);
window.applyHighlight = () => RevisionModeUI.applyHighlight();
window.removeHighlight = () => RevisionModeUI.removeHighlight();

console.log('[RevisionMode] UI initialisée');

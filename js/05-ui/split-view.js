/**
 * Split View UI
 * Vue split écran avec deux panneaux synchronisables
 */

const SplitViewUI = (() => {
    'use strict';

    let isActive = false;
    let activePanel = 'left';
    let splitState = {
        left: { view: 'editor', sceneId: null, actId: null, chapterId: null },
        right: { view: null, sceneId: null, actId: null, chapterId: null },
        ratio: 60
    };

    const VIEW_LABELS = {
        'editor': 'Structure',
        'characters': 'Personnages',
        'world': 'Univers',
        'notes': 'Notes',
        'codex': 'Codex',
        'stats': 'Statistiques',
        'analysis': 'Analyse'
    };

    function toggle() {
        if (isActive) {
            close();
        } else {
            activate();
        }
    }

    function activate() {
        isActive = true;
        activePanel = 'left';
        
        // Initialize with current view state
        if (window.currentView) {
            splitState.left.view = window.currentView;
        }
        if (window.currentSceneId) {
            splitState.left.sceneId = window.currentSceneId;
            splitState.left.actId = window.currentActId;
            splitState.left.chapterId = window.currentChapterId;
        }
        
        render();
        if (window.EventBus) EventBus.emit('splitview:activated');
    }

    function close() {
        isActive = false;
        
        // Restore main view from left panel
        if (window.switchView && splitState.left.view) {
            window.switchView(splitState.left.view);
        }
        
        splitState.right.view = null;
        if (window.EventBus) EventBus.emit('splitview:closed');
    }

    function render() {
        const editorView = document.getElementById('editorView');
        if (!editorView || !isActive) return;
        
        const ratio = splitState.ratio || 60;
        const leftLabel = VIEW_LABELS[splitState.left.view] || 'Vue';
        const rightLabel = splitState.right.view ? VIEW_LABELS[splitState.right.view] || 'Vue' : 'Vide';
        
        editorView.innerHTML = '<div class="split-view-container"><div class="split-panel-left">'+leftLabel+'</div><div class="split-panel-right">'+rightLabel+'</div></div>';
    }

    function setActivePanel(panel) {
        activePanel = panel;
    }

    function saveSplitState() {
        localStorage.setItem('splitViewState', JSON.stringify(splitState));
    }

    function loadSplitState() {
        const saved = localStorage.getItem('splitViewState');
        if (saved) {
            try {
                splitState = JSON.parse(saved);
            } catch (e) {
                console.error('[SplitView] Erreur chargement:', e);
            }
        }
    }

    return {
        toggle,
        activate,
        close,
        render,
        setActivePanel,
        isActive: () => isActive,
        getState: () => splitState,
        saveSplitState,
        loadSplitState
    };
})();

window.SplitViewUI = SplitViewUI;
window.toggleSplitView = () => SplitViewUI.toggle();
window.splitViewActive = false;

console.log('[SplitView] UI initialisée');

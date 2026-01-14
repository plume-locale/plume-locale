        (function () {
            if (typeof window === 'undefined') return;
            // If migrated implementation exists, do not override
            if (window.saveToHistory && window.undo && window.redo) return;

            // Provide thin shims that delegate to migrated functions when available
            window.saveToHistory = window.saveToHistory || function () { console.warn('saveToHistory shim called before migration loaded'); };
            window.saveToHistoryImmediate = window.saveToHistoryImmediate || function () { console.warn('saveToHistoryImmediate shim called before migration loaded'); };
            window.undo = window.undo || function () { console.warn('undo shim called before migration loaded'); };
            window.redo = window.redo || function () { console.warn('redo shim called before migration loaded'); };
            window.updateUndoRedoButtons = window.updateUndoRedoButtons || function () { /* noop */ };
        })();
        

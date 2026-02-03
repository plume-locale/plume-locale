(function () {
    if (typeof window === 'undefined') return;
    // If migrated implementation exists, do not override
    if (window.saveToHistory && window.undo && window.redo) return;

    // Provide thin shims that delegate to migrated functions when available
    // [MVVM : ViewModel]
    // Command to save state (Shim)
    window.saveToHistory = window.saveToHistory || function () { console.warn('saveToHistory shim called before migration loaded'); };
    // [MVVM : ViewModel]
    // Command to save state immediately (Shim)
    window.saveToHistoryImmediate = window.saveToHistoryImmediate || function () { console.warn('saveToHistoryImmediate shim called before migration loaded'); };
    // [MVVM : ViewModel]
    // Command to undo action (Shim)
    window.undo = window.undo || function () { console.warn('undo shim called before migration loaded'); };
    // [MVVM : ViewModel]
    // Command to redo action (Shim)
    window.redo = window.redo || function () { console.warn('redo shim called before migration loaded'); };
    // [MVVM : View]
    // Update UI buttons state (Shim)
    window.updateUndoRedoButtons = window.updateUndoRedoButtons || function () { /* noop */ };
})();


// Migrated from js/05.undo-redo.js

function saveToHistory() {
    const snapshot = JSON.parse(JSON.stringify(project));
    console.log('📝 saveToHistory called - historyStack.length:', historyStack.length);
    historyStack.push(snapshot);
    if (historyStack.length > maxHistorySize) historyStack.shift();
    redoStack = [];
    console.log('✓ State saved - history size:', historyStack.length);
    updateUndoRedoButtons();
    try { if (typeof EventBus !== 'undefined') EventBus.emit('history:save', { size: historyStack.length }); } catch (e) {}
}

function saveToHistoryImmediate() {
    if (historyDebounceTimer) { clearTimeout(historyDebounceTimer); historyDebounceTimer = null; }
    saveToHistory();
}

function undo() {
    console.log('🔙 undo called - historyStack.length:', historyStack.length);
    if (historyStack.length === 0) { showNotification('⚠️ Aucune action à annuler'); return; }
    redoStack.push(JSON.parse(JSON.stringify(project)));
    const previousState = historyStack.pop();
    isUndoRedoAction = true;
    project = JSON.parse(JSON.stringify(previousState));
    console.log('✓ Project restored from history');
    saveProject();
    try { if (typeof EventBus !== 'undefined') EventBus.emit('history:undo', { historySize: historyStack.length }); } catch (e) {}
    refreshAllViews();
    isUndoRedoAction = false;
    updateUndoRedoButtons();
    showNotification('↶ Annulé');
}

function redo() {
    if (redoStack.length === 0) { showNotification('⚠️ Aucune action à rétablir'); return; }
    historyStack.push(JSON.parse(JSON.stringify(project)));
    const nextState = redoStack.pop();
    isUndoRedoAction = true;
    project = JSON.parse(JSON.stringify(nextState));
    saveProject();
    try { if (typeof EventBus !== 'undefined') EventBus.emit('history:redo', { redoSize: redoStack.length }); } catch (e) {}
    refreshAllViews();
    isUndoRedoAction = false;
    updateUndoRedoButtons();
    showNotification('↷ Rétabli');
}

function updateUndoRedoButtons() {
    const headerUndoBtn = document.getElementById('headerUndoBtn');
    const headerRedoBtn = document.getElementById('headerRedoBtn');
    const mobileUndoBtn = document.getElementById('mobileUndoBtn');
    const mobileRedoBtn = document.getElementById('mobileRedoBtn');
    const undoDisabled = historyStack.length === 0;
    const redoDisabled = redoStack.length === 0;
    if (headerUndoBtn) {
        headerUndoBtn.disabled = undoDisabled;
        headerUndoBtn.title = historyStack.length > 0 ? `Annuler (${historyStack.length} action(s) disponible(s)) - Ctrl+Z` : 'Aucune action à annuler';
    }
    if (headerRedoBtn) {
        headerRedoBtn.disabled = redoDisabled;
        headerRedoBtn.title = redoStack.length > 0 ? `Rétablir (${redoStack.length} action(s) disponible(s)) - Ctrl+Y` : 'Aucune action à rétablir';
    }
    if (mobileUndoBtn) {
        mobileUndoBtn.disabled = undoDisabled;
        mobileUndoBtn.style.opacity = undoDisabled ? '0.5' : '1';
        mobileUndoBtn.style.cursor = undoDisabled ? 'not-allowed' : 'pointer';
    }
    if (mobileRedoBtn) {
        mobileRedoBtn.disabled = redoDisabled;
        mobileRedoBtn.style.opacity = redoDisabled ? '0.5' : '1';
        mobileRedoBtn.style.cursor = redoDisabled ? 'not-allowed' : 'pointer';
    }
    try { if (typeof EventBus !== 'undefined') EventBus.emit('history:change', { historySize: historyStack.length, redoSize: redoStack.length }); } catch (e) {}
}

// Expose for backward compatibility
if (typeof window !== 'undefined') {
    window.saveToHistory = saveToHistory;
    window.saveToHistoryImmediate = saveToHistoryImmediate;
    window.undo = undo;
    window.redo = redo;
    window.updateUndoRedoButtons = updateUndoRedoButtons;
}

// Attach to EventBus if available (or retry until available)
(function attachEventBusListeners() {
    let attempts = 0;
    function tryAttach() {
        attempts++;
        if (typeof EventBus !== 'undefined') {
            EventBus.on('history:undo', () => undo());
            EventBus.on('history:redo', () => redo());
            EventBus.on('history:save', () => saveToHistory());
            return;
        }
        if (attempts < 50) setTimeout(tryAttach, 100);
    }
    tryAttach();
})();
// Migrated from js/05.undo-redo.js

function saveToHistory() {
    // Créer une copie profonde du projet
    const snapshot = JSON.parse(JSON.stringify(project));
    
    console.log('📝 saveToHistory appelé - historyStack.length:', historyStack.length);
    
    // Ajouter à l'historique
    historyStack.push(snapshot);
    
    // Limiter la taille de l'historique
    if (historyStack.length > maxHistorySize) {
        historyStack.shift(); // Retirer le plus ancien
    }
    
    // Vider le redo stack car on a fait une nouvelle action
    redoStack = [];
    
    console.log('✓ État sauvegardé - Total dans historique:', historyStack.length);
    
    // Mettre à jour l'UI
    updateUndoRedoButtons();
}

// Sauvegarder immédiatement dans l'historique (pour actions importantes)
function saveToHistoryImmediate() {
    if (historyDebounceTimer) {
        clearTimeout(historyDebounceTimer);
        historyDebounceTimer = null;
    }
    
    saveToHistory();
}

function undo() {
    console.log('🔙 Undo appelé - historyStack.length:', historyStack.length);
    
    if (historyStack.length === 0) {
        console.log('⚠️ Historique vide !');
        showNotification('⚠️ Aucune action à annuler');
        return;
    }
    
    // Sauvegarder l'état actuel dans le redo stack
    redoStack.push(JSON.parse(JSON.stringify(project)));
    console.log('💾 État actuel sauvegardé dans redoStack');
    
    // Restaurer l'état précédent
    const previousState = historyStack.pop();
    console.log('📂 État précédent récupéré - reste dans historique:', historyStack.length);
    
    // Flag pour éviter de sauvegarder cette restauration
    isUndoRedoAction = true;
    project = JSON.parse(JSON.stringify(previousState));
    console.log('✓ Projet restauré');
    
    // Sauvegarder et rafraîchir
    saveProject();
    refreshAllViews();
    
    isUndoRedoAction = false;
    updateUndoRedoButtons();
    showNotification('↶ Annulé');
}

function redo() {
    if (redoStack.length === 0) {
        showNotification('⚠️ Aucune action à rétablir');
        return;
    }
    
    // Sauvegarder l'état actuel dans l'historique
    historyStack.push(JSON.parse(JSON.stringify(project)));
    
    // Restaurer l'état suivant
    const nextState = redoStack.pop();
    
    // Flag pour éviter de sauvegarder cette restauration
    isUndoRedoAction = true;
    project = JSON.parse(JSON.stringify(nextState));
    
    // Sauvegarder et rafraîchir
    saveProject();
    refreshAllViews();
    
    isUndoRedoAction = false;
    updateUndoRedoButtons();
    showNotification('↷ Rétabli');
}

function updateUndoRedoButtons() {
    const headerUndoBtn = document.getElementById('headerUndoBtn');
    const headerRedoBtn = document.getElementById('headerRedoBtn');
    
    const mobileUndoBtn = document.getElementById('mobileUndoBtn');
    const mobileRedoBtn = document.getElementById('mobileRedoBtn');
    
    const undoDisabled = historyStack.length === 0;
    const redoDisabled = redoStack.length === 0;
    
    if (headerUndoBtn) {
        headerUndoBtn.disabled = undoDisabled;
        headerUndoBtn.title = historyStack.length > 0 
            ? `Annuler (${historyStack.length} action(s) disponible(s)) - Ctrl+Z`
            : 'Aucune action à annuler';
    }
    
    if (headerRedoBtn) {
        headerRedoBtn.disabled = redoDisabled;
        headerRedoBtn.title = redoStack.length > 0 
            ? `Rétablir (${redoStack.length} action(s) disponible(s)) - Ctrl+Y`
            : 'Aucune action à rétablir';
    }
    
    if (mobileUndoBtn) {
        mobileUndoBtn.disabled = undoDisabled;
        if (undoDisabled) {
            mobileUndoBtn.style.opacity = '0.5';
            mobileUndoBtn.style.cursor = 'not-allowed';
        } else {
            mobileUndoBtn.style.opacity = '1';
            mobileUndoBtn.style.cursor = 'pointer';
        }
    }
    
    if (mobileRedoBtn) {
        mobileRedoBtn.disabled = redoDisabled;
        if (redoDisabled) {
            mobileRedoBtn.style.opacity = '0.5';
            mobileRedoBtn.style.cursor = 'not-allowed';
        } else {
            mobileRedoBtn.style.opacity = '1';
            mobileRedoBtn.style.cursor = 'pointer';
        }
    }
}

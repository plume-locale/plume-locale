/**
 * Repository for keyboard shortcuts
 */
class KeyboardShortcutsRepository {
    constructor() {
        this.shortcuts = [
            { id: 'closeModals', key: 'Escape', ctrl: false, meta: false, description: 'Close all modals' },
            { id: 'focusSearch', key: 'f', ctrl: true, meta: true, description: 'Focus global search' },
            { id: 'saveProject', key: 's', ctrl: true, meta: true, description: 'Save current project' },
            { id: 'toggleFocusMode', key: 'F11', ctrl: false, meta: false, description: 'Toggle focus mode' },
            { id: 'toggleRevision', key: 'r', ctrl: true, meta: true, description: 'Toggle revision mode' },
            { id: 'openShortcutsModal', key: '?', ctrl: false, meta: false, description: 'Show keyboard shortcuts summary' }
        ].map(s => {
            const kb = new KeyboardShortcut(s.key, s.ctrl, s.meta, s.shift || false, s.alt || false, s.description);
            kb.id = s.id;
            return kb;
        });
    }

    getAll() {
        return this.shortcuts;
    }

    getById(id) {
        return this.shortcuts.find(s => s.id === id);
    }
}

const keyboardShortcutsRepository = new KeyboardShortcutsRepository();

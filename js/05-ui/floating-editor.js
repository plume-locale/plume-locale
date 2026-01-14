// Migrated from js/09.floating-editor.js

// FLOATING EDITOR (mobile & desktop helpers)

function initEditorGestures() {
    const editor = document.querySelector('.editor-textarea');
    if (!editor) return;
    
    let lastTap = 0;
    let initialPinchDistance = 0;
    let initialFontSize = 16;
    
    editor.addEventListener('touchend', (e) => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            e.preventDefault();
            toggleFocusMode();
        }
        lastTap = currentTime;
    });
    
    let touchStartY = 0;
    editor.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            touchStartY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
            const computedStyle = window.getComputedStyle(editor);
            initialFontSize = parseFloat(computedStyle.fontSize);
        }
    });
    
    editor.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const currentDistance = Math.sqrt(dx * dx + dy * dy);
            const scale = currentDistance / initialPinchDistance;
            const newFontSize = Math.max(12, Math.min(24, initialFontSize * scale));
            editor.style.fontSize = newFontSize + 'px';
        }
    });
    
    editor.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 2) {
            const touchEndY = touchStartY;
            const deltaY = touchEndY - touchStartY;
            if (deltaY < -50) { 
                e.preventDefault();
                if (typeof EventBus !== 'undefined') EventBus.emit('history:undo');
                else if (typeof undo === 'function') undo();
            }
            else if (deltaY > 50) { 
                e.preventDefault();
                if (typeof EventBus !== 'undefined') EventBus.emit('history:redo');
                else if (typeof redo === 'function') redo();
            }
        }
    });
}

let floatingMenuPosition = null;
let isDraggingFloatingMenu = false;
let dragOffset = { x: 0, y: 0 };

function initFloatingEditorMenu() {
    const menu = document.getElementById('floatingEditorMenu');
    const handle = document.getElementById('floatingMenuHandle');
    const toggleBtn = document.getElementById('floatingEditorToggle');
    if (!menu || !handle || !toggleBtn) return;

    toggleBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleFloatingEditorMenu();
    });

    // Prefer StateManager-stored position when available, fallback to localStorage
    let savedPos = null;
    if (typeof StateManager !== 'undefined') {
        try { savedPos = StateManager.get('floatingMenuPosition'); } catch (e) { savedPos = null; }
    }
    if (!savedPos) {
        const raw = localStorage.getItem('floatingMenuPosition');
        if (raw) {
            try { savedPos = JSON.parse(raw); } catch (e) { savedPos = null; }
        }
    }
    if (savedPos) {
        floatingMenuPosition = savedPos;
    }
    if (!floatingMenuPosition) {
        floatingMenuPosition = { x: Math.max(10, (window.innerWidth / 2) - 150), y: Math.max(10, (window.innerHeight / 2) - 200) };
    }

    handle.addEventListener('touchstart', function(e) {
        isDraggingFloatingMenu = true;
        const touch = e.touches[0];
        const rect = menu.getBoundingClientRect();
        dragOffset.x = touch.clientX - rect.left;
        dragOffset.y = touch.clientY - rect.top;
        handle.style.background = 'var(--accent-red)';
        e.preventDefault(); e.stopPropagation();
    }, { passive: false });

    handle.addEventListener('mousedown', function(e) {
        isDraggingFloatingMenu = true;
        const rect = menu.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        handle.style.background = 'var(--accent-red)';
        e.preventDefault(); e.stopPropagation();
    });
}

document.addEventListener('touchmove', function(e) {
    if (!isDraggingFloatingMenu) return;
    const menu = document.getElementById('floatingEditorMenu');
    const touch = e.touches[0];
    const newX = touch.clientX - dragOffset.x;
    const newY = touch.clientY - dragOffset.y;
    floatingMenuPosition.x = Math.max(10, Math.min(newX, window.innerWidth - menu.offsetWidth - 10));
    floatingMenuPosition.y = Math.max(10, Math.min(newY, window.innerHeight - menu.offsetHeight - 10));
    menu.style.transform = 'none';
    menu.style.left = floatingMenuPosition.x + 'px';
    menu.style.top = floatingMenuPosition.y + 'px';
    e.preventDefault(); e.stopPropagation();
}, { passive: false });

document.addEventListener('touchend', function(e) {
    if (!isDraggingFloatingMenu) return;
    isDraggingFloatingMenu = false;
    const handle = document.getElementById('floatingMenuHandle'); if (handle) handle.style.background = 'var(--accent-gold)';
    // Persist position to both StateManager (if present) and localStorage for backward compatibility
    try {
        if (typeof StateManager !== 'undefined') StateManager.set('floatingMenuPosition', floatingMenuPosition);
    } catch (e) { console.warn('StateManager not available to persist floatingMenuPosition'); }
    localStorage.setItem('floatingMenuPosition', JSON.stringify(floatingMenuPosition));
});

document.addEventListener('mousemove', function(e) {
    if (!isDraggingFloatingMenu) return;
    const menu = document.getElementById('floatingEditorMenu');
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    floatingMenuPosition.x = Math.max(10, Math.min(newX, window.innerWidth - menu.offsetWidth - 10));
    floatingMenuPosition.y = Math.max(10, Math.min(newY, window.innerHeight - menu.offsetHeight - 10));
    menu.style.transform = 'none';
    menu.style.left = floatingMenuPosition.x + 'px';
    menu.style.top = floatingMenuPosition.y + 'px';
    e.preventDefault();
});

document.addEventListener('mouseup', function(e) {
    if (!isDraggingFloatingMenu) return;
    isDraggingFloatingMenu = false;
    const handle = document.getElementById('floatingMenuHandle'); if (handle) handle.style.background = 'var(--accent-gold)';
    try {
        if (typeof StateManager !== 'undefined') StateManager.set('floatingMenuPosition', floatingMenuPosition);
    } catch (e) { console.warn('StateManager not available to persist floatingMenuPosition'); }
    localStorage.setItem('floatingMenuPosition', JSON.stringify(floatingMenuPosition));
});

function updateFloatingMenuPosition() {
    const menu = document.getElementById('floatingEditorMenu');
    if (menu && floatingMenuPosition) {
        menu.style.transform = 'none';
        menu.style.left = floatingMenuPosition.x + 'px';
        menu.style.top = floatingMenuPosition.y + 'px';
    }
}

function toggleFloatingEditorMenu() {
    const menu = document.getElementById('floatingEditorMenu');
    const toggle = document.getElementById('floatingEditorToggle');
    if (!menu || !toggle) return;
    if (menu.classList.contains('active')) { menu.classList.remove('active'); toggle.textContent = '✏️'; }
    else { menu.classList.add('active'); updateFloatingMenuPosition(); toggle.textContent = '✖️'; }
    // Emit an event for UI consumers
    try { if (typeof EventBus !== 'undefined') EventBus.emit('floating-editor:toggled', { active: menu.classList.contains('active') }); } catch (e) { /* ignore */ }
}

function applyFloatingFormat() { const format = document.getElementById('floatingFormatBlock').value; document.execCommand('formatBlock', false, format); const editor = document.querySelector('.editor-textarea'); if (editor) editor.focus(); }
function changeFloatingTextColor() { const color = document.getElementById('floatingTextColor').value; document.execCommand('foreColor', false, color); const editor = document.querySelector('.editor-textarea'); if (editor) editor.focus(); }
function changeFloatingBackgroundColor() { const color = document.getElementById('floatingBgColor').value; document.execCommand('hiliteColor', false, color); const editor = document.querySelector('.editor-textarea'); if (editor) editor.focus(); }
function insertLink() { const url = prompt('URL du lien :'); if (url) { const selection = window.getSelection(); if (selection.toString()) { document.execCommand('createLink', false, url); } else { const text = prompt('Texte du lien :'); if (text) { document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${text}</a>`); } } const editor = document.querySelector('.editor-textarea'); if (editor) editor.focus(); } }
function insertImage() { const url = prompt('URL de l\'image :'); if (url) { document.execCommand('insertImage', false, url); const editor = document.querySelector('.editor-textarea'); if (editor) editor.focus(); } }

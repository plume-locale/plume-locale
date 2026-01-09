// Floating Editor UI - Menu flottant pour édition rapide
const FloatingEditorUI = (() => {
    let isOpen = false;

    function toggle() {
        isOpen = !isOpen;
        const menu = document.getElementById('floatingEditorMenu');
        const toggle = document.getElementById('floatingEditorToggle');
        
        if (menu) {
            menu.classList.toggle('active');
        }
        
        if (toggle) {
            toggle.textContent = isOpen ? '✕' : '⚙️';
        }
    }

    function close() {
        isOpen = false;
        const menu = document.getElementById('floatingEditorMenu');
        const toggle = document.getElementById('floatingEditorToggle');
        
        if (menu) menu.classList.remove('active');
        if (toggle) toggle.textContent = '⚙️';
    }

    return { toggle, close };
})();

window.FloatingEditorUI = FloatingEditorUI;
window.toggleFloatingEditor = () => FloatingEditorUI.toggle();
window.closeFloatingEditor = () => FloatingEditorUI.close();

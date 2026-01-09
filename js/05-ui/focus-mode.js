// Focus Mode UI - Mode de concentration avec pomodoro
const FocusModeUI = (() => {
    let focusModeActive = false;
    let focusPanelOpen = false;
    let focusStartWordCount = 0;
    let projectWordGoal = 50000;
    let pomodoroTime = 25 * 60;
    let pomodoroInterval = null;
    let pomodoroRunning = false;
    let pomodorosCompleted = 0;

    function toggle() {
        focusModeActive = !focusModeActive;
        const appContainer = document.querySelector('.app-container');
        if (!appContainer) return;

        if (focusModeActive) {
            appContainer.classList.add('focus-mode');
            if (appContainer.requestFullscreen) {
                appContainer.requestFullscreen().catch(() => {});
            }
        } else {
            appContainer.classList.remove('focus-mode');
            if (document.exitFullscreen && document.fullscreenElement) {
                document.exitFullscreen();
            }
            focusPanelOpen = false;
            const panel = document.getElementById('focusPanel');
            if (panel) panel.classList.remove('active');
        }
    }

    function togglePanel() {
        focusPanelOpen = !focusPanelOpen;
        const panel = document.getElementById('focusPanel');
        if (panel) panel.classList.toggle('active');
    }

    function startPomodoro() {
        if (pomodoroRunning) return;
        pomodoroRunning = true;
        const btn = document.getElementById('pomodoroHeaderBtn');
        if (btn) btn.classList.add('pomodoro-active');
        
        pomodoroInterval = setInterval(() => {
            if (pomodoroTime > 0) {
                pomodoroTime--;
                updatePomodoroDisplay();
            } else {
                completePomodoro();
            }
        }, 1000);
    }

    function pausePomodoro() {
        pomodoroRunning = false;
        const btn = document.getElementById('pomodoroHeaderBtn');
        if (btn) btn.classList.remove('pomodoro-active');
        if (pomodoroInterval) {
            clearInterval(pomodoroInterval);
            pomodoroInterval = null;
        }
    }

    function resetPomodoro() {
        pausePomodoro();
        pomodoroTime = 25 * 60;
        updatePomodoroDisplay();
    }

    function completePomodoro() {
        pausePomodoro();
        pomodorosCompleted++;
        const display = document.getElementById('pomodorosCompleted');
        if (display) display.textContent = pomodorosCompleted;
        alert('⏰ Pomodoro terminé ! Temps de pause.');
        pomodoroTime = 25 * 60;
        updatePomodoroDisplay();
    }

    function updatePomodoroDisplay() {
        const minutes = Math.floor(pomodoroTime / 60);
        const seconds = pomodoroTime % 60;
        const display = document.getElementById('pomodoroDisplay');
        if (display) {
            display.textContent = minutes.toString().padStart(2, '0') + ':' + seconds.toString().padStart(2, '0');
        }
    }

    function togglePomodoroPopup() {
        const popup = document.getElementById('pomodoroPopup');
        if (popup) popup.classList.toggle('active');
    }

    return { toggle, togglePanel, startPomodoro, pausePomodoro, resetPomodoro, togglePomodoroPopup };
})();

window.FocusModeUI = FocusModeUI;
window.toggleFocusMode = () => FocusModeUI.toggle();
window.toggleFocusPanel = () => FocusModeUI.togglePanel();
window.startPomodoro = () => FocusModeUI.startPomodoro();
window.pausePomodoro = () => FocusModeUI.pausePomodoro();
window.resetPomodoro = () => FocusModeUI.resetPomodoro();
window.togglePomodoroPopup = () => FocusModeUI.togglePomodoroPopup();
window.toggleToolbar = () => {
    const toolbar = document.getElementById('editorToolbar');
    if (toolbar) toolbar.style.display = document.getElementById('hideToolbar')?.checked ? 'none' : 'flex';
};
window.toggleLinksPanelVisibility = () => {
    const panel = document.getElementById('linksPanel');
    if (panel) panel.style.display = document.getElementById('hideLinksPanel')?.checked ? 'none' : 'block';
};
window.focusModeActive = false;
window.focusPanelOpen = false;

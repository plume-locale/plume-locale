/**
 * GDrive Backup Main
 */
let gdriveBackupViewModel;
let gdriveBackupView;

async function initGDriveBackup() {
    gdriveBackupView = new GDriveBackupView();
    gdriveBackupViewModel = new GDriveBackupViewModel(gdriveBackupRepository);

    // Bind view update to viewmodel changes
    gdriveBackupViewModel.onStateChange = (state) => {
        gdriveBackupView.render(state);
    };

    // Delay initialization to let GAPI scripts load if they are slow
    const checkInterval = setInterval(() => {
        if (typeof gapi !== 'undefined' && typeof google !== 'undefined') {
            clearInterval(checkInterval);
            gdriveBackupViewModel.initialize();
        }
    }, 500);
}

// Start initialization
window.addEventListener('load', initGDriveBackup);

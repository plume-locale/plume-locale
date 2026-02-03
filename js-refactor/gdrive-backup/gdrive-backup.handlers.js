/**
 * GDrive Backup Handlers
 */
const GDriveBackupHandlers = {
    onLogin() {
        gdriveBackupViewModel.login();
    },

    onLogout() {
        gdriveBackupViewModel.logout();
    },

    onSync() {
        gdriveBackupViewModel.sync();
    },

    onRestore() {
        gdriveBackupViewModel.restore();
    },

    onToggleAutoSave(event) {
        gdriveBackupViewModel.toggleAutoSave(event.target.checked);
    }
};

// Global functions for legacy onclick handlers in HTML
function handleAuthClick() { GDriveBackupHandlers.onLogin(); }
function handleSignoutClick() { GDriveBackupHandlers.onLogout(); }
function syncNowWithGDrive() { GDriveBackupHandlers.onSync(); }
function restoreFromGDrive() { GDriveBackupHandlers.onRestore(); }
function toggleGDriveAutoSave(enabled) {
    gdriveBackupViewModel.toggleAutoSave(enabled);
}

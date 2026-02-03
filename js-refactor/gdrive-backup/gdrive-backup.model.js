/**
 * GDrive Backup Model
 */
const GDriveBackupModel = {
    createInitialState() {
        return {
            isSignedIn: false,
            user: null, // { name, email, picture }
            autoSaveEnabled: false,
            lastSyncTime: null,
            status: 'idle', // 'idle', 'syncing', 'success', 'error'
            statusMessage: 'Prêt',
            fileId: null
        };
    }
};

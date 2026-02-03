/**
 * GDrive Backup ViewModel
 */
class GDriveBackupViewModel {
    constructor(repository) {
        this.repository = repository;
        this.state = GDriveBackupModel.createInitialState();
        this.onStateChange = null;
        this.autoSaveTimer = null;
    }

    async initialize() {
        // Load persistend state from local storage
        const token = localStorage.getItem('gdrive_token');
        const userStr = localStorage.getItem('gdrive_user');
        const autoSave = localStorage.getItem('gdrive_auto_save') === 'true';

        await this.repository.init();

        if (token && userStr) {
            this.state.isSignedIn = true;
            this.state.user = JSON.parse(userStr);
            this.state.autoSaveEnabled = autoSave;
            this.repository.setToken(token);

            if (autoSave) {
                this.startAutoSave();
            }
        }

        this.notify();
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.notify();
    }

    notify() {
        if (this.onStateChange) {
            this.onStateChange(this.state);
        }
    }

    async login() {
        if (!this.repository.CLIENT_ID) {
            alert("Configuration manquante : Veuillez contacter l'administrateur.");
            return;
        }

        this.repository.requestAccessToken(async (resp) => {
            if (resp.error !== undefined) {
                this.setState({ status: 'error', statusMessage: 'Erreur d\'authentification' });
                return;
            }

            localStorage.setItem('gdrive_token', resp.access_token);
            this.repository.setToken(resp.access_token);

            const user = await this.repository.fetchUserInfo(resp.access_token);
            this.state.user = user;
            this.state.isSignedIn = true;
            localStorage.setItem('gdrive_user', JSON.stringify(user));

            this.setState({ status: 'success', statusMessage: 'Connecté' });
        }, this.state.isSignedIn ? '' : 'consent');
    }

    logout() {
        const token = localStorage.getItem('gdrive_token');
        if (token) {
            this.repository.revokeToken(token);
            localStorage.removeItem('gdrive_token');
            localStorage.removeItem('gdrive_user');
            this.state.isSignedIn = false;
            this.state.user = null;
            this.toggleAutoSave(false);
            this.setState({ status: 'idle', statusMessage: 'Déconnecté' });
        }
    }

    async sync() {
        if (!this.state.isSignedIn) return;

        this.setState({ status: 'syncing', statusMessage: 'Synchronisation...' });

        try {
            const fileName = `Plume_${project.title.replace(/\s+/g, '_')}.json`;
            const content = JSON.stringify(project, null, 2);

            let fileId = localStorage.getItem(`gdrive_file_id_${project.title}`);

            if (fileId) {
                try {
                    await this.repository.updateFile(fileId, content);
                } catch (e) {
                    if (e.status === 404) {
                        fileId = null; // Re-create if deleted
                    } else {
                        throw e;
                    }
                }
            }

            if (!fileId) {
                const existingFile = await this.repository.findFile(fileName);
                if (existingFile) {
                    fileId = existingFile.id;
                    await this.repository.updateFile(fileId, content);
                } else {
                    fileId = await this.repository.createFile(fileName, content);
                }
                localStorage.setItem(`gdrive_file_id_${project.title}`, fileId);
            }

            const now = new Date();
            this.setState({
                status: 'success',
                statusMessage: 'Dernière sauvegarde : ' + now.toLocaleTimeString(),
                lastSyncTime: now
            });

        } catch (error) {
            console.error('GDrive Sync Error:', error);
            this.setState({ status: 'error', statusMessage: 'Erreur de synchronisation' });

            if (error.status === 401) {
                // Re-auth needed
                this.login();
            }
        }
    }

    async restore() {
        if (!this.state.isSignedIn) return;
        if (!confirm('Restaurer depuis Google Drive ? Les données locales seront remplacées.')) return;

        this.setState({ status: 'syncing', statusMessage: 'Récupération...' });

        try {
            const fileName = `Plume_${project.title.replace(/\s+/g, '_')}.json`;
            const file = await this.repository.findFile(fileName);

            if (file) {
                const importedData = await this.repository.getFileContent(file.id);
                if (importedData && importedData.acts) {
                    // Update global project object (Legacy compatibility)
                    window.project = {
                        ...window.project,
                        ...importedData
                    };
                    saveProject(); // Legacy global save
                    if (typeof renderActsList === 'function') renderActsList();
                    if (typeof switchView === 'function') switchView('editor');

                    this.setState({ status: 'success', statusMessage: 'Restauration réussie' });
                    alert('Projet restauré avec succès !');
                }
            } else {
                alert('Aucune sauvegarde trouvée sur votre Drive.');
                this.setState({ status: 'idle', statusMessage: 'Aucun fichier trouvé' });
            }
        } catch (error) {
            console.error('GDrive Restore Error:', error);
            this.setState({ status: 'error', statusMessage: 'Erreur de restauration' });
        }
    }

    toggleAutoSave(enabled) {
        this.state.autoSaveEnabled = enabled;
        localStorage.setItem('gdrive_auto_save', enabled);

        if (enabled) {
            this.startAutoSave();
        } else {
            this.stopAutoSave();
        }
        this.notify();
    }

    startAutoSave() {
        this.stopAutoSave();
        this.autoSaveTimer = setInterval(() => {
            this.sync();
        }, 5 * 60 * 1000); // 5 mins
    }

    stopAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
}

/**
 * [MVVM : ViewModel]
 * Import/Export ViewModel
 * Coordinates modal state, selection logic, and triggers export/import actions.
 */

const ImportExportViewModel = {

    // --- Backup & Restore (JSON) ---

    showBackupMenu: function () {
        ImportExportView.openBackupModal();
    },

    exportToJSON: function () {
        if (!window.project) return;
        const dataStr = JSON.stringify(window.project, null, 2);
        const filename = `${(window.project.title || 'projet').replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;

        ImportExportRepository.downloadFile(dataStr, filename, 'application/json');

        // Notify user (View responsibility really, but alert is quick)
        alert(`💾 Fichier JSON téléchargé !\n\nNom : ${filename}\n\nTu peux maintenant l'uploader sur Google Drive, Dropbox, ou tout autre service cloud.`);
    },

    importFromFile: function () {
        ImportExportView.triggerFileInput();
    },

    handleFileImport: async function (file) {
        if (!file) return;
        if (!file.name.endsWith('.json')) {
            alert('⚠️ Erreur : Le fichier doit être au format JSON');
            return;
        }

        if (!confirm('⚠️ ATTENTION : L\'import va remplacer toutes vos données actuelles.\n\nVoulez-vous créer une sauvegarde avant de continuer ?')) {
            ImportExportView.resetFileInput();
            return;
        }

        // Auto backup
        this.exportToJSON();

        try {
            const content = await ImportExportRepository.readFileAsText(file);
            const importedData = JSON.parse(content);

            // Basic validation
            if (!importedData.acts || !Array.isArray(importedData.acts)) {
                throw new Error('Format de fichier invalide');
            }

            // Secure merge/update
            window.project = Object.assign({
                title: "Mon Roman",
                acts: [],
                characters: [],
                world: [],
                timeline: [],
                notes: [],
                codex: [],
                stats: { dailyGoal: 500, totalGoal: 80000, writingSessions: [] },
                versions: []
            }, importedData);

            // Re-auth logic might be needed if user data is there, but for local app just safe structure.

            // Side effects to update UI
            if (typeof saveProject === 'function') saveProject();
            if (typeof renderActsList === 'function') renderActsList();
            if (typeof switchView === 'function') switchView('editor');

            ImportExportView.closeBackupModal();
            alert('✅ Import réussi !\n\nToutes vos données ont été restaurées.');

        } catch (error) {
            alert('❌ Erreur lors de l\'import : ' + error.message);
        }

    },


    // --- Google Drive Integration ---

    initGDrive: function () {
        if (typeof GoogleDriveService === 'undefined') {
            console.warn('GoogleDriveService not loaded.');
            return;
        }
        GoogleDriveService.init((success) => {
            if (success) {
                // Check if we can silent login?
                // For now, user initiates login.
            }
        });
    },

    handleAuthClick: function () {
        if (typeof GoogleDriveService === 'undefined') return;
        GoogleDriveService.handleAuthClick((user) => {
            if (user) {
                ImportExportView.updateGDriveUI(user, true);
                ImportExportView.updateGDriveStatus('Connecté', 'success');
                // Check preferences for auto-save?
            }
        });
    },

    handleSignoutClick: function () {
        if (typeof GoogleDriveService === 'undefined') return;
        GoogleDriveService.handleSignoutClick(() => {
            ImportExportView.updateGDriveUI(null, false);
            ImportExportView.updateGDriveStatus('Déconnecté', 'normal');
        });
    },

    toggleGDriveAutoSave: function (checked) {
        // Store preference in localStorage or Project model
        // For now, just a visual toggle or session state
        window.gDriveAutoSave = checked;
        if (checked) {
            this.syncNowWithGDrive();
        }
    },

    syncNowWithGDrive: async function () {
        if (typeof GoogleDriveService === 'undefined' || !GoogleDriveService.accessToken) {
            alert("Veuillez d'abord vous connecter à Google Drive.");
            return;
        }

        ImportExportView.updateGDriveStatus('Sauvegarde...', 'sync');

        try {
            const dataStr = JSON.stringify(window.project, null, 2);
            const filename = `backup_plume_${(window.project.title || 'projet').replace(/\s+/g, '_')}.json`;

            await GoogleDriveService.saveFile(dataStr, filename);
            ImportExportView.updateGDriveStatus('Synchronisé', 'success');
            ImportExportView.showNotification(`☁️ Sauvegarde Cloud réussie !`);
        } catch (err) {
            console.error(err);
            ImportExportView.updateGDriveStatus('Erreur sync', 'error');
            alert("Erreur lors de la sauvegarde Drive: " + err.message);
        }
    },

    restoreFromGDrive: async function () {
        if (typeof GoogleDriveService === 'undefined' || !GoogleDriveService.accessToken) {
            alert("Veuillez d'abord vous connecter à Google Drive.");
            return;
        }

        const filename = `backup_plume_${(window.project.title || 'projet').replace(/\s+/g, '_')}.json`;

        if (!confirm(`Voulez-vous écraser le projet actuel avec la sauvegarde Cloud '${filename}' ?`)) return;

        ImportExportView.updateGDriveStatus('Téléchargement...', 'sync');

        try {
            const result = await GoogleDriveService.loadFile(filename);
            // Result is likely the JSON object already if using gapi client properly with alt=media
            // But gapi client get returns a response obj.

            let importedData;
            if (typeof result === 'string') {
                importedData = JSON.parse(result);
            } else if (result.body) {
                importedData = JSON.parse(result.body);
            } else {
                importedData = result; // Assuming it parsed it or it's the object
            }

            // Validation & Merge reuse handleFileImport logic concept
            if (!importedData.acts) throw new Error("Format invalide");

            window.project = importedData;
            if (typeof saveProject === 'function') saveProject();
            if (typeof renderActsList === 'function') renderActsList();
            if (typeof switchView === 'function') switchView('editor');

            ImportExportView.updateGDriveStatus('Restauré', 'success');
            alert("✅ Projet restauré depuis le Cloud !");
            ImportExportView.closeBackupModal();

        } catch (err) {
            console.error(err);
            ImportExportView.updateGDriveStatus('Erreur restauration', 'error');
            alert("Erreur restauration: " + (err.message || "Fichier non trouvé ou erreur réseau"));
        }
    },

    openExportNovelModal: function () {
        ImportExportModel.initSelectionState(true);
        ImportExportView.renderExportTree(window.project, ImportExportModel.selectionState);
        ImportExportView.updateExportFormatInfo();
        ImportExportView.openExportNovelModal();
    },

    toggleAct: function (actId) {
        const newState = !ImportExportModel.selectionState[`act-${actId}`];
        ImportExportModel.selectionState[`act-${actId}`] = newState;

        // Propagate to children
        const act = window.project.acts.find(a => a.id === actId);
        if (act) {
            act.chapters.forEach(c => {
                ImportExportModel.selectionState[`chapter-${c.id}`] = newState;
                c.scenes.forEach(s => {
                    ImportExportModel.selectionState[`scene-${s.id}`] = newState;
                });
            });
        }
        ImportExportView.renderExportTree(window.project, ImportExportModel.selectionState);
    },

    toggleChapter: function (actId, chapterId) {
        const newState = !ImportExportModel.selectionState[`chapter-${chapterId}`];
        ImportExportModel.selectionState[`chapter-${chapterId}`] = newState;

        // Propagate to scenes
        const act = window.project.acts.find(a => a.id === actId);
        const chapter = act ? act.chapters.find(c => c.id === chapterId) : null;
        if (chapter) {
            chapter.scenes.forEach(s => {
                ImportExportModel.selectionState[`scene-${s.id}`] = newState;
            });
        }

        // Check parent act state
        this._updateParentStates(actId, chapterId);
        ImportExportView.renderExportTree(window.project, ImportExportModel.selectionState);
    },

    toggleScene: function (actId, chapterId, sceneId) {
        const newState = !ImportExportModel.selectionState[`scene-${sceneId}`];
        ImportExportModel.selectionState[`scene-${sceneId}`] = newState;

        this._updateParentStates(actId, chapterId);
        ImportExportView.renderExportTree(window.project, ImportExportModel.selectionState);
    },

    _updateParentStates: function (actId, chapterId) {
        const act = window.project.acts.find(a => a.id === actId);
        if (!act) return;

        if (chapterId) {
            const chapter = act.chapters.find(c => c.id === chapterId);
            if (chapter) {
                const allScenes = chapter.scenes.every(s => ImportExportModel.selectionState[`scene-${s.id}`]);
                ImportExportModel.selectionState[`chapter-${chapterId}`] = allScenes;
            }
        }

        const allChapters = act.chapters.every(c => ImportExportModel.selectionState[`chapter-${c.id}`]);
        ImportExportModel.selectionState[`act-${actId}`] = allChapters;
    },

    toggleAllScenes: function () {
        const allSelected = Object.values(ImportExportModel.selectionState).every(v => v === true);
        ImportExportModel.initSelectionState(!allSelected);
        ImportExportView.renderExportTree(window.project, ImportExportModel.selectionState);
    },

    toggleAllExportOptions: function (checked) {
        ImportExportView.setAllOptions(checked);
    },

    executeNovelExport: async function () {
        const options = ImportExportView.getOptions();
        const format = options.format; // docx, markdown, txt, html, epub

        const content = ImportExportModel.getSelectedContent();
        const title = window.project.title || 'Sans Titre';

        try {
            switch (format) {
                case 'markdown':
                    const md = ImportExportRepository.generateMarkdown(content, options, title);
                    ImportExportRepository.downloadFile(md, `${title}.md`, 'text/markdown');
                    break;
                case 'txt':
                    const txt = ImportExportRepository.generateTXT(content, options, title);
                    ImportExportRepository.downloadFile(txt, `${title}.txt`, 'text/plain');
                    break;
                case 'html':
                    const html = ImportExportRepository.generateHTML(content, options, title);
                    ImportExportRepository.downloadFile(html, `${title}.html`, 'text/html');
                    break;
                case 'epub':
                    const epubBlob = await ImportExportRepository.generateEPUB(content, options, title);
                    ImportExportRepository.downloadFile(epubBlob, `${title}.epub`, 'application/epub+zip');
                    break;
                case 'docx':
                    const docxBlob = await ImportExportRepository.generateDOCX(content, options, title);
                    ImportExportRepository.downloadFile(docxBlob, `${title}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                    break;
            }
            ImportExportView.showNotification(`✓ Export ${format.toUpperCase()} terminé`);
            ImportExportView.closeExportNovelModal();
        } catch (e) {
            console.error(e);
            alert("Erreur export: " + e.message);
        }
    }
};

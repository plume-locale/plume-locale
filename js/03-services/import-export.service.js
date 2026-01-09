/**
 * Import/Export Service
 * Gestion de l'import et export des projets
 */

const ImportExportService = (() => {
    'use strict';

    /**
     * Exporte le projet au format JSON
     * @param {Object} project - Projet à exporter
     */
    async function exportToJSON(project) {
        if (!project) {
            const state = StateManager.getState();
            project = state.project;
        }

        if (!project) {
            if (window.ToastUI) {
                ToastUI.error('Aucun projet à exporter');
            }
            return;
        }

        try {
            const dataStr = JSON.stringify(project, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const filename = `${project.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

            if (window.ToastUI) {
                ToastUI.success(`Fichier JSON téléchargé : ${filename}`);
            } else {
                alert(`✅ Fichier JSON téléchargé !\n\nNom : ${filename}\n\nVous pouvez maintenant l'uploader sur Google Drive, Dropbox, ou tout autre service cloud.`);
            }
        } catch (error) {
            console.error('[ImportExport] Erreur export JSON:', error);
            if (window.ToastUI) {
                ToastUI.error('Erreur lors de l\'export');
            }
        }
    }

    /**
     * Exporte le projet au format texte brut
     * @param {Object} project - Projet à exporter
     */
    function exportToText(project) {
        if (!project) {
            const state = StateManager.getState();
            project = state.project;
        }

        if (!project) {
            if (window.ToastUI) {
                ToastUI.error('Aucun projet à exporter');
            }
            return;
        }

        try {
            let text = `${project.title}\n${'='.repeat(project.title.length)}\n\n`;

            if (project.acts) {
                project.acts.forEach(act => {
                    text += `\n\n${act.title}\n${'='.repeat(act.title.length)}\n\n`;

                    if (act.chapters) {
                        act.chapters.forEach(chapter => {
                            text += `\n${chapter.title}\n${'-'.repeat(chapter.title.length)}\n\n`;

                            if (chapter.scenes) {
                                chapter.scenes.forEach(scene => {
                                    // Convertir HTML en texte brut
                                    const temp = document.createElement('div');
                                    temp.innerHTML = scene.content || '';
                                    const plainText = temp.textContent || temp.innerText || '';

                                    text += `\n${scene.title}\n\n${plainText}\n\n`;
                                });
                            }
                        });
                    }
                });
            }

            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.title.replace(/\s+/g, '_')}.txt`;
            a.click();
            URL.revokeObjectURL(url);

            if (window.ToastUI) {
                ToastUI.success('Fichier texte téléchargé');
            }
        } catch (error) {
            console.error('[ImportExport] Erreur export texte:', error);
            if (window.ToastUI) {
                ToastUI.error('Erreur lors de l\'export');
            }
        }
    }

    /**
     * Importe un projet depuis un fichier JSON
     * @param {File} file - Fichier à importer
     */
    async function importFromFile(file) {
        if (!file) {
            if (window.ToastUI) {
                ToastUI.error('Aucun fichier sélectionné');
            }
            return;
        }

        if (!file.name.endsWith('.json')) {
            if (window.ToastUI) {
                ToastUI.error('Le fichier doit être au format JSON');
            } else {
                alert('❌ Erreur : Le fichier doit être au format JSON');
            }
            return;
        }

        // Demander confirmation
        const confirmMessage = '⚠️ ATTENTION : L\'import va remplacer toutes vos données actuelles.\n\nVoulez-vous créer une sauvegarde avant de continuer ?';
        const shouldBackup = window.ModalUI
            ? await ModalUI.confirm(confirmMessage)
            : confirm(confirmMessage);

        if (!shouldBackup) {
            return;
        }

        // Créer une sauvegarde avant l'import
        const state = StateManager.getState();
        if (state.project) {
            await exportToJSON(state.project);
        }

        // Lire le fichier
        const reader = new FileReader();

        reader.onload = async function(e) {
            try {
                const importedData = JSON.parse(e.target.result);

                // Valider les données importées
                if (!importedData.acts || !Array.isArray(importedData.acts)) {
                    throw new Error('Format de fichier invalide');
                }

                // Fusionner avec la structure actuelle pour assurer que tous les champs existent
                const project = {
                    id: importedData.id || Date.now(),
                    title: importedData.title || 'Mon Roman',
                    description: importedData.description || '',
                    acts: importedData.acts || [],
                    characters: importedData.characters || [],
                    world: importedData.world || [],
                    timeline: importedData.timeline || [],
                    notes: importedData.notes || [],
                    codex: importedData.codex || [],
                    stats: importedData.stats || {
                        dailyGoal: 500,
                        totalGoal: 80000,
                        writingSessions: []
                    },
                    versions: importedData.versions || [],
                    mindmaps: importedData.mindmaps || [],
                    arcs: importedData.arcs || []
                };

                // Mettre à jour l'état
                StateManager.setState({ project });

                // Sauvegarder
                if (window.StorageService) {
                    await StorageService.saveProject(project);
                }

                // Aussi mettre à jour window.project pour compatibilité
                window.project = project;

                // Naviguer vers la vue structure
                if (window.Router) {
                    Router.navigate('structure');
                } else if (typeof switchView === 'function') {
                    switchView('editor');
                }

                // Fermer la modale de backup si ouverte
                if (window.ModalUI) {
                    ModalUI.close();
                }

                // Notification de succès
                if (window.ToastUI) {
                    ToastUI.success('Import réussi ! Toutes vos données ont été restaurées.');
                } else {
                    alert('✅ Import réussi !\n\nToutes vos données ont été restaurées.');
                }

                // Publier l'événement
                if (window.EventBus) {
                    EventBus.emit('project:imported', { project });
                }

            } catch (error) {
                console.error('[ImportExport] Erreur import:', error);
                if (window.ToastUI) {
                    ToastUI.error('Erreur lors de l\'import : ' + error.message);
                } else {
                    alert('❌ Erreur lors de l\'import : ' + error.message);
                }
            }
        };

        reader.onerror = function() {
            if (window.ToastUI) {
                ToastUI.error('Erreur lors de la lecture du fichier');
            } else {
                alert('❌ Erreur lors de la lecture du fichier');
            }
        };

        reader.readAsText(file);
    }

    /**
     * Ouvre le sélecteur de fichier pour l'import
     */
    function openFileSelector() {
        const input = document.getElementById('importFileInput');
        if (input) {
            input.click();
        } else {
            // Créer un input temporaire
            const tempInput = document.createElement('input');
            tempInput.type = 'file';
            tempInput.accept = '.json';
            tempInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    importFromFile(file);
                }
            };
            tempInput.click();
        }
    }

    /**
     * Affiche le menu de backup
     */
    function showBackupMenu() {
        const modal = document.getElementById('backupModal');
        if (modal) {
            modal.classList.add('active');
        } else if (window.ModalUI) {
            const content = `
                <div style="text-align: center; padding: 2rem;">
                    <h2 style="margin-bottom: 1.5rem;">Sauvegarde et Import</h2>
                    <button onclick="ImportExportService.exportToJSON()" class="btn btn-primary" style="margin: 0.5rem; padding: 1rem 2rem;">
                        📥 Exporter en JSON
                    </button>
                    <button onclick="ImportExportService.exportToText()" class="btn btn-secondary" style="margin: 0.5rem; padding: 1rem 2rem;">
                        📄 Exporter en TXT
                    </button>
                    <button onclick="ImportExportService.openFileSelector()" class="btn btn-secondary" style="margin: 0.5rem; padding: 1rem 2rem;">
                        📤 Importer depuis fichier
                    </button>
                </div>
            `;
            ModalUI.open('backup-modal', content, { title: 'Gestion des sauvegardes' });
        }
    }

    // API publique
    return {
        exportToJSON,
        exportToText,
        importFromFile,
        openFileSelector,
        showBackupMenu
    };
})();

// Exposer globalement pour compatibilité
window.ImportExportService = ImportExportService;
window.exportToJSON = () => ImportExportService.exportToJSON();
window.exportProject = () => ImportExportService.exportToText();
window.importFromFile = () => ImportExportService.openFileSelector();
window.showBackupMenu = () => ImportExportService.showBackupMenu();

// Gestion de l'input file si présent dans le DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const importInput = document.getElementById('importFileInput');
        if (importInput) {
            importInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    ImportExportService.importFromFile(file);
                    e.target.value = ''; // Reset input
                }
            });
        }
    });
} else {
    const importInput = document.getElementById('importFileInput');
    if (importInput) {
        importInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                ImportExportService.importFromFile(file);
                e.target.value = ''; // Reset input
            }
        });
    }
}

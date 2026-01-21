
        // Backup and Import Management
        function showBackupMenu() {
            document.getElementById('backupModal').classList.add('active');
        }

        function exportToJSON() {
            const dataStr = JSON.stringify(project, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const filename = `${project.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            
            alert(`? Fichier JSON téléchargé !\n\nNom : ${filename}\n\nTu peux maintenant l'uploader sur Google Drive, Dropbox, ou tout autre service cloud.`);
        }

        function importFromFile() {
            document.getElementById('importFileInput').click();
        }

        function handleFileImport(event) {
            const file = event.target.files[0];
            if (!file) return;

            if (!file.name.endsWith('.json')) {
                alert('? Erreur : Le fichier doit être au format JSON');
                return;
            }

            if (!confirm('?? ATTENTION : L\'import va remplacer toutes vos données actuelles.\n\nVoulez-vous créer une sauvegarde avant de continuer ?')) {
                event.target.value = ''; // Reset input
                return;
            }

            // Create backup before import
            exportToJSON();

            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    // Validate imported data
                    if (!importedData.acts || !Array.isArray(importedData.acts)) {
                        throw new Error('Format de fichier invalide');
                    }

                    // Merge with current structure to ensure all fields exist
                    project = {
                        title: importedData.title || "Mon Roman",
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
                        versions: importedData.versions || []
                    };

                    saveProject();
                    switchView('editor');
                    renderActsList();
                    closeModal('backupModal');
                    
                    alert('? Import réussi !\n\nToutes vos données ont été restaurées.');
                } catch (error) {
                    alert('? Erreur lors de l\'import : ' + error.message);
                }
                
                event.target.value = ''; // Reset input
            };
            
            reader.onerror = function() {
                alert('? Erreur lors de la lecture du fichier');
                event.target.value = ''; // Reset input
            };
            
            reader.readAsText(file);
        }

        // Export
        function exportProject() {
            let text = `${project.title}\n${'='.repeat(project.title.length)}\n\n`;
            
            project.acts.forEach(act => {
                text += `\n\n${act.title}\n${'='.repeat(act.title.length)}\n\n`;
                
                act.chapters.forEach(chapter => {
                    text += `\n${chapter.title}\n${'-'.repeat(chapter.title.length)}\n\n`;
                    chapter.scenes.forEach(scene => {
                        // Convert HTML to plain text for export
                        const temp = document.createElement('div');
                        temp.innerHTML = scene.content;
                        const plainText = temp.textContent || temp.innerText || '';
                        
                        text += `\n${scene.title}\n\n${plainText}\n\n`;
                    });
                });
            });

            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${project.title.replace(/\s+/g, '_')}.txt`;
            a.click();
            URL.revokeObjectURL(url);
        }

        // Modal Management
        function openAddActModal() {
            document.getElementById('addActModal').classList.add('active');
            setTimeout(() => document.getElementById('actTitleInput').focus(), 100);
        }

        function openAddChapterModal(actId) {
            // Si pas d'actId fourni, utiliser le premier acte ou on en créera un
            if (actId) {
                activeActId = actId;
            } else if (project.acts.length > 0) {
                activeActId = project.acts[0].id;
            } else {
                activeActId = null; // Sera créé dans addChapter
            }
            document.getElementById('addChapterModal').classList.add('active');
            setTimeout(() => document.getElementById('chapterTitleInput').focus(), 100);
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

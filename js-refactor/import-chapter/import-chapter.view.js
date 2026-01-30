/**
 * [MVVM : View]
 * Import Chapter View - Interface utilisateur pour l'import de fichiers .docx
 */

const ImportChapterView = {
    /**
     * ID du modal
     */
    modalId: 'importChapterModal',

    /**
     * Ouvre le modal d'import
     */
    open() {
        // Vérifier que mammoth.js est disponible
        if (!ImportChapterViewModel.isMammothAvailable()) {
            alert('Erreur : La bibliothèque d\'import n\'est pas chargée. Veuillez rafraîchir la page.');
            return;
        }

        // Reset l'état
        ImportChapterViewModel.reset();

        // Afficher le modal
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.add('active');
            this.renderInitialState();
        }
    },

    /**
     * Ferme le modal
     */
    close() {
        const modal = document.getElementById(this.modalId);
        if (modal) {
            modal.classList.remove('active');
        }
        ImportChapterViewModel.cancelImport();
    },

    /**
     * Affiche l'état initial (sélection de fichier)
     */
    renderInitialState() {
        const content = document.getElementById('importChapterContent');
        if (!content) return;

        content.innerHTML = `
            <div class="import-chapter-upload">
                <div class="import-chapter-dropzone" id="importDropzone">
                    <i data-lucide="file-up" style="width: 48px; height: 48px; color: var(--accent-gold); margin-bottom: 1rem;"></i>
                    <p style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.5rem;">
                        Glissez votre fichier .docx ici
                    </p>
                    <p style="color: var(--text-muted); margin-bottom: 1rem;">
                        ou cliquez pour sélectionner
                    </p>
                    <input type="file" id="importChapterFileInput" accept=".docx" style="display: none;">
                    <button class="btn btn-primary" onclick="document.getElementById('importChapterFileInput').click()">
                        <i data-lucide="folder-open" style="width: 16px; height: 16px; margin-right: 8px;"></i>
                        Parcourir
                    </button>
                </div>

                <div style="margin-top: 1.5rem; padding: 1rem; background: var(--bg-secondary); border-radius: 8px; font-size: 0.85rem;">
                    <div style="font-weight: 600; margin-bottom: 0.5rem; color: var(--accent-gold);">
                        <i data-lucide="info" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 6px;"></i>
                        Formats de chapitres reconnus :
                    </div>
                    <ul style="margin: 0; padding-left: 1.5rem; color: var(--text-muted); line-height: 1.6;">
                        <li>Titres avec style "Titre 1" ou "Heading 1"</li>
                        <li>"Chapitre 1", "Chapitre I", "Chapter One"</li>
                        <li>"1. Titre du chapitre", "1 - Titre"</li>
                        <li>"Partie 1", "Part I"</li>
                    </ul>
                </div>
            </div>
        `;

        // Initialiser les événements
        this.initDropzone();
        this.initFileInput();

        // Rafraîchir les icônes
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Initialise la zone de drop
     */
    initDropzone() {
        const dropzone = document.getElementById('importDropzone');
        if (!dropzone) return;

        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            dropzone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelect(files[0]);
            }
        });

        dropzone.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'INPUT') {
                document.getElementById('importChapterFileInput')?.click();
            }
        });
    },

    /**
     * Initialise l'input file
     */
    initFileInput() {
        const input = document.getElementById('importChapterFileInput');
        if (!input) return;

        input.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileSelect(e.target.files[0]);
            }
        });
    },

    /**
     * Gère la sélection d'un fichier
     * @param {File} file
     */
    async handleFileSelect(file) {
        this.renderProcessing(file.name);

        const result = await ImportChapterViewModel.processFile(file);

        if (result.success) {
            this.renderPreview(result.data);
        } else {
            this.renderError(result.error);
        }
    },

    /**
     * Affiche l'état de traitement
     * @param {string} fileName
     */
    renderProcessing(fileName) {
        const content = document.getElementById('importChapterContent');
        if (!content) return;

        content.innerHTML = `
            <div style="text-align: center; padding: 3rem;">
                <div class="import-chapter-spinner"></div>
                <p style="margin-top: 1.5rem; font-size: 1.1rem;">
                    Analyse de <strong>${fileName}</strong>...
                </p>
                <p style="color: var(--text-muted); margin-top: 0.5rem;">
                    Détection des chapitres en cours
                </p>
            </div>
        `;
    },

    /**
     * Affiche l'aperçu des chapitres détectés
     * @param {Object} data
     */
    renderPreview(data) {
        const content = document.getElementById('importChapterContent');
        if (!content) return;

        const { fileName, chapters, stats } = data;

        content.innerHTML = `
            <div class="import-chapter-preview">
                <!-- En-tête avec statistiques -->
                <div style="background: var(--bg-secondary); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                        <div>
                            <div style="font-weight: 600; font-size: 1rem;">
                                <i data-lucide="file-text" style="width: 16px; height: 16px; vertical-align: middle; margin-right: 6px; color: var(--accent-gold);"></i>
                                ${fileName}
                            </div>
                        </div>
                        <div style="display: flex; gap: 1.5rem; font-size: 0.9rem;">
                            <div>
                                <span style="color: var(--text-muted);">Chapitres :</span>
                                <strong style="color: var(--accent-gold);">${stats.totalChapters}</strong>
                            </div>
                            <div>
                                <span style="color: var(--text-muted);">Mots :</span>
                                <strong>${stats.totalWords.toLocaleString('fr-FR')}</strong>
                            </div>
                            <div>
                                <span style="color: var(--text-muted);">Moy./chap :</span>
                                <strong>${stats.averageWordsPerChapter.toLocaleString('fr-FR')}</strong>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Titre de l'acte -->
                <div style="margin-bottom: 1.5rem;">
                    <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">
                        Titre de l'acte dans Plume :
                    </label>
                    <input type="text"
                           id="importActTitle"
                           class="form-input"
                           value="${fileName.replace('.docx', '').replace(/[-_]/g, ' ')}"
                           placeholder="Nom de l'acte"
                           style="width: 100%;">
                </div>

                <!-- Liste des chapitres -->
                <div style="margin-bottom: 1.5rem;">
                    <div style="font-weight: 600; margin-bottom: 0.75rem;">
                        <i data-lucide="list" style="width: 14px; height: 14px; vertical-align: middle; margin-right: 6px;"></i>
                        Chapitres détectés :
                    </div>
                    <div class="import-chapter-list" style="max-height: 300px; overflow-y: auto; border: 1px solid var(--border-color); border-radius: 8px;">
                        ${chapters.map((ch, i) => `
                            <div class="import-chapter-item" style="padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
                                <div style="display: flex; align-items: center; gap: 0.75rem;">
                                    <span style="color: var(--text-muted); font-size: 0.8rem; min-width: 24px;">${i + 1}.</span>
                                    <span style="font-weight: 500;">${ch.title}</span>
                                </div>
                                <span style="color: var(--text-muted); font-size: 0.85rem;">
                                    ${stats.chapters[i].wordCount.toLocaleString('fr-FR')} mots
                                </span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Boutons d'action -->
                <div style="display: flex; gap: 1rem; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="ImportChapterView.renderInitialState()">
                        <i data-lucide="arrow-left" style="width: 14px; height: 14px; margin-right: 6px;"></i>
                        Choisir un autre fichier
                    </button>
                    <button class="btn btn-primary" onclick="ImportChapterView.confirmImport()">
                        <i data-lucide="check" style="width: 14px; height: 14px; margin-right: 6px;"></i>
                        Importer ${stats.totalChapters} chapitres
                    </button>
                </div>
            </div>
        `;

        // Rafraîchir les icônes
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Affiche une erreur
     * @param {string} message
     */
    renderError(message) {
        const content = document.getElementById('importChapterContent');
        if (!content) return;

        content.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i data-lucide="alert-circle" style="width: 48px; height: 48px; color: var(--accent-red); margin-bottom: 1rem;"></i>
                <p style="font-size: 1.1rem; font-weight: 600; color: var(--accent-red); margin-bottom: 0.5rem;">
                    Erreur lors de l'import
                </p>
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
                    ${message}
                </p>
                <button class="btn btn-primary" onclick="ImportChapterView.renderInitialState()">
                    <i data-lucide="refresh-cw" style="width: 14px; height: 14px; margin-right: 6px;"></i>
                    Réessayer
                </button>
            </div>
        `;

        // Rafraîchir les icônes
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    },

    /**
     * Confirme et exécute l'import
     */
    confirmImport() {
        const actTitleInput = document.getElementById('importActTitle');
        const actTitle = actTitleInput ? actTitleInput.value.trim() : null;

        const result = ImportChapterViewModel.confirmImport(actTitle);

        if (result.success) {
            this.renderSuccess(result.data);
        } else {
            this.renderError(result.error);
        }
    },

    /**
     * Affiche le succès de l'import
     * @param {Object} data
     */
    renderSuccess(data) {
        const content = document.getElementById('importChapterContent');
        if (!content) return;

        content.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i data-lucide="check-circle" style="width: 64px; height: 64px; color: #4CAF50; margin-bottom: 1rem;"></i>
                <p style="font-size: 1.3rem; font-weight: 600; margin-bottom: 0.5rem;">
                    Import réussi !
                </p>
                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">
                    <strong>${data.chaptersImported}</strong> chapitres importés dans l'acte "<strong>${data.actTitle}</strong>"
                    <br>
                    <span style="font-size: 0.9rem;">${data.totalWords.toLocaleString('fr-FR')} mots au total</span>
                </p>
                <button class="btn btn-primary" onclick="ImportChapterView.close()">
                    <i data-lucide="edit-3" style="width: 14px; height: 14px; margin-right: 6px;"></i>
                    Commencer à éditer
                </button>
            </div>
        `;

        // Rafraîchir les icônes
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
};

/**
 * Fonction globale pour ouvrir le modal d'import
 */
function openImportChapterModal() {
    ImportChapterView.open();
}

/**
 * Fonction globale pour fermer le modal d'import
 */
function closeImportChapterModal() {
    ImportChapterView.close();
}

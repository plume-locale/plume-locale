// ============================================
// Module: features/analysis
// Généré automatiquement - Plume Writer
// ============================================
// Initialize
// === TENSION WORDS MANAGEMENT ===

// Valeurs par défaut des mots de tension
const DEFAULT_TENSION_WORDS = {
    high: [
        'combat', 'bataille', 'mort', 'tuer', 'danger', 'peur', 'terreur', 'cri', 'hurler',
        'sang', 'blessure', 'fuir', 'course', 'poursuite', 'menace', 'attaque', 'explosion',
        'feu', 'incendie', 'catastrophe', 'urgence', 'panique', 'désespoir', 'tragédie',
        'révélation', 'secret', 'trahison', 'conflit', 'confrontation', 'affrontement',
        'climax', 'crucial', 'décisif', 'critique', 'vital', 'dramatique'
    ],
    medium: [
        'mystère', 'suspense', 'intrigue', 'complot', 'enquête', 'découverte', 'surprise',
        'tension', 'stress', 'angoisse', 'inquiétude', 'doute', 'hésitation', 'dilemme',
        'choix', 'décision', 'tournant', 'changement', 'transformation'
    ],
    low: [
        'calme', 'paix', 'repos', 'détente', 'tranquille', 'paisible', 'serein',
        'conversation', 'discussion', 'réflexion', 'souvenir', 'rêve', 'pensée'
    ]
};

// Récupérer les mots de tension (personnalisés ou par défaut)
// [MVVM : Model]
// Récupère les mots de tension (personnalisés ou par défaut) depuis le localStorage.
function getTensionWords() {
    const stored = localStorage.getItem('tensionWords');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Erreur lors du chargement des mots de tension:', e);
            return DEFAULT_TENSION_WORDS;
        }
    }
    return DEFAULT_TENSION_WORDS;
}

// Sauvegarder les mots de tension
// [MVVM : Model]
// Sauvegarde les mots de tension dans le localStorage.
function saveTensionWordsToStorage(words) {
    localStorage.setItem('tensionWords', JSON.stringify(words));
}

// Ouvrir l'éditeur de mots de tension
// [MVVM : View]
// Ouvre le modal de l'éditeur de mots de tension et déclenche le chargement des données.
function openTensionWordsEditor() {
    document.getElementById('tensionWordsModal').classList.add('active');
    loadTensionWordsInEditor();
}

// Charger les mots dans l'éditeur
// [MVVM : ViewModel]
// Récupère les données et met à jour l'affichage de l'éditeur pour les trois catégories de tension.
function loadTensionWordsInEditor() {
    const words = getTensionWords();

    // Charger les mots de haute tension
    const highList = document.getElementById('highTensionList');
    highList.innerHTML = '';
    words.high.forEach((word, index) => {
        highList.innerHTML += createWordElement(word, 'high', index);
    });

    // Charger les mots de tension moyenne
    const mediumList = document.getElementById('mediumTensionList');
    mediumList.innerHTML = '';
    words.medium.forEach((word, index) => {
        mediumList.innerHTML += createWordElement(word, 'medium', index);
    });

    // Charger les mots de faible tension
    const lowList = document.getElementById('lowTensionList');
    lowList.innerHTML = '';
    words.low.forEach((word, index) => {
        lowList.innerHTML += createWordElement(word, 'low', index);
    });
}

// Créer un élément de mot avec bouton de suppression
// [MVVM : View]
// Génère le fragment HTML représentant un mot avec son bouton de suppression.
function createWordElement(word, type, index) {
    const colors = {
        high: 'var(--accent-red)',
        medium: '#e6a23c',
        low: 'var(--accent-blue)'
    };

    return `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; background: var(--bg-primary); border-radius: 4px; border: 1px solid var(--border-color);">
                    <span style="font-size: 0.85rem; color: var(--text-primary);">${word}</span>
                    <button onclick="removeTensionWord('${type}', ${index})" 
                            style="background: none; border: none; color: ${colors[type]}; cursor: pointer; font-size: 1rem; padding: 0 0.25rem; opacity: 0.7; transition: opacity 0.2s;"
                            onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'"
                            title="Supprimer ce mot">
                        ×
                    </button>
                </div>
            `;
}

// Ajouter un mot de tension
// [MVVM : ViewModel]
// Valide et ajoute un nouveau mot à une catégorie spécifique, puis met à jour le modèle et la vue.
function addTensionWord(type) {
    const input = document.getElementById(`${type}TensionInput`);
    const word = input.value.trim().toLowerCase();

    if (!word) {
        showNotification('⚠️ Veuillez entrer un mot', 'warning');
        return;
    }

    const words = getTensionWords();

    // Vérifier si le mot existe déjà
    if (words[type].includes(word)) {
        showNotification('⚠️ Ce mot existe déjà dans cette catégorie', 'warning');
        return;
    }

    // Vérifier si le mot existe dans une autre catégorie
    for (const category in words) {
        if (category !== type && words[category].includes(word)) {
            showNotification(`⚠️ Ce mot existe déjà dans la catégorie "${category === 'high' ? 'haute' : category === 'medium' ? 'moyenne' : 'faible'} tension"`, 'warning');
            return;
        }
    }

    // Ajouter le mot
    words[type].push(word);
    saveTensionWordsToStorage(words);

    // Recharger la liste
    loadTensionWordsInEditor();

    // Vider l'input
    input.value = '';

    showNotification(`✓ Mot "${word}" ajouté`, 'success');
}

// Supprimer un mot de tension
// [MVVM : ViewModel]
// Supprime un mot par son index dans une catégorie, puis met à jour le modèle et la vue.
function removeTensionWord(type, index) {
    const words = getTensionWords();
    const removedWord = words[type][index];

    words[type].splice(index, 1);
    saveTensionWordsToStorage(words);

    // Recharger la liste
    loadTensionWordsInEditor();

    showNotification(`✓ Mot "${removedWord}" supprimé`, 'success');
}

// Enregistrer les modifications
// [MVVM : View]
// Ferme le modal et informe l'utilisateur que les modifications ont été enregistrées.
function saveTensionWords() {
    closeModal('tensionWordsModal');
    showNotification('✓ Mots de tension enregistrés. Le graphique sera recalculé lors de la prochaine visualisation.', 'success');
}

// Réinitialiser aux valeurs par défaut
// [MVVM : ViewModel]
// Restaure le dictionnaire par défaut après confirmation, puis met à jour le modèle et la vue.
function resetTensionWordsToDefault() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les mots de tension aux valeurs par défaut ? Cette action est irréversible.')) {
        saveTensionWordsToStorage(DEFAULT_TENSION_WORDS);
        loadTensionWordsInEditor();
        showNotification('✓ Mots de tension réinitialisés aux valeurs par défaut', 'success');
    }
}

// Exporter les dictionnaires de mots de tension
// [MVVM : ViewModel]
// Formate les dictionnaires actuels et déclenche le téléchargement d'un fichier texte.
function exportTensionWords() {
    const words = getTensionWords();

    // Créer trois fichiers texte, un par catégorie
    const highWords = words.high.join('\n');
    const mediumWords = words.medium.join('\n');
    const lowWords = words.low.join('\n');

    // Créer un fichier ZIP virtuel avec les trois fichiers
    const content = `=== DICTIONNAIRES DE MOTS DE TENSION ===
Exporté le ${new Date().toLocaleString('fr-FR')}

=== HAUTE TENSION (${words.high.length} mots) ===
${highWords}

=== TENSION MOYENNE (${words.medium.length} mots) ===
${mediumWords}

=== FAIBLE TENSION (${words.low.length} mots) ===
${lowWords}
`;

    // Créer et télécharger le fichier
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dictionnaires-tension-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('✓ Dictionnaires exportés avec succès', 'success');
}

// === BULK IMPORT FOR TENSION WORDS ===

let currentBulkImportType = null;

// Ouvrir le modal d'import en masse
// [MVVM : View]
// Configure et affiche le modal d'importation en masse pour une catégorie donnée.
function openBulkImport(type) {
    currentBulkImportType = type;

    const titles = {
        high: '📥 Import en masse - Haute tension',
        medium: '📥 Import en masse - Tension moyenne',
        low: '📥 Import en masse - Faible tension'
    };

    document.getElementById('bulkImportTitle').textContent = titles[type];
    document.getElementById('bulkImportText').value = '';
    document.getElementById('bulkImportFile').value = '';
    document.querySelector('input[name="importMode"][value="add"]').checked = true;

    document.getElementById('bulkImportModal').classList.add('active');
}

// Traiter l'import en masse
// [MVVM : ViewModel]
// Récupère la source d'importation (texte ou fichier) et orchestre le processus de lecture.
function processBulkImport() {
    if (!currentBulkImportType) return;

    const textarea = document.getElementById('bulkImportText');
    const fileInput = document.getElementById('bulkImportFile');
    const mode = document.querySelector('input[name="importMode"]:checked').value;

    // Vérifier si un fichier est sélectionné
    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const content = e.target.result;
            importWordsFromText(content, currentBulkImportType, mode);
        };

        reader.onerror = function () {
            showNotification('❌ Erreur lors de la lecture du fichier', 'error');
        };

        reader.readAsText(file);
    } else if (textarea.value.trim()) {
        // Utiliser le texte collé
        importWordsFromText(textarea.value, currentBulkImportType, mode);
    } else {
        showNotification('⚠️ Veuillez coller du texte ou sélectionner un fichier', 'warning');
    }
}

// Importer les mots depuis du texte
// [MVVM : ViewModel]
// Analyse le texte brut, filtre les doublons et les mots vides, puis intègre les résultats au modèle.
function importWordsFromText(text, type, mode) {
    // Nettoyer et parser le texte
    let words = [];

    // Séparer par retours à la ligne ET par virgules
    const lines = text.split(/\r?\n/);
    lines.forEach(line => {
        // Pour chaque ligne, séparer aussi par virgules
        const wordsInLine = line.split(',');
        wordsInLine.forEach(word => {
            const cleaned = word.trim().toLowerCase();
            if (cleaned && cleaned.length > 0) {
                words.push(cleaned);
            }
        });
    });

    // Supprimer les doublons
    words = [...new Set(words)];

    if (words.length === 0) {
        showNotification('⚠️ Aucun mot valide trouvé', 'warning');
        return;
    }

    // Récupérer les mots existants
    const tensionWords = getTensionWords();

    if (mode === 'replace') {
        // Remplacer tous les mots
        tensionWords[type] = words;
        showNotification(`✓ ${words.length} mots importés (remplacement)`, 'success');
    } else {
        // Ajouter aux mots existants (sans doublons)
        const existingWords = new Set(tensionWords[type]);
        let addedCount = 0;

        words.forEach(word => {
            if (!existingWords.has(word)) {
                tensionWords[type].push(word);
                addedCount++;
            }
        });

        const skippedCount = words.length - addedCount;
        if (addedCount > 0) {
            showNotification(`✓ ${addedCount} mot(s) ajouté(s)${skippedCount > 0 ? ` (${skippedCount} doublon(s) ignoré(s))` : ''}`, 'success');
        } else {
            showNotification(`⚠️ Tous les mots existent déjà (${skippedCount} doublon(s))`, 'warning');
        }
    }

    // Sauvegarder et recharger
    saveTensionWordsToStorage(tensionWords);
    loadTensionWordsInEditor();

    // Fermer le modal
    closeModal('bulkImportModal');
}

// Gestionnaire pour le changement de fichier
// [MVVM : View]
// Initialise les écouteurs d'événements pour la gestion interactive du modal d'importation en masse.
document.addEventListener('DOMContentLoaded', function () {
    const fileInput = document.getElementById('bulkImportFile');
    if (fileInput) {
        fileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                // Vider le textarea si un fichier est sélectionné
                document.getElementById('bulkImportText').value = '';
            }
        });
    }

    const textarea = document.getElementById('bulkImportText');
    if (textarea) {
        textarea.addEventListener('input', function () {
            if (this.value.trim()) {
                // Vider le file input si du texte est saisi
                document.getElementById('bulkImportFile').value = '';
            }
        });
    }
});


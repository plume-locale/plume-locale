/**
 * @file tension.view.js
 * @description Vue pour le module de tension. Gère le DOM et l'affichage.
 */

const TensionView = {
    /**
     * Ouvre le modal de l'éditeur de mots de tension.
     */
    openEditor: function () {
        const modal = document.getElementById('tensionWordsModal');
        if (modal) {
            modal.classList.add('active');
            this.loadWords();
        }
    },

    /**
     * Charge et affiche les mots dans l'éditeur.
     */
    loadWords: function () {
        const words = TensionRepository.getTensionWords(); // Accès direct Repository permis pour lecture simple ou via ViewModel

        this.renderList('highTensionList', words.high, 'high');
        this.renderList('mediumTensionList', words.medium, 'medium');
        this.renderList('lowTensionList', words.low, 'low');
    },

    /**
     * Affiche une liste de mots dans un conteneur.
     */
    renderList: function (elementId, wordList, type) {
        const container = document.getElementById(elementId);
        if (!container) return;

        container.innerHTML = '';
        wordList.forEach((word, index) => {
            container.innerHTML += this.createWordElement(word, type, index);
        });
    },

    /**
     * Crée le HTML pour un élément mot.
     */
    createWordElement: function (word, type, index) {
        const colors = {
            high: 'var(--accent-red)',
            medium: '#e6a23c',
            low: 'var(--accent-blue)'
        };

        // Note: l'événement onClick appelle une fonction globale qui sera définie dans handlers.js
        return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.75rem; background: var(--bg-primary); border-radius: 4px; border: 1px solid var(--border-color);">
                <span style="font-size: 0.85rem; color: var(--text-primary);">${word}</span>
                <button onclick="TensionHandlers.onRemoveWord('${type}', ${index})" 
                        style="background: none; border: none; color: ${colors[type]}; cursor: pointer; font-size: 1rem; padding: 0 0.25rem; opacity: 0.7; transition: opacity 0.2s;"
                        onmouseover="this.style.opacity='1'" onmouseout="this.style.opacity='0.7'"
                        title="Supprimer ce mot">
                    ×
                </button>
            </div>
        `;
    },

    /**
     * Ferme le modal d'éditeur.
     */
    closeEditor: function () {
        if (typeof closeModal === 'function') {
            closeModal('tensionWordsModal');
        } else {
            document.getElementById('tensionWordsModal')?.classList.remove('active');
        }
    },

    /**
     * Ouvre le modal d'import en masse.
     */
    openBulkImport: function (type) {
        const titles = {
            high: '📥 Import en masse - Haute tension',
            medium: '📥 Import en masse - Tension moyenne',
            low: '📥 Import en masse - Faible tension'
        };

        document.getElementById('bulkImportTitle').textContent = titles[type] || 'Import en masse';
        document.getElementById('bulkImportText').value = '';
        document.getElementById('bulkImportFile').value = '';

        const radioAdd = document.querySelector('input[name="importMode"][value="add"]');
        if (radioAdd) radioAdd.checked = true;

        document.getElementById('bulkImportModal')?.classList.add('active');
    },

    /**
     * Ferme le modal d'import en masse.
     */
    closeBulkImport: function () {
        if (typeof closeModal === 'function') {
            closeModal('bulkImportModal');
        } else {
            document.getElementById('bulkImportModal')?.classList.remove('active');
        }
    },

    /**
     * Injecte le Tension Meter dans le DOM.
     */
    injectTensionMeter: function () {
        if (document.getElementById('liveTensionMeter')) return;

        const div = document.createElement('div');
        div.id = 'liveTensionMeter';
        div.className = 'tension-meter-container';
        div.setAttribute('title', 'Tension dramatique en temps réel');

        div.innerHTML = `
            <svg class="tension-meter-svg" viewBox="0 0 50 50">
                <circle class="tension-meter-bg" cx="25" cy="25" r="22"></circle>
                <circle class="tension-meter-fill" id="tensionMeterFill" cx="25" cy="25" r="22" stroke-dasharray="138.2" stroke-dashoffset="138.2"></circle>
            </svg>
            <div class="tension-value-display" id="tensionValueDisplay">--</div>
            <div class="tension-tooltip" id="tensionTooltip"></div>
        `;

        document.body.appendChild(div);

        if (typeof focusModeActive !== 'undefined' && focusModeActive) {
            div.classList.add('focus-hide');
        }
    },

    /**
     * Met à jour le Tension Meter avec les résultats du calcul.
     */
    updateMeter: function (result) {
        const score = result.score;
        const circle = document.getElementById('tensionMeterFill');

        if (circle) {
            const radius = 22;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (score / 100) * circumference;
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = offset;

            if (score > 65) circle.style.stroke = 'var(--accent-red)';
            else if (score > 40) circle.style.stroke = 'var(--accent-gold)';
            else circle.style.stroke = 'var(--accent-blue)';
        }

        const valueDisplay = document.getElementById('tensionValueDisplay');
        if (valueDisplay) valueDisplay.textContent = `${score}%`;

        this.updateTooltip(result);
    },

    /**
     * Met à jour le tooltip.
     */
    updateTooltip: function (result) {
        const tooltip = document.getElementById('tensionTooltip');
        if (!tooltip) return;

        const highTags = result.foundWords.high.slice(0, 5).map(w => `<span class="tension-tag tension-tag-high">${w}</span>`).join('');
        const mediumTags = result.foundWords.medium.slice(0, 5).map(w => `<span class="tension-tag tension-tag-medium">${w}</span>`).join('');

        tooltip.innerHTML = `
            <div class="tension-tooltip-title">
                <i data-lucide="zap" style="width:14px;height:14px;"></i> Tension Directe
            </div>
            <div class="tension-tooltip-item">
                <span>Indice d'intensité</span>
                <strong>${result.score}%</strong>
            </div>
            <div class="tension-tooltip-item">
                <span>Mots-clés forts</span>
                <span style="color: var(--accent-red)">${result.details.high}</span>
            </div>
            <div class="tension-tooltip-item">
                <span>Mots-clés modérés</span>
                <span style="color: var(--accent-gold)">${result.details.medium}</span>
            </div>
            <div class="tension-tags-container">
                ${highTags}
                ${mediumTags}
            </div>
            <div style="margin-top: 0.75rem; font-size: 0.65rem; color: var(--text-muted); font-style: italic;">
                Analyse la scène active (sous le curseur ou visible à l'écran).
            </div>
        `;

        if (typeof lucide !== 'undefined' && lucide.createIcons) lucide.createIcons();
    },

    /**
     * Télécharge un fichier texte (pour l'export).
     */
    downloadFile: function (filename, content) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
};

// ===================================
// Corrector View - Basic Implementation
// ===================================

const CorrectorView = {
    init() {
        // No UI to init initially
    },

    async check() {
        const editor = document.querySelector('.editor-textarea');
        if (!editor) {
            alert(Localization.t('corrector.no_editor'));
            return;
        }

        const text = editor.innerText;
        this._showToast(Localization.t('ai.thinking'), 'info'); // Show temporary toast

        // 1. Local basic checks
        const localIssues = this._analyzeText(text);

        // 2. Remote API check (LanguageTool)
        let remoteIssues = [];
        try {
            remoteIssues = await CorrectorService.checkText(text);
        } catch (e) {
            console.error(e);
        }

        // Merge results
        const allIssues = [...localIssues, ...remoteIssues];

        if (allIssues.length === 0) {
            this._showToast(Localization.t('corrector.no_issues'), "success");
        } else {
            this._showReport(allIssues);
        }
    },

    _analyzeText(text) {
        const issues = [];

        // 1. Espaces multiples
        const doubleSpaceCount = (text.match(/  /g) || []).length;
        if (doubleSpaceCount > 0) {
            issues.push({
                type: 'format',
                message: Localization.t('corrector.double_spaces', [doubleSpaceCount]),
                severity: 'warning'
            });
        }

        // 2. Phrases très longues (> 60 mots)
        const sentences = text.split(/[.!?]+/);
        let longSentences = 0;
        sentences.forEach(s => {
            const words = s.trim().split(/\s+/).length;
            if (words > 60) longSentences++;
        });

        if (longSentences > 0) {
            issues.push({
                type: 'style',
                message: Localization.t('corrector.long_sentences', [longSentences]),
                severity: 'info'
            });
        }

        // 3. Répétitions proches (très basique)
        // (Pourrait être amélioré avec word-repetition module)

        // 4. Mots de remplissage
        const fillers = ['du coup', 'en fait', 'genre', 'voilà'];
        fillers.forEach(filler => {
            const count = (text.match(new RegExp(`\\b${filler}\\b`, 'gi')) || []).length;
            if (count > 0) {
                issues.push({
                    type: 'style',
                    message: Localization.t('corrector.usages_of', [count, filler]),
                    severity: 'warning'
                });
            }
        });

        return issues;
    },

    _showReport(issues) {
        // Créer une modal simple pour le rapport
        const modalId = 'corrector-report-modal';
        let modal = document.getElementById(modalId);

        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.5); z-index: 2000;
                display: flex; align-items: center; justify-content: center;
            `;
            document.body.appendChild(modal);
        }

        const html = `
            <div style="background: white; padding: 20px; border-radius: 8px; width: 400px; max-height: 80vh; overflow-y: auto;">
                <h3 style="margin-top: 0;">${Localization.t('corrector.report_title')}</h3>
                <div style="margin: 15px 0;">
                    ${issues.map(issue => `
                        <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px;">
                            <span style="width: 10px; height: 10px; border-radius: 50%; background: ${issue.severity === 'warning' ? 'orange' : 'blue'};"></span>
                            <span>${issue.message}</span>
                        </div>
                    `).join('')}
                </div>
                <div style="text-align: right; font-size: 0.8em; color: gray; margin-bottom: 15px;">
                    ${Localization.t('corrector.disclaimer')}
                </div>
                <button onclick="document.getElementById('${modalId}').remove()" style="padding: 8px 16px; background: #333; color: white; border: none; border-radius: 4px; cursor: pointer;">${Localization.t('btn.close')}</button>
            </div>
        `;

        modal.innerHTML = html;
    },

    _showToast(message, type) {
        // ... (reuse existing toast logic or simple alert)
        alert(message);
    }
};

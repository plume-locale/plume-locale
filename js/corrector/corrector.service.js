// ===================================
// Corrector Service
// ===================================

const CorrectorService = {
    // API config for LanguageTool or similar
    // https://languagetool.org/http-api/
    api: {
        baseUrl: 'https://api.languagetool.org/v2/check',
        language: 'fr'
    },

    async checkText(text) {
        if (!text || text.trim().length === 0) return [];

        try {
            const params = new URLSearchParams();
            params.append('text', text);
            params.append('language', 'fr');
            params.append('enabledOnly', 'false');

            const response = await fetch('https://api.languagetool.org/v2/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: params
            });

            if (!response.ok) {
                console.warn('LanguageTool API error:', response.statusText);
                return []; // Fallback to local analysis silently
            }

            const data = await response.json();

            // Map LanguageTool matches to our internal format
            return data.matches.map(match => ({
                type: match.rule.issueType, // e.g. 'misspelling', 'grammar'
                message: match.message,
                severity: this._mapSeverity(match.rule.issueType),
                context: match.context.text,
                offset: match.offset,
                length: match.length,
                replacements: match.replacements.map(r => r.value).slice(0, 3)
            }));

        } catch (error) {
            console.error('Corrector Service Error:', error);
            return []; // Fallback
        }
    },

    _mapSeverity(issueType) {
        switch (issueType) {
            case 'misspelling': return 'error';
            case 'grammar': return 'warning';
            default: return 'info';
        }
    },
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CorrectorService };
}

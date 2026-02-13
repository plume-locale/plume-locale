// ===================================
// AI Assistant Service
// ===================================

const AiAssistantService = {
    // API config for Google Gemini
    api: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent',
        // Key is stored in localStorage ('ai_assistant_key') for security
    },

    setApiKey(key) {
        if (!key) return;
        localStorage.setItem('ai_assistant_key', key);
    },

    getApiKey() {
        return localStorage.getItem('ai_assistant_key');
    },

    async send(text) {
        const key = this.getApiKey();
        if (!key) {
            return Localization.t('ai.key_missing');
        }

        try {
            const url = `${this.api.baseUrl}?key=${key}`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: text
                        }]
                    }]
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || Localization.t('ai.api_error'));
            }

            const data = await response.json();
            // Gemini response structure
            if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            } else {
                throw new Error("Réponse vide de l'IA");
            }

        } catch (error) {
            console.error('AI Error:', error);
            return Localization.t('ai.connection_error', [error.message]);
        }
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AiAssistantService };
}

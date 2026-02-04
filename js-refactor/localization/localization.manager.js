/**
 * [MVVM : Coordinator] Localization Manager
 * Central singleton that orchestrates localization.
 */
class LocalizationManager {
    constructor() {
        this.model = new LocalizationModel();
        this.view = new LocalizationView();

        // Initialize
        this.model.subscribe((newLocale) => {
            this.handleLocaleChange(newLocale);
        });
    }

    /**
     * Initialize the manager.
     * Can optionally load a saved preference.
     */
    init() {
        // Here we could load from localStorage
        const savedLocale = localStorage.getItem('plume_locale') || 'fr';
        this.setLocale(savedLocale);

        console.log(`Localization Manager initialized. Locale: ${savedLocale}`);
    }

    /**
     * Change the language.
     * @param {string} localeCode 
     */
    setLocale(localeCode) {
        this.model.setLocale(localeCode);
        localStorage.setItem('plume_locale', localeCode);
    }

    /**
     * Get the current language.
     * @returns {string}
     */
    getLocale() {
        return this.model.getLocale();
    }

    /**
     * Translate a key.
     * @param {string} key 
     * @param {Array} params 
     * @returns {string}
     */
    t(key, params = []) {
        return this.model.translate(key, params);
    }

    /**
     * Handle the change event (update view).
     */
    handleLocaleChange(locale) {
        this.view.updateInterface(locale, (key) => this.t(key));

        // Dispatch a global event for other components if needed
        window.dispatchEvent(new CustomEvent('localeChanged', { detail: { locale } }));
        console.log(`Locale changed to: ${locale}`);
    }

    /**
     * Toggle between available locales (fr <-> en).
     */
    toggleLocale() {
        const current = this.getLocale();
        const next = current === 'fr' ? 'en' : 'fr';
        this.setLocale(next);
    }
}

// Global Instance
const Localization = new LocalizationManager();

// Expose globally for usage in other modules
window.Localization = Localization;

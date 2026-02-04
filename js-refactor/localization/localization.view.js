/**
 * [MVVM : View] Localization View
 * Handles updating the DOM when the locale changes.
 */
class LocalizationView {
    constructor() {
        // No specific state needed here
    }

    /**
     * Update all elements with data-i18n attribute.
     * @param {string} currentLocale 
     * @param {function} translateFn - The translation function from the manager
     */
    updateInterface(currentLocale, translateFn) {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = translateFn(key);

            // If the element has children (like icons), we try to only replace text nodes,
            // or if it's a simple span/div, we replace the content.
            // For safety in this specific app structure where icons are common:
            if (el.children.length > 0) {
                // Heuristic: Update the last text node or specific implementation
                // Often buttons have: <icon> <span>Text</span>
                // We might target specific spans if possible. 
                // BUT, to keep it simple and robust, let's assume complex buttons use a span wrapper for text.
                // If the element is a leaf node or just text:
                // For now, let's try to set title/placeholder/textContent based on tag.

                // If it's an input/textarea with placeholder
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    el.placeholder = translation;
                } else {
                    // For complex elements, we might need a dedicated span with data-i18n inside.
                    // However, if the user put data-i18n on the parent, we might overwrite icons.
                    // Recommendation: Put data-i18n on the text definition itself.
                    // Fallback check:
                    let textNode = Array.from(el.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0);
                    if (textNode) {
                        textNode.textContent = translation;
                    } else {
                        // No text node found, maybe it's in a child span that hasn't the attribute?
                        // In that case, we expect the DOM to be cleaner. Use innerText if safe.
                        // console.warn('Localization: Element has children but no direct text node found for', key, el);
                    }
                }

            } else {
                // Simple element
                if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                    if (el.type === 'button' || el.type === 'submit') {
                        el.value = translation;
                    } else {
                        el.placeholder = translation;
                    }
                } else if (el.hasAttribute('title')) {
                    // Start by translation the title content
                    el.title = translation;
                } else {
                    el.textContent = translation;
                }
            }

            // Also update Title attribute if data-i18n-title is present
            if (el.hasAttribute('data-i18n-title')) {
                const titleKey = el.getAttribute('data-i18n-title');
                el.title = translateFn(titleKey);
            }
        });
    }
}

/**
 * Text Utilities
 * Helper functions for text formatting and manipulation
 */

const TextUtils = (() => {
    /**
     * Escape HTML special characters
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Unescape HTML entities
     */
    function unescapeHtml(html) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = html;
        return textarea.value;
    }

    /**
     * Capitalize first letter
     */
    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    /**
     * Convert to title case
     */
    function toTitleCase(str) {
        if (!str) return '';
        return str.replace(/\b\w/g, char => char.toUpperCase());
    }

    /**
     * Convert to slug (for URLs)
     */
    function toSlug(str) {
        if (!str) return '';
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
    }

    /**
     * Truncate text with ellipsis
     */
    function truncate(text, length = 100, suffix = '...') {
        if (!text) return '';
        if (text.length <= length) return text;
        return text.substring(0, length - suffix.length) + suffix;
    }

    /**
     * Truncate text in middle (useful for long paths)
     */
    function truncateMiddle(text, length = 50, separator = '...') {
        if (!text || text.length <= length) return text;
        const half = Math.floor((length - separator.length) / 2);
        return text.substring(0, half) + separator + text.substring(text.length - half);
    }

    /**
     * Word count
     */
    function wordCount(text) {
        if (!text) return 0;
        return text.trim().split(/\s+/).length;
    }

    /**
     * Character count (excluding whitespace)
     */
    function charCount(text, excludeSpaces = true) {
        if (!text) return 0;
        if (excludeSpaces) {
            return text.replace(/\s/g, '').length;
        }
        return text.length;
    }

    /**
     * Generate summary from text
     */
    function generateSummary(text, sentenceCount = 3) {
        if (!text) return '';
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        return sentences.slice(0, sentenceCount).join(' ').trim();
    }

    /**
     * Check if text is empty or whitespace only
     */
    function isEmpty(text) {
        return !text || text.trim().length === 0;
    }

    /**
     * Highlight search term in text
     */
    function highlightMatch(text, searchTerm, className = 'highlight') {
        if (!text || !searchTerm) return escapeHtml(text);
        const regex = new RegExp(`(${escapeHtml(searchTerm)})`, 'gi');
        return escapeHtml(text).replace(regex, `<span class="${className}">$1</span>`);
    }

    /**
     * Compare two strings (case-insensitive)
     */
    function compare(str1, str2) {
        return (str1 || '').toLowerCase() === (str2 || '').toLowerCase();
    }

    /**
     * Calculate string similarity (0-1)
     */
    function similarity(str1, str2) {
        const s1 = (str1 || '').toLowerCase();
        const s2 = (str2 || '').toLowerCase();

        const longer = s1.length > s2.length ? s1 : s2;
        const shorter = s1.length > s2.length ? s2 : s1;

        if (longer.length === 0) return 1.0;

        const editDistance = getEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Calculate Levenshtein distance
     */
    function getEditDistance(str1, str2) {
        const track = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(0));

        for (let i = 0; i <= str1.length; i++) track[0][i] = i;
        for (let j = 0; j <= str2.length; j++) track[j][0] = j;

        for (let j = 1; j <= str2.length; j++) {
            for (let i = 1; i <= str1.length; i++) {
                const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
                track[j][i] = Math.min(
                    track[j][i - 1] + 1,
                    track[j - 1][i] + 1,
                    track[j - 1][i - 1] + indicator
                );
            }
        }

        return track[str2.length][str1.length];
    }

    /**
     * Extract mentions (@username)
     */
    function extractMentions(text) {
        if (!text) return [];
        const regex = /@(\w+)/g;
        const matches = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            matches.push(match[1]);
        }
        return matches;
    }

    /**
     * Extract hashtags
     */
    function extractHashtags(text) {
        if (!text) return [];
        const regex = /#(\w+)/g;
        const matches = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            matches.push(match[1]);
        }
        return matches;
    }

    /**
     * Extract URLs
     */
    function extractUrls(text) {
        if (!text) return [];
        const urlRegex = /https?:\/\/[^\s]+/g;
        return text.match(urlRegex) || [];
    }

    /**
     * Pluralize word (simple version)
     */
    function pluralize(word, count) {
        return count === 1 ? word : word + 's';
    }

    return {
        escapeHtml,
        unescapeHtml,
        capitalize,
        toTitleCase,
        toSlug,
        truncate,
        truncateMiddle,
        wordCount,
        charCount,
        generateSummary,
        isEmpty,
        highlightMatch,
        compare,
        similarity,
        getEditDistance,
        extractMentions,
        extractHashtags,
        extractUrls,
        pluralize
    };
})();

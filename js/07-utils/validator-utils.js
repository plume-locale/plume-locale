/**
 * Validator Utilities
 * Helper functions for data validation
 */

const ValidatorUtils = (() => {
    /**
     * Validate email address
     */
    function isEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Validate URL
     */
    function isUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Validate phone number (basic)
     */
    function isPhoneNumber(phone) {
        const regex = /^[\d\s\-\+\(\)]{10,}$/;
        return regex.test(phone);
    }

    /**
     * Validate number
     */
    function isNumber(value) {
        return !isNaN(value) && isFinite(value);
    }

    /**
     * Validate integer
     */
    function isInteger(value) {
        return Number.isInteger(value);
    }

    /**
     * Validate float
     */
    function isFloat(value) {
        return ValidatorUtils.isNumber(value) && !Number.isInteger(value);
    }

    /**
     * Validate positive number
     */
    function isPositive(value) {
        return ValidatorUtils.isNumber(value) && value > 0;
    }

    /**
     * Validate negative number
     */
    function isNegative(value) {
        return ValidatorUtils.isNumber(value) && value < 0;
    }

    /**
     * Validate string length
     */
    function lengthBetween(str, min, max) {
        if (!str) return min === 0;
        const length = str.length;
        return length >= min && length <= max;
    }

    /**
     * Validate string matches pattern
     */
    function matchesPattern(str, pattern) {
        const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
        return regex.test(str);
    }

    /**
     * Check if string is alphanumeric
     */
    function isAlphanumeric(str) {
        return /^[a-zA-Z0-9]*$/.test(str);
    }

    /**
     * Check if string contains only letters
     */
    function isAlpha(str) {
        return /^[a-zA-Z]*$/.test(str);
    }

    /**
     * Check if string contains only numbers
     */
    function isNumeric(str) {
        return /^[0-9]*$/.test(str);
    }

    /**
     * Check if string is slug format
     */
    function isSlug(str) {
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(str);
    }

    /**
     * Check if value is empty
     */
    function isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim().length === 0;
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    }

    /**
     * Check if value is required (not empty)
     */
    function isRequired(value) {
        return !ValidatorUtils.isEmpty(value);
    }

    /**
     * Validate object has required fields
     */
    function hasRequiredFields(obj, fields) {
        return fields.every(field => ValidatorUtils.isRequired(obj[field]));
    }

    /**
     * Validate color (hex, rgb, hsl)
     */
    function isColor(value) {
        const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
        const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
        const hslRegex = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/;

        return hexRegex.test(value) || rgbRegex.test(value) || hslRegex.test(value);
    }

    /**
     * Validate credit card number (Luhn algorithm)
     */
    function isCreditCard(number) {
        const digits = number.replace(/\D/g, '');
        if (digits.length < 13 || digits.length > 19) return false;

        let sum = 0;
        let isEven = false;

        for (let i = digits.length - 1; i >= 0; i--) {
            let digit = parseInt(digits[i], 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    /**
     * Validate date
     */
    function isDate(value) {
        if (!(value instanceof Date)) {
            value = new Date(value);
        }
        return value instanceof Date && !isNaN(value);
    }

    /**
     * Validate date format (YYYY-MM-DD)
     */
    function isDateFormat(value) {
        return /^\d{4}-\d{2}-\d{2}$/.test(value) && ValidatorUtils.isDate(value);
    }

    /**
     * Validate time format (HH:MM:SS)
     */
    function isTimeFormat(value) {
        return /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value);
    }

    /**
     * Validate IPv4 address
     */
    function isIPv4(value) {
        const regex = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;
        return regex.test(value);
    }

    /**
     * Validate JSON
     */
    function isJSON(value) {
        try {
            JSON.parse(value);
            return true;
        } catch (e) {
            return false;
        }
    }

    return {
        isEmail,
        isUrl,
        isPhoneNumber,
        isNumber,
        isInteger,
        isFloat,
        isPositive,
        isNegative,
        lengthBetween,
        matchesPattern,
        isAlphanumeric,
        isAlpha,
        isNumeric,
        isSlug,
        isEmpty,
        isRequired,
        hasRequiredFields,
        isColor,
        isCreditCard,
        isDate,
        isDateFormat,
        isTimeFormat,
        isIPv4,
        isJSON
    };
})();

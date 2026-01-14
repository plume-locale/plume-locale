/**
 * Date Utilities
 * Helper functions for date formatting and manipulation
 */

const DateUtils = (() => {
    /**
     * Format date to locale string
     */
    function format(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            ...options
        };
        return new Date(date).toLocaleDateString('fr-FR', defaultOptions);
    }

    /**
     * Format date and time
     */
    function formatDateTime(date, dateOptions = {}, timeOptions = {}) {
        const d = new Date(date);
        const dateStr = DateUtils.format(d, dateOptions);
        const timeStr = d.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            ...timeOptions
        });
        return `${dateStr} ${timeStr}`;
    }

    /**
     * Format time only
     */
    function formatTime(date, options = {}) {
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            ...options
        };
        return new Date(date).toLocaleTimeString('fr-FR', defaultOptions);
    }

    /**
     * Format relative time (e.g., "2 hours ago")
     */
    function formatRelative(date) {
        const now = new Date();
        const then = new Date(date);
        const seconds = Math.floor((now - then) / 1000);

        const intervals = {
            year: 31536000,
            month: 2592000,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60
        };

        for (const [name, secondsInInterval] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / secondsInInterval);
            if (interval >= 1) {
                return interval === 1 ? `il y a 1 ${name}` : `il y a ${interval} ${name}s`;
            }
        }

        return 'à l\'instant';
    }

    /**
     * Get days between two dates
     */
    function daysBetween(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const diffTime = Math.abs(d2 - d1);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    /**
     * Add days to date
     */
    function addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }

    /**
     * Add months to date
     */
    function addMonths(date, months) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + months);
        return result;
    }

    /**
     * Add years to date
     */
    function addYears(date, years) {
        const result = new Date(date);
        result.setFullYear(result.getFullYear() + years);
        return result;
    }

    /**
     * Get start of day
     */
    function startOfDay(date) {
        const result = new Date(date);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    /**
     * Get end of day
     */
    function endOfDay(date) {
        const result = new Date(date);
        result.setHours(23, 59, 59, 999);
        return result;
    }

    /**
     * Get start of month
     */
    function startOfMonth(date) {
        const result = new Date(date);
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    /**
     * Get end of month
     */
    function endOfMonth(date) {
        const result = new Date(date);
        result.setMonth(result.getMonth() + 1);
        result.setDate(0);
        result.setHours(23, 59, 59, 999);
        return result;
    }

    /**
     * Check if date is today
     */
    function isToday(date) {
        const today = new Date();
        const d = new Date(date);
        return d.toDateString() === today.toDateString();
    }

    /**
     * Check if date is in past
     */
    function isPast(date) {
        return new Date(date) < new Date();
    }

    /**
     * Check if date is in future
     */
    function isFuture(date) {
        return new Date(date) > new Date();
    }

    /**
     * Check if date is valid
     */
    function isValid(date) {
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Get days in month
     */
    function getDaysInMonth(date) {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    }

    /**
     * Get week number
     */
    function getWeekNumber(date) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNumber;
    }

    /**
     * Compare two dates (ignoring time)
     */
    function isSameDay(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        return d1.toDateString() === d2.toDateString();
    }

    /**
     * Get date range (for calendar display)
     */
    function getMonthDates(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = d.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const dates = [];
        for (let i = 1; i <= lastDay.getDate(); i++) {
            dates.push(new Date(year, month, i));
        }

        return dates;
    }

    return {
        format,
        formatDateTime,
        formatTime,
        formatRelative,
        daysBetween,
        addDays,
        addMonths,
        addYears,
        startOfDay,
        endOfDay,
        startOfMonth,
        endOfMonth,
        isToday,
        isPast,
        isFuture,
        isValid,
        getDaysInMonth,
        getWeekNumber,
        isSameDay,
        getMonthDates
    };
})();

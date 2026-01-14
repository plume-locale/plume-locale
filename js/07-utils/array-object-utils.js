/**
 * Array and Object Utilities
 * Helper functions for array and object manipulation
 */

const ArrayObjectUtils = (() => {
    // ===== ARRAY UTILITIES =====

    /**
     * Remove duplicate values from array
     */
    function unique(arr) {
        return [...new Set(arr)];
    }

    /**
     * Remove duplicate objects by key
     */
    function uniqueBy(arr, key) {
        const seen = new Set();
        return arr.filter(item => {
            const value = item[key];
            if (seen.has(value)) return false;
            seen.add(value);
            return true;
        });
    }

    /**
     * Flatten nested array
     */
    function flatten(arr, depth = Infinity) {
        return arr.reduce((flat, item) => {
            return flat.concat(depth > 1 && Array.isArray(item) ? ArrayObjectUtils.flatten(item, depth - 1) : item);
        }, []);
    }

    /**
     * Chunk array into smaller arrays
     */
    function chunk(arr, size) {
        const chunks = [];
        for (let i = 0; i < arr.length; i += size) {
            chunks.push(arr.slice(i, i + size));
        }
        return chunks;
    }

    /**
     * Shuffle array (Fisher-Yates)
     */
    function shuffle(arr) {
        const result = [...arr];
        for (let i = result.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [result[i], result[j]] = [result[j], result[i]];
        }
        return result;
    }

    /**
     * Get random element from array
     */
    function random(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /**
     * Find and return matching elements
     */
    function findAll(arr, predicate) {
        return arr.filter(predicate);
    }

    /**
     * Sum array values
     */
    function sum(arr) {
        return arr.reduce((total, val) => total + val, 0);
    }

    /**
     * Average of array values
     */
    function average(arr) {
        return arr.length === 0 ? 0 : ArrayObjectUtils.sum(arr) / arr.length;
    }

    /**
     * Get min value from array
     */
    function min(arr) {
        return Math.min(...arr);
    }

    /**
     * Get max value from array
     */
    function max(arr) {
        return Math.max(...arr);
    }

    /**
     * Group array by key
     */
    function groupBy(arr, key) {
        return arr.reduce((groups, item) => {
            const groupKey = item[key];
            if (!groups[groupKey]) {
                groups[groupKey] = [];
            }
            groups[groupKey].push(item);
            return groups;
        }, {});
    }

    /**
     * Sort array of objects by key
     */
    function sortBy(arr, key, order = 'asc') {
        const sorted = [...arr];
        sorted.sort((a, b) => {
            const aVal = a[key];
            const bVal = b[key];

            if (aVal < bVal) return order === 'asc' ? -1 : 1;
            if (aVal > bVal) return order === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }

    /**
     * Get indices of matching elements
     */
    function findIndices(arr, predicate) {
        return arr.reduce((indices, item, idx) => {
            if (predicate(item)) indices.push(idx);
            return indices;
        }, []);
    }

    /**
     * Paginate array
     */
    function paginate(arr, page, pageSize) {
        const start = (page - 1) * pageSize;
        return arr.slice(start, start + pageSize);
    }

    /**
     * Get first N elements
     */
    function first(arr, n = 1) {
        return n === 1 ? arr[0] : arr.slice(0, n);
    }

    /**
     * Get last N elements
     */
    function last(arr, n = 1) {
        return n === 1 ? arr[arr.length - 1] : arr.slice(-n);
    }

    // ===== OBJECT UTILITIES =====

    /**
     * Deep clone object
     */
    function deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => ArrayObjectUtils.deepClone(item));

        const cloned = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                cloned[key] = ArrayObjectUtils.deepClone(obj[key]);
            }
        }
        return cloned;
    }

    /**
     * Merge objects
     */
    function merge(target, ...sources) {
        if (!sources.length) return target;

        const result = ArrayObjectUtils.deepClone(target);

        sources.forEach(source => {
            for (const key in source) {
                if (source.hasOwnProperty(key)) {
                    if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
                        result[key] = ArrayObjectUtils.merge(result[key] || {}, source[key]);
                    } else {
                        result[key] = source[key];
                    }
                }
            }
        });

        return result;
    }

    /**
     * Invert object keys and values
     */
    function invert(obj) {
        return Object.entries(obj).reduce((inverted, [key, value]) => {
            inverted[value] = key;
            return inverted;
        }, {});
    }

    /**
     * Pick specific keys from object
     */
    function pick(obj, keys) {
        return keys.reduce((picked, key) => {
            if (key in obj) {
                picked[key] = obj[key];
            }
            return picked;
        }, {});
    }

    /**
     * Omit specific keys from object
     */
    function omit(obj, keys) {
        const omitted = { ...obj };
        keys.forEach(key => delete omitted[key]);
        return omitted;
    }

    /**
     * Get nested value by path
     */
    function getByPath(obj, path, defaultValue = undefined) {
        const keys = path.split('.');
        let value = obj;

        for (const key of keys) {
            value = value?.[key];
            if (value === undefined) return defaultValue;
        }

        return value;
    }

    /**
     * Set nested value by path
     */
    function setByPath(obj, path, value) {
        const keys = path.split('.');
        let current = obj;

        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!(key in current)) {
                current[key] = {};
            }
            current = current[key];
        }

        current[keys[keys.length - 1]] = value;
        return obj;
    }

    /**
     * Check if object has any values
     */
    function hasValues(obj) {
        return Object.keys(obj).length > 0;
    }

    /**
     * Get object size (number of keys)
     */
    function size(obj) {
        return Object.keys(obj).length;
    }

    /**
     * Map object values
     */
    function mapValues(obj, mapper) {
        return Object.entries(obj).reduce((mapped, [key, value]) => {
            mapped[key] = mapper(value, key);
            return mapped;
        }, {});
    }

    /**
     * Filter object by predicate
     */
    function filterObject(obj, predicate) {
        return Object.entries(obj).reduce((filtered, [key, value]) => {
            if (predicate(value, key)) {
                filtered[key] = value;
            }
            return filtered;
        }, {});
    }

    /**
     * Compare two objects for equality
     */
    function equals(obj1, obj2) {
        if (obj1 === obj2) return true;
        if (obj1 == null || obj2 == null) return false;
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        return keys1.every(key => ArrayObjectUtils.equals(obj1[key], obj2[key]));
    }

    return {
        // Array utilities
        unique,
        uniqueBy,
        flatten,
        chunk,
        shuffle,
        random,
        findAll,
        sum,
        average,
        min,
        max,
        groupBy,
        sortBy,
        findIndices,
        paginate,
        first,
        last,

        // Object utilities
        deepClone,
        merge,
        invert,
        pick,
        omit,
        getByPath,
        setByPath,
        hasValues,
        size,
        mapValues,
        filterObject,
        equals
    };
})();

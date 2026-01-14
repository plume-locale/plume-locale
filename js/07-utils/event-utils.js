/**
 * Event Utilities
 * Helper functions for common event patterns and async utilities
 */

const EventUtils = (() => {
    /**
     * Debounce function (wait for inactivity before executing)
     */
    function debounce(callback, delay = 300) {
        let timeoutId;

        return function(...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                callback.apply(this, args);
            }, delay);
        };
    }

    /**
     * Throttle function (limit execution frequency)
     */
    function throttle(callback, delay = 300) {
        let lastTime = 0;

        return function(...args) {
            const now = Date.now();

            if (now - lastTime >= delay) {
                callback.apply(this, args);
                lastTime = now;
            }
        };
    }

    /**
     * Request animation frame wrapper
     */
    function animationFrame(callback) {
        return requestAnimationFrame(callback);
    }

    /**
     * Cancel animation frame
     */
    function cancelAnimationFrame(id) {
        window.cancelAnimationFrame(id);
    }

    /**
     * Debounce for animation frames
     */
    function debounceAnimationFrame(callback) {
        let frameId;

        return function(...args) {
            if (frameId) {
                cancelAnimationFrame(frameId);
            }

            frameId = animationFrame(() => {
                callback.apply(this, args);
            });
        };
    }

    /**
     * Delay execution (returns promise)
     */
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Once - execute function only once
     */
    function once(callback) {
        let called = false;
        let result;

        return function(...args) {
            if (!called) {
                called = true;
                result = callback.apply(this, args);
            }
            return result;
        };
    }

    /**
     * Before - execute callback before function
     */
    function before(callback, count) {
        let callCount = 0;

        return function(...args) {
            if (callCount < count) {
                callCount++;
                return callback.apply(this, args);
            }
        };
    }

    /**
     * After - execute callback after N calls
     */
    function after(callback, count) {
        let callCount = 0;

        return function(...args) {
            if (++callCount === count) {
                return callback.apply(this, args);
            }
        };
    }

    /**
     * Compose functions (right to left)
     */
    function compose(...fns) {
        return (value) => fns.reduceRight((acc, fn) => fn(acc), value);
    }

    /**
     * Pipe functions (left to right)
     */
    function pipe(...fns) {
        return (value) => fns.reduce((acc, fn) => fn(acc), value);
    }

    /**
     * Memoize function results
     */
    function memoize(callback) {
        const cache = new Map();

        return function(...args) {
            const key = JSON.stringify(args);

            if (cache.has(key)) {
                return cache.get(key);
            }

            const result = callback.apply(this, args);
            cache.set(key, result);

            return result;
        };
    }

    /**
     * Retry failed promise
     */
    async function retry(fn, options = {}) {
        const { maxAttempts = 3, delay: retryDelay = 1000, backoff = true } = options;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                if (attempt === maxAttempts) throw error;

                const waitTime = backoff ? retryDelay * Math.pow(2, attempt - 1) : retryDelay;
                await EventUtils.delay(waitTime);
            }
        }
    }

    /**
     * Timeout promise
     */
    function timeout(promise, ms) {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Promise timeout')), ms)
            )
        ]);
    }

    /**
     * Run promises in parallel with limit
     */
    async function parallelLimit(tasks, limit) {
        const results = [];
        const executing = [];

        for (const [index, task] of tasks.entries()) {
            const promise = Promise.resolve().then(() => task()).then(
                result => {
                    results[index] = result;
                    return result;
                }
            );

            executing.push(promise);

            if (executing.length >= limit) {
                await Promise.race(executing);
                executing.splice(executing.findIndex(p => p === promise), 1);
            }
        }

        await Promise.all(executing);
        return results;
    }

    /**
     * Batch promises
     */
    async function batch(tasks, batchSize) {
        const results = [];

        for (let i = 0; i < tasks.length; i += batchSize) {
            const batch = tasks.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(task => task()));
            results.push(...batchResults);
        }

        return results;
    }

    return {
        debounce,
        throttle,
        animationFrame,
        cancelAnimationFrame,
        debounceAnimationFrame,
        delay,
        once,
        before,
        after,
        compose,
        pipe,
        memoize,
        retry,
        timeout,
        parallelLimit,
        batch
    };
})();

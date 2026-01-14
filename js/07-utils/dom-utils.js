/**
 * DOM Utilities
 * Helper functions for DOM manipulation and querying
 */

const DOMUtils = (() => {
    /**
     * Create an element with optional attributes and content
     */
    function createElement(tag, options = {}) {
        const element = document.createElement(tag);

        if (options.id) element.id = options.id;
        if (options.class) element.className = options.class;
        if (options.text) element.textContent = options.text;
        if (options.html) element.innerHTML = options.html;

        if (options.attributes) {
            Object.entries(options.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }

        if (options.dataset) {
            Object.entries(options.dataset).forEach(([key, value]) => {
                element.dataset[key] = value;
            });
        }

        if (options.styles) {
            Object.assign(element.style, options.styles);
        }

        if (options.events) {
            Object.entries(options.events).forEach(([event, handler]) => {
                element.addEventListener(event, handler);
            });
        }

        return element;
    }

    /**
     * Query single element safely
     */
    function query(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (e) {
            console.error(`Invalid selector: ${selector}`, e);
            return null;
        }
    }

    /**
     * Query all elements matching selector
     */
    function queryAll(selector, parent = document) {
        try {
            return Array.from(parent.querySelectorAll(selector));
        } catch (e) {
            console.error(`Invalid selector: ${selector}`, e);
            return [];
        }
    }

    /**
     * Check if element matches selector
     */
    function matches(element, selector) {
        return element.matches ? element.matches(selector) : false;
    }

    /**
     * Get closest parent matching selector
     */
    function closest(element, selector) {
        return element.closest ? element.closest(selector) : null;
    }

    /**
     * Add classes to element
     */
    function addClass(element, ...classes) {
        element.classList.add(...classes.filter(c => c));
    }

    /**
     * Remove classes from element
     */
    function removeClass(element, ...classes) {
        element.classList.remove(...classes.filter(c => c));
    }

    /**
     * Toggle class on element
     */
    function toggleClass(element, className, force) {
        if (force !== undefined) {
            element.classList.toggle(className, force);
        } else {
            element.classList.toggle(className);
        }
    }

    /**
     * Check if element has class
     */
    function hasClass(element, className) {
        return element.classList.contains(className);
    }

    /**
     * Set multiple styles at once
     */
    function setStyles(element, styles) {
        Object.assign(element.style, styles);
    }

    /**
     * Get computed style value
     */
    function getStyle(element, property) {
        return window.getComputedStyle(element).getPropertyValue(property);
    }

    /**
     * Show element
     */
    function show(element) {
        element.style.display = '';
    }

    /**
     * Hide element
     */
    function hide(element) {
        element.style.display = 'none';
    }

    /**
     * Toggle visibility
     */
    function toggleVisibility(element, show = null) {
        if (show !== null) {
            show ? DOMUtils.show(element) : DOMUtils.hide(element);
        } else {
            element.style.display === 'none' ? DOMUtils.show(element) : DOMUtils.hide(element);
        }
    }

    /**
     * Check if element is visible
     */
    function isVisible(element) {
        return element.style.display !== 'none' && window.getComputedStyle(element).display !== 'none';
    }

    /**
     * Empty element (remove all children)
     */
    function empty(element) {
        element.innerHTML = '';
    }

    /**
     * Remove element from DOM
     */
    function remove(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    /**
     * Insert element after target
     */
    function insertAfter(newElement, targetElement) {
        targetElement.parentNode.insertBefore(newElement, targetElement.nextSibling);
    }

    /**
     * Get element's offset
     */
    function getOffset(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset,
            width: rect.width,
            height: rect.height
        };
    }

    /**
     * Scroll to element
     */
    function scrollIntoView(element, options = { behavior: 'smooth', block: 'start' }) {
        element.scrollIntoView(options);
    }

    /**
     * Focus element
     */
    function focus(element) {
        element.focus();
    }

    /**
     * Get form data as object
     */
    function getFormData(formElement) {
        const formData = new FormData(formElement);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    }

    /**
     * Set form data from object
     */
    function setFormData(formElement, data) {
        Object.entries(data).forEach(([key, value]) => {
            const input = formElement.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = !!value;
                } else if (input.type === 'radio') {
                    const radio = formElement.querySelector(`[name="${key}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                } else {
                    input.value = value;
                }
            }
        });
    }

    return {
        createElement,
        query,
        queryAll,
        matches,
        closest,
        addClass,
        removeClass,
        toggleClass,
        hasClass,
        setStyles,
        getStyle,
        show,
        hide,
        toggleVisibility,
        isVisible,
        empty,
        remove,
        insertAfter,
        getOffset,
        scrollIntoView,
        focus,
        getFormData,
        setFormData
    };
})();

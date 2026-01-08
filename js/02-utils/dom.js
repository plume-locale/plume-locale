// ============================================
// DOM UTILS - Utilitaires de manipulation DOM
// ============================================

/**
 * DOMUtils - Helpers pour simplifier la manipulation du DOM
 *
 * Responsabilités :
 * - Fournir des wrappers simples pour les opérations DOM courantes
 * - Échapper le HTML pour la sécurité
 * - Créer des éléments de manière programmatique
 * - Gérer la visibilité des éléments
 */

const DOMUtils = (function() {
    'use strict';

    /**
     * Sélectionne un élément
     * @param {string} selector - Sélecteur CSS
     * @param {Element} context - Contexte de recherche (par défaut document)
     * @returns {Element|null}
     */
    function query(selector, context = document) {
        return context.querySelector(selector);
    }

    /**
     * Sélectionne tous les éléments correspondants
     * @param {string} selector - Sélecteur CSS
     * @param {Element} context - Contexte de recherche
     * @returns {Array<Element>}
     */
    function queryAll(selector, context = document) {
        return Array.from(context.querySelectorAll(selector));
    }

    /**
     * Crée un élément DOM
     * @param {string} tag - Nom de la balise
     * @param {Object} attributes - Attributs de l'élément
     * @param {Array|string} children - Enfants (éléments ou texte)
     * @returns {Element}
     */
    function create(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);

        // Appliquer les attributs
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'classList') {
                if (Array.isArray(value)) {
                    element.classList.add(...value);
                }
            } else if (key === 'dataset') {
                Object.entries(value).forEach(([dataKey, dataValue]) => {
                    element.dataset[dataKey] = dataValue;
                });
            } else if (key === 'style') {
                Object.entries(value).forEach(([styleKey, styleValue]) => {
                    element.style[styleKey] = styleValue;
                });
            } else if (key.startsWith('on') && typeof value === 'function') {
                // Event listeners (onClick, onSubmit, etc.)
                const eventName = key.substring(2).toLowerCase();
                element.addEventListener(eventName, value);
            } else {
                element.setAttribute(key, value);
            }
        });

        // Ajouter les enfants
        const childArray = Array.isArray(children) ? children : [children];
        childArray.forEach(child => {
            if (!child) return; // Ignorer null/undefined

            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });

        return element;
    }

    /**
     * Vide un élément de tous ses enfants
     * @param {Element} element
     */
    function empty(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }

    /**
     * Supprime un élément du DOM
     * @param {Element} element
     */
    function remove(element) {
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    /**
     * Échappe le HTML pour éviter les injections XSS
     * @param {string} text - Texte à échapper
     * @returns {string}
     */
    function escape(text) {
        if (text == null) return '';

        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Affiche un élément
     * @param {Element} element
     * @param {string} display - Type d'affichage (par défaut '')
     */
    function show(element, display = '') {
        if (element) {
            element.style.display = display;
        }
    }

    /**
     * Masque un élément
     * @param {Element} element
     */
    function hide(element) {
        if (element) {
            element.style.display = 'none';
        }
    }

    /**
     * Toggle la visibilité d'un élément
     * @param {Element} element
     * @param {boolean} force - Force l'état (optionnel)
     * @returns {boolean} Nouvel état visible/caché
     */
    function toggle(element, force) {
        if (!element) return false;

        const isHidden = element.style.display === 'none';
        const shouldShow = force !== undefined ? force : isHidden;

        if (shouldShow) {
            show(element);
        } else {
            hide(element);
        }

        return shouldShow;
    }

    /**
     * Ajoute une ou plusieurs classes
     * @param {Element} element
     * @param {string|Array<string>} classes
     */
    function addClass(element, classes) {
        if (!element) return;

        const classList = Array.isArray(classes) ? classes : [classes];
        element.classList.add(...classList);
    }

    /**
     * Retire une ou plusieurs classes
     * @param {Element} element
     * @param {string|Array<string>} classes
     */
    function removeClass(element, classes) {
        if (!element) return;

        const classList = Array.isArray(classes) ? classes : [classes];
        element.classList.remove(...classList);
    }

    /**
     * Toggle une classe
     * @param {Element} element
     * @param {string} className
     * @param {boolean} force - Force l'état (optionnel)
     * @returns {boolean} Nouvel état
     */
    function toggleClass(element, className, force) {
        if (!element) return false;

        return element.classList.toggle(className, force);
    }

    /**
     * Vérifie si un élément a une classe
     * @param {Element} element
     * @param {string} className
     * @returns {boolean}
     */
    function hasClass(element, className) {
        return element ? element.classList.contains(className) : false;
    }

    /**
     * Récupère ou définit un attribut
     * @param {Element} element
     * @param {string} name - Nom de l'attribut
     * @param {string} value - Valeur (optionnel, get si non fourni)
     * @returns {string|null}
     */
    function attr(element, name, value) {
        if (!element) return null;

        if (value === undefined) {
            return element.getAttribute(name);
        } else {
            element.setAttribute(name, value);
            return value;
        }
    }

    /**
     * Retire un attribut
     * @param {Element} element
     * @param {string} name
     */
    function removeAttr(element, name) {
        if (element) {
            element.removeAttribute(name);
        }
    }

    /**
     * Récupère ou définit un attribut data-*
     * @param {Element} element
     * @param {string} name - Nom (sans le préfixe data-)
     * @param {string} value - Valeur (optionnel)
     * @returns {string|null}
     */
    function data(element, name, value) {
        if (!element) return null;

        if (value === undefined) {
            return element.dataset[name];
        } else {
            element.dataset[name] = value;
            return value;
        }
    }

    /**
     * Récupère le parent le plus proche correspondant au sélecteur
     * @param {Element} element
     * @param {string} selector
     * @returns {Element|null}
     */
    function closest(element, selector) {
        return element ? element.closest(selector) : null;
    }

    /**
     * Ajoute un event listener avec délégation
     * @param {Element} parent - Élément parent
     * @param {string} selector - Sélecteur des enfants
     * @param {string} event - Type d'événement
     * @param {Function} handler - Gestionnaire
     * @returns {Function} Fonction pour retirer le listener
     */
    function delegate(parent, selector, event, handler) {
        const listener = (e) => {
            const target = e.target.closest(selector);
            if (target) {
                handler.call(target, e);
            }
        };

        parent.addEventListener(event, listener);

        return () => parent.removeEventListener(event, listener);
    }

    /**
     * Insère du HTML de manière sécurisée
     * @param {Element} element
     * @param {string} html
     * @param {string} position - beforebegin, afterbegin, beforeend, afterend
     */
    function insertHTML(element, html, position = 'beforeend') {
        if (element) {
            element.insertAdjacentHTML(position, html);
        }
    }

    /**
     * Récupère les dimensions d'un élément
     * @param {Element} element
     * @returns {Object} {width, height, top, left}
     */
    function getBounds(element) {
        if (!element) return null;

        const rect = element.getBoundingClientRect();
        return {
            width: rect.width,
            height: rect.height,
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom
        };
    }

    /**
     * Scroll jusqu'à un élément
     * @param {Element} element
     * @param {Object} options - Options de scroll
     */
    function scrollTo(element, options = { behavior: 'smooth', block: 'center' }) {
        if (element) {
            element.scrollIntoView(options);
        }
    }

    /**
     * Vérifie si un élément est visible dans le viewport
     * @param {Element} element
     * @returns {boolean}
     */
    function isInViewport(element) {
        if (!element) return false;

        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Parse du HTML en élément DOM
     * @param {string} html
     * @returns {Element}
     */
    function parseHTML(html) {
        const template = document.createElement('template');
        template.innerHTML = html.trim();
        return template.content.firstChild;
    }

    /**
     * Clone un élément
     * @param {Element} element
     * @param {boolean} deep - Clone profond (défaut true)
     * @returns {Element}
     */
    function clone(element, deep = true) {
        return element ? element.cloneNode(deep) : null;
    }

    // API publique
    return {
        query,
        queryAll,
        create,
        empty,
        remove,
        escape,
        show,
        hide,
        toggle,
        addClass,
        removeClass,
        toggleClass,
        hasClass,
        attr,
        removeAttr,
        data,
        closest,
        delegate,
        insertHTML,
        getBounds,
        scrollTo,
        isInViewport,
        parseHTML,
        clone,

        // Alias courts
        $: query,
        $$: queryAll
    };
})();

// Exposer globalement
window.DOMUtils = DOMUtils;

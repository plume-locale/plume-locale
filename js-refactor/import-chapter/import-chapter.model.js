/**
 * [MVVM : Model]
 * Import Chapter Model - Gestion du parsing et de la détection des chapitres
 * depuis un fichier .docx
 */

const ImportChapterModel = {
    /**
     * Patterns de détection des chapitres (ordre de priorité)
     */
    chapterPatterns: [
        // Titres avec numéros
        /^chapitre\s+(\d+|[ivxlcdm]+)[\s:.\-–—]*(.*)$/i,
        /^chapter\s+(\d+|[ivxlcdm]+)[\s:.\-–—]*(.*)$/i,
        /^chap\.?\s*(\d+|[ivxlcdm]+)[\s:.\-–—]*(.*)$/i,
        // Titres avec mots (Chapitre Un, Chapitre Premier)
        /^chapitre\s+(un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|premier|deuxième|troisième|second)[\s:.\-–—]*(.*)$/i,
        // Format numéroté simple
        /^(\d+)[\s:.\-–—]+(.+)$/,
        // Format avec tiret ou point
        /^(\d+)\.\s*(.+)$/,
        // Partie/Part
        /^partie\s+(\d+|[ivxlcdm]+)[\s:.\-–—]*(.*)$/i,
        /^part\s+(\d+|[ivxlcdm]+)[\s:.\-–—]*(.*)$/i
    ],

    /**
     * Convertit un fichier DOCX en HTML via Mammoth.js
     * @param {File} file - Fichier .docx
     * @returns {Promise<{html: string, messages: Array}>}
     */
    async convertDocxToHtml(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;
                    const result = await mammoth.convertToHtml(
                        { arrayBuffer },
                        {
                            styleMap: [
                                "p[style-name='Heading 1'] => h1:fresh",
                                "p[style-name='Heading 2'] => h2:fresh",
                                "p[style-name='Titre 1'] => h1:fresh",
                                "p[style-name='Titre 2'] => h2:fresh",
                                "p[style-name='Title'] => h1:fresh",
                                "p[style-name='Titre'] => h1:fresh"
                            ]
                        }
                    );
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Parse le HTML et détecte les chapitres automatiquement
     * @param {string} html - HTML converti depuis le DOCX
     * @returns {Array<{title: string, content: string}>}
     */
    parseChaptersFromHtml(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const chapters = [];

        // Stratégie 1: Détection via les titres H1/H2
        const headings = doc.querySelectorAll('h1, h2');
        if (headings.length > 0) {
            return this.parseByHeadings(doc, headings);
        }

        // Stratégie 2: Détection via patterns textuels dans les paragraphes
        const paragraphs = doc.querySelectorAll('p');
        const patternChapters = this.parseByPatterns(paragraphs);
        if (patternChapters.length > 0) {
            return patternChapters;
        }

        // Stratégie 3: Si aucun chapitre détecté, créer un chapitre unique
        const fullContent = doc.body.innerHTML;
        if (fullContent.trim()) {
            chapters.push({
                title: 'Chapitre 1',
                content: this.cleanHtml(fullContent)
            });
        }

        return chapters;
    },

    /**
     * Parse les chapitres en utilisant les balises H1/H2
     * @param {Document} doc - Document HTML parsé
     * @param {NodeList} headings - Liste des titres H1/H2
     * @returns {Array<{title: string, content: string}>}
     */
    parseByHeadings(doc, headings) {
        const chapters = [];
        const body = doc.body;

        headings.forEach((heading, index) => {
            const title = heading.textContent.trim();
            if (!title) return;

            // Collecter tout le contenu jusqu'au prochain heading
            let content = '';
            let sibling = heading.nextElementSibling;

            while (sibling && !['H1', 'H2'].includes(sibling.tagName)) {
                content += sibling.outerHTML;
                sibling = sibling.nextElementSibling;
            }

            // Nettoyer le titre des numéros de chapitre si présent
            const cleanTitle = this.cleanChapterTitle(title);

            chapters.push({
                title: cleanTitle || `Chapitre ${index + 1}`,
                content: this.cleanHtml(content)
            });
        });

        // Si du contenu existe avant le premier heading, l'ajouter comme prologue
        const firstHeading = headings[0];
        let prologueContent = '';
        let sibling = body.firstElementChild;

        while (sibling && sibling !== firstHeading) {
            if (sibling.textContent.trim()) {
                prologueContent += sibling.outerHTML;
            }
            sibling = sibling.nextElementSibling;
        }

        if (prologueContent.trim()) {
            chapters.unshift({
                title: 'Prologue',
                content: this.cleanHtml(prologueContent)
            });
        }

        return chapters;
    },

    /**
     * Parse les chapitres via patterns textuels
     * @param {NodeList} paragraphs - Paragraphes du document
     * @returns {Array<{title: string, content: string}>}
     */
    parseByPatterns(paragraphs) {
        const chapters = [];
        let currentChapter = null;
        let prologueContent = '';

        paragraphs.forEach(p => {
            const text = p.textContent.trim();
            const matchedPattern = this.matchChapterPattern(text);

            if (matchedPattern) {
                // Sauvegarder le chapitre précédent
                if (currentChapter) {
                    chapters.push(currentChapter);
                } else if (prologueContent.trim()) {
                    // Contenu avant le premier chapitre = prologue
                    chapters.push({
                        title: 'Prologue',
                        content: this.cleanHtml(prologueContent)
                    });
                }

                // Nouveau chapitre
                currentChapter = {
                    title: matchedPattern.title,
                    content: ''
                };
            } else if (currentChapter) {
                // Ajouter au chapitre en cours
                currentChapter.content += p.outerHTML;
            } else {
                // Avant le premier chapitre
                prologueContent += p.outerHTML;
            }
        });

        // Ajouter le dernier chapitre
        if (currentChapter) {
            currentChapter.content = this.cleanHtml(currentChapter.content);
            chapters.push(currentChapter);
        }

        return chapters;
    },

    /**
     * Teste si un texte correspond à un pattern de chapitre
     * @param {string} text - Texte à tester
     * @returns {Object|null} - {title, number} ou null
     */
    matchChapterPattern(text) {
        if (!text || text.length > 100) return null; // Trop long pour être un titre

        for (const pattern of this.chapterPatterns) {
            const match = text.match(pattern);
            if (match) {
                // Extraire le titre propre
                const number = match[1];
                const subtitle = match[2] ? match[2].trim() : '';

                let title;
                if (subtitle) {
                    title = subtitle;
                } else if (/^\d+$/.test(number)) {
                    title = `Chapitre ${number}`;
                } else {
                    title = `Chapitre ${this.romanToArabic(number) || number}`;
                }

                return { title, number };
            }
        }

        return null;
    },

    /**
     * Nettoie un titre de chapitre
     * @param {string} title - Titre brut
     * @returns {string} - Titre nettoyé
     */
    cleanChapterTitle(title) {
        // Supprimer les préfixes "Chapitre X -" etc.
        let clean = title;

        for (const pattern of this.chapterPatterns) {
            const match = clean.match(pattern);
            if (match && match[2]) {
                return match[2].trim() || clean;
            }
        }

        return clean;
    },

    /**
     * Convertit un nombre romain en arabe
     * @param {string} roman - Nombre romain
     * @returns {number|null}
     */
    romanToArabic(roman) {
        if (!roman || typeof roman !== 'string') return null;

        const romanNumerals = {
            'i': 1, 'v': 5, 'x': 10, 'l': 50,
            'c': 100, 'd': 500, 'm': 1000
        };

        const str = roman.toLowerCase();
        let result = 0;
        let prev = 0;

        for (let i = str.length - 1; i >= 0; i--) {
            const current = romanNumerals[str[i]];
            if (!current) return null;

            if (current < prev) {
                result -= current;
            } else {
                result += current;
            }
            prev = current;
        }

        return result > 0 ? result : null;
    },

    /**
     * Nettoie le HTML pour Plume
     * @param {string} html - HTML brut
     * @returns {string} - HTML nettoyé
     */
    cleanHtml(html) {
        if (!html) return '';

        // Créer un élément temporaire pour manipuler le HTML
        const temp = document.createElement('div');
        temp.innerHTML = html;

        // Supprimer les styles inline inutiles
        const allElements = temp.querySelectorAll('*');
        allElements.forEach(el => {
            // Garder seulement certains styles (bold, italic)
            const style = el.getAttribute('style');
            if (style) {
                const keepStyles = [];
                if (style.includes('font-weight') && style.includes('bold')) {
                    keepStyles.push('font-weight: bold');
                }
                if (style.includes('font-style') && style.includes('italic')) {
                    keepStyles.push('font-style: italic');
                }
                if (keepStyles.length > 0) {
                    el.setAttribute('style', keepStyles.join('; '));
                } else {
                    el.removeAttribute('style');
                }
            }

            // Supprimer les classes inutiles
            el.removeAttribute('class');
        });

        // Convertir les <strong> et <em> pour uniformité
        return temp.innerHTML;
    },

    /**
     * Crée la structure Plume à partir des chapitres détectés
     * @param {Array} chapters - Chapitres détectés
     * @param {string} actTitle - Titre de l'acte à créer
     * @returns {Object} - Structure d'acte Plume
     */
    createPlumeStructure(chapters, actTitle = 'Import') {
        const now = new Date().toISOString();

        const act = createAct(actTitle, {
            description: `Importé le ${new Date().toLocaleDateString('fr-FR')}`
        });

        chapters.forEach((chapter, index) => {
            const plumeChapter = createChapter(chapter.title || `Chapitre ${index + 1}`);

            // Créer une scène avec le contenu du chapitre
            const scene = createScene('Contenu', {
                content: chapter.content,
                wordCount: this.countWords(chapter.content)
            });

            plumeChapter.scenes.push(scene);
            act.chapters.push(plumeChapter);
        });

        return act;
    },

    /**
     * Compte les mots dans un contenu HTML
     * @param {string} html - Contenu HTML
     * @returns {number}
     */
    countWords(html) {
        if (!html) return 0;
        const temp = document.createElement('div');
        temp.innerHTML = html;
        const text = temp.textContent || temp.innerText || '';
        const words = text.trim().match(/[\p{L}]+/gu);
        return words ? words.length : 0;
    }
};

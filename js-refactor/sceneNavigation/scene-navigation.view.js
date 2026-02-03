/**
 * [View : Scene Navigation]
 * Gère l'interface de navigation entre scènes.
 */

const sceneNavigationView = {
    /**
     * Crée la barre d'outils si elle n'existe pas.
     */
    ensureToolbarCreated() {
        if (document.getElementById('sceneNavToolbar')) return;

        const toolbar = document.createElement('div');
        toolbar.id = 'sceneNavToolbar';
        toolbar.className = 'scene-nav-toolbar';
        toolbar.innerHTML = `
            <div class="scene-nav-buttons">
                <button class="scene-nav-btn scene-nav-prev" title="Déplacer vers la scène précédente (tout le texte avant le curseur)">
                    <i data-lucide="chevron-left" style="width:16;height:16;"></i>
                </button>
                <button class="scene-nav-btn scene-nav-next" title="Déplacer vers la scène suivante (tout le texte après le curseur)">
                    <i data-lucide="chevron-right" style="width:16;height:16;"></i>
                </button>
            </div>
            <div class="scene-nav-line"></div>
            <div class="scene-nav-word-counts">
                <span class="scene-nav-words-before" title="Mots avant le curseur">0 mots</span>
                <span class="scene-nav-words-after" title="Mots après le curseur">0 mots</span>
            </div>
        `;

        document.body.appendChild(toolbar);
        window.sceneNavigationModel.toolbar = toolbar;

        // Initialiser Lucide si disponible
        if (window.lucide) {
            window.lucide.createIcons({
                attrs: {
                    'stroke-width': 2
                },
                nameAttr: 'data-lucide'
            });
        }
    },

    /**
     * Met à jour la position et l'état de la barre de navigation.
     */
    updatePosition() {
        const toolbar = document.getElementById('sceneNavToolbar');
        if (!toolbar) return;

        const activeElement = document.activeElement;
        if (!activeElement || !activeElement.classList.contains('editor-textarea')) {
            this.hide();
            return;
        }

        const editor = activeElement;
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0) {
            this.hide();
            return;
        }

        const range = selection.getRangeAt(0);
        if (!editor.contains(range.commonAncestorContainer)) {
            this.hide();
            return;
        }

        // Détecter le contexte
        const ctx = window.sceneNavigationViewModel.detectSceneContext(editor);
        if (!ctx) {
            this.hide();
            return;
        }
        window.sceneNavigationModel.activeSceneContext = ctx;

        // Obtenir le rect du curseur
        const rect = this.getCursorRect(range);
        if (!rect || (rect.width === 0 && rect.height === 0)) {
            this.hide();
            return;
        }

        const editorRect = editor.getBoundingClientRect();
        const lineHeight = rect.height || 24;
        const verticalCenter = rect.top + (lineHeight / 2);

        // Visibilité
        if (verticalCenter < editorRect.top || verticalCenter > window.innerHeight) {
            this.hide();
            return;
        }

        // Positionnement
        const buttonsEl = toolbar.querySelector('.scene-nav-buttons');
        if (buttonsEl) {
            buttonsEl.style.left = `${editorRect.left - 70}px`;
            buttonsEl.style.top = `${verticalCenter - 14}px`;
        }

        const wordCountsEl = toolbar.querySelector('.scene-nav-word-counts');
        if (wordCountsEl) {
            wordCountsEl.style.left = `${editorRect.right + 15}px`;
            wordCountsEl.style.top = `${verticalCenter - 16}px`;
        }

        // Boutons adjacents
        const adjacent = window.sceneNavigationViewModel.getAdjacentScenes(ctx);
        this.updateButtons(adjacent);

        if (!adjacent.previous && !adjacent.next) {
            this.hide();
            return;
        }

        // Compteurs de mots
        this.updateWordCounts(editor, range);

        toolbar.classList.add('visible');
        window.sceneNavigationModel.lastCursorRect = rect;
    },

    /**
     * Obtient le rectangle de position du curseur.
     */
    getCursorRect(range) {
        const rects = range.getClientRects();
        if (rects.length > 0) {
            return rects[rects.length - 1];
        } else {
            const tempRange = range.cloneRange();
            tempRange.collapse(true);
            const span = document.createElement('span');
            span.textContent = '\u200b';
            tempRange.insertNode(span);
            const rect = span.getBoundingClientRect();
            span.remove();
            return rect;
        }
    },

    /**
     * Met à jour les titres et la visibilité des boutons.
     */
    updateButtons(adjacent) {
        const toolbar = document.getElementById('sceneNavToolbar');
        const prevBtn = toolbar.querySelector('.scene-nav-prev');
        const nextBtn = toolbar.querySelector('.scene-nav-next');

        if (prevBtn) {
            prevBtn.style.display = adjacent.previous ? '' : 'none';
            if (adjacent.previous) {
                prevBtn.title = `Déplacer vers "${adjacent.previous.title}" (texte avant le curseur)`;
            }
        }
        if (nextBtn) {
            nextBtn.style.display = adjacent.next ? '' : 'none';
            if (adjacent.next) {
                nextBtn.title = `Déplacer vers "${adjacent.next.title}" (texte après le curseur)`;
            }
        }
    },

    /**
     * Met à jour l'affichage des compteurs de mots.
     */
    updateWordCounts(editor, range) {
        const toolbar = document.getElementById('sceneNavToolbar');
        const beforeEl = toolbar.querySelector('.scene-nav-words-before');
        const afterEl = toolbar.querySelector('.scene-nav-words-after');

        if (!beforeEl || !afterEl) return;

        const before = window.sceneNavigationViewModel.extractTextAtCursor(editor, range, 'before');
        const after = window.sceneNavigationViewModel.extractTextAtCursor(editor, range, 'after');

        beforeEl.textContent = `${window.sceneNavigationViewModel.countWords(before ? before.text : '')} mots`;
        afterEl.textContent = `${window.sceneNavigationViewModel.countWords(after ? after.text : '')} mots`;
    },

    /**
     * Cache la barre.
     */
    hide() {
        const toolbar = document.getElementById('sceneNavToolbar');
        if (toolbar) {
            toolbar.classList.remove('visible');
        }
    },

    /**
     * Met à jour un éditeur adjacent dans le DOM.
     */
    updateAdjacentEditor(sceneId, content) {
        const adjacentEditor = document.querySelector(`.editor-textarea[data-scene-id="${sceneId}"]`);
        if (adjacentEditor && adjacentEditor !== document.activeElement) {
            adjacentEditor.innerHTML = content;
        }
    },

    /**
     * Nettoie le début de l'éditeur.
     */
    cleanEditorStart(editor) {
        while (editor.firstChild) {
            const node = editor.firstChild;
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.textContent.trim() === '') {
                    node.remove();
                    continue;
                }
                node.textContent = node.textContent.trimStart();
                break;
            } else if (node.nodeName === 'BR') {
                node.remove();
                continue;
            } else if (node.innerHTML !== undefined && node.innerHTML.trim() === '') {
                node.remove();
                continue;
            }
            break;
        }
    },

    /**
     * Nettoie la fin de l'éditeur.
     */
    cleanEditorEnd(editor) {
        while (editor.lastChild) {
            const node = editor.lastChild;
            if (node.nodeType === Node.TEXT_NODE) {
                if (node.textContent.trim() === '') {
                    node.remove();
                    continue;
                }
                node.textContent = node.textContent.trimEnd();
                break;
            } else if (node.nodeName === 'BR') {
                node.remove();
                continue;
            } else if (node.innerHTML !== undefined && node.innerHTML.trim() === '') {
                node.remove();
                continue;
            }
            break;
        }
    },

    /**
     * Affiche une notification.
     */
    showNotification(message, type = 'info') {
        if (typeof window.showToast === 'function') {
            window.showToast(message, type);
            return;
        }
        console.log(`[SceneNav ${type}] ${message}`);
    },

    /**
     * Place le curseur au début de l'éditeur.
     */
    focusEditorStart(editor) {
        const selection = window.getSelection();
        const range = document.createRange();
        if (editor.firstChild) {
            range.setStart(editor.firstChild, 0);
        } else {
            range.setStart(editor, 0);
        }
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
    }
};

window.sceneNavigationView = sceneNavigationView;

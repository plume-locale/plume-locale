/**
 * Handlers for the Reserve feature
 */
const ReserveHandlers = {
    _searchQuery: '',
    _searchTimeout: null,

    /**
     * Entry point to bury selected text
     */
    async onBurySelection() {
        console.log('[ReserveHandlers] onBurySelection called');
        const selection = window.getSelection();
        
        if (!selection || selection.rangeCount === 0 || selection.isCollapsed) {
            if (typeof showNotification === 'function') {
                showNotification(Localization.t('notification.no_selection') || 'Aucun texte sélectionné');
            }
            return;
        }

        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        
        // Find if we are in an editor
        let editor = container.nodeType === 1 ? container.closest('.editor-textarea') : container.parentElement?.closest('.editor-textarea');
        
        if (!editor && document.activeElement && document.activeElement.classList.contains('editor-textarea')) {
            editor = document.activeElement;
        }

        if (!editor) {
            if (typeof showNotification === 'function') {
                showNotification(Localization.t('reserve.error_no_editor'));
            }
            return;
        }

        const div = document.createElement('div');
        div.appendChild(range.cloneContents());
        const content = div.innerHTML;

        if (!content || content.trim() === '') return;

        const sceneId = editor.getAttribute('data-scene-id') || (typeof currentSceneId !== 'undefined' ? currentSceneId : null);
        
        try {
            const item = await ReserveViewModel.bury(content, sceneId);
            
            if (item) {
                range.deleteContents();
                if (typeof this._syncEditor === 'function') this._syncEditor(editor);
                
                if (typeof showNotification === 'function') {
                    showNotification(Localization.t('reserve.buried') || 'Texte mis en réserve');
                }

                // Refresh UI
                if (typeof currentView !== 'undefined' && currentView === 'reserve') {
                    ReserveView.render();
                }
                ReserveView.renderSidebar();
            }
        } catch (error) {
            console.error('[ReserveHandlers] Error burying text:', error);
        }
    },

    /**
     * Restores an item into the editor
     */
    async onRestore(id) {
        console.log('[ReserveHandlers] onRestore called:', id);
        const item = ReserveViewModel.getItems().find(i => i.id === id);
        if (!item) return;

        const editor = document.querySelector('.editor-textarea');
        if (!editor) {
            if (typeof showNotification === 'function') {
                showNotification(Localization.t('reserve.error_no_restore_editor'));
            }
            return;
        }

        try {
            // Check if selection exists in editor, otherwise append at end
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0 && editor.contains(selection.anchorNode)) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                const div = document.createElement('div');
                div.innerHTML = item.content;
                const fragment = document.createDocumentFragment();
                while (div.firstChild) fragment.appendChild(div.firstChild);
                range.insertNode(fragment);
            } else {
                editor.innerHTML += item.content;
            }

            if (typeof this._syncEditor === 'function') this._syncEditor(editor);
            await ReserveViewModel.incinerate(id);
            
            if (typeof showNotification === 'function') {
                showNotification(Localization.t('reserve.restored') || 'Texte restauré');
            }

            this.closeModal();
            if (typeof currentView !== 'undefined' && currentView === 'reserve') {
                ReserveView.render();
            }
            ReserveView.renderSidebar();
        } catch (error) {
            console.error('[ReserveHandlers] Error restoring text:', error);
        }
    },

    /**
     * Copy to clipboard
     */
    async onCopy(id) {
        const item = ReserveViewModel.getItems().find(i => i.id === id);
        if (!item) return;

        try {
            const plainText = ReserveView._stripHtml(item.content);
            await navigator.clipboard.writeText(plainText);
            if (typeof showNotification === 'function') {
                showNotification(Localization.t('reserve.copied') || 'Copié dans le presse-papier');
            }
        } catch (err) {
            console.error('[ReserveHandlers] Copy failed:', err);
        }
    },

    /**
     * Toggles pinned status (for sidebar visibility)
     */
    async onTogglePin(id) {
        console.log('[ReserveHandlers] onTogglePin:', id);
        const success = await ReserveViewModel.togglePin(id);
        if (success) {
            if (typeof currentView !== 'undefined' && currentView === 'reserve') {
                ReserveView.render();
            }
            ReserveView.renderSidebar();
        }
    },

    /**
     * Handles search input
     */
    onSearch(query) {
        this._searchQuery = query;
        
        if (this._searchTimeout) clearTimeout(this._searchTimeout);
        
        this._searchTimeout = setTimeout(() => {
            ReserveView.render();
        }, 300);
    },

    /**
     * Delete item
     */
    async onIncinerate(id) {
        if (!confirm(Localization.t('reserve.confirm_delete') || 'Supprimer définitivement cet extrait ?')) return;

        const success = await ReserveViewModel.incinerate(id);
        if (success) {
            this.closeModal();
            if (typeof currentView !== 'undefined' && currentView === 'reserve') {
                ReserveView.render();
            }
            ReserveView.renderSidebar();
        }
    },

    /**
     * Modal management
     */
    openModal(id) {
        console.log('[ReserveHandlers] Opening modal for:', id);
        const item = ReserveViewModel.getItems().find(i => i.id === id);
        if (!item) return;

        const modal = document.getElementById('reserve-modal');
        const content = document.getElementById('reserve-modal-content');
        if (!modal || !content) return;
        
        const context = item.sourceSceneTitle ? `${item.sourceChapterTitle || ''} > ${item.sourceSceneTitle}` : Localization.t('reserve.origin_unknown');

        content.innerHTML = `
            <div style="padding: 1.5rem; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary);">
                <div>
                    <h3 style="margin: 0; color: var(--text-primary); font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                        <i data-lucide="book-open" style="color: var(--accent-gold); width: 20px; height: 20px;"></i>
                        ${Localization.t('reserve.read_more')}
                    </h3>
                    <div style="font-size: 0.8rem; color: var(--accent-gold); margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                        <i data-lucide="map-pin" style="width: 12px; height: 12px;"></i> ${context}
                    </div>
                </div>
                <button class="btn btn-icon reserve-modal-close" 
                        onclick="ReserveHandlers.closeModal()" 
                        title="${Localization.t('btn.close')}"
                        style="border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; color: var(--text-primary); border: none; background: transparent; cursor: pointer; font-size: 24px; font-weight: normal; line-height: 1;">
                    &times;
                </button>
            </div>
            <div style="padding: 2.5rem; overflow-y: auto; flex: 1; line-height: 1.8; font-size: 1.15rem; color: var(--text-primary); font-family: var(--font-serif, serif); white-space: pre-wrap; background: var(--bg-primary);">
                ${item.content}
            </div>
            <div style="padding: 1.2rem 1.5rem; border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; background: var(--bg-secondary);">
                <div style="font-size: 0.85rem; color: var(--text-muted);">
                    <i data-lucide="type" style="width: 14px; height: 14px; vertical-align: middle;"></i> ${item.wordCount} mots
                </div>
                <div style="display: flex; gap: 1rem;">
                    <button class="btn btn-secondary" onclick="ReserveHandlers.onCopy('${item.id}')">
                        <i data-lucide="copy" style="width: 16px; height: 16px; margin-right: 6px;"></i> ${Localization.t('btn.copy')}
                    </button>
                    <button class="btn btn-secondary" style="color: var(--accent-red);" onclick="ReserveHandlers.onIncinerate('${item.id}')">
                        <i data-lucide="trash-2" style="width: 16px; height: 16px; margin-right: 6px;"></i> ${Localization.t('btn.delete')}
                    </button>
                    <button class="btn btn-primary" onclick="ReserveHandlers.onRestore('${item.id}')">
                        <i data-lucide="rotate-ccw" style="width: 16px; height: 16px; margin-right: 6px;"></i> ${Localization.t('reserve.restore')}
                    </button>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
        // Force reflow for animation
        setTimeout(() => {
            if (content) content.style.transform = 'scale(1)';
        }, 10);
        
        if (typeof lucide !== 'undefined') lucide.createIcons({ root: content });

        // Escape key to close
        this._escHandler = (e) => { if (e.key === 'Escape') this.closeModal(); };
        window.addEventListener('keydown', this._escHandler);
    },

    closeModal() {
        const modal = document.getElementById('reserve-modal');
        const content = document.getElementById('reserve-modal-content');
        if (!modal) return;
        
        if (content) content.style.transform = 'scale(0.95)';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 200);
        
        if (this._escHandler) {
            window.removeEventListener('keydown', this._escHandler);
            this._escHandler = null;
        }
    },

    toggleExpand(id) {
        const content = document.getElementById(`reserve-sidebar-content-${id}`);
        if (!content) return;
        
        const isExpanded = content.style.display === 'block';
        
        if (isExpanded) {
            content.style.display = '-webkit-box';
            content.style.webkitLineClamp = '2';
        } else {
            content.style.display = 'block';
            content.style.webkitLineClamp = 'none';
        }
    },

    toggleSidebar() {
        const sidebar = document.getElementById('sidebarReserve');
        const btn = document.getElementById('toolReserveBtn');
        if (!sidebar) return;

        const isHidden = sidebar.classList.contains('hidden');
        
        document.querySelectorAll('.sidebar-plot, .sidebar-versions, .sidebar-investigation').forEach(el => {
            if (el.id !== 'sidebarReserve') el.classList.add('hidden');
        });
        document.querySelectorAll('.tool-btn').forEach(el => {
            if (el.id !== 'toolReserveBtn') el.classList.remove('active');
        });

        if (isHidden) {
            sidebar.classList.remove('hidden');
            if (btn) btn.classList.add('active');
            if (window.ReserveView) window.ReserveView.renderSidebar();
        } else {
            sidebar.classList.add('hidden');
            if (btn) btn.classList.remove('active');
        }
    },

    _syncEditor(editor) {
        if (!editor) return;
        // Trigger Plume's internal sync logic
        editor.dispatchEvent(new Event('input', { bubbles: true }));
        if (typeof updateStats === 'function') updateStats();
        if (typeof saveCurrentScene === 'function') saveCurrentScene();
    }
};

window.ReserveHandlers = ReserveHandlers;

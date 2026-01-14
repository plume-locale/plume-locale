/**
 * Codex Handlers
 * Responsible for handling all user interactions in the codex view
 */

const CodexHandlers = (() => {
    function attachListHandlers() {
        const container = document.getElementById('codexList');
        if (!container) return;

        container.addEventListener('click', (e) => {
            const item = e.target.closest('.codex-item');
            if (item) {
                const codexId = parseInt(item.dataset.codexId);
                openCodexDetail(codexId);
                return;
            }

            const deleteBtn = e.target.closest('.codex-item-delete');
            if (deleteBtn) {
                const item = deleteBtn.closest('.codex-item');
                const codexId = parseInt(item.dataset.codexId);
                deleteCodex(codexId);
                return;
            }
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    function openAddCodexModal() {
        const html = CodexRender.renderAddCodexModal();
        ModalUI.open('add-codex-modal', html);
        attachAddCodexHandlers();
    }

    function attachAddCodexHandlers() {
        const form = document.getElementById('add-codex-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleAddCodex();
        });
    }

    async function handleAddCodex() {
        const title = document.getElementById('codex-title-input')?.value.trim();
        const category = document.getElementById('codex-category-input')?.value.trim();
        const description = document.getElementById('codex-description-input')?.value.trim();

        if (!title) {
            alert('Le titre est requis');
            return;
        }

        try {
            const state = StateManager.get('project');

            const newEntry = {
                id: Date.now(),
                title: title,
                category: category || 'Général',
                description: description || '',
                content: '',
                keywords: [],
                created: Date.now()
            };

            if (!state.codex) {
                state.codex = [];
            }

            state.codex.push(newEntry);
            StateManager.set('project', state);

            if (typeof StorageService !== 'undefined') {
                await StorageService.saveProject(state);
            } else if (typeof saveProject === 'function') {
                saveProject();
            }

            ModalUI.close();
            CodexView.render();

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('codex:created', newEntry);
            }
        } catch (error) {
            console.error('Error adding codex entry:', error);
            alert('Erreur lors de la création');
        }
    }

    function openCodexDetail(codexId) {
        const state = StateManager.get('project');
        const entry = state.codex?.find(c => c.id === codexId);

        if (!entry) return;

        const html = CodexRender.renderCodexDetail(entry);
        const container = document.getElementById('editorView');
        if (container) {
            container.innerHTML = html;
            attachCodexDetailHandlers(codexId);
        }
    }

    function attachCodexDetailHandlers(codexId) {
        const titleInput = document.getElementById('codex-title');
        const categoryInput = document.getElementById('codex-category');
        const descInput = document.getElementById('codex-description');
        const contentInput = document.getElementById('codex-content');
        const keywordsInput = document.getElementById('codex-keywords');

        let saveTimeout;
        const autoSave = async () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(async () => {
                try {
                    const state = StateManager.get('project');
                    const entry = state.codex?.find(c => c.id === codexId);

                    if (entry) {
                        entry.title = titleInput.value || 'Sans titre';
                        entry.category = categoryInput.value || 'Général';
                        entry.description = descInput.value;
                        entry.content = contentInput.value;
                        entry.keywords = keywordsInput.value
                            .split(',')
                            .map(k => k.trim())
                            .filter(k => k);

                        StateManager.set('project', state);

                        if (typeof StorageService !== 'undefined') {
                            await StorageService.saveProject(state);
                        } else if (typeof saveProject === 'function') {
                            saveProject();
                        }

                        if (typeof EventBus !== 'undefined') {
                            EventBus.emit('codex:updated', entry);
                        }
                    }
                } catch (error) {
                    console.error('Error saving codex:', error);
                }
            }, 1000);
        };

        if (titleInput) titleInput.addEventListener('change', autoSave);
        if (categoryInput) categoryInput.addEventListener('change', autoSave);
        if (descInput) descInput.addEventListener('change', autoSave);
        if (contentInput) contentInput.addEventListener('change', autoSave);
        if (keywordsInput) keywordsInput.addEventListener('change', autoSave);
    }

    async function deleteCodex(codexId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
            return;
        }

        try {
            const state = StateManager.get('project');
            if (state.codex) {
                state.codex = state.codex.filter(c => c.id !== codexId);
                StateManager.set('project', state);

                if (typeof StorageService !== 'undefined') {
                    await StorageService.saveProject(state);
                } else if (typeof saveProject === 'function') {
                    saveProject();
                }

                CodexView.render();

                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('codex:deleted', codexId);
                }
            }
        } catch (error) {
            console.error('Error deleting codex entry:', error);
            alert('Erreur lors de la suppression');
        }
    }

    function searchCodex(query) {
        const state = StateManager.get('project');
        if (!state.codex) return [];

        const lowerQuery = query.toLowerCase();
        return state.codex.filter(c =>
            c.title.toLowerCase().includes(lowerQuery) ||
            c.description.toLowerCase().includes(lowerQuery) ||
            c.content.toLowerCase().includes(lowerQuery) ||
            (c.keywords && c.keywords.some(k => k.toLowerCase().includes(lowerQuery)))
        );
    }

    function filterByCategory(category) {
        const state = StateManager.get('project');
        if (!state.codex) return [];

        if (!category) return state.codex;
        return state.codex.filter(c => c.category === category);
    }

    return {
        attachListHandlers,
        openAddCodexModal,
        attachAddCodexHandlers,
        handleAddCodex,
        openCodexDetail,
        attachCodexDetailHandlers,
        deleteCodex,
        searchCodex,
        filterByCategory
    };
})();

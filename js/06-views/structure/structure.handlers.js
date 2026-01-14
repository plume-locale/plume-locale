/**
 * Structure Handlers
 * Responsible for handling all user interactions in the structure view
 */

const StructureHandlers = (() => {
    /**
     * Attach event listeners to the structure list
     */
    function attachListHandlers() {
        const container = document.getElementById('structureList');
        if (!container) return;

        // Setup drag and drop
        setupActDragAndDrop();
        setupChapterDragAndDrop();
        setupSceneDragAndDrop();

        // Refresh lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    /**
     * Toggle act expansion
     * @param {number} actId - Act ID
     */
    function toggleAct(actId) {
        const container = document.getElementById('structureList');
        const expandedActs = JSON.parse(localStorage.getItem('plume_expanded_acts') || '[]');
        
        const index = expandedActs.indexOf(actId);
        if (index > -1) {
            expandedActs.splice(index, 1);
        } else {
            expandedActs.push(actId);
        }
        
        localStorage.setItem('plume_expanded_acts', JSON.stringify(expandedActs));
        StructureView.render();
    }

    /**
     * Open add act modal
     */
    function openAddActModal() {
        const html = StructureRender.renderAddActModal();
        ModalUI.open('add-act-modal', html);
        attachAddActHandlers();
    }

    /**
     * Attach handlers to add act form
     */
    function attachAddActHandlers() {
        const form = document.getElementById('add-act-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleAddAct();
        });
    }

    /**
     * Handle adding a new act
     */
    async function handleAddAct() {
        const title = document.getElementById('act-title')?.value.trim();
        
        if (!title) {
            alert('Le titre de l\'acte est requis');
            return;
        }

        try {
            const state = StateManager.get('project');
            
            const newAct = {
                id: Date.now(),
                title: title,
                chapters: []
            };

            state.acts.push(newAct);
            StateManager.set('project', state);
            
            // Persist
            if (typeof StorageService !== 'undefined') {
                await StorageService.saveProject(state);
            } else if (typeof saveProject === 'function') {
                saveProject();
            }

            ModalUI.close();
            StructureView.render();

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('structure:act:created', newAct);
            }
        } catch (error) {
            console.error('Error adding act:', error);
            alert('Erreur lors de la création de l\'acte');
        }
    }

    /**
     * Delete an act
     * @param {number} actId - Act ID
     */
    async function deleteAct(actId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet acte et tous ses chapitres ?')) {
            return;
        }

        try {
            const state = StateManager.get('project');
            state.acts = state.acts.filter(a => a.id !== actId);
            StateManager.set('project', state);

            if (typeof StorageService !== 'undefined') {
                await StorageService.saveProject(state);
            } else if (typeof saveProject === 'function') {
                saveProject();
            }

            StructureView.render();

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('structure:act:deleted', actId);
            }
        } catch (error) {
            console.error('Error deleting act:', error);
            alert('Erreur lors de la suppression');
        }
    }

    /**
     * Start editing an act title
     * @param {number} actId - Act ID
     * @param {HTMLElement} element - Title element
     */
    function startEditingAct(actId, element) {
        const state = StateManager.get('project');
        const act = state.acts.find(a => a.id === actId);
        if (!act) return;

        const originalText = act.title;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'editing-input';
        input.value = originalText;
        
        element.textContent = '';
        element.appendChild(input);
        input.focus();
        input.select();

        const finishEditing = async () => {
            const newTitle = input.value.trim();
            if (newTitle && newTitle !== originalText) {
                try {
                    act.title = newTitle;
                    StateManager.set('project', state);
                    
                    if (typeof StorageService !== 'undefined') {
                        await StorageService.saveProject(state);
                    } else if (typeof saveProject === 'function') {
                        saveProject();
                    }

                    if (typeof EventBus !== 'undefined') {
                        EventBus.emit('structure:act:updated', act);
                    }
                } catch (error) {
                    console.error('Error updating act:', error);
                }
            }
            StructureView.render();
        };

        input.addEventListener('blur', finishEditing);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishEditing();
            } else if (e.key === 'Escape') {
                StructureView.render();
            }
        });
    }

    /**
     * Open add chapter modal
     * @param {number} actId - Parent act ID
     */
    function openAddChapterModal(actId) {
        const html = StructureRender.renderAddChapterModal(actId);
        ModalUI.open('add-chapter-modal', html);
        attachAddChapterHandlers();
    }

    /**
     * Attach handlers to add chapter form
     */
    function attachAddChapterHandlers() {
        const form = document.getElementById('add-chapter-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleAddChapter();
        });
    }

    /**
     * Handle adding a new chapter
     */
    async function handleAddChapter() {
        const actId = parseInt(document.getElementById('chapter-act-id')?.value);
        const title = document.getElementById('chapter-title')?.value.trim();

        if (!actId) {
            alert('Erreur: acte non trouvé');
            return;
        }

        try {
            const state = StateManager.get('project');
            const act = state.acts.find(a => a.id === actId);
            
            if (!act) {
                alert('Acte non trouvé');
                return;
            }

            const newChapter = {
                id: Date.now(),
                title: title || 'Sans titre',
                scenes: []
            };

            act.chapters.push(newChapter);
            StateManager.set('project', state);

            if (typeof StorageService !== 'undefined') {
                await StorageService.saveProject(state);
            } else if (typeof saveProject === 'function') {
                saveProject();
            }

            ModalUI.close();
            StructureView.render();

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('structure:chapter:created', newChapter);
            }
        } catch (error) {
            console.error('Error adding chapter:', error);
            alert('Erreur lors de la création du chapitre');
        }
    }

    /**
     * Delete a chapter
     * @param {number} actId - Parent act ID
     * @param {number} chapterId - Chapter ID
     */
    async function deleteChapter(actId, chapterId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce chapitre et toutes ses scènes ?')) {
            return;
        }

        try {
            const state = StateManager.get('project');
            const act = state.acts.find(a => a.id === actId);
            
            if (act) {
                act.chapters = act.chapters.filter(c => c.id !== chapterId);
                StateManager.set('project', state);

                if (typeof StorageService !== 'undefined') {
                    await StorageService.saveProject(state);
                } else if (typeof saveProject === 'function') {
                    saveProject();
                }

                StructureView.render();

                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('structure:chapter:deleted', chapterId);
                }
            }
        } catch (error) {
            console.error('Error deleting chapter:', error);
            alert('Erreur lors de la suppression');
        }
    }

    /**
     * Start editing a chapter title
     * @param {number} actId - Parent act ID
     * @param {number} chapterId - Chapter ID
     * @param {HTMLElement} element - Title element
     */
    function startEditingChapter(actId, chapterId, element) {
        const state = StateManager.get('project');
        const act = state.acts.find(a => a.id === actId);
        if (!act) return;

        const chapter = act.chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        const originalText = chapter.title;
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'editing-input';
        input.value = originalText;
        
        element.textContent = '';
        element.appendChild(input);
        input.focus();
        input.select();

        const finishEditing = async () => {
            const newTitle = input.value.trim();
            if (newTitle && newTitle !== originalText) {
                try {
                    chapter.title = newTitle;
                    StateManager.set('project', state);
                    
                    if (typeof StorageService !== 'undefined') {
                        await StorageService.saveProject(state);
                    } else if (typeof saveProject === 'function') {
                        saveProject();
                    }

                    if (typeof EventBus !== 'undefined') {
                        EventBus.emit('structure:chapter:updated', chapter);
                    }
                } catch (error) {
                    console.error('Error updating chapter:', error);
                }
            }
            StructureView.render();
        };

        input.addEventListener('blur', finishEditing);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishEditing();
            } else if (e.key === 'Escape') {
                StructureView.render();
            }
        });
    }

    /**
     * Open add scene modal
     * @param {number} actId - Parent act ID
     * @param {number} chapterId - Parent chapter ID
     */
    function openAddSceneModal(actId, chapterId) {
        const html = StructureRender.renderAddSceneModal(actId, chapterId);
        ModalUI.open('add-scene-modal', html);
        attachAddSceneHandlers();
    }

    /**
     * Attach handlers to add scene form
     */
    function attachAddSceneHandlers() {
        const form = document.getElementById('add-scene-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleAddScene();
        });
    }

    /**
     * Handle adding a new scene
     */
    async function handleAddScene() {
        const actId = parseInt(document.getElementById('scene-act-id')?.value);
        const chapterId = parseInt(document.getElementById('scene-chapter-id')?.value);
        const title = document.getElementById('scene-title')?.value.trim();
        const status = document.getElementById('scene-status')?.value || 'draft';

        if (!actId || !chapterId) {
            alert('Erreur: acte ou chapitre non trouvé');
            return;
        }

        try {
            const state = StateManager.get('project');
            const act = state.acts.find(a => a.id === actId);
            
            if (!act) {
                alert('Acte non trouvé');
                return;
            }

            const chapter = act.chapters.find(c => c.id === chapterId);
            if (!chapter) {
                alert('Chapitre non trouvé');
                return;
            }

            const newScene = {
                id: Date.now(),
                title: title || 'Sans titre',
                content: '',
                status: status,
                linkedCharacters: [],
                linkedElements: []
            };

            chapter.scenes.push(newScene);
            StateManager.set('project', state);

            if (typeof StorageService !== 'undefined') {
                await StorageService.saveProject(state);
            } else if (typeof saveProject === 'function') {
                saveProject();
            }

            ModalUI.close();
            StructureView.render();

            if (typeof EventBus !== 'undefined') {
                EventBus.emit('structure:scene:created', newScene);
            }
        } catch (error) {
            console.error('Error adding scene:', error);
            alert('Erreur lors de la création de la scène');
        }
    }

    /**
     * Open scene for editing
     * @param {number} actId - Act ID
     * @param {number} chapterId - Chapter ID
     * @param {number} sceneId - Scene ID
     */
    function openScene(actId, chapterId, sceneId) {
        const state = StateManager.get('project');
        const act = state.acts.find(a => a.id === actId);
        
        if (!act) return;

        const chapter = act.chapters.find(c => c.id === chapterId);
        if (!chapter) return;

        const scene = chapter.scenes.find(s => s.id === sceneId);
        if (!scene) return;

        const html = StructureRender.renderSceneEditor(scene, actId, chapterId);
        const container = document.getElementById('editorView');
        if (container) {
            container.innerHTML = html;
            attachSceneEditorHandlers();
            updateWordCount();
            
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
    }

    /**
     * Attach handlers to scene editor
     */
    function attachSceneEditorHandlers() {
        // Handlers are inline in HTML attributes
        // This is for any additional setup needed
    }

    /**
     * Update scene title
     * @param {number} actId - Act ID
     * @param {number} chapterId - Chapter ID
     * @param {number} sceneId - Scene ID
     * @param {string} newTitle - New title
     */
    async function updateSceneTitle(actId, chapterId, sceneId, newTitle) {
        try {
            const state = StateManager.get('project');
            const act = state.acts.find(a => a.id === actId);
            const chapter = act?.chapters.find(c => c.id === chapterId);
            const scene = chapter?.scenes.find(s => s.id === sceneId);

            if (scene) {
                scene.title = newTitle;
                StateManager.set('project', state);

                if (typeof StorageService !== 'undefined') {
                    await StorageService.saveProject(state);
                } else if (typeof saveProject === 'function') {
                    saveProject();
                }

                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('structure:scene:updated', scene);
                }
            }
        } catch (error) {
            console.error('Error updating scene title:', error);
        }
    }

    /**
     * Update scene status
     * @param {number} actId - Act ID
     * @param {number} chapterId - Chapter ID
     * @param {number} sceneId - Scene ID
     * @param {string} newStatus - New status
     */
    async function updateSceneStatus(actId, chapterId, sceneId, newStatus) {
        try {
            const state = StateManager.get('project');
            const act = state.acts.find(a => a.id === actId);
            const chapter = act?.chapters.find(c => c.id === chapterId);
            const scene = chapter?.scenes.find(s => s.id === sceneId);

            if (scene) {
                scene.status = newStatus;
                StateManager.set('project', state);

                if (typeof StorageService !== 'undefined') {
                    await StorageService.saveProject(state);
                } else if (typeof saveProject === 'function') {
                    saveProject();
                }

                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('structure:scene:updated', scene);
                }
            }
        } catch (error) {
            console.error('Error updating scene status:', error);
        }
    }

    /**
     * Update scene content
     * @param {number} actId - Act ID
     * @param {number} chapterId - Chapter ID
     * @param {number} sceneId - Scene ID
     * @param {string} newContent - New content
     */
    async function updateSceneContent(actId, chapterId, sceneId, newContent) {
        try {
            const state = StateManager.get('project');
            const act = state.acts.find(a => a.id === actId);
            const chapter = act?.chapters.find(c => c.id === chapterId);
            const scene = chapter?.scenes.find(s => s.id === sceneId);

            if (scene) {
                scene.content = newContent;
                StateManager.set('project', state);

                if (typeof StorageService !== 'undefined') {
                    await StorageService.saveProject(state);
                } else if (typeof saveProject === 'function') {
                    saveProject();
                }

                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('structure:scene:updated', scene);
                }
            }
        } catch (error) {
            console.error('Error updating scene content:', error);
        }
    }

    /**
     * Update and display word count
     */
    function updateWordCount() {
        const content = document.getElementById('scene-content')?.value || '';
        const words = StructureRender.countWords(content);
        const counter = document.getElementById('word-count');
        if (counter) {
            counter.textContent = `${words} mots`;
        }
    }

    /**
     * Delete a scene
     * @param {number} actId - Act ID
     * @param {number} chapterId - Chapter ID
     * @param {number} sceneId - Scene ID
     */
    async function deleteScene(actId, chapterId, sceneId) {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette scène ?')) {
            return;
        }

        try {
            const state = StateManager.get('project');
            const act = state.acts.find(a => a.id === actId);
            const chapter = act?.chapters.find(c => c.id === chapterId);

            if (chapter) {
                chapter.scenes = chapter.scenes.filter(s => s.id !== sceneId);
                StateManager.set('project', state);

                if (typeof StorageService !== 'undefined') {
                    await StorageService.saveProject(state);
                } else if (typeof saveProject === 'function') {
                    saveProject();
                }

                StructureView.render();

                if (typeof EventBus !== 'undefined') {
                    EventBus.emit('structure:scene:deleted', sceneId);
                }
            }
        } catch (error) {
            console.error('Error deleting scene:', error);
            alert('Erreur lors de la suppression');
        }
    }

    /**
     * Setup drag and drop for acts
     */
    function setupActDragAndDrop() {
        let draggedAct = null;
        const actHeaders = document.querySelectorAll('.act-header');
        
        actHeaders.forEach(header => {
            const dragHandle = header.querySelector('.drag-handle');
            if (!dragHandle) return;

            dragHandle.addEventListener('dragstart', (e) => {
                draggedAct = parseInt(header.dataset.actId);
                header.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('type', 'act');
                e.stopPropagation();
            });

            dragHandle.addEventListener('dragend', (e) => {
                header.classList.remove('dragging');
                draggedAct = null;
            });

            header.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                const targetActId = parseInt(e.currentTarget.dataset.actId);
                if (draggedAct && draggedAct !== targetActId) {
                    e.currentTarget.classList.add('drag-over');
                }
            });

            header.addEventListener('dragleave', (e) => {
                e.currentTarget.classList.remove('drag-over');
            });

            header.addEventListener('drop', (e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('drag-over');
                const targetActId = parseInt(e.currentTarget.dataset.actId);
                if (draggedAct && draggedAct !== targetActId) {
                    reorderActs(draggedAct, targetActId);
                }
            });
        });
    }

    /**
     * Reorder acts
     */
    async function reorderActs(draggedId, targetId) {
        try {
            const state = StateManager.get('project');
            const draggedIndex = state.acts.findIndex(a => a.id === draggedId);
            const targetIndex = state.acts.findIndex(a => a.id === targetId);

            if (draggedIndex === -1 || targetIndex === -1) return;

            const [removed] = state.acts.splice(draggedIndex, 1);
            state.acts.splice(targetIndex, 0, removed);

            StateManager.set('project', state);

            if (typeof StorageService !== 'undefined') {
                await StorageService.saveProject(state);
            } else if (typeof saveProject === 'function') {
                saveProject();
            }

            StructureView.render();
        } catch (error) {
            console.error('Error reordering acts:', error);
        }
    }

    /**
     * Setup drag and drop for chapters
     */
    function setupChapterDragAndDrop() {
        let draggedChapter = { chapterId: null, actId: null };
        const chapterHeaders = document.querySelectorAll('.chapter-header');

        chapterHeaders.forEach(header => {
            const dragHandle = header.querySelector('.drag-handle');
            if (!dragHandle) return;

            dragHandle.addEventListener('dragstart', (e) => {
                draggedChapter.chapterId = parseInt(header.dataset.chapterId);
                draggedChapter.actId = parseInt(header.dataset.actId);
                header.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('type', 'chapter');
                e.stopPropagation();
            });

            dragHandle.addEventListener('dragend', (e) => {
                header.classList.remove('dragging');
                draggedChapter = { chapterId: null, actId: null };
            });

            header.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                const targetChapterId = parseInt(e.currentTarget.dataset.chapterId);
                if (draggedChapter.chapterId && draggedChapter.chapterId !== targetChapterId) {
                    e.currentTarget.classList.add('drag-over');
                }
            });

            header.addEventListener('dragleave', (e) => {
                e.currentTarget.classList.remove('drag-over');
            });

            header.addEventListener('drop', (e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('drag-over');
                const targetChapterId = parseInt(e.currentTarget.dataset.chapterId);
                const targetActId = parseInt(e.currentTarget.dataset.actId);
                if (draggedChapter.chapterId && draggedChapter.chapterId !== targetChapterId) {
                    reorderChapters(draggedChapter.chapterId, draggedChapter.actId, targetChapterId, targetActId);
                }
            });
        });
    }

    /**
     * Reorder chapters
     */
    async function reorderChapters(draggedChapterId, draggedActId, targetChapterId, targetActId) {
        try {
            const state = StateManager.get('project');
            const sourceAct = state.acts.find(a => a.id === draggedActId);
            const targetAct = state.acts.find(a => a.id === targetActId);

            if (!sourceAct || !targetAct) return;

            const draggedIndex = sourceAct.chapters.findIndex(c => c.id === draggedChapterId);
            const targetIndex = targetAct.chapters.findIndex(c => c.id === targetChapterId);

            if (draggedIndex === -1 || targetIndex === -1) return;

            const [removed] = sourceAct.chapters.splice(draggedIndex, 1);
            targetAct.chapters.splice(targetIndex, 0, removed);

            StateManager.set('project', state);

            if (typeof StorageService !== 'undefined') {
                await StorageService.saveProject(state);
            } else if (typeof saveProject === 'function') {
                saveProject();
            }

            StructureView.render();
        } catch (error) {
            console.error('Error reordering chapters:', error);
        }
    }

    /**
     * Setup drag and drop for scenes
     */
    function setupSceneDragAndDrop() {
        let draggedScene = { sceneId: null, chapterId: null, actId: null };
        const sceneItems = document.querySelectorAll('.scene-item.draggable');

        sceneItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                draggedScene.sceneId = parseInt(e.target.dataset.sceneId);
                draggedScene.chapterId = parseInt(e.target.dataset.chapterId);
                draggedScene.actId = parseInt(e.target.dataset.actId);
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            item.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
                draggedScene = { sceneId: null, chapterId: null, actId: null };
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                const targetSceneId = parseInt(e.currentTarget.dataset.sceneId);
                if (draggedScene.sceneId && draggedScene.sceneId !== targetSceneId) {
                    e.currentTarget.classList.add('drag-over');
                }
            });

            item.addEventListener('dragleave', (e) => {
                e.currentTarget.classList.remove('drag-over');
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('drag-over');
                const targetSceneId = parseInt(e.currentTarget.dataset.sceneId);
                const targetChapterId = parseInt(e.currentTarget.dataset.chapterId);
                const targetActId = parseInt(e.currentTarget.dataset.actId);
                if (draggedScene.sceneId && draggedScene.sceneId !== targetSceneId) {
                    reorderScenes(draggedScene.sceneId, draggedScene.actId, draggedScene.chapterId, targetSceneId, targetActId, targetChapterId);
                }
            });
        });
    }

    /**
     * Reorder scenes
     */
    async function reorderScenes(draggedSceneId, draggedActId, draggedChapterId, targetSceneId, targetActId, targetChapterId) {
        try {
            const state = StateManager.get('project');
            const sourceAct = state.acts.find(a => a.id === draggedActId);
            const targetAct = state.acts.find(a => a.id === targetActId);

            if (!sourceAct || !targetAct) return;

            const sourceChapter = sourceAct.chapters.find(c => c.id === draggedChapterId);
            const targetChapter = targetAct.chapters.find(c => c.id === targetChapterId);

            if (!sourceChapter || !targetChapter) return;

            const draggedIndex = sourceChapter.scenes.findIndex(s => s.id === draggedSceneId);
            const targetIndex = targetChapter.scenes.findIndex(s => s.id === targetSceneId);

            if (draggedIndex === -1 || targetIndex === -1) return;

            const [removed] = sourceChapter.scenes.splice(draggedIndex, 1);
            targetChapter.scenes.splice(targetIndex, 0, removed);

            StateManager.set('project', state);

            if (typeof StorageService !== 'undefined') {
                await StorageService.saveProject(state);
            } else if (typeof saveProject === 'function') {
                saveProject();
            }

            StructureView.render();
        } catch (error) {
            console.error('Error reordering scenes:', error);
        }
    }

    // Public API
    return {
        attachListHandlers,
        toggleAct,
        openAddActModal,
        attachAddActHandlers,
        handleAddAct,
        deleteAct,
        startEditingAct,
        openAddChapterModal,
        attachAddChapterHandlers,
        handleAddChapter,
        deleteChapter,
        startEditingChapter,
        openAddSceneModal,
        attachAddSceneHandlers,
        handleAddScene,
        openScene,
        attachSceneEditorHandlers,
        updateSceneTitle,
        updateSceneStatus,
        updateSceneContent,
        updateWordCount,
        deleteScene,
        setupActDragAndDrop,
        reorderActs,
        setupChapterDragAndDrop,
        reorderChapters,
        setupSceneDragAndDrop,
        reorderScenes
    };
})();

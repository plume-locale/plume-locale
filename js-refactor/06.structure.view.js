

// Act Management
// [MVVM : View]
// Group: Use Case | Naming: AddActUseCase
// Coordination UI pour ajouter un acte
function addAct() {
    const title = document.getElementById('actTitleInput').value.trim();

    const result = addActViewModel(title);

    if (result.success) {
        // Gérer les effets de bord
        if (result.sideEffects) {
            executeRepositorySideEffect(result.sideEffects.repository);

            if (result.sideEffects.shouldExpand) {
                expandedActs.add(result.sideEffects.shouldExpand);
            }
            if (result.sideEffects.shouldSave) {
                saveProject();
            }
        }

        document.getElementById('actTitleInput').value = '';
        closeModal('addActModal');
        renderActsList();

        if (result.message) {
            showNotification(result.message, 'success');
        }
    } else {
        showNotification(result.message || 'Erreur lors de l\'ajout de l\'acte', 'error');
    }
}

// [MVVM : View]
// Coordination UI pour supprimer un acte
function deleteAct(actId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet acte et tous ses chapitres ?')) return;

    const result = deleteActViewModel(actId);

    if (result.success) {
        // Gérer les effets de bord
        if (result.sideEffects) {
            executeRepositorySideEffect(result.sideEffects.repository);

            if (result.sideEffects.shouldSave) {
                saveProject();
            }
            if (result.sideEffects.shouldResetState) {
                currentActId = null;
                currentChapterId = null;
                currentSceneId = null;
            }
        }

        if (result.needsEmptyState) {
            showEmptyState();
        }
        renderActsList();

        if (result.message) {
            showNotification(result.message, 'success');
        }
    } else {
        showNotification(result.message || 'Erreur lors de la suppression', 'error');
    }
}

// Chapter Management
// [MVVM : View]
// Coordination UI pour ajouter un chapitre
function addChapter() {
    const title = document.getElementById('chapterTitleInput').value.trim();

    const result = addChapterViewModel(title);

    if (result.success) {
        // Gérer les effets de bord
        if (result.sideEffects) {
            executeRepositorySideEffect(result.sideEffects.repository);

            if (result.sideEffects.shouldExpandAct) {
                expandedActs.add(result.sideEffects.shouldExpandAct);
            }
            if (result.sideEffects.shouldExpandChapter) {
                expandedChapters.add(result.sideEffects.shouldExpandChapter);
            }
            if (result.sideEffects.shouldSave) {
                saveProject();
            }
        }

        document.getElementById('chapterTitleInput').value = '';
        closeModal('addChapterModal');
        renderActsList();

        if (result.message) {
            showNotification(result.message, 'success');
        }
    } else {
        showNotification(result.message || 'Erreur lors de l\'ajout du chapitre', 'error');
    }
}

// [MVVM : View]
// Coordination UI pour supprimer un chapitre
function deleteChapter(actId, chapterId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chapitre et toutes ses scènes ?')) return;

    const result = deleteChapterViewModel(actId, chapterId);

    if (result.success) {
        // Gérer les effets de bord
        if (result.sideEffects) {
            executeRepositorySideEffect(result.sideEffects.repository);

            if (result.sideEffects.shouldSave) {
                saveProject();
            }
            if (result.sideEffects.shouldResetState) {
                currentChapterId = null;
                currentSceneId = null;
            }
        }

        if (result.needsEmptyState) {
            showEmptyState();
        }
        renderActsList();

        if (result.message) {
            showNotification(result.message, 'success');
        }
    } else {
        showNotification(result.message || 'Erreur lors de la suppression', 'error');
    }
}

// Scene Management
// [MVVM : View]
// Coordination UI pour ajouter une scène
function addScene() {
    const title = document.getElementById('sceneTitleInput').value.trim();

    const result = addSceneViewModel(title, activeActId, activeChapterId);

    if (result.success) {
        // Gérer les effets de bord
        if (result.sideEffects) {
            executeRepositorySideEffect(result.sideEffects.repository);

            if (result.sideEffects.shouldExpandAct) {
                expandedActs.add(result.sideEffects.shouldExpandAct);
            }
            if (result.sideEffects.shouldExpandChapter) {
                expandedChapters.add(result.sideEffects.shouldExpandChapter);
            }
            if (result.sideEffects.shouldSave) {
                saveProject();
            }
            if (result.sideEffects.shouldOpenScene) {
                const { actId, chapterId, sceneId } = result.sideEffects.shouldOpenScene;
                openScene(actId, chapterId, sceneId);
            }
        }

        document.getElementById('sceneTitleInput').value = '';
        closeModal('addSceneModal');
        renderActsList();

        if (result.message) {
            showNotification(result.message, 'success');
        }
    } else {
        showNotification(result.message || 'Erreur lors de l\'ajout de la scène', 'error');
    }
}

// [MVVM : View]
// Coordination UI pour mettre à jour le statut d'une scène
function setSceneStatus(actId, chapterId, sceneId, status) {
    const result = setSceneStatusViewModel(actId, chapterId, sceneId, status);

    if (result.success) {
        // Gérer les effets de bord
        if (result.sideEffects) {
            executeRepositorySideEffect(result.sideEffects.repository);

            if (result.sideEffects.shouldSave) {
                saveProject();
            }
        }

        closeStatusMenu();
        renderActsList();
        updateProgressBar();

        if (result.message) {
            showNotification(result.message, 'info');
        }
    } else {
        showNotification(result.message || 'Erreur lors de la mise à jour du statut', 'error');
    }
}

// [MVVM : View]
// Coordination UI pour supprimer une scène
function deleteScene(actId, chapterId, sceneId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette scène ?')) return;

    const result = deleteSceneViewModel(actId, chapterId, sceneId);

    if (result.success) {
        // Gérer les effets de bord
        if (result.sideEffects) {
            executeRepositorySideEffect(result.sideEffects.repository);

            if (result.sideEffects.shouldSave) {
                saveProject();
            }
            if (result.sideEffects.shouldResetState) {
                currentSceneId = null;
            }
        }

        if (result.needsEmptyState) {
            showEmptyState();
        }
        renderActsList();

        if (result.message) {
            showNotification(result.message, 'success');
        }
    } else {
        showNotification(result.message || 'Erreur lors de la suppression', 'error');
    }
}


// [MVVM : View]
// Alterne l'affichage d'un acte (déplié/replié)
function toggleAct(actId) {
    const element = document.getElementById(`act-${actId}`);
    const icon = element.querySelector('.act-icon');
    const chaptersContainer = element.querySelector('.act-chapters');

    const isExpanded = icon.classList.contains('expanded');

    icon.classList.toggle('expanded');
    chaptersContainer.classList.toggle('visible');

    // Sauvegarder l'état
    if (isExpanded) {
        expandedActs.delete(actId);
    } else {
        expandedActs.add(actId);
    }
    saveTreeState();
}


// [MVVM : View]
// Active l'édition du titre d'un acte dans le DOM
function startEditingAct(actId, element) {
    const act = project.acts.find(a => a.id === actId);
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

    const finishEditing = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== originalText) {
            act.title = newTitle;
            saveProject();
        }
        renderActsList();
    };

    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            finishEditing();
        } else if (e.key === 'Escape') {
            renderActsList();
        }
    });
}

// [MVVM : View]
// Alterne l'affichage d'un chapitre (déplié/replié)
function toggleChapter(actId, chapterId) {
    const element = document.getElementById(`chapter-${chapterId}`);
    const icon = element.querySelector('.chapter-icon');
    const scenesList = element.querySelector('.scenes-list');

    const isExpanded = icon.classList.contains('expanded');

    icon.classList.toggle('expanded');
    scenesList.classList.toggle('visible');

    // Sauvegarder l'état
    if (isExpanded) {
        expandedChapters.delete(chapterId);
    } else {
        expandedChapters.add(chapterId);
    }
    saveTreeState();
}



// [MVVM : View]
// Active l'édition du titre d'un chapitre dans le DOM
function startEditingChapter(actId, chapterId, element) {
    const act = project.acts.find(a => a.id === actId);
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

    const finishEditing = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== originalText) {
            chapter.title = newTitle;
            saveProject();

            // Update editor if this chapter is currently open
            if (currentChapterId === chapterId) {
                const breadcrumb = document.querySelector('.editor-breadcrumb');
                if (breadcrumb) breadcrumb.textContent = `${act.title} > ${newTitle}`;
            }
        }
        renderActsList();
    };

    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            finishEditing();
        } else if (e.key === 'Escape') {
            renderActsList();
        }
    });
}

// Scene Management
// [MVVM : View]
// Ouvre la modale d'ajout de scène
function openAddSceneModal(actId, chapterId) {
    activeActId = actId;
    activeChapterId = chapterId;
    document.getElementById('addSceneModal').classList.add('active');
}

// [MVVM : Other]
// Group: Coordinator | Naming: AddSceneCoordinator
// Ouvre la modale d'ajout de scène rapidement (Mixte)
function openAddSceneModalQuick() {
    // Utiliser le chapitre courant s'il existe, sinon le premier chapitre disponible
    if (currentActId && currentChapterId) {
        openAddSceneModal(currentActId, currentChapterId);
    } else if (project.acts.length > 0 && project.acts[0].chapters.length > 0) {
        openAddSceneModal(project.acts[0].id, project.acts[0].chapters[0].id);
    } else {
        showNotification('Créez d\'abord un chapitre');
    }
}


// [MVVM : View]
// Ouvre le menu contextuel de statut d'une scène
function toggleSceneStatus(actId, chapterId, sceneId, event) {
    event = event || window.event;
    event.stopPropagation();

    // Fermer tout menu existant
    closeStatusMenu();

    const act = project.acts.find(a => a.id === actId);
    if (!act) return;

    const chapter = act.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const scene = chapter.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const currentStatus = scene.status || 'draft';

    // Créer le menu contextuel
    const menu = document.createElement('div');
    menu.className = 'status-menu visible';
    menu.id = 'statusMenu';
    menu.innerHTML = `
                <div class="status-menu-item ${currentStatus === 'draft' ? 'active' : ''}" onclick="setSceneStatus(${actId}, ${chapterId}, ${sceneId}, 'draft')">
                    <span class="status-menu-dot draft"></span>
                    <span>Brouillon</span>
                </div>
                <div class="status-menu-item ${currentStatus === 'progress' ? 'active' : ''}" onclick="setSceneStatus(${actId}, ${chapterId}, ${sceneId}, 'progress')">
                    <span class="status-menu-dot progress"></span>
                    <span>En cours</span>
                </div>
                <div class="status-menu-item ${currentStatus === 'complete' ? 'active' : ''}" onclick="setSceneStatus(${actId}, ${chapterId}, ${sceneId}, 'complete')">
                    <span class="status-menu-dot complete"></span>
                    <span>Terminé</span>
                </div>
                <div class="status-menu-item ${currentStatus === 'review' ? 'active' : ''}" onclick="setSceneStatus(${actId}, ${chapterId}, ${sceneId}, 'review')">
                    <span class="status-menu-dot review"></span>
                    <span>À réviser</span>
                </div>
            `;

    // Positionner le menu en position fixe près du clic
    const badge = event.target.closest('.status-badge');
    if (badge) {
        const rect = badge.getBoundingClientRect();
        menu.style.top = (rect.bottom + 5) + 'px';
        menu.style.left = (rect.left - 100) + 'px'; // Décaler vers la gauche

        // S'assurer que le menu ne sort pas de l'écran
        document.body.appendChild(menu);

        const menuRect = menu.getBoundingClientRect();
        if (menuRect.right > window.innerWidth) {
            menu.style.left = (window.innerWidth - menuRect.width - 10) + 'px';
        }
        if (menuRect.left < 0) {
            menu.style.left = '10px';
        }
        if (menuRect.bottom > window.innerHeight) {
            menu.style.top = (rect.top - menuRect.height - 5) + 'px';
        }

        currentStatusMenu = menu;
    }

    // Fermer le menu si on clique ailleurs
    setTimeout(() => {
        document.addEventListener('click', closeStatusMenuOnClickOutside);
    }, 10);
}

// [MVVM : View]
// Ferme le menu de statut
function closeStatusMenu() {
    const menu = document.getElementById('statusMenu');
    if (menu) {
        menu.remove();
    }
    currentStatusMenu = null;
    document.removeEventListener('click', closeStatusMenuOnClickOutside);
}

// [MVVM : View]
// Gère la fermeture du menu au clic extérieur
function closeStatusMenuOnClickOutside(event) {
    if (currentStatusMenu && !currentStatusMenu.contains(event.target)) {
        closeStatusMenu();
    }
}

// [MVVM : View]
// Applique visuellement les filtres de statut dans l'arborescence
function applyStatusFilters() {
    // Appliquer les filtres à toutes les scènes
    document.querySelectorAll('.scene-item[data-scene-id]').forEach(sceneEl => {
        const sceneId = parseInt(sceneEl.dataset.sceneId);
        const actId = parseInt(sceneEl.dataset.actId);
        const chapterId = parseInt(sceneEl.dataset.chapterId);

        const act = project.acts.find(a => a.id === actId);
        if (!act) return;
        const chapter = act.chapters.find(c => c.id === chapterId);
        if (!chapter) return;
        const scene = chapter.scenes.find(s => s.id === sceneId);
        if (!scene) return;

        const status = scene.status || 'draft';

        if (activeStatusFilters.includes(status)) {
            sceneEl.classList.remove('filtered-out');
        } else {
            sceneEl.classList.add('filtered-out');
        }
    });

    // Cacher les chapitres dont toutes les scènes sont filtrées (mais pas les chapitres vides)
    document.querySelectorAll('.chapter-group').forEach(chapterEl => {
        const allScenes = chapterEl.querySelectorAll('.scene-item[data-scene-id]');
        const visibleScenes = chapterEl.querySelectorAll('.scene-item[data-scene-id]:not(.filtered-out)');

        // Si le chapitre a des scènes mais aucune visible, le cacher
        // Si le chapitre n'a pas de scènes (vide), le garder visible
        if (allScenes.length > 0 && visibleScenes.length === 0) {
            chapterEl.classList.add('filtered-out');
        } else {
            chapterEl.classList.remove('filtered-out');
        }
    });

    // Cacher les actes dont tous les chapitres sont filtrés (mais pas les actes avec chapitres vides)
    document.querySelectorAll('.act-group').forEach(actEl => {
        const allChapters = actEl.querySelectorAll('.chapter-group');
        const visibleChapters = actEl.querySelectorAll('.chapter-group:not(.filtered-out)');

        // Si l'acte a des chapitres mais aucun visible, le cacher
        // Si l'acte n'a pas de chapitres (vide), le garder visible
        if (allChapters.length > 0 && visibleChapters.length === 0) {
            actEl.classList.add('filtered-out');
        } else {
            actEl.classList.remove('filtered-out');
        }
    });
}

/* [MVVM] View */
function updateProgressBar() {
    let counts = { draft: 0, progress: 0, complete: 0, review: 0 };
    let total = 0;

    project.acts.forEach(act => {
        act.chapters.forEach(chapter => {
            chapter.scenes.forEach(scene => {
                const status = scene.status || 'draft';
                counts[status] = (counts[status] || 0) + 1;
                total++;
            });
        });
    });

    // Mettre à jour les compteurs
    document.getElementById('countDraft').textContent = counts.draft;
    document.getElementById('countProgress').textContent = counts.progress;
    document.getElementById('countComplete').textContent = counts.complete;
    document.getElementById('countReview').textContent = counts.review;

    // Mettre à jour le texte de progression
    const completedPercent = total > 0 ? Math.round((counts.complete / total) * 100) : 0;
    document.getElementById('progressStatsText').textContent = `${total} scène${total > 1 ? 's' : ''}`;
    document.getElementById('progressPercent').textContent = `${completedPercent}% terminé`;

    // Mettre à jour les segments de la barre
    if (total > 0) {
        document.getElementById('progressComplete').style.width = `${(counts.complete / total) * 100}%`;
        document.getElementById('progressReview').style.width = `${(counts.review / total) * 100}%`;
        document.getElementById('progressProgress').style.width = `${(counts.progress / total) * 100}%`;
        document.getElementById('progressDraft').style.width = `${(counts.draft / total) * 100}%`;
    } else {
        document.getElementById('progressComplete').style.width = '0%';
        document.getElementById('progressReview').style.width = '0%';
        document.getElementById('progressProgress').style.width = '0%';
        document.getElementById('progressDraft').style.width = '0%';
    }
}

/* [MVVM] View */
function startEditingScene(actId, chapterId, sceneId, element) {
    const act = project.acts.find(a => a.id === actId);
    if (!act) return;

    const chapter = act.chapters.find(c => c.id === chapterId);
    if (!chapter) return;

    const scene = chapter.scenes.find(s => s.id === sceneId);
    if (!scene) return;

    const originalText = scene.title;
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'editing-input';
    input.value = originalText;

    element.textContent = '';
    element.appendChild(input);
    input.focus();
    input.select();

    const finishEditing = () => {
        const newTitle = input.value.trim();
        if (newTitle && newTitle !== originalText) {
            scene.title = newTitle;
            saveProject();

            // Update editor if this scene is currently open
            if (currentSceneId === sceneId) {
                const editorTitle = document.querySelector('.editor-title');
                if (editorTitle) editorTitle.textContent = newTitle;
            }
        }
        renderActsList();
    };

    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            finishEditing();
        } else if (e.key === 'Escape') {
            renderActsList();
        }
    });
}

// Rendering

// [MVVM : View]
// Affiche le modal d'ajout d'acte (DOM)
function openAddActModal() {
    document.getElementById('addActModal').classList.add('active');
    setTimeout(() => document.getElementById('actTitleInput').focus(), 100);
}

// [MVVM : Other]
// Logique de sélection d'acte (ViewModel) et manipulation DOM (View) - Mixte
function openAddChapterModal(actId) {
    // Si pas d'actId fourni, utiliser le premier acte ou on en créera un
    if (actId) {
        activeActId = actId;
    } else if (project.acts.length > 0) {
        activeActId = project.acts[0].id;
    } else {
        activeActId = null; // Sera créé dans addChapter
    }
    document.getElementById('addChapterModal').classList.add('active');
    setTimeout(() => document.getElementById('chapterTitleInput').focus(), 100);
}


// [MVVM : ViewModel]
// Logique métier pour récupérer tous les actes (Read)
function getAllActsViewModel() {
    return {
        success: true,
        data: ActRepository.getAll()
    };
}

// [MVVM : ViewModel]
// Logique métier pour récupérer un acte par ID (Read)
function getActViewModel(actId) {
    const act = ActRepository.getById(actId);
    if (!act) {
        return {
            success: false,
            error: 'NOT_FOUND',
            message: 'Acte introuvable'
        };
    }
    return {
        success: true,
        data: act
    };
}

// [MVVM : ViewModel]
// Logique métier pour ajouter un acte (Create)
function addActViewModel(title) {
    // Validation du titre
    const validation = ValidationHelper.validateTitle(title);
    if (!validation.isValid) {
        return {
            success: false,
            error: validation.error,
            message: validation.message
        };
    }

    const trimmedTitle = validation.value;

    // Vérifier les doublons
    const duplicateCheck = ValidationHelper.checkDuplicate(trimmedTitle, ActRepository.getAll());
    if (duplicateCheck.isDuplicate) {
        return {
            success: false,
            error: duplicateCheck.error,
            message: duplicateCheck.message
        };
    }

    try {
        const act = createAct(trimmedTitle);
        // On ne fait plus project.acts.push(act) ici !
        // On le délègue à la View via sideEffects

        return {
            success: true,
            data: act,
            message: `Acte "${trimmedTitle}" créé avec succès`,
            sideEffects: {
                repository: {
                    action: 'ADD',
                    collection: 'acts',
                    data: act
                },
                shouldExpand: act.id,
                shouldSave: true
            }
        };
    } catch (error) {
        return {
            success: false,
            error: 'CREATION_FAILED',
            message: 'Erreur lors de la création de l\'acte',
            details: error.message
        };
    }
}

// [MVVM : ViewModel]
// Logique métier pour supprimer un acte (Delete)
function deleteActViewModel(actId) {
    const act = ActRepository.getById(actId);
    if (!act) {
        return {
            success: false,
            error: 'NOT_FOUND',
            message: 'Acte introuvable'
        };
    }

    const actTitle = act.title;
    // On ne fait plus project.acts = project.acts.filter(...) ici !

    let needsEmptyState = false;
    if (currentActId === actId) {
        needsEmptyState = true;
    }

    return {
        success: true,
        message: `Acte "${actTitle}" supprimé`,
        needsEmptyState,
        sideEffects: {
            repository: {
                action: 'REMOVE',
                collection: 'acts',
                id: actId
            },
            shouldSave: true,
            shouldResetState: needsEmptyState
        }
    };
}

// [MVVM : ViewModel]
// Logique métier pour mettre à jour un acte (Update)
function updateActViewModel(actId, updates) {
    const act = ActRepository.getById(actId);
    if (!act) {
        return {
            success: false,
            error: 'NOT_FOUND',
            message: 'Acte introuvable'
        };
    }

    if (updates.title) {
        const validation = ValidationHelper.validateTitle(updates.title);
        if (!validation.isValid) {
            return {
                success: false,
                error: validation.error,
                message: validation.message
            };
        }
        updates.title = validation.value;
    }

    return {
        success: true,
        message: 'Acte mis à jour',
        sideEffects: {
            repository: {
                action: 'UPDATE',
                collection: 'acts',
                id: actId,
                updates: updates
            },
            shouldSave: true
        }
    };
}

// [MVVM : ViewModel]
// Logique métier pour récupérer tous les chapitres d'un acte (Read)
function getAllChaptersViewModel(actId) {
    const chapters = ChapterRepository.getAll(actId);
    return {
        success: true,
        data: chapters
    };
}

// [MVVM : ViewModel]
// Logique métier pour récupérer un chapitre (Read)
function getChapterViewModel(actId, chapterId) {
    const chapter = ChapterRepository.getById(actId, chapterId);
    if (!chapter) {
        return {
            success: false,
            error: 'NOT_FOUND',
            message: 'Chapitre introuvable'
        };
    }
    return {
        success: true,
        data: chapter
    };
}

// [MVVM : ViewModel]
// Logique métier pour ajouter un chapitre (Create)
function addChapterViewModel(title) {
    // Validation du titre
    const validation = ValidationHelper.validateTitle(title);
    if (!validation.isValid) {
        return {
            success: false,
            error: validation.error,
            message: validation.message
        };
    }

    const trimmedTitle = validation.value;
    let autoCreatedAct = null;

    // Si pas d'acte, en créer un par défaut
    if (!activeActId || !ActRepository.getById(activeActId)) {
        if (ActRepository.getAll().length === 0) {
            try {
                autoCreatedAct = createAct('Roman');
                // On délèguera la création de l'acte par défaut à la View via sideEffects
                activeActId = autoCreatedAct.id;
            } catch (error) {
                return {
                    success: false,
                    error: 'ACT_CREATION_FAILED',
                    message: 'Impossible de créer l\'acte par défaut'
                };
            }
        } else {
            activeActId = ActRepository.getAll()[0].id;
        }
    }

    const act = ActRepository.getById(activeActId);
    if (!act) {
        return {
            success: false,
            error: 'ACT_NOT_FOUND',
            message: 'Acte introuvable'
        };
    }

    // Vérifier les doublons dans les chapitres de cet acte
    const duplicateCheck = ValidationHelper.checkDuplicate(trimmedTitle, ChapterRepository.getAll(activeActId));
    if (duplicateCheck.isDuplicate) {
        return {
            success: false,
            error: duplicateCheck.error,
            message: 'Un chapitre avec ce titre existe déjà dans cet acte'
        };
    }

    try {
        const chapter = createChapter(trimmedTitle);

        return {
            success: true,
            data: { act, chapter },
            message: `Chapitre "${trimmedTitle}" créé avec succès`,
            sideEffects: {
                repository: [
                    // Si on a créé un acte par défaut, il faut le rajouter
                    ...(autoCreatedAct ? [{ action: 'ADD', collection: 'acts', data: autoCreatedAct }] : []),
                    {
                        action: 'ADD',
                        collection: 'chapters',
                        actId: activeActId,
                        data: chapter
                    }
                ],
                shouldExpandAct: activeActId,
                shouldExpandChapter: chapter.id,
                shouldSave: true
            }
        };
    } catch (error) {
        return {
            success: false,
            error: 'CREATION_FAILED',
            message: 'Erreur lors de la création du chapitre',
            details: error.message
        };
    }
}

// [MVVM : ViewModel]
// Logique métier pour supprimer un chapitre (Delete)
function deleteChapterViewModel(actId, chapterId) {
    const chapter = ChapterRepository.getById(actId, chapterId);
    if (!chapter) {
        return {
            success: false,
            error: 'CHAPTER_NOT_FOUND',
            message: 'Chapitre introuvable'
        };
    }

    const chapterTitle = chapter.title;

    let needsEmptyState = false;
    if (currentChapterId === chapterId) {
        needsEmptyState = true;
    }

    return {
        success: true,
        message: `Chapitre "${chapterTitle}" supprimé`,
        needsEmptyState,
        sideEffects: {
            repository: {
                action: 'REMOVE',
                collection: 'chapters',
                actId: actId,
                id: chapterId
            },
            shouldSave: true,
            shouldResetState: needsEmptyState
        }
    };
}

// [MVVM : ViewModel]
// Logique métier pour mettre à jour un chapitre (Update)
function updateChapterViewModel(actId, chapterId, updates) {
    const chapter = ChapterRepository.getById(actId, chapterId);
    if (!chapter) {
        return {
            success: false,
            error: 'NOT_FOUND',
            message: 'Chapitre introuvable'
        };
    }

    if (updates.title) {
        const validation = ValidationHelper.validateTitle(updates.title);
        if (!validation.isValid) {
            return {
                success: false,
                error: validation.error,
                message: validation.message
            };
        }
        updates.title = validation.value;
    }

    return {
        success: true,
        message: 'Chapitre mis à jour',
        sideEffects: {
            repository: {
                action: 'UPDATE',
                collection: 'chapters',
                actId: actId,
                id: chapterId,
                updates: updates
            },
            shouldSave: true
        }
    };
}

// [MVVM : ViewModel]
// Logique métier pour récupérer toutes les scènes (Read)
function getAllScenesViewModel(actId, chapterId) {
    return {
        success: true,
        data: SceneRepository.getAll(actId, chapterId)
    };
}

// [MVVM : ViewModel]
// Logique métier pour récupérer une scène (Read)
function getSceneViewModel(actId, chapterId, sceneId) {
    const scene = SceneRepository.getById(actId, chapterId, sceneId);
    if (!scene) {
        return {
            success: false,
            error: 'NOT_FOUND',
            message: 'Scène introuvable'
        };
    }
    return {
        success: true,
        data: scene
    };
}

// [MVVM : ViewModel]
// Logique métier pour ajouter une scène (Create)
function addSceneViewModel(title, actId, chapterId) {
    // Validation du titre
    const validation = ValidationHelper.validateTitle(title);
    if (!validation.isValid) {
        return {
            success: false,
            error: validation.error,
            message: validation.message
        };
    }

    if (!actId || !chapterId) {
        return {
            success: false,
            error: 'MISSING_PARAMETERS',
            message: 'Acte et chapitre requis'
        };
    }

    const trimmedTitle = validation.value;

    const chapter = ChapterRepository.getById(actId, chapterId);
    if (!chapter) {
        return {
            success: false,
            error: 'CHAPTER_NOT_FOUND',
            message: 'Chapitre introuvable'
        };
    }

    // Vérifier les doublons dans les scènes de ce chapitre
    const duplicateCheck = ValidationHelper.checkDuplicate(trimmedTitle, SceneRepository.getAll(actId, chapterId));
    if (duplicateCheck.isDuplicate) {
        return {
            success: false,
            error: duplicateCheck.error,
            message: 'Une scène avec ce titre existe déjà dans ce chapitre'
        };
    }

    try {
        const scene = createScene(trimmedTitle);

        return {
            success: true,
            data: scene,
            message: `Scène "${trimmedTitle}" créée avec succès`,
            sideEffects: {
                repository: {
                    action: 'ADD',
                    collection: 'scenes',
                    actId: actId,
                    chapterId: chapterId,
                    data: scene
                },
                shouldExpandAct: actId,
                shouldExpandChapter: chapterId,
                shouldSave: true,
                shouldOpenScene: { actId, chapterId, sceneId: scene.id }
            }
        };
    } catch (error) {
        return {
            success: false,
            error: 'CREATION_FAILED',
            message: 'Erreur lors de la création de la scène',
            details: error.message
        };
    }
}

// [MVVM : ViewModel]
// Logique métier pour mettre à jour le statut d'une scène (Update)
function setSceneStatusViewModel(actId, chapterId, sceneId, status) {
    const validStatuses = ['draft', 'progress', 'complete', 'review'];
    if (!validStatuses.includes(status)) {
        return {
            success: false,
            error: 'INVALID_STATUS',
            message: `Statut invalide. Valeurs acceptées : ${validStatuses.join(', ')}`
        };
    }

    const scene = SceneRepository.getById(actId, chapterId, sceneId);
    if (!scene) {
        return {
            success: false,
            error: 'SCENE_NOT_FOUND',
            message: 'Scène introuvable'
        };
    }

    const oldStatus = scene.status;

    return {
        success: true,
        message: `Statut mis à jour : ${oldStatus} → ${status}`,
        sideEffects: {
            repository: {
                action: 'UPDATE',
                collection: 'scenes',
                actId: actId,
                chapterId: chapterId,
                id: sceneId,
                updates: { status: status }
            },
            shouldSave: true
        }
    };
}

// [MVVM : ViewModel]
// Logique métier pour mettre à jour une scène (Update général)
function updateSceneViewModel(actId, chapterId, sceneId, updates) {
    const scene = SceneRepository.getById(actId, chapterId, sceneId);
    if (!scene) {
        return {
            success: false,
            error: 'NOT_FOUND',
            message: 'Scène introuvable'
        };
    }

    if (updates.title) {
        const validation = ValidationHelper.validateTitle(updates.title);
        if (!validation.isValid) {
            return {
                success: false,
                error: validation.error,
                message: validation.message
            };
        }
        updates.title = validation.value;
    }

    return {
        success: true,
        message: 'Scène mise à jour',
        sideEffects: {
            repository: {
                action: 'UPDATE',
                collection: 'scenes',
                actId: actId,
                chapterId: chapterId,
                id: sceneId,
                updates: updates
            },
            shouldSave: true
        }
    };
}

// [MVVM : ViewModel]
// Logique métier pour supprimer une scène (Delete)
function deleteSceneViewModel(actId, chapterId, sceneId) {
    const scene = SceneRepository.getById(actId, chapterId, sceneId);
    if (!scene) {
        return {
            success: false,
            error: 'SCENE_NOT_FOUND',
            message: 'Scène introuvable'
        };
    }

    const sceneTitle = scene.title;

    let needsEmptyState = false;
    if (currentSceneId === sceneId) {
        needsEmptyState = true;
    }

    return {
        success: true,
        message: `Scène "${sceneTitle}" supprimée`,
        needsEmptyState,
        sideEffects: {
            repository: {
                action: 'REMOVE',
                collection: 'scenes',
                actId: actId,
                chapterId: chapterId,
                id: sceneId
            },
            shouldSave: true,
            shouldResetState: needsEmptyState
        }
    };
}

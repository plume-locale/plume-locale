02.storage.js :
	// [MVVM : Model]
	// Initialisation de la couche de données (Data Access Layer).
	initDB

	// [MVVM : Model]
	// Logique de migration de données.
	migrateFromLocalStorage

	// [MVVM : Model]
	// Persistance des données (Create/Update).
	saveProjectToDB

	// [MVVM : Model]
	// Récupération de données (Read).
	loadProjectFromDB

	// [MVVM : Model]
	// Récupération de collection (Read All).
	loadAllProjectsFromDB

	// [MVVM : Model]
	// Suppression de données (Delete).
	deleteProjectFromDB

	// [MVVM : Model]
	// Métadonnées sur les données.
	getIndexedDBSize

	// [MVVM : Model]
	// Persistance de configuration.
	saveSetting

	// [MVVM : Model]
	// Récupération de configuration.
	loadSetting

03.project.js :
	// [MVVM : View]
	// Gère l'affichage des différentes vues et l'état de l'interface (DOM manipulation)
	switchView

	// [MVVM : View]
	// Affiche le contenu HTML spécifique de chaque vue (Routing/Rendering)
	renderViewContent

	// [MVVM : View]
	// Affiche une scène spécifique dans un conteneur donné (Rendering pour split view)
	renderSceneInContainer

	// [MVVM : View]
	// Ouvre la modale de gestion des projets (UI logic)
	openProjectsModal

	// [MVVM : View]
	// Ouvre la modale de création de projet (UI logic)
	openNewProjectModal

	// [MVVM : ViewModel]
	// Crée un nouveau projet à partir des inputs (View) et met à jour les données (Model)
	createNewProject

	// [MVVM : ViewModel]
	// Change le projet actif (State) et déclenche la mise à jour de l'interface (View)
	switchToProject

	// [MVVM : ViewModel]
	// Supprime un projet (Model) et rafraîchit l'affichage (View)
	deleteProject

	// [MVVM : ViewModel]
	// Prépare les données du modèle pour l'export (Business Logic/Bridge)
	exportProjectIndividual

	// [MVVM : View]
	// Déclenche l'élément d'entrée de fichier (UI Interaction)
	importProject

	// [MVVM : ViewModel]
	// Traite le fichier importé, valide les données et met à jour le modèle
	handleProjectImport

	// [MVVM : View]
	// Génère et injecte le HTML pour la liste des projets
	renderProjectsList

	// [MVVM : Model]
	// Service de persistance : sauvegarde l'état complet dans la base de données
	saveAllProjects

	// [MVVM : Model]
	// Service de persistance : charge l'état depuis la base de données
	loadAllProjects

	// [MVVM : Model]
	// Factory : crée une nouvelle instance de structure de projet par défaut
	createDefaultProject

	// [MVVM : Model]
	// Validation/Migration : s'assure que toutes les propriétés requises existent
	ensureProjectStructure

	// [MVVM : View]
	// Initialise l'interface de l'outil d'analyse
	renderAnalysis

	// [MVVM : ViewModel]
	// Orchestrateur : récupère les données, lance les calculs du modèle, met à jour la vue
	runTextAnalysis

	// [MVVM : ViewModel]
	// Helper : extrait les données brutes nécessaires depuis le modèle selon le contexte de vue
	getTextForAnalysis

	// [MVVM : Other]
	// [HELPER] Utilitaire de traitement de chaîne (agnostique)
	stripHTML

	// [MVVM : Model]
	// Algorithme pur : logique de détection des répétitions
	detectRepetitions

	// [MVVM : Model]
	// Algorithme pur : calcul de score de lisibilité
	calculateReadability

	// [MVVM : Model]
	// Helper algorithmique : comptage de syllabes
	countSyllables

	// [MVVM : Model]
	// Algorithme pur : analyse de fréquence des mots
	calculateWordFrequency

	// [MVVM : Model]
	// Algorithme pur : statistiques de longueur de phrases
	calculateSentenceLength

	// [MVVM : Model]
	// Algorithme pur : analyse de distribution narrative/dialogue
	analyzeNarrativeDistribution

	// [MVVM : View]
	// Rendu des résultats d'analyse (Génération HTML)
	displayAnalysisResults

04.init.js :
	// [MVVM : Other]
	// Mixte (Controller/Initialization)
	init

	// [MVVM : Other]
	// Fonction utilitaire pour convertir un nombre en chiffres romains (Utility)
	toRoman

	// [MVVM : ViewModel]
	// Gère la sauvegarde du projet avec debounce pour l'historique
	saveProject

	// [MVVM : ViewModel]
	// Gère le renommage du projet (Input et mise à jour Modèle/Vue)
	renameProject

06.structure.js :
	// [MVVM : View]
	// Rafraîchit toutes les vues de l'application
	refreshAllViews

	// [MVVM : Model]
	// Charge le projet depuis le localStorage et gère la migration de structure
	loadProject

	// [MVVM : View]
	// Alterne l'affichage d'un acte (déplié/replié)
	toggleAct

	// [MVVM : View]
	// Active l'édition du titre d'un acte dans le DOM
	startEditingAct

	// [MVVM : View]
	// Alterne l'affichage d'un chapitre (déplié/replié)
	toggleChapter

	// [MVVM : Model]
	// Sauvegarde l'état d'expansion de l'arborescence dans IndexedDB
	saveTreeState

	// [MVVM : View]
	// Déploie toute l'arborescence dans l'interface
	expandAllTree

	// [MVVM : View]
	// Replie toute l'arborescence dans l'interface
	collapseAllTree

	// [MVVM : Model]
	// Charge l'état d'expansion de l'arborescence depuis IndexedDB
	loadTreeState

	// [MVVM : View]
	// Restaure visuellement l'état d'expansion dans le DOM
	restoreTreeState

	// [MVVM : View]
	// Active l'édition du titre d'un chapitre dans le DOM
	startEditingChapter

	// [MVVM : View]
	// Ouvre la modale d'ajout de scène
	openAddSceneModal

	// [MVVM : View]
	// Ouvre le menu contextuel de statut d'une scène
	toggleSceneStatus

	// [MVVM : View]
	// Ferme le menu de statut
	closeStatusMenu

	// [MVVM : View]
	// Gère la fermeture du menu au clic extérieur
	closeStatusMenuOnClickOutside

	// [MVVM : View]
	// Applique visuellement les filtres de statut dans l'arborescence
	applyStatusFilters

07.stats.js :
	// [MVVM : ViewModel]
	// Formate un nombre pour l'affichage (ex: 1.2k)
	formatWordCount

	// [MVVM : ViewModel]
	// Calcule les statistiques d'un chapitre pour la vue
	getChapterStats

	// [MVVM : ViewModel]
	// Calcule les statistiques d'un acte pour la vue
	getActStats

	// [MVVM : View]
	// Génère et affiche la liste des actes et chapitres dans le DOM
	renderActsList

	// [MVVM : View]
	// Génère le HTML pour les liens personnages d'une scène
	renderSceneCharacters

	// [MVVM : View]
	// Génère le HTML pour les liens éléments/lieux d'une scène
	renderSceneElements

	// [MVVM : View]
	// Génère le HTML pour les événements temporels liés à une scène
	renderSceneMetroEvents

	// [MVVM : View]
	// Ouvre la modale pour lier des personnages (Gestion UI)
	openCharacterLinker

	// [MVVM : View]
	// Ouvre la modale pour lier des éléments (Gestion UI)
	openElementLinker

	// [MVVM : View]
	// Génère et affiche l'éditeur de texte complet
	renderEditor

	// [MVVM : View]
	// Affiche l'état vide de l'éditeur
	showEmptyState

	// [MVVM : View]
	// Alias pour l'état vide
	renderWelcomeEditor

	// [MVVM : View]
	// Affiche l'écran d'accueil des personnages
	renderCharacterWelcome

	// [MVVM : View]
	// Affiche l'écran d'accueil de l'univers
	renderWorldWelcome

	// [MVVM : View]
	// Affiche l'écran d'accueil des notes
	renderNotesWelcome

	// [MVVM : View]
	// Affiche l'écran d'accueil du codex
	renderCodexWelcome

	// [MVVM : Other]
	// Synchronise la Vue vers le Modèle (Input -> Data) et sauvegarde (Mixte)
	updateSceneContent

	// [MVVM : Model]
	// Utilitaire pur pour compter les mots (Logique métier)
	getWordCount

08.auto-detect.js :
	// [MVVM : View]
	// Fonction de rendu pur. Construit le DOM du panneau latéral basé sur l'état du Modèle.
	refreshLinksPanel

	// [MVVM : View]
	// Helper de rendu UI. Détermine l'icône Lucide à utiliser pour un type d'élément.
	getElementIcon

	// [MVVM : ViewModel]
	// Action utilisateur (Command) : Gère la déliaison d'un personnage (Bascule l'état).
	toggleCharacterLinkerAction

	// [MVVM : View]
	// Helper de rendu UI pour les avatars.
	getAvatarHTML

	// [MVVM : Model]
	// Utilitaire pur de manipulation de string (Normalisation pour recherche)
	normalizeForSearch

	// [MVVM : Model]
	// Utilitaire pur : Échappe les caractères spéciaux regex.
	escapeRegex

	// [MVVM : View]
	// Manipulation directe du DOM/API du navigateur pour le formatage.
	formatText

09.floating-editor.js :
	// [MVVM : View]
	// Gère les interactions tactiles sur l'éditeur (zoom, undo/redo gestuels)
	initEditorGestures

	// [MVVM : View]
	// Initialise le menu flottant, ses références DOM et les événements locaux
	initFloatingEditorMenu

	// [MVVM : View]
	// Met à jour le DOM du menu selon l'état de position stocké
	updateFloatingMenuPosition

	// [MVVM : View]
	// Logique d'affichage : Bascule la visibilité du menu et met à jour l'icône
	toggleFloatingEditorMenu

	// [MVVM : ViewModel]
	// Action : Applique le formatage de bloc sur le contenu
	applyFloatingFormat

	// [MVVM : ViewModel]
	// Action : Modifie la couleur du texte
	changeFloatingTextColor

	// [MVVM : ViewModel]
	// Action : Modifie la couleur de fond
	changeFloatingBackgroundColor

	// [MVVM : ViewModel]
	// Action : Logique d'insertion de lien avec interaction utilisateur
	insertLink

	// [MVVM : ViewModel]
	// Action : Logique d'insertion d'image
	insertImage

10.colorpalette.js :
	// [MVVM : Model]
	// Source de données pour la palette de couleurs
	colorPalette

	// [MVVM : View]
	// Gère la logique UI et les événements du redimensionnement de la sidebar
	initSidebarResize

	// [MVVM : View]
	// Génère les éléments UI pour les sélecteurs de couleurs
	initializeColorPickers

	// [MVVM : View]
	// Contrôle la visibilité et le positionnement de l'UI du sélecteur de couleur
	toggleColorPicker

	// [MVVM : View]
	// Met à jour la couleur du texte dans l'éditeur et synchronise les inputs UI
	applyTextColor

	// [MVVM : View]
	// Met à jour la couleur de fond dans l'éditeur et synchronise les inputs UI
	applyBackgroundColor

	// [MVVM : View]
	// Gère les raccourcis clavier au sein de l'éditeur
	handleEditorKeydown

12.import-export.js :
	// [MVVM : View]
	// Gère l'affichage du modal de sauvegarde
	showBackupMenu

	// [MVVM : Other]
	// Convertit le Model en JSON et gère le téléchargement (View) - Mixte
	exportToJSON

	// [MVVM : View]
	// Interaction simple pour ouvrir le sélecteur de fichier
	importFromFile

	// [MVVM : Other]
	// Lit le fichier (View), valide et met à jour le Model, puis rafraîchit l'UI (View) - Mixte
	handleFileImport

	// [MVVM : Other]
	// Formatte les données du Model pour l'export texte et déclenche le téléchargement (View) - Mixte
	exportProject

	// [MVVM : View]
	// Affiche le modal d'ajout d'acte (DOM)
	openAddActModal

	// [MVVM : Other]
	// Logique de sélection d'acte (ViewModel) et manipulation DOM (View) - Mixte
	openAddChapterModal

	// [MVVM : View]
	// Manipulation DOM pour fermer les modales
	closeModal

13.mobile-menu.js :
	// [MVVM : View]
	// Manipulation directe du DOM pour la sidebar mobile (classList, style).
	toggleMobileSidebar

	// [MVVM : View]
	// Manipulation directe du DOM pour fermer la sidebar.
	closeMobileSidebar

	// [MVVM : View]
	// Gestion de l'affichage du menu de navigation mobile (DOM + SVG).
	toggleMobileNav

	// [MVVM : View]
	// Fermeture du menu de navigation mobile (DOM).
	closeMobileNav

	// [MVVM : View]
	// Mise à jour de l'état UI actif et appel d'une fonction de changement de vue.
	switchViewMobile

	// [MVVM : View]
	// Affichage/Masquage de la barre d'outils (DOM).
	toggleEditorToolbar

	// [MVVM : View]
	// Affichage/Masquage du panneau de liens (DOM).
	toggleLinksPanel

	// [MVVM : View]
	// Interaction complexe entre deux éléments d'interface (menu flottant et toolbar).
	toggleToolbarFromFloating

	// [MVVM : View]
	// Gestion de l'affichage du menu avancé (DOM + Style).
	toggleAdvancedMenu

	// [MVVM : Other]
	// Interaction utilisateur (Prompt) -> Appel logique métier (formatText). (Mixte)
	insertLink

	// [MVVM : View]
	// Calcul de dimensions et ajustement de classes CSS en fonction de l'espace disponible.
	checkHeaderOverflow

15.characters.js :
	// [MVVM : Other]
	// Logique métier et interaction utilisateur (prompt) - Mixte
	addNewRace

	// [MVVM : View]
	// Manipulation directe du DOM pour afficher la modale
	openAddCharacterModal

	// [MVVM : ViewModel]
	// Gère la création, l'initialisation et la sauvegarde d'un personnage
	addCharacter

	// [MVVM : ViewModel]
	// Gère la suppression et la mise à jour de l'état global
	deleteCharacter

	// [MVVM : View]
	// Génération du HTML pour la liste des personnages
	renderCharactersList

	// [MVVM : ViewModel]
	// Gère l'état de repliement des groupes dans le localStorage
	toggleTreeviewGroup

	// [MVVM : View]
	// Génération du HTML pour les scènes liées
	renderCharacterLinkedScenes

	// [MVVM : ViewModel]
	// Coordination de l'affichage du détail d'un personnage
	openCharacterDetail

	// [MVVM : Other]
	// Migration et normalisation des données (Model/ViewModel)
	migrateCharacterData

	// [MVVM : View]
	// Template HTML principal de la fiche personnage
	renderCharacterSheet

	// [MVVM : View]
	// Template HTML pour un item d'inventaire
	renderInventoryItem

	// [MVVM : View]
	// Interaction UI simple pour afficher/masquer des sections
	toggleCharacterSection

	// [MVVM : ViewModel]
	// Logique de mise à jour du nom
	updateCharacterName

	// [MVVM : ViewModel]
	// Logique de mise à jour du nom d'affichage
	updateCharacterDisplayName

	// [MVVM : Other]
	// Gestion des tags et mise à jour directe (Mixte)
	handleTagInput

	// [MVVM : ViewModel]
	// Logique de suppression d'un tag
	removeCharacterTag

16.split-view.js :
	// [MVVM : ViewModel]
	// Gère le basculement de l'état global du mode split
	toggleSplitView

	// [MVVM : ViewModel]
	// Initialise l'état pour l'activation du mode split
	activateSplitView

	// [MVVM : ViewModel]
	// Réinitialise l'état et restaure la vue standard
	closeSplitView

	// [MVVM : View]
	// Met à jour l'état visuel du bouton de bascule dans le DOM
	updateSplitToggleButton

	// [MVVM : View]
	// Génère et injecte la structure HTML principale du mode split
	renderSplitView

	// [MVVM : ViewModel]
	// Gère le changement de panneau actif et met à jour les indicateurs visuels
	setActiveSplitPanel

	// [MVVM : View]
	// Manipulle le DOM de la barre latérale pour correspondre à la vue du panneau actif
	updateSidebarForSplitPanel

	// [MVVM : ViewModel]
	// Gère le changement de type de vue au sein d'un panneau spécifique
	switchSplitPanelView

	// [MVVM : View]
	// Met à jour l'en-tête (titre et icône) d'un panneau split
	updateSplitPanelHeader

	// [MVVM : View]
	// Prépare et initialise le conteneur de contenu pour un panneau
	renderSplitPanelViewContent

17.world.js :
	// [MVVM : View]
	// Manipule directement le DOM (ouvre la modale et met le focus).
	openAddWorldModal

	// [MVVM : View]
	// Génération dynamique du HTML pour la liste des éléments
	renderWorldList

	// [MVVM : View]
	// Génération HTML pour les scènes liées (ViewModel/View fragment)
	renderElementLinkedScenes

	// [MVVM : ViewModel]
	// Met à jour les données du Model et déclenche le rafraîchissement de la View
	updateWorldField

18.timeline.js :
	// [MVVM : View]
	// Manipule directement le DOM pour afficher le modal d'ajout
	openAddTimelineModal

	// [MVVM : View]
	// Rend la liste chronologique dans le DOM à partir du Model
	renderTimelineList

	// [MVVM : View]
	// Construit la vue détaillée d'un événement chronologique
	openTimelineDetail

	// [MVVM : ViewModel]
	// Met à jour un champ de l'événement et rafraîchit la View
	updateTimelineField

19.notes.js :
	// [MVVM : View]
	// Affiche la modal d'ajout ; interaction UI uniquement.
	openAddNoteModal

	// [MVVM : ViewModel]
	// Crée un nouvel objet Model, met à jour project.notes, persiste et déclenche le rendu.
	addNote

	// [MVVM : ViewModel]
	// Modifie le Model (suppression), persiste et met à jour la View.
	deleteNote

	// [MVVM : View]
	// Rend la liste des notes dans le DOM ; lecture du Model mais responsabilité d'affichage.
	renderNotesList

	// [MVVM : ViewModel]
	// Mutations de l'état d'affichage (expand/collapse) et déclenche rendu.
	toggleNoteCategory

	// [MVVM : ViewModel]
	// Opération sur l'état UI et rafraîchissement de la View.
	expandAllNoteCategories

	// [MVVM : ViewModel]
	// Opération sur l'état UI et rafraîchissement de la View.
	collapseAllNoteCategories

	// [MVVM : Other]
	// Rend la vue détail et gère la navigation (Mixte View/ViewModel).
	openNoteDetail

	// [MVVM : View]
	// Génère le markup HTML des médias pour une note.
	renderNoteMedias

	// [MVVM : Other]
	// Fonction utilitaire (extraction de domaine).
	extractDomain

	// [MVVM : Other]
	// Parse l'ID YouTube depuis une URL.
	extractYoutubeId

	// [MVVM : View]
	// Crée et affiche la modal d'ajout de média.
	openAddMediaModal

	// [MVVM : View]
	// Aide l'UI en adaptant le placeholder selon le type.
	updateMediaInputPlaceholder

	// [MVVM : ViewModel]
	// Ajoute un média au Model, met à jour les timestamps, persiste et rafraîchit la View.
	addNoteMedia

	// [MVVM : ViewModel]
	// Supprime un média du Model, persiste et met à jour la View.
	deleteNoteMedia

	// [MVVM : ViewModel]
	// Met à jour un champ du Model, persiste et rafraîchit la View.
	updateNoteField

	// [MVVM : ViewModel]
	// Transforme la saisie en tableau dans le Model, persiste et rafraîchit la View.
	updateNoteTags

20.snapshots.js :
	// [MVVM : ViewModel]
	// Coordonne la création d'un snapshot du project, persiste et demande la mise à jour de la vue.
	createVersion

	// [MVVM : ViewModel]
	// Modifie le project (Model) en supprimant une version, persiste et notifie la vue.
	deleteVersion

	// [MVVM : ViewModel]
	// Restaure l'état du project (Model) depuis un snapshot.
	restoreVersion

	// [MVVM : View]
	// Génère directement du HTML et manipule le DOM (Vue).
	renderVersionsList

	// [MVVM : Other]
	// Calcule une différence (ViewModel) et l'affiche via alert (View).
	compareVersion

21.sceneVersions.js :
	// [MVVM : Other]
	// Met à jour l'état et manipule le DOM (Mixte ViewModel + View)
	toggleVersionsSidebar

	// [MVVM : Other]
	// Force l'état d'affichage et modifie directement la Vue (Mixte ViewModel + View)
	showVersionsSidebar

	// [MVVM : Model]
	// Accès et initialisation des données de modèle (versions d'une scène)
	getSceneVersions

	// [MVVM : ViewModel]
	// Localise et expose l'act/chapter/scene courant pour la Vue
	getCurrentSceneForVersions

	// [MVVM : Other]
	// Orchestration : lit la Vue, met à jour le Modèle, et rafraîchit la Vue (Mixte)
	createSceneVersion

	// [MVVM : Other]
	// Met à jour l'état du modèle et rafraîchit la Vue (Mixte)
	switchToSceneVersion

	// [MVVM : View]
	// Rattache des écouteurs DOM aux marqueurs d'annotation
	reattachAnnotationMarkerListeners

	// [MVVM : Other]
	// Supprime le modèle (versions) et rafraîchit la Vue (Mixte)
	deleteSceneVersion

	// [MVVM : Other]
	// Met à jour le modèle (label) et demande à la Vue de se rafraîchir (Mixte)
	renameSceneVersion

	// [MVVM : View]
	// Construit et injecte le HTML pour la liste des versions
	renderSceneVersionsList

	// [MVVM : Other]
	// Met à jour le modèle (flag isFinal) puis rafraîchit la Vue (Mixte)
	toggleFinalVersion

	// [MVVM : Model]
	// Logique d'accès pour l'export (choisit la version finale si présente)
	getSceneExportContent

	// [MVVM : ViewModel]
	// Synchronise le contenu édité (Vue) avec le Modèle et ses versions actives
	updateSceneContentWithVersion

22.diff.js :
	// [MVVM : View]
	// Manipule directement le DOM (sélecteurs, affichage du modal).
	openDiffModal

	// [MVVM : View]
	// Simple action d'interface qui masque le modal.
	closeDiffModal

	// [MVVM : ViewModel]
	// Orchestrateur — récupère les données, calcule le diff et appelle le rendu.
	updateDiff

	// [MVVM : Model]
	// Transformation de données (HTML -> texte brut).
	stripHtml

	// [MVVM : Model]
	// Calcule la différence entre deux textes (logique métier).
	computeDiff

	// [MVVM : Model]
	// Prépare les données (tokenisation) pour l'algorithme de diff.
	tokenizeText

	// [MVVM : Model]
	// Implémentation de l'algorithme de diff (Myers).
	myersDiff

	// [MVVM : Model]
	// Aide à construire la structure de donnée de sortie (utilitaire).
	addParagraphToResult

	// [MVVM : View]
	// Met à jour le DOM pour afficher des statistiques.
	updateDiffStats

	// [MVVM : View]
	// Génère et injecte du HTML pour la vue unifiée.
	renderUnifiedDiff

	// [MVVM : View]
	// Génère et injecte le HTML pour l'affichage côte-à-côte.
	renderSideBySideDiff

	// [MVVM : View]
	// Sécurise le texte inséré dans le DOM (utilitaire).
	escapeHtml

23.stats.js :
	// [MVVM : Other]
	// Calcule des métriques (ViewModel) et injecte du HTML (View).
	renderStats

	// [MVVM : View]
	// Transforme les données d'historique en fragments HTML.
	renderWritingHistory

	// [MVVM : ViewModel]
	// Met à jour le modèle (project.stats), persiste et déclenche un re-render.
	updateGoal

	// [MVVM : ViewModel]
	// Suit et modifie l'état du modèle (writingSessions), calculs métier.
	trackWritingSession

24.codex.js :
	// [MVVM : View]
	// Affiche une modale et manipule le DOM (purement interface).
	openAddCodexModal

	// [MVVM : ViewModel]
	// Traite l'entrée utilisateur et met à jour le Model (project.codex).
	addCodexEntry

	// [MVVM : ViewModel]
	// Modifie le Model (suppression) et déclenche sauvegarde + rafraîchissement.
	deleteCodexEntry

	// [MVVM : View]
	// Rend la liste dans le DOM (groupement, tri, affichage).
	renderCodexList

	// [MVVM : Other]
	// Charge une entrée et compose le HTML détaillé (Mixte ViewModel + View).
	openCodexDetail

	// [MVVM : ViewModel]
	// Met à jour le Model puis synchronise la View.
	updateCodexField

	// [MVVM : Other]
	// Agrège données du Model et construit la View (modal) (Mixte).
	showReferencesForCharacter

	// [MVVM : Model]
	// Lecture du Model (recherche pure de données).
	findScenesWithCharacter

	// [MVVM : Model]
	// Lecture du Model (recherche pure de données).
	findScenesWithElement

	// [MVVM : Other]
	// Agrège données via helpers et affiche modal (Mixte ViewModel + View).
	showReferencesForElement

	// [MVVM : ViewModel]
	// Met à jour le Model (liaison/déliaison) puis rafraîchit la View.
	toggleCharacterInScene

25.globalSearch.js :
	// [MVVM : ViewModel]
	// Traite l'entrée utilisateur pour la recherche globale.
	performGlobalSearch

	// [MVVM : ViewModel]
	// Parcourt les données du Model et les prépare pour la View.
	searchEverywhere

	// [MVVM : ViewModel]
	// Utilitaire de transformation pour générer un extrait.
	getPreview

	// [MVVM : View]
	// Responsable du rendu DOM des résultats de recherche.
	displaySearchResults

	// [MVVM : ViewModel]
	// Exécute l'action associée au résultat.
	executeSearchAction

	// [MVVM : View]
	// Logique d'interface pour fermer les résultats de recherche.
	closeSearchResults

26.focusMode.js :
	// [MVVM : ViewModel]
	// Calcule les données de progression et met à jour la vue.
	updateWritingProgress

	// [MVVM : View]
	// Bascule la visibilité d'un élément d'interface (panneau focus).
	toggleFocusPanel

	// [MVVM : View]
	// Bascule l'affichage d'un composant UI (barre d'outils).
	toggleToolbar

	// [MVVM : View]
	// Bascule l'affichage d'un composant UI (panneau des liens).
	toggleLinksPanelVisibility

	// [MVVM : ViewModel]
	// Met à jour les statistiques affichées dans le mode focus.
	updateFocusStats

	// [MVVM : View]
	// Affiche ou masque la popup du timer Pomodoro.
	togglePomodoroPopup

	// [MVVM : ViewModel]
	// Gère la logique de démarrage du timer Pomodoro.
	startPomodoro

	// [MVVM : ViewModel]
	// Gère la logique de pause du timer Pomodoro.
	pausePomodoro

	// [MVVM : ViewModel]
	// Réinitialise l'état logique du timer Pomodoro.
	resetPomodoro

	// [MVVM : ViewModel]
	// Gère la fin d'un cycle Pomodoro (logique métier et notification).
	completedPomodoro

	// [MVVM : View]
	// Met à jour l'affichage textuel du timer dans l'interface.
	updatePomodoroDisplay

28.revision.js :
	// [MVVM : ViewModel]
	// Gère la sélection de la couleur de surlignage dans l'interface.
	selectHighlightColor

	// [MVVM : View]
	// Ouvre la fenêtre contextuelle de création d' annotation.
	openAnnotationPopup

	// [MVVM : View]
	// Ferme la fenêtre contextuelle de création d' annotation.
	closeAnnotationPopup

	// [MVVM : ViewModel]
	// Gère le changement de type d' annotation dans l'interface.
	selectAnnotationType

	// [MVVM : View]
	// Génère et affiche la liste des annotations de la scène dans le panneau latéral.
	renderAnnotationsPanel

	// [MVVM : ViewModel]
	// Alterne l'affichage du panneau des annotations.
	toggleAnnotationsPanel

	// [MVVM : View]
	// Masque le panneau des annotations.
	closeAnnotationsPanel

	// [MVVM : View]
	// Met à jour les compteurs et l'état visuel des boutons d' accès aux annotations.
	updateAnnotationsButton

	// [MVVM : Model]
	// Récupère la version active d' une scène.
	getActiveVersion

	// [MVVM : Model]
	// Récupère la liste des annotations pour la version active d' une scène.
	getVersionAnnotations

	// [MVVM : Model]
	// Ajoute une annotation à la version désirée.
	addVersionAnnotation

	// [MVVM : Model]
	// Supprime une annotation de la version.
	removeVersionAnnotation

	// [MVVM : Model]
	// Recherche une annotation spécifique par son ID.
	findVersionAnnotation

	// [MVVM : Model]
	// Assure la compatibilité en migrant les anciennes annotations vers le nouveau système de versions.
	migrateSceneAnnotationsToVersion

	// [MVVM : View]
	// Fait défiler l' éditeur pour centrer une annotation spécifique.
	scrollToAnnotation

	// [MVVM : View]
	// Crée une animation visuelle pour mettre en évidence une annotation dans le texte.
	highlightAnnotation

	// [MVVM : View]
	// Masque le panneau des annotations.
	closeAnnotationsPanel

29.todos.js :
	// [MVVM : View]
	// Ferme le panneau des TODOs
	closeTodosPanel

	// [MVVM : ViewModel]
	// Ouvre une scène spécifique et ferme le panneau
	goToTodoScene

	// [MVVM : ViewModel]
	// Bascule l'état d'un TODO depuis le panneau et met à jour le Model et la View
	toggleTodoFromPanel

	// [MVVM : Model]
	// Retourne le nombre total d'annotations pour une scène (logique de données)
	getSceneAnnotationCount

	// [MVVM : Model]
	// Retourne le nombre de TODOs non terminés pour une scène (logique de données)
	getSceneTodoCount

	// [MVVM : Model]
	// Gère la structure des données et la migration des annotations
	ensureAnnotationsStructure

	// [MVVM : ViewModel]
	// Initialisation globale intégrant la structure des annotations
	originalInit

	// [MVVM : ViewModel]
	// Bascule l'état d'un TODO depuis la liste et rafraîchit les interfaces
	toggleTodoFromList

	// [MVVM : ViewModel]
	// Change la vue et ouvre la scène correspondante à un TODO
	openSceneFromTodo

	// [MVVM : View]
	// Calcule et positionne le panneau d'annotations en fonction de la toolbar
	updateAnnotationsPanelPosition

30.corkboard.js :
	// [MVVM : View]
	// Rend le menu latéral ou le panneau de configuration du Cork Board
	renderCorkBoard

	// [MVVM : ViewModel]
	// Met à jour le filtre par acte et rafraîchit la vue
	updateCorkActFilter

	// [MVVM : ViewModel]
	// Met à jour le filtre par chapitre et rafraîchit la vue
	updateCorkChapterFilter

	// [MVVM : ViewModel]
	// Filtre et ouvre la vue plein écran du Cork Board
	filterAndRefreshCork

	// [MVVM : ViewModel]
	// Ferme la vue Cork Board et retourne à la vue précédente
	closeCorkBoardView

	// [MVVM : ViewModel]
	// Ouvre la vue plein écran du Cork Board et initialise les composants
	openCorkBoardView

	// [MVVM : View]
	// Génère le HTML complet pour la vue du tableau d'affichage (Cork Board)
	renderCorkBoardFullView

	// [MVVM : View]
	// Rend le HTML d'une carte individuelle (scène) pour le Cork Board
	renderCorkCard

	// [MVVM : View]
	// Affiche ou masque la palette de couleurs pour une scène
	toggleColorPalette

	// [MVVM : ViewModel]
	// Définit la couleur d'une scène dans le modèle et met à jour la vue
	setCorkColor

	// [MVVM : ViewModel]
	// Met à jour le synopsis d'une scène dans le modèle
	updateSceneSynopsis

	// [MVVM : ViewModel]
	// Ouvre une scène spécifique dans l'éditeur depuis le Cork Board
	openSceneFromCork

	// [MVVM : View]
	// Alterne l'affichage d'un acte dans la vue structurée
	toggleStructuredAct

	// [MVVM : ViewModel]
	// Crée un nouveau chapitre au sein d'un acte depuis le Cork Board
	createChapterFromCork

	// [MVVM : ViewModel]
	// Ouvre la modal pour ajouter une nouvelle scène depuis le Cork Board
	openAddSceneModalFromCork

	// [MVVM : ViewModel]
	// Crée un nouvel acte au sein du projet depuis le Cork Board
	createActFromCork

	// [MVVM : View]
	// Initialise les fonctions de glisser-déposer pour le Cork Board
	setupCorkBoardDragAndDrop

	// [MVVM : ViewModel]
	// Gère le début de l'action de glisser pour une carte
	handleCorkDragStart

	// [MVVM : ViewModel]
	// Gère la fin de l'action de glisser pour une carte
	handleCorkDragEnd

	// [MVVM : ViewModel]
	// Gère le survol d'une cible potentielle lors du glisser-déposer
	handleCorkDragOver

	// [MVVM : View]
	// Affiche une notification temporaire à l'écran
	showNotification

	// [MVVM : ViewModel]
	// Gère le dépôt d'une carte et met à jour l'ordre des scènes
	handleCorkDrop

	// [MVVM : View]
	// Met à jour dynamiquement la taille de la grille du Cork Board
	updateCorkGridSize

31.mindmap.js :
	// [MVVM : View]
	// Gère l'affichage de la liste des mindmaps dans la barre latérale.
	renderMindmapView

	// [MVVM : ViewModel]
	// Commande pour créer une nouvelle mindmap avec un titre saisi par l'utilisateur.
	createNewMindmap

	// [MVVM : ViewModel]
	// Commande pour supprimer une mindmap après confirmation.
	deleteMindmap

	// [MVVM : ViewModel]
	// Gère la sélection d'une mindmap et met à jour l'affichage.
	selectMindmap

	// [MVVM : ViewModel]
	// Commande pour renommer la mindmap actuellement sélectionnée.
	renameMindmap

	// [MVVM : View]
	// Rendu principal de la zone de travail (canvas) de la mindmap.
	renderMindmapCanvas

	// [MVVM : View]
	// Génère le code HTML pour afficher les nœuds de la mindmap.
	renderMindmapNodes

	// [MVVM : View]
	// Génère le code SVG pour afficher les liens entre les nœuds.
	renderMindmapLinks

	// [MVVM : View]
	// Génère le contenu HTML de la bibliothèque d'éléments (personnages, univers, etc.).
	renderLibraryContent

	// [MVVM : View]
	// Détermine l'icône à afficher pour un nœud en fonction de son type.
	getNodeIcon

	// [MVVM : ViewModel]
	// Extrait le contenu textuel d'un nœud pour l'affichage.
	getNodeContent

	// [MVVM : ViewModel]
	// Alterne l'état replié/déplié de la bibliothèque.
	toggleLibrary

	// [MVVM : ViewModel]
	// Change l'onglet actif dans la bibliothèque et rafraîchit son contenu.
	setLibraryTab

	// [MVVM : ViewModel]
	// Gère l'initialisation ou la finalisation de la création d'un lien entre deux nœuds.
	startLinkFrom

	// [MVVM : ViewModel]
	// Annule le processus de création de lien en cours.
	cancelLinking

	// [MVVM : ViewModel]
	// Commande pour ajouter un nœud de type note à la mindmap.
	addNoteNode

	// [MVVM : ViewModel]
	// Commande pour supprimer un nœud et ses liens associés.
	deleteNode

	// [MVVM : Mixte]
	// Affiche un modal d'édition pour les liens (Vue) et gère la logique de modification (ViewModel).
	editLink

	// [MVVM : ViewModel]
	// Réinitialise le zoom et le panoramique de la vue mindmap.
	resetMindmapView

	// [MVVM : View]
	// Initialise les écouteurs d'événements pour les interactions avec la mindmap.
	initMindmapEvents

	// [MVVM : View]
	// Initialise les événements de glisser-déposer pour les éléments de la bibliothèque.
	initLibraryDragEvents

	// [MVVM : ViewModel]
	// Gère le début du glisser-déposer tactile pour un élément de la bibliothèque.
	handleLibraryTouchStart

	// [MVVM : ViewModel]
	// Gère le mouvement du glisser-déposer tactile.
	handleLibraryTouchMove

	// [MVVM : ViewModel]
	// Gère la fin du glisser-déposer tactile et le drop sur la canvas.
	handleLibraryTouchEnd

	// [MVVM : ViewModel]
	// Nettoie les données et les clones visuels après un glisser-déposer tactile.
	cleanupTouchDrag

	// [MVVM : ViewModel]
	// Prépare les données à transférer lors du début d'un glisser-déposer (souris).
	handleLibraryDragStart

	// [MVVM : ViewModel]
	// Autorise le survol de la zone de drop.
	handleDragOver

	// [MVVM : ViewModel]
	// Gère le dépôt d'un élément de la bibliothèque sur la canvas.
	handleDrop

	// [MVVM : ViewModel]
	// Initialise le déplacement d'un nœud à la souris.
	handleNodeMouseDown

	// [MVVM : ViewModel]
	// Gère le clic (sélection/liaison) et le double-clic (navigation) sur un nœud.
	handleNodeClick

	// [MVVM : ViewModel]
	// Initialise le déplacement panoramique de la canvas.
	handleCanvasMouseDown

	// [MVVM : ViewModel]
	// Met à jour la position des nœuds ou de la canvas lors du déplacement de la souris.
	handleMouseMove

	// [MVVM : ViewModel]
	// Finalise le déplacement d'un nœud ou de la canvas.
	handleMouseUp

33.plot.js :
	// [MVVM : View]
	// Génère et affiche l'interface graphique du graphique d'intrigue (SVG) dans le conteneur principal.
	renderPlotView

	// [MVVM : ViewModel]
	// Bascule vers la vue éditeur et ouvre la scène correspondante au point d'intrigue sélectionné.
	openPlotPoint

	// [MVVM : ViewModel]
	// Permet à l'utilisateur de modifier manuellement la valeur de tension d'un point spécifique.
	editPlotPointIntensity

	// [MVVM : ViewModel]
	// Effectue une analyse statistique et narrative de la courbe de tension actuelle pour fournir un rapport.
	analyzePlotCurve

	// [MVVM : ViewModel]
	// Propose des suggestions d'amélioration de l'intrigue basées sur l'analyse de la courbe (zones plates, rythme).
	showPlotSuggestions

	// [MVVM : ViewModel]
	// Réinitialise et recalcule tous les points de tension à partir des données brutes des scènes.
	resetPlotPoints

	// [MVVM : View]
	// Affiche une information à l'utilisateur expliquant que les points sont générés automatiquement.
	addPlotPoint

	// [MVVM : ViewModel]
	// Exporte le graphique d'intrigue actuel au format SVG pour un usage externe.
	exportPlot

34.relations-graph.js :
	// [MVVM : ViewModel]
	// Initialise le processus de glisser-déposer pour un personnage.
	startDragCharacter

	// [MVVM : ViewModel]
	// Gère le clic sur un personnage, en distinguant le simple clic du glissement.
	handleCharacterClick

	// [MVVM : View]
	// Met à jour dynamiquement les lignes SVG représentant les relations entre les personnages.
	updateRelationLines

	// [MVVM : ViewModel]
	// Réinitialise toutes les positions personnalisées des personnages dans le modèle.
	resetCharacterPositions

	// [MVVM : ViewModel]
	// Calcule et applique automatiquement une disposition en cercle pour tous les personnages.
	autoArrangeCharacters

	// [MVVM : ViewModel]
	// Gère la sélection séquentielle de deux personnages pour créer une nouvelle relation.
	selectCharacterForRelation

	// [MVVM : View]
	// Affiche la boîte de dialogue modale permettant de définir les détails d'une nouvelle relation.
	createRelationModal

	// [MVVM : ViewModel]
	// Enregistre temporairement le type de relation sélectionné dans l'interface de création.
	selectRelationType

	// [MVVM : ViewModel]
	// Crée l'objet relation, l'ajoute au modèle du projet et déclenche la sauvegarde et le rafraîchissement.
	saveRelation

	// [MVVM : ViewModel]
	// Ferme la modale de création de relation et réinitialise l'état de sélection.
	closeRelationModal

	// [MVVM : Model]
	// Compte le nombre de relations d'un type spécifique présentes dans les données du projet.
	getRelationCount

	// [MVVM : ViewModel]
	// Permet de modifier la description d'une relation existante via une invite de commande.
	editRelation

	// [MVVM : ViewModel]
	// Supprime une relation du modèle après confirmation de l'utilisateur.
	deleteRelation

35.renderMap.js :
	// [MVVM : View]
	// Gère l'affichage de la carte géographique et de ses marqueurs dans l'interface utilisateur.
	renderMapView

	// [MVVM : ViewModel]
	// Permet à l'utilisateur de charger une image pour la carte via un sélecteur de fichiers.
	uploadMapImage

	// [MVVM : ViewModel]
	// Ajoute un nouveau lieu à la carte avec des coordonnées par défaut ou aléatoires.
	addMapLocation

	// [MVVM : ViewModel]
	// Permet de modifier le nom d'un marqueur existant sur la carte.
	editMapLocation

	// [MVVM : ViewModel]
	// Supprime un marqueur de la carte après confirmation.
	deleteMapLocation

	// [MVVM : ViewModel]
	// Réinitialise complètement la carte et supprime tous les marqueurs associés.
	clearMap

	// [MVVM : ViewModel]
	// Exporte les données de localisation de la carte au format JSON.
	exportMapData

36.timeline-metro.js :
	// [MVVM : View]
	// Rend la liste latérale (sidebar) des événements de la timeline.
	renderTimelineVizList

	// [MVVM : View]
	// Rend la vue principale de la timeline métro.
	renderTimelineVizView

	// [MVVM : View]
	// Génère le code SVG pour la visualisation de la timeline métro.
	renderMetroSVG

	// [MVVM : ViewModel]
	// Ouvre la modale de création ou d'édition d'un événement métro.
	openMetroEventModal

	// [MVVM : ViewModel]
	// Met à jour l'affichage des personnages liés dans la modale d'événement.
	updateMetroLinkedChars

	// [MVVM : ViewModel]
	// Retire un personnage de la sélection dans la modale d'événement.
	removeMetroCharFromEvent

	// [MVVM : ViewModel]
	// Enregistre les modifications d'un événement métro.
	saveMetroEvent

	// [MVVM : Model]
	// Réorganise les ordres des événements pour qu'ils soient séquentiels.
	normalizeMetroEventOrder

	// [MVVM : ViewModel]
	// Déplace un événement vers le haut ou le bas dans l'ordre.
	moveMetroEvent

	// [MVVM : ViewModel]
	// Supprime un événement de la timeline métro.
	deleteMetroEvent

	// [MVVM : ViewModel]
	// Ouvre la scène liée à un événement dans l'éditeur.
	openMetroLinkedScene

	// [MVVM : ViewModel]
	// Affiche la modale de choix de vue lors de l'ouverture d'un événement depuis l'éditeur.
	openMetroEventFromScene

	// [MVVM : ViewModel]
	// Bascule vers la vue complète de la timeline pour un événement donné.
	openMetroEventFullView

	// [MVVM : ViewModel]
	// Ouvre la timeline métro en vue partagée (split view).
	openMetroEventSplitView

	// [MVVM : ViewModel]
	// Ouvre le sélecteur de couleur pour un personnage.
	openMetroColorPicker

	// [MVVM : ViewModel]
	// Sélectionne une couleur dans le sélecteur de couleur.
	selectMetroColor

	// [MVVM : ViewModel]
	// Applique la couleur sélectionnée au personnage et met à jour le modèle.
	applyMetroColor

	// [MVVM : ViewModel]
	// Rafraîchit l'affichage de la timeline (vue normale ou partagée).
	refreshTimelineView

	// [MVVM : ViewModel]
	// Trie la timeline métro par date.
	sortMetroByDate

	// [MVVM : ViewModel]
	// Efface tous les événements de la timeline métro.
	clearMetroTimeline

	// [MVVM : ViewModel]
	// Exporte la timeline métro au format CSV.
	exportMetroTimelineCSV

	// [MVVM : ViewModel]
	// Ajoute un événement (legacy).
	addTimelineVizEvent

	// [MVVM : ViewModel]
	// Modifie un événement (legacy).
	editTimelineVizEvent

	// [MVVM : ViewModel]
	// Trie par date (legacy).
	sortTimelineByDate

	// [MVVM : ViewModel]
	// Efface la timeline (legacy).
	clearTimeline

	// [MVVM : ViewModel]
	// Exporte la timeline (legacy).
	exportTimelineViz

	// [MVVM : ViewModel]
	// Importe des événements depuis un fichier CSV.
	importTimelineCSV

	// [MVVM : ViewModel]
	// Analyse le contenu d'un CSV d'importation.
	parseMetroTimelineCSV

	// [MVVM : ViewModel]
	// Exporte au format CSV (legacy).
	exportTimelineCSV

37.theme-manager.js :
	// [MVVM : Modèle]
	// Utilitaire de conversion de couleur pour le stockage et le traitement des données de thème.
	rgbaToHex

	// [MVVM : Vue]
	// Crée et affiche l'interface utilisateur (modal) du gestionnaire de thèmes.
	openThemeManager

	// [MVVM : Vue]
	// Génère et affiche la liste des thèmes prédéfinis dans l'interface.
	renderPresetThemes

	// [MVVM : Vue]
	// Génère et affiche la liste des thèmes personnalisés dans l'interface.
	renderCustomThemes

	// [MVVM : ViewModel]
	// Logique de coordination pour appliquer un thème prédéfini et mettre à jour l'éditeur.
	applyPresetTheme

	// [MVVM : ViewModel]
	// Logique de coordination pour appliquer un thème personnalisé et mettre à jour l'éditeur.
	applyCustomTheme

	// [MVVM : ViewModel]
	// Logique de transition pour supprimer un thème et mettre à jour l'interface.
	deleteCustomTheme

	// [MVVM : ViewModel]
	// Récupère les valeurs de l'éditeur pour les appliquer au document.
	applyCurrentEditorColors

	// [MVVM : ViewModel]
	// Gère le flux de sauvegarde d'un nouveau thème personnalisé.
	saveThemeAsCustom

	// [MVVM : ViewModel]
	// Prépare et lance l'exportation du thème actuellement édité.
	exportCurrentTheme

	// [MVVM : ViewModel]
	// Coordonne l'importation de fichier et la décision de l'utilisateur.
	importThemeFile

	// [MVVM : ViewModel]
	// Restaure les couleurs par défaut du document et de l'éditeur.
	resetToDefault

38.tension.js :
	// [MVVM : Model]
	// Récupère les mots de tension (personnalisés ou par défaut) depuis le localStorage.
	getTensionWords

	// [MVVM : Model]
	// Sauvegarde les mots de tension dans le localStorage.
	saveTensionWordsToStorage

	// [MVVM : View]
	// Ouvre le modal de l'éditeur de mots de tension et déclenche le chargement des données.
	openTensionWordsEditor

	// [MVVM : ViewModel]
	// Récupère les données et met à jour l'affichage de l'éditeur pour les trois catégories de tension.
	loadTensionWordsInEditor

	// [MVVM : View]
	// Génère le fragment HTML représentant un mot avec son bouton de suppression.
	createWordElement

	// [MVVM : ViewModel]
	// Valide et ajoute un nouveau mot à une catégorie spécifique, puis met à jour le modèle et la vue.
	addTensionWord

	// [MVVM : ViewModel]
	// Supprime un mot par son index dans une catégorie, puis met à jour le modèle et la vue.
	removeTensionWord

	// [MVVM : View]
	// Ferme le modal et informe l'utilisateur que les modifications ont été enregistrées.
	saveTensionWords

	// [MVVM : ViewModel]
	// Restaure le dictionnaire par défaut après confirmation, puis met à jour le modèle et la vue.
	resetTensionWordsToDefault

	// [MVVM : ViewModel]
	// Formate les dictionnaires actuels et déclenche le téléchargement d'un fichier texte.
	exportTensionWords

	// [MVVM : View]
	// Configure et affiche le modal d'importation en masse pour une catégorie donnée.
	openBulkImport

	// [MVVM : ViewModel]
	// Récupère la source d'importation (texte ou fichier) et orchestre le processus de lecture.
	processBulkImport

	// [MVVM : ViewModel]
	// Analyse le texte brut, filtre les doublons et les mots vides, puis intègre les résultats au modèle.
	importWordsFromText

39.export.js :
	// [MVVM : View]
	// Génère et affiche l'arborescence des éléments (actes, chapitres, scènes) à exporter.
	renderExportTree

	// [MVVM : ViewModel]
	// Alterne la sélection de l'ensemble des éléments du projet pour l'export.
	toggleAllScenes

	// [MVVM : ViewModel]
	// Gère le changement d'état de sélection d'une scène et met à jour les parents (chapitre, acte).
	toggleScene

	// [MVVM : View]
	// Met à jour les informations textuelles affichées selon le format d'export choisi.
	updateExportFormatInfo

	// [MVVM : ViewModel]
	// Récupère les options de l'interface et lance le processus d'exportation approprié.
	executeNovelExport

	// [MVVM : ViewModel]
	// Coche ou décoche toutes les options additionnelles d'export (personnages, univers, etc.).
	toggleAllExportOptions

	// [MVVM : ViewModel]
	// Extrait et structure les données du projet sélectionnées pour l'exportation.
	getSelectedContent

	// [MVVM : autre]
	// Génère et télécharge le contenu du projet au format DOCX (utilisant la bibliothèque docx).
	exportAsDOCX

	// [MVVM : autre]
	// Compile le roman et ses annexes (personnages, univers, etc.) dans une archive ZIP.
	exportProjectAsZip

	// [MVVM : autre]
	// Formate les données sélectionnées en syntaxe Markdown.
	generateMarkdownContent

	// [MVVM : autre]
	// Formate les données sélectionnées en texte brut.
	generateTXTContent

	// [MVVM : autre]
	// Formate les données sélectionnées en document HTML structuré.
	generateHTMLContent

	// [MVVM : autre]
	// Génère le blob binaire pour un document DOCX à partir du contenu structuré.
	generateDOCXBlob

	// [MVVM : autre]
	// Gère le téléchargement d'un fichier par le navigateur à partir d'un contenu et d'un type MIME.
	downloadFile

41.storageMonitoring.js :
	// [MVVM : ViewModel]
	// Initialise la surveillance du stockage, vérifie la présence des éléments UI et déclenche les premières mises à jour.
	initStorageMonitoring

	// [MVVM : Model]
	// Récupère les données brutes de quota et d'utilisation du stockage via l'API Storage Estimate ou un fallback.
	getStorageSize

	// [MVVM : ViewModel]
	// Surveille les seuils de stockage et décide d'afficher des alertes ou de réinitialiser l'état des avertissements.
	checkStorageQuota

	// [MVVM : View]
	// Affiche une boîte de dialogue de confirmation et redirige vers l'export ou les détails selon le choix utilisateur.
	showStorageAlert

	// [MVVM : View]
	// Affiche une alerte critique en cas d'échec de sauvegarde pour cause d'espace insuffisant.
	handleStorageError

43.arcs.js :
	// [MVVM : View]
	// Génère le code HTML pour l'icône d'un type d'arc.
	renderArcTypeIcon

	// [MVVM : Model]
	// Initialise la structure de données des arcs narratifs dans le projet si elle n'existe pas.
	initNarrativeArcs

	// [MVVM : View]
	// Rend le HTML de la liste des arcs narratifs dans la barre latérale.
	renderArcsList

	// [MVVM : View]
	// Rend le HTML de l'état initial ou vide de la vue des arcs.
	renderArcsWelcome

	// [MVVM : ViewModel]
	// Gère l'ouverture des détails d'un arc en basculant vers l'éditeur.
	openArcDetail

	// [MVVM : ViewModel]
	// Initialise un nouvel objet arc et affiche l'éditeur pour sa création.
	createNewArc

	// [MVVM : View]
	// Génère et affiche le formulaire d'édition (création ou modification) d'un arc.
	renderArcEditor

	// [MVVM : ViewModel]
	// Prépare l'édition d'un arc existant en ouvrant l'éditeur.
	editArcInline

	// [MVVM : ViewModel]
	// Annule l'édition en cours et revient à la vue d'accueil.
	cancelArcEdit

	// [MVVM : View]
	// Alterne la visibilité du panneau des arcs pour une scène.
	toggleArcScenePanel

	// [MVVM : View]
	// Affiche le panneau de gestion des arcs narratifs pour la scène courante.
	renderArcScenePanel

	// [MVVM : ViewModel]
	// Met à jour le statut d'avancement d'un arc pour la scène courante.
	updateArcStatus

	// [MVVM : ViewModel]
	// Enregistre les notes spécifiques à un arc pour la scène courante.
	updateArcNotes

44.storygrid.js :
	// [MVVM : View]
	// Ferme une modale et la supprime du DOM si elle est dynamique.
	closeModal

	// [MVVM : Model]
	// Initialise les données du Story Grid dans le projet si nécessaire et charge l'état.
	initStoryGrid

	// [MVVM : Model]
	// Migre les anciennes cartes vers le nouveau système hiérarchique et ajoute les champs de liaison.
	migrateOldCards

	// [MVVM : Model]
	// Crée automatiquement des lignes de base à partir des personnages, arcs et lieux du projet.
	autoCreateRowsFromProject

	// [MVVM : Model]
	// Sauvegarde les données du Story Grid dans l'objet projet global.
	saveStoryGridData

	// [MVVM : ViewModel]
	// Génère la structure des colonnes de la timeline en fonction du niveau de zoom (Acte, Chapitre, Scène).
	getTimelineColumns

	// [MVVM : ViewModel]
	// Récupère toutes les scènes appartenant à un acte donné.
	getAllScenesFromAct

	// [MVVM : Model]
	// Lie automatiquement une carte à une entité (personnage, arc, lieu) selon le type de ligne.
	autoLinkCardToRow

	// [MVVM : ViewModel]
	// Retrouve une colonne de la timeline par son identifiant.
	getColumnFromId

	// [MVVM : ViewModel]
	// Vérifie si une carte correspond à une colonne selon la structure hiérarchique.
	matchesColumn

	// [MVVM : ViewModel]
	// Gère la suppression d'une carte en distinguant l'originale d'un duplicata (jumelle).
	deleteCardContextual

	// [MVVM : Model]
	// Recherche une carte par son identifiant dans toutes les lignes.
	findCardById

	// [MVVM : ViewModel]
	// Détermine si une carte doit être affichée sur une ligne donnée (carte originale ou jumelle).
	shouldCardAppearOnRow

	// [MVVM : ViewModel]
	// Récupère la liste de toutes les cartes à afficher pour une cellule (incluant les jumelles).
	getCardsForCell

	// [MVVM : ViewModel]
	// Compte le nombre total d'occurrences d'une carte dans la grille.
	getCardTwinCount

	// [MVVM : Other]
	// Retire un personnage d'une carte, sauvegarde et redessine.
	removeCharacterFromCard

	// [MVVM : Other]
	// Associe un arc narratif à une carte, sauvegarde et redessine.
	addArcToCard

	// [MVVM : Other]
	// Retire un arc narratif d'une carte, sauvegarde et redessine.
	removeArcFromCard

	// [MVVM : ViewModel]
	// Supprime l'association d'une carte avec l'entité source d'une ligne donnée.
	removeCardAssociation

	// [MVVM : Other]
	// Associe un lieu à une carte, sauvegarde et redessine.
	addLocationToCard

	// [MVVM : Other]
	// Retire un lieu d'une carte, sauvegarde et redessine.
	removeLocationFromCard

	// [MVVM : View]
	// Applique un style de surbrillance aux cartes jumelles d'une carte donnée.
	highlightTwinCards

	// [MVVM : View]
	// Retire la surbrillance de toutes les cartes jumelles.
	unhighlightTwinCards

	// [MVVM : Other]
	// Crée un lien entre deux cartes, sauvegarde et redessine.
	addCardLink

	// [MVVM : Other]
	// Supprime un lien entre deux cartes, sauvegarde et redessine.
	deleteCardLink

	// [MVVM : Other]
	// Change le mode de vue de la grille et applique les filtres correspondants.
	setStoryGridViewMode

	// [MVVM : Other]
	// Définit le niveau de zoom de la grille et redessine.
	setStoryGridZoom

	// [MVVM : Other]
	// Filtre les lignes affichées par type et redessine.
	filterStoryGridRows

	// [MVVM : View]
	// Fonction de rendu principale qui génère l'ensemble de l'interface du Story Grid.
	renderStoryGrid

	// [MVVM : View]
	// Génère le HTML de la barre d'outils (navigation, zoom, actions).
	renderStoryGridToolbar

	// [MVVM : View]
	// Génère le HTML des en-têtes de lignes (titres et icônes à gauche).
	renderStoryGridRowHeaders

	// [MVVM : View]
	// Génère le HTML des en-têtes de colonnes (Actes, Chapitres, Scènes en haut).
	renderStoryGridColumnHeaders

	// [MVVM : View]
	// Génère le corps de la grille contenant les cellules et les cartes.
	renderStoryGridBody

	// [MVVM : ViewModel]
	// Calcule combien de colonnes une carte doit occuper (span) selon son contexte.
	calculateCardSpan

	// [MVVM : ViewModel]
	// Vérifie si une entité est présente dans une scène spécifique du projet.
	checkRowColumnContent

	// [MVVM : View]
	// Génère l'indicateur visuel pour le contenu détecté automatiquement dans le projet.
	renderAutoCard

	// [MVVM : View]
	// Génère le HTML d'une carte individuelle (originale ou jumelle).
	renderStoryGridCard

	// [MVVM : View]
	// Génère les badges de liaison (personnages, arcs, lieux) affichés sur une carte.
	renderCardLinkBadges

	// [MVVM : View]
	// Génère les indicateurs visuels de l'intensité dramatique.
	renderIntensityDots

	// [MVVM : Other]
	// Tronque un texte s'il dépasse une longueur maximale.
	truncateText

	// [MVVM : View]
	// Dessine les liens SVG entre les cartes dans la grille.
	renderStoryGridLinks

	// [MVVM : Other]
	// Initialise le drag & drop d'une carte vers une autre cellule.
	handleCardDragStart

	// [MVVM : Other]
	// Nettoie l'état de drag & drop à la fin du déplacement d'une carte.
	handleCardDragEnd

	// [MVVM : Other]
	// Gère le survol d'une zone de dépôt lors du glissement d'une carte.
	handleCardDragOver

	// [MVVM : Other]
	// Gère la sortie d'une zone de dépôt lors du glissement d'une carte.
	handleCardDragLeave

	// [MVVM : Other]
	// Gère le dépôt d'une carte sur une autre carte, redirige vers la cellule parente.
	handleCardDropOnCard

	// [MVVM : Other]
	// Gère le survol d'une carte lors du glissement d'une autre carte.
	handleCardDragOverOnCard

	// [MVVM : Other]
	// Gère la sortie du survol d'une carte lors du glissement.
	handleCardDragLeaveOnCard

	// [MVVM : Other]
	// Gère le dépôt d'une carte sur un élément enfant d'une cellule.
	handleCellChildDrop

	// [MVVM : Other]
	// Gère le survol d'un élément enfant d'une cellule lors du glissement.
	handleCellChildDragOver

	// [MVVM : Other]
	// Gère la sortie du survol d'un élément enfant d'une cellule.
	handleCellChildDragLeave

	// [MVVM : Other]
	// Gère le dépôt effectif d'une carte dans une cellule.
	handleCardDrop

	// [MVVM : View]
	// Initialise les écouteurs d'événements pour le glisser-déposer des lignes.
	initRowDragDrop

	// [MVVM : Other]
	// Démarre le glissement d'une ligne (réordonnancement).
	handleRowDragStart

	// [MVVM : Other]
	// Termine le glissement d'une ligne et nettoie les styles.
	handleRowDragEnd

	// [MVVM : Other]
	// Gère le survol d'une ligne lors du réordonnancement.
	handleRowDragOver

	// [MVVM : Other]
	// Gère le dépôt d'une ligne pour changer son ordre.
	handleRowDrop

	// [MVVM : View]
	// Initialise tous les écouteurs d'événements (pan, zoom, drag & drop délégué).
	initStoryGridEventListeners

	// [MVVM : Other]
	// Gère le début du glissement d'une carte via délégation d'événements.
	handleDelegatedDragStart

	// [MVVM : Other]
	// Gère la fin du glissement d'une carte via délégation.
	handleDelegatedDragEnd

	// [MVVM : Other]
	// Gère le survol des cellules lors d'un glissement délégué.
	handleDelegatedDragOver

	// [MVVM : Other]
	// Gère la sortie d'une cellule lors d'un glissement délégué.
	handleDelegatedDragLeave

	// [MVVM : Other]
	// Gère le dépôt d'une carte dans une cellule via délégation.
	handleDelegatedDrop

	// [MVVM : ViewModel]
	// Détermine l'ID de colonne approprié pour une carte selon le niveau de zoom actuel.
	getCardColumnId

	// [MVVM : Other]
	// Démarre le déplacement panoramique (pan) de la grille.
	handlePanStart

	// [MVVM : Other]
	// Gère le mouvement panoramique de la grille.
	handlePanMove

	// [MVVM : Other]
	// Arrête le déplacement panoramique de la grille.
	handlePanEnd

	// [MVVM : Other]
	// Gère le zoom à la molette (Ctrl + Wheel).
	handleWheelZoom

	// [MVVM : ViewModel]
	// Gère la logique de passage d'un niveau de zoom à l'autre.
	zoomStoryGrid

	// [MVVM : View]
	// Affiche ou masque le panneau des filtres de la grille.
	toggleStoryGridFilters

	// [MVVM : Other]
	// Active ou désactive un filtre de type de ligne et redessine la grille.
	toggleRowTypeFilter

	// [MVVM : ViewModel]
	// Récupère le libellé textuel correspondant à un mode de vue.
	getViewModeLabel

	// [MVVM : Other]
	// Active l'édition interactive du titre d'une ligne via un champ input temporaire.
	editRowTitle

	// [MVVM : ViewModel]
	// Crée une carte et ouvre immédiatement sa modale de détail.
	quickAddCard

	// [MVVM : View]
	// Ouvre la modale permettant d'ajouter une nouvelle ligne à la grille.
	openAddRowModal

	// [MVVM : View]
	// Met à jour les options de source (personnages, arcs...) dans la modale d'ajout de ligne.
	updateRowSourceOptions

	// [MVVM : Other]
	// Valide et crée la ligne demandée via la modale.
	confirmAddRow

	// [MVVM : View]
	// Ouvre le menu contextuel (options) d'une ligne à l'emplacement du clic.
	openRowOptionsMenu

	// [MVVM : View]
	// Ouvre la modale de modification des propriétés d'une ligne.
	editRowProperties

	// [MVVM : Other]
	// Sauvegarde les modifications apportées aux propriétés d'une ligne.
	saveRowProperties

	// [MVVM : Other]
	// Demande confirmation avant de supprimer une ligne.
	confirmDeleteRow

	// [MVVM : View]
	// Ouvre la modale de détail d'une carte pour édition complète.
	openCardDetail

	// [MVVM : View]
	// Génère le HTML de la section des liaisons (personnages, arcs, lieux) dans la modale.
	renderCardEntityLinks

	// [MVVM : View]
	// Génère le HTML de la liste des personnages liés à une carte.
	renderCardCharacters

	// [MVVM : View]
	// Génère le HTML de la liste des arcs narratifs liés à une carte.
	renderCardArcs

	// [MVVM : View]
	// Génère le HTML de la liste des lieux liés à une carte.
	renderCardLocations

	// [MVVM : View]
	// Rafraîchit l'affichage des liens dans la modale de détail d'une carte.
	refreshCardDetailLinks

	// [MVVM : View]
	// Ouvre une modale pour sélectionner et ajouter un personnage à une carte.
	openAddCharacterToCardModal

	// [MVVM : Other]
	// Sélectionne un personnage pour l'ajouter à une carte et rafraîchit la vue.
	selectCharacterForCard

	// [MVVM : View]
	// Ouvre une modale pour sélectionner et ajouter un arc narratif à une carte.
	openAddArcToCardModal

	// [MVVM : Other]
	// Sélectionne un arc pour l'ajouter à une carte et rafraîchit la vue.
	selectArcForCard

	// [MVVM : View]
	// Ouvre une modale pour sélectionner et ajouter un lieu à une carte.
	openAddLocationToCardModal

	// [MVVM : Other]
	// Sélectionne un lieu pour l'ajouter à une carte et rafraîchit la vue.
	selectLocationForCard

	// [MVVM : View]
	// Génère le HTML de la liste des liens entre cartes pour la modale de détail.
	renderCardLinks

	// [MVVM : Other]
	// Met à jour l'intensité d'une carte et modifie l'UI sans rendu complet.
	updateCardIntensity

	// [MVVM : Other]
	// Demande confirmation avant de supprimer une carte.
	confirmDeleteCard

	// [MVVM : View]
	// Ouvre la modale pour créer un lien entre la carte actuelle et une autre carte.
	openAddLinkModal

	// [MVVM : Other]
	// Valide et crée le lien entre cartes suite à la sélection en modale.
	confirmAddLink

	// [MVVM : View]
	// Ouvre la modale des paramètres généraux du Story Grid.
	openStoryGridSettings

	// [MVVM : Other]
	// Sauvegarde les paramètres de la grille et ferme la modale.
	saveStoryGridSettings

	// [MVVM : Other]
	// Réinitialise complètement le Story Grid (supprime tout et recrée les lignes de base).
	resetStoryGrid

	// [MVVM : View]
	// Affiche l'écran d'accueil vide du Story Grid quand aucun contenu n'est ouvert.
	renderStoryGridWelcome

	// [MVVM : Other]
	// Lie une scène du manuscrit à une carte existante et synchronise les données.
	linkSceneToCard

	// [MVVM : Model]
	// Exporte les données du Story Grid au format JSON pour téléchargement.
	exportStoryGridData

	// [MVVM : Other]
	// Importe des données Story Grid à partir d'un fichier JSON.
	importStoryGridData

	// [MVVM : View]
	// Ouvre la modale de navigation pour choisir comment visualiser une scène liée.
	showSceneNavigationModal

	// [MVVM : ViewModel]
	// Ferme la modale et navigue vers la vue Structure pour éditer une scène.
	navigateToSceneFromGrid

	// [MVVM : ViewModel]
	// Ouvre une scène en mode vue séparée (Split-View) tout en gardant la grille visible.
	openSceneInSplitViewFromGrid

45.arc-board.js :
	// [MVVM : Model]
	// Initialise les structures de données de l'Arc Board si elles n'existent pas (catégories et arcs).
	initArcBoard

	// [MVVM : View]
	// Affiche la barre latérale contenant la liste des arcs narratifs groupés par catégorie.
	renderArcsBoardSidebar

	// [MVVM : View]
	// Génère le code HTML du formulaire de création de catégorie.
	renderInlineCategoryForm

	// [MVVM : Other]
	// Raccourci vers showInlineCategoryForm pour compatibilité.
	showAddCategoryModal

	// [MVVM : ViewModel]
	// Annule l'affichage du formulaire de création de catégorie.
	cancelInlineCategoryForm

	// [MVVM : ViewModel]
	// Gère les touches Enter et Escape dans le formulaire de catégorie.
	handleInlineCategoryKeydown

	// [MVVM : View]
	// Génère le code HTML du formulaire de création/édition d'arc narratif.
	renderInlineArcForm

	// [MVVM : View]
	// Génère le code HTML pour un arc individuel dans l'arborescence de la barre latérale.
	renderArcTreeItem

	// [MVVM : ViewModel]
	// Annule l'affichage du formulaire d'arc.
	cancelInlineArcForm

	// [MVVM : ViewModel]
	// Gère les touches clavier dans le formulaire d'arc.
	handleInlineArcKeydown

	// [MVVM : View]
	// Met à jour dynamiquement la couleur sélectionnée dans le formulaire selon la catégorie choisie.
	updateInlineArcColor

	// [MVVM : ViewModel]
	// Déclenche l'affichage du formulaire de création d'arc.
	createNewArcBoard

	// [MVVM : View]
	// Ferme la modale de création d'arc si l'utilisateur clique en dehors.
	closeCreateArcModal

	// [MVVM : View]
	// Rendu principal de l'interface du canvas Arc Board (toolbar, wrapper, canvas).
	renderArcBoardCanvas

	// [MVVM : View]
	// Rendu de tous les éléments (items) physiques présents sur le board.
	renderArcBoardItems

	// [MVVM : View]
	// Dispatcher de rendu pour un item du board selon son type.
	renderArcItem

	// [MVVM : View]
	// Génère le code HTML d'une colonne sur le board.
	renderArcColumn

	// [MVVM : View]
	// Génère le code HTML d'une carte à l'intérieur d'une colonne.
	renderArcCard

	// [MVVM : Other]
	// Supprime une carte d'une colonne et met à jour les données du projet.
	deleteArcCard

	// [MVVM : View]
	// Supprime les classes de feedback visuel à la fin du drag d'une carte.
	handleCardDragEnd

	// [MVVM : View]
	// Génère le code HTML d'une note flottante.
	renderArcNote

	// [MVVM : View]
	// Génère le code HTML d'une image flottante.
	renderArcImage

	// [MVVM : View]
	// Génère le code HTML d'un lien flottant.
	renderArcLink

	// [MVVM : View]
	// Génère le code HTML d'une liste de tâches flottante.
	renderArcTodo

	// [MVVM : View]
	// Génère le code HTML d'un commentaire flottant.
	renderArcComment

	// [MVVM : View]
	// Génère le code HTML d'un tableau flottant.
	renderArcTable

	// [MVVM : View]
	// Rendu par défaut du panneau contextuel (informations de l'arc et stats).
	renderArcContextDefault

	// [MVVM : Other]
	// Détermine et affiche le contenu du panneau contextuel selon l'item sélectionné.
	renderArcContextForItem

	// [MVVM : View]
	// Rendu des contrôles contextuels pour une colonne.
	renderColumnContextPanel

	// [MVVM : View]
	// Rendu des contrôles contextuels pour du texte (formatage, alignement).
	renderTextContextPanel

	// [MVVM : View]
	// Rendu des contrôles contextuels pour une image.
	renderImageContextPanel

	// [MVVM : View]
	// Rendu des contrôles contextuels pour une liste de tâches.
	renderTodoContextPanel

	// [MVVM : View]
	// Rendu des contrôles contextuels pour un tableau.
	renderTableContextPanel

	// [MVVM : View]
	// Rendu par défaut pour les types d'items non spécifiés.
	renderDefaultContextPanel

	// [MVVM : Other]
	// Bascule la visibilité du panneau contextuel à droite.
	toggleArcContextPanel

	// [MVVM : Other]
	// Active ou désactive le mode de création de connexions.
	toggleConnectionMode

	// [MVVM : Other]
	// Annule le mode connexion et réinitialise l'état associé.
	cancelConnectionMode

	// [MVVM : Other]
	// Gère la logique de sélection source/cible pour créer une connexion entre deux éléments.
	handleConnectionClick

	// [MVVM : Other]
	// Calcule géométriquement les meilleurs côtés (top, bottom, left, right) pour relier deux éléments.
	calculateBestConnectionSides

	// [MVVM : View]
	// Dessine toutes les connexions SVG sur le board pour l'arc actuel.
	renderArcConnections

	// [MVVM : Other]
	// Calcule la position (x, y) d'un point d'ancrage sur le bord d'un élément.
	getElementPosition

	// [MVVM : Other]
	// Génère la chaîne de caractères (path) pour une courbe de Bézier entre deux points.
	createBezierPath

	// [MVVM : Other]
	// Sélectionne une connexion et met à jour l'état visuel.
	selectArcConnection

	// [MVVM : Other]
	// Supprime tous les éléments (items et connexions) actuellement sélectionnés.
	deleteSelectedItems

	// [MVVM : ViewModel]
	// Gère l'événement mousedown sur le canvas (début du pan ou désélection).
	handleCanvasMouseDown

	// [MVVM : ViewModel]
	// Gère le mouvement de la souris sur le canvas (pan, drag d'item, resize).
	handleCanvasMouseMove

	// [MVVM : ViewModel]
	// Gère la fin des interactions souris sur le canvas.
	handleCanvasMouseUp

	// [MVVM : ViewModel]
	// Gère le zoom via la molette de la souris (avec Ctrl).
	handleCanvasWheel

	// [MVVM : ViewModel]
	// Empêche le menu contextuel par défaut et affiche celui du canvas.
	handleCanvasContextMenu

	// [MVVM : View]
	// Applique physiquement les transformations CSS (scale et translate) au DOM du canvas.
	updateCanvasTransform

	// [MVVM : Other]
	// Modifie le facteur de zoom du board et met à jour l'affichage.
	zoomArcBoard

	// [MVVM : Other]
	// Réinitialise le zoom à 100% et recentre le canvas.
	resetArcZoom

	// [MVVM : Other]
	// Définit l'outil actif (sélection, pan, connexion) et met à jour les curseurs et boutons.
	setArcTool

	// [MVVM : Other]
	// Crée et ajoute un nouvel élément (colonne, note, image, etc.) sur le board.
	addArcItem

	// [MVVM : Other]
	// Ajoute une nouvelle carte d'un type spécifique à une colonne donnée.
	addCardToColumn

	// [MVVM : Other]
	// Gère la sélection d'un item sur le board (simple ou multi-sélection avec Ctrl).
	selectArcItem

	// [MVVM : ViewModel]
	// Sélectionne une carte (actuellement en sélectionnant sa colonne parente).
	selectArcCard

	// [MVVM : Other]
	// Désélectionne tous les éléments du board et réinitialise le panneau contextuel.
	deselectAllArcItems

	// [MVVM : ViewModel]
	// Gère le début du drag d'un item (initialisation des positions).
	handleItemMouseDown

	// [MVVM : ViewModel]
	// Gère le déplacement d'un item pendant le drag.
	handleItemDrag

	// [MVVM : Other]
	// Termine le drag d'un item et enregistre sa nouvelle position.
	endItemDrag

	// [MVVM : ViewModel]
	// Initialise le redimensionnement d'une colonne.
	startColumnResize

	// [MVVM : ViewModel]
	// Gère le redimensionnement dynamique d'une colonne pendant le drag.
	handleColumnResizeDrag

	// [MVVM : Other]
	// Termine le redimensionnement d'une colonne et enregistre sa largeur.
	endColumnResize

	// [MVVM : Other]
	// Met à jour le titre d'un item dans les données du projet.
	updateArcItemTitle

	// [MVVM : Other]
	// Met à jour le contenu textuel d'un item.
	updateArcItemContent

	// [MVVM : Other]
	// Met à jour la largeur d'un item et rafraîchit l'affichage.
	updateArcItemWidth

	// [MVVM : Other]
	// Met à jour le titre global de l'arc narratif actuel.
	updateCurrentArcTitle

	// [MVVM : Other]
	// Met à jour le contenu d'une carte spécifique.
	updateArcCardContent

	// [MVVM : Other]
	// Met à jour le titre d'une carte spécifique.
	updateArcCardTitle

	// [MVVM : Other]
	// Ajoute une tâche à une carte de type to-do.
	addArcTodoItem

	// [MVVM : Other]
	// Bascule l'état de complétion d'une tâche dans une carte.
	toggleArcTodo

	// [MVVM : Other]
	// Met à jour le texte d'une tâche dans une carte.
	updateArcTodoText

	// [MVVM : Other]
	// Ajoute une tâche à un item flottant de type to-do.
	addFloatingTodoItem

	// [MVVM : Other]
	// Bascule l'état de complétion d'une tâche dans un item flottant.
	toggleFloatingTodo

	// [MVVM : Other]
	// Met à jour le texte d'une tâche dans un item flottant.
	updateFloatingTodoText

	// [MVVM : Other]
	// Met à jour la valeur d'une cellule dans un tableau.
	updateArcTableCell

	// [MVVM : Other]
	// Modifie les dimensions (lignes ou colonnes) d'un tableau.
	updateArcTableSize

	// [MVVM : Other]
	// Gère l'entrée d'une URL pour une carte lien dans une colonne.
	handleLinkInput

	// [MVVM : Other]
	// Gère l'entrée d'une URL pour un item lien flottant.
	handleFloatingLinkInput

	// [MVVM : View]
	// Déclenche le clic sur l'input file masqué pour l'upload global au board.
	triggerArcUpload

	// [MVVM : View]
	// Déclenche l'upload d'image pour un item spécifique.
	triggerItemImageUpload

	// [MVVM : View]
	// Déclenche l'upload d'image pour une carte spécifique dans une colonne.
	triggerCardImageUpload

	// [MVVM : Other]
	// Lit le fichier uploadé et met à jour l'élément cible (item ou carte) avec l'image Base64.
	handleArcFileUpload

	// [MVVM : Other]
	// Met à jour la source d'image d'un item flottant et enregistre.
	updateItemImage

	// [MVVM : Other]
	// Met à jour la source d'image d'une carte dans une colonne et enregistre.
	updateCardImage

	// [MVVM : Other]
	// Supprime un item du board ainsi que toutes ses connexions associées.
	deleteArcItem

	// [MVVM : Other]
	// Applique une commande de formatage de texte (gras, italique, etc.) au texte sélectionné.
	formatArcText

	// [MVVM : Other]
	// Insère une balise code dans l'éditeur de texte actuel.
	insertArcCode

	// [MVVM : ViewModel]
	// Initialise le transfert de données pour le drag d'une carte.
	handleCardDragStart

	// [MVVM : ViewModel]
	// Initialise le transfert de données pour le drag d'un item flottant.
	handleFloatingDragStart

	// [MVVM : View]
	// Réinitialise les styles visuels après le drag d'un item flottant.
	handleFloatingDragEnd

	// [MVVM : View]
	// Gère le survol d'une colonne pendant un drag (feedback visuel).
	handleCardDragOver

	// [MVVM : View]
	// Gère la sortie de survol d'une colonne pendant un drag.
	handleCardDragLeave

	// [MVVM : Other]
	// Gère le drop sur une colonne (déplacement de carte ou conversion d'item flottant en carte).
	handleCardDrop

	// [MVVM : Other]
	// Gère le drop sur le canvas (conversion d'une carte en item flottant à la position du drop).
	handleCanvasDrop

	// [MVVM : View]
	// Gère le dragover sur le canvas pour permettre le drop de cartes.
	handleCanvasDragOver

	// [MVVM : View]
	// Réinitialise le feedback visuel quand le drag quitte le canvas.
	handleCanvasDragLeave

	// [MVVM : Model]
	// Logique de conversion : transforme les données d'un item flottant en structure de carte.
	convertFloatingToCard

	// [MVVM : Model]
	// Logique de conversion : transforme les données d'une carte en structure d'item flottant.
	convertCardToFloating

	// [MVVM : View]
	// Affiche le menu contextuel personnalisé sur le canvas.
	showCanvasContextMenu

	// [MVVM : View]
	// Affiche le menu contextuel personnalisé pour un arc spécifique dans la sidebar.
	showArcContextMenu

	// [MVVM : View]
	// Supprime le menu contextuel personnalisé du DOM.
	removeContextMenu

	// [MVVM : Other]
	// Ajoute un nouvel item sur le board à une position spécifique (via menu contextuel).
	addArcItemAtPosition

	// [MVVM : Other]
	// Supprime définitivement un arc narratif après confirmation.
	deleteArc

	// [MVVM : Other]
	// Duplique un arc narratif complet avec de nouveaux identifiants pour tous ses éléments.
	duplicateArc

	// [MVVM : Other]
	// Renomme un arc narratif via une boîte de dialogue prompt.
	renameArc

	// [MVVM : View]
	// (Ancien système) Ferme la modale d'ajout de catégorie.
	closeAddCategoryModal

	// [MVVM : Other]
	// (Ancien système) Valide et crée une nouvelle catégorie via modale.
	confirmAddCategory

	// [MVVM : View]
	// Affiche l'écran d'accueil du mode Arc Board si aucun arc n'est ouvert.
	renderArcsWelcomeBoard

	// [MVVM : Other]
	// Copie les éléments sélectionnés dans le presse-papier interne.
	copySelectedItems

	// [MVVM : Other]
	// Colle les éléments du presse-papier sur le board avec un décalage.
	pasteArcItem

	// [MVVM : View]
	// Intégration : Redirige vers le nouveau système de rendu de la liste des arcs.
	renderArcsList

	// [MVVM : View]
	// Intégration : Redirige vers le nouveau système d'accueil.
	renderArcsWelcome

	// [MVVM : ViewModel]
	// Intégration : Redirige vers la création d'arc du nouveau système.
	createNewArc

	// [MVVM : ViewModel]
	// Intégration : Redirige vers l'ouverture de board du nouveau système.
	openArcDetail

46.thriller-board.js :
	// [MVVM : ViewModel]
	// Initialise le Thriller Board, l'état global et les écouteurs d'événements.
	initThrillerBoard

	// [MVVM : ViewModel]
	// Point d'entrée principal pour le rendu du Thriller Board selon le mode de vue.
	renderThrillerBoard

	// [MVVM : View]
	// Affiche la vue "Canvas" (tableau blanc) du Thriller Board.
	renderThrillerCanvasView

	// [MVVM : View]
	// Affiche la vue "Grille" (swimlanes) du Thriller Board.
	renderThrillerGridView

	// [MVVM : View]
	// Génère le HTML pour la structure de la grille (colonnes et lignes).
	renderThrillerGrid

	// [MVVM : View]
	// Affiche une ligne (swimlane) spécifique dans la grille.
	renderThrillerSwimlaneRow

	// [MVVM : View]
	// Affiche une cellule individuelle de la grille, gérant le drop de cartes.
	renderThrillerGridCell

	// [MVVM : View]
	// Affiche une pile de cartes dans une cellule de la grille.
	renderCardStack

	// [MVVM : Other]
	// Gère la fin du glissement d'une carte : réinitialise l'état et nettoie les styles visuels (View).
	handleCardDragEnd

	// [MVVM : ViewModel]
	// Gère le survol d'une cellule pendant un glissement, définit l'effet de drop et surligne la zone (View).
	handleCellDragOver

	// [MVVM : View]
	// Retire le surlignage visuel lorsqu'on quitte une cellule pendant un glissement.
	handleCellDragLeave

	// [MVVM : ViewModel]
	// Gère le clic sur une carte empilée : édition si en haut, sinon mise au premier plan (View logic).
	handleStackedCardClick

	// [MVVM : View]
	// Rendu HTML d'une carte Thriller individuelle (en-tête, corps, pied de page).
	renderThrillerCard

	// [MVVM : ViewModel]
	// Gère le clic sur l'en-tête d'une carte pour ouvrir le modal d'édition de l'élément d'origine.
	handleCardHeaderClick

	// [MVVM : View]
	// Affiche un "popover" (bulle) pour changer rapidement le statut d'une carte.
	handleCardFooterClick

	// [MVVM : Other]
	// Met à jour le modèle (statut de la carte) et rafraîchit la vue.
	changeCardStatus

	// [MVVM : Other]
	// Change l'ordre d'affichage (zIndex) pour amener une carte au premier plan.
	bringCardToFront

	// [MVVM : View]
	// Affiche un modal listant toutes les cartes d'une cellule empilée.
	showCardStackModal

	// [MVVM : ViewModel]
	// Amène une carte au front et ferme le modal de la pile.
	bringCardToFrontAndClose

	// [MVVM : ViewModel]
	// Ouvre le modal d'édition à partir d'une sélection dans la pile.
	editThrillerCardFromModal

	// [MVVM : Other]
	// Supprime une carte depuis le modal de la pile et rafraîchit l'interface.
	deleteThrillerCardFromStack

	// [MVVM : View]
	// Affiche les propriétés spécifiques d'une carte (champs alibi, indice, etc.) sous forme de badges/icônes.
	renderThrillerCardProperties

	// [MVVM : Other]
	// Définit les propriétés attendues pour chaque type de carte Thriller.
	getCardTypeProperties

	// [MVVM : ViewModel]
	// Formate une valeur brute en chaîne lisible pour l'interface utilisateur.
	formatPropertyValue

	// [MVVM : Model]
	// Récupère les colonnes basées sur la structure narrative (Actes, Chapitres, Scènes).
	getNarrativeColumns

	// [MVVM : Model]
	// Génère automatiquement des lignes à partir des personnages et des lieux du projet.
	getAutoGeneratedRows

	// [MVVM : ViewModel]
	// Alterne entre la vue Canvas et la vue Grille.
	toggleThrillerViewMode

	// [MVVM : ViewModel]
	// Définit le mode de colonnes (libre ou narratif) et rafraîchit la grille.
	setThrillerColumnMode

	// [MVVM : View]
	// Affiche la liste des éléments Thriller dans la barre latérale.
	renderThrillerList

	// [MVVM : ViewModel]
	// Sélectionne un élément et fait défiler la vue pour le rendre visible.
	selectAndViewThrillerElement

	// [MVVM : Other]
	// Crée un nouvel élément (Model) et ouvre son modal d'édition (View).
	addThrillerElement

	// [MVVM : ViewModel]
	// Sélectionne l'onglet de filtrage dans la barre latérale.
	selectThrillerTab

	// [MVVM : View]
	// Affiche les éléments sur le canvas.
	renderThrillerElements

	// [MVVM : View]
	// Dessine les connexions entre les éléments sur le canvas (vue Canvas uniquement).
	renderThrillerConnections

	// [MVVM : View]
	// Affiche le modal d'édition d'un élément Thriller.
	editThrillerElement

	// [MVVM : View]
	// Rendu dynamique des champs du formulaire selon le type d'élément Thriller.
	renderThrillerElementFields

	// [MVVM : Other]
	// Récupère les données du formulaire, met à jour le modèle (project) et rafraîchit la vue.
	saveThrillerElement

	// [MVVM : Other]
	// Met à jour toutes les cartes de la grille associées à un élément modifié.
	updateCardsFromElement

	// [MVVM : Model]
	// Duplique les cartes vers les colonnes de scènes si des scènes sont référencées.
	duplicateCardsToScenes

	// [MVVM : Model]
	// Déplace les cartes vers une nouvelle swimlane si le personnage change.
	moveCardsToNewSwimlane

	// [MVVM : Other]
	// Crée une ou plusieurs cartes sur la grille pour un élément donné.
	createCardForElement

	// [MVVM : Other]
	// Supprime un élément, ses cartes associées et ses connexions.
	deleteThrillerElement

	// [MVVM : ViewModel]
	// Alias de filtrage pour compatibilité ascendante.
	filterThrillerElements

	// [MVVM : ViewModel]
	// Gère l'événement mousedown sur le canvas pour la navigation.
	handleThrillerCanvasMouseDown

	// [MVVM : ViewModel]
	// Gère l'événement mousemove pour le déplacement du canvas (panning).
	handleThrillerCanvasMouseMove

	// [MVVM : ViewModel]
	// Gère l'événement mouseup pour terminer les interactions canvas.
	handleThrillerCanvasMouseUp

	// [MVVM : ViewModel]
	// Gère l'événement wheel pour le zoom interactif sur le canvas.
	handleThrillerCanvasWheel

	// [MVVM : View]
	// Met à jour le contenu du panneau de contexte basé sur l'élément sélectionné.
	updateThrillerContextPanel

	// [MVVM : ViewModel]
	// Affiche ou masque le panneau latéral de contexte.
	toggleThrillerContextPanel

	// [MVVM : ViewModel]
	// Ajuste le niveau de zoom du board.
	zoomThrillerBoard

	// [MVVM : View]
	// Met à jour l'affichage numérique du zoom dans l'interface.
	updateThrillerZoomDisplay

	// [MVVM : ViewModel]
	// Ajuste le zoom pour que tous les éléments soient visibles à l'écran.
	fitThrillerBoardToScreen

	// [MVVM : ViewModel]
	// Marque un élément comme sélectionné dans l'état global.
	selectThrillerElement

	// [MVVM : Other]
	// Génère un identifiant unique aléatoire.
	generateId

	// [MVVM : View]
	// Rendu visuel des étiquettes (pills) de personnages.
	renderCharacterPills

	// [MVVM : View]
	// Rendu des options de sélection de scène pour les menus déroulants.
	renderSceneOptions

	// [MVVM : View]
	// Rendu visuel des étiquettes (pills) de scènes.
	renderScenePills

	// [MVVM : View]
	// Rendu générique de listes d'éléments modifiables (points pivots, indices trompeurs, etc.).
	renderListItems

	// [MVVM : ViewModel]
	// Ajoute un personnage à la liste d'un champ et met à jour l'affichage.
	addCharacterPill

	// [MVVM : ViewModel]
	// Supprime un personnage de la liste d'un champ et met à jour l'affichage.
	removeCharacterPill

	// [MVVM : ViewModel]
	// Ajoute une scène à la liste d'un champ et met à jour l'affichage.
	addScenePill

	// [MVVM : ViewModel]
	// Supprime une scène de la liste d'un champ et met à jour l'affichage.
	removeScenePill

	// [MVVM : ViewModel]
	// Ajoute un élément textuel à une liste modifiable (ex: points pivots).
	addListItem

	// [MVVM : ViewModel]
	// Supprime un élément textuel d'une liste modifiable.
	removeListItem

	// [MVVM : View]
	// Affiche le modal de création d'une nouvelle ligne (swimlane) dans la grille.
	addThrillerSwimlaneRow

	// [MVVM : View]
	// Met à jour les champs du formulaire du modal de ligne selon le type sélectionné.
	updateRowTypeFields

	// [MVVM : Other]
	// Enregistre une nouvelle ligne dans le modèle et rafraîchit la grille.
	saveThrillerSwimlaneRow

	// [MVVM : View]
	// Affiche le modal d'édition d'une ligne existante.
	editThrillerRow

	// [MVVM : Other]
	// Supprime une ligne (Model) et rafraîchit la vue.
	deleteThrillerRow

	// [MVVM : View]
	// Affiche le modal de création d'une nouvelle colonne.
	addThrillerColumn

	// [MVVM : View]
	// Affiche le modal d'édition d'une colonne.
	editThrillerColumn

	// [MVVM : Other]
	// Supprime une colonne (Model) et rafraîchit la vue.
	deleteThrillerColumn

	// [MVVM : View]
	// Affiche le modal pour ajouter une carte directement dans une cellule de la grille.
	addThrillerCardToCell

	// [MVVM : View]
	// Met à jour les champs du modal de création de carte selon le type choisi.
	updateCardFields

	// [MVVM : Other]
	// Enregistre une nouvelle carte dans la cellule (Model/ViewModel) et rafraîchit la grille.
	saveNewThrillerCard

	// [MVVM : View (Déprécié)]
	// Ancien modal d'édition de carte (maintenant remplacé par le modal d'élément).
	editThrillerCard

	// [MVVM : View (Déprécié)]
	// Mise à jour des champs de l'ancien modal d'édition de carte.
	updateCardFieldsForEdit

	// [MVVM : Other]
	// Enregistrement des modifications via l'ancien modal de carte.
	saveEditedThrillerCard

	// [MVVM : Other]
	// Supprime une carte de la grille (Model) et rafraîchit l'affichage.
	deleteThrillerCard

	// [MVVM : Other]
	// Initialise le dessin d'une connexion entre deux sockets de cartes.
	startThrillerConnection

	// [MVVM : View]
	// Met à jour visuellement la ligne temporaire pendant le glissement d'une connexion.
	handleConnectionDrag

	// [MVVM : Other]
	// Finalise la création d'une connexion entre deux cartes au relâchement de la souris.
	endThrillerConnection

	// [MVVM : Other]
	// Crée une nouvelle connexion logique entre deux éléments et l'ajoute au projet.
	createThrillerConnection

	// [MVVM : Other]
	// Supprime une connexion logique entre deux éléments.
	deleteThrillerConnection

	// [MVVM : View]
	// Dessine toutes les connexions SVG entre les cartes dans la vue Grille.
	renderThrillerConnections

	// [MVVM : ViewModel]
	// Détermine la meilleure paire de sockets pour relier deux cartes (proximité).
	chooseBestSocketPair

	// [MVVM : View]
	// Dessine une ligne SVG complexe (courbe) entre deux points de connexion.
	drawConnectionLine

	// [MVVM : ViewModel]
	// Calcule les coordonnées absolues d'un socket dans le DOM.
	getSocketPosition


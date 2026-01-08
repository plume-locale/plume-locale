# 🏗️ Nouvelle Architecture JavaScript - Plume Locale

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Structure des dossiers](#structure-des-dossiers)
- [Modules principaux](#modules-principaux)
- [Ordre de chargement](#ordre-de-chargement)
- [Usage et exemples](#usage-et-exemples)
- [Migration](#migration)

---

## Vue d'ensemble

Cette nouvelle architecture suit les principes modernes de développement JavaScript :

- ✅ **Séparation des préoccupations** : UI / Logique / Données
- ✅ **Modularité** : Chaque fichier a une responsabilité unique
- ✅ **Réutilisabilité** : Utilitaires et services partagés
- ✅ **Testabilité** : Logique découplée du DOM
- ✅ **Maintenabilité** : Structure claire et prévisible

---

## Structure des dossiers

```
js/
├── 00-core/              # Cœur de l'application
│   ├── 00.app.js         # Point d'entrée et orchestration
│   ├── 01.state.js       # Gestion de l'état global (StateManager)
│   ├── 02.events.js      # Bus d'événements (EventBus)
│   └── 03.router.js      # Navigation entre vues (Router)
│
├── 01-infrastructure/    # Couche infrastructure (à venir)
│   ├── storage.js        # Persistance (IndexedDB + localStorage)
│   └── migration.js      # Migrations de données
│
├── 02-utils/             # Utilitaires réutilisables
│   ├── dom.js            # Helpers DOM
│   ├── text.js           # Formatage texte
│   ├── array.js          # Manipulation tableaux
│   ├── date.js           # Formatage dates
│   ├── color.js          # Gestion couleurs
│   └── validators.js     # Validation de données
│
├── 03-services/          # Logique métier (à venir)
├── 04-models/            # Modèles de données (à venir)
├── 05-ui/                # Composants UI (à venir)
├── 06-views/             # Vues principales (à venir)
├── 07-features/          # Fonctionnalités transversales (à venir)
├── 08-mobile/            # Spécifique mobile (à venir)
└── 09-keyboard/          # Raccourcis clavier (à venir)
```

---

## Modules principaux

### 1. App (`00-core/00.app.js`)

Point d'entrée de l'application. Orchestre l'initialisation de tous les modules.

```javascript
// Initialiser l'application
await App.init();

// Informations
App.info();
App.getVersion(); // "2.0.0"

// Debug
App.enableDebug();
App.disableDebug();

// Reset
await App.reset();
```

### 2. StateManager (`00-core/01.state.js`)

Gestion centralisée de l'état global avec réactivité.

```javascript
// Lire l'état
const state = StateManager.getState();
console.log(state.currentView); // "structure"

// Modifier l'état
StateManager.setState({
    currentView: 'characters',
    currentSceneId: 123
});

// Écouter les changements
const unsubscribe = StateManager.subscribe('currentView', (newView, oldView) => {
    console.log(`Vue changée: ${oldView} → ${newView}`);
});

// Se désabonner
unsubscribe();

// Écouter tous les changements
StateManager.subscribeAll((newState, oldState, updates) => {
    console.log('État mis à jour:', updates);
});
```

### 3. EventBus (`00-core/02.events.js`)

Système de publication/souscription pour la communication découplée entre modules.

```javascript
// Souscrire à un événement
EventBus.on('character:created', (character) => {
    console.log('Nouveau personnage:', character.name);
});

// Souscrire une seule fois
EventBus.once('app:ready', () => {
    console.log('Application prête !');
});

// Émettre un événement
EventBus.emit('character:created', { id: 1, name: 'Alice' });

// Émettre de manière asynchrone
await EventBus.emitAsync('scene:updated', sceneData);

// Se désabonner
EventBus.off('character:created', handler);

// Stats et debug
EventBus.stats();
EventBus.getHistory(10);
EventBus.setDebug(true);
```

### 4. Router (`00-core/03.router.js`)

Gestion de la navigation entre les différentes vues.

```javascript
// Enregistrer une vue
Router.register('characters', CharactersView);

// Naviguer vers une vue
await Router.navigate('characters');

// Retour arrière
await Router.back();

// Recharger la vue actuelle
await Router.reload();

// Informations
Router.getCurrentView(); // "characters"
Router.getViews(); // ["structure", "characters", ...]
Router.getHistory(); // Historique de navigation
```

### 5. DOMUtils (`02-utils/dom.js`)

Helpers pour la manipulation du DOM.

```javascript
// Sélection
const element = DOMUtils.query('.my-class');
const elements = DOMUtils.queryAll('.items');

// Création
const div = DOMUtils.create('div', {
    className: 'card',
    dataset: { id: 123 },
    style: { color: 'red' }
}, ['Contenu']);

// Manipulation
DOMUtils.show(element);
DOMUtils.hide(element);
DOMUtils.toggle(element, true);
DOMUtils.addClass(element, 'active');
DOMUtils.removeClass(element, 'active');

// Échappement HTML
const safe = DOMUtils.escape(userInput);

// Délégation d'événements
DOMUtils.delegate(container, '.btn', 'click', (e) => {
    console.log('Bouton cliqué');
});

// Alias courts
const el = DOMUtils.$('.my-class');
const els = DOMUtils.$$('.items');
```

### 6. TextUtils (`02-utils/text.js`)

Utilitaires de formatage et manipulation de texte.

```javascript
// Formatage
TextUtils.formatWordCount(1500); // "1 500 mots"
TextUtils.countWords(text); // 150
TextUtils.truncate(text, 100); // "Texte tronqué..."
TextUtils.capitalize("hello"); // "Hello"

// Normalisation
TextUtils.normalize("Café"); // "cafe"
TextUtils.slugify("Mon Article"); // "mon-article"

// Analyse
TextUtils.contains(text, "recherche"); // true
TextUtils.readingTime(text); // {minutes: 5, seconds: 30, text: "5 min 30 s"}

// Templates
TextUtils.template("Bonjour {{name}}", { name: "Alice" }); // "Bonjour Alice"
```

### 7. ArrayUtils (`02-utils/array.js`)

Manipulation de tableaux.

```javascript
// Recherche
ArrayUtils.findById(characters, 123);
ArrayUtils.findIndexById(scenes, 456);

// Manipulation d'IDs
ArrayUtils.removeId([1, 2, 3], 2); // [1, 3]
ArrayUtils.toggleId([1, 2, 3], 4); // [1, 2, 3, 4]
ArrayUtils.hasId([1, 2, 3], 2); // true

// Tri et filtrage
ArrayUtils.sortBy(items, 'name', 'asc');
ArrayUtils.groupBy(items, 'category');
ArrayUtils.unique([1, 1, 2, 3]); // [1, 2, 3]

// Statistiques
ArrayUtils.sum([1, 2, 3]); // 6
ArrayUtils.average([1, 2, 3]); // 2
ArrayUtils.min([1, 2, 3]); // 1
ArrayUtils.max([1, 2, 3]); // 3

// Utilitaires
ArrayUtils.chunk([1,2,3,4,5], 2); // [[1,2], [3,4], [5]]
ArrayUtils.shuffle(array);
ArrayUtils.move(array, 0, 3);
```

### 8. DateUtils (`02-utils/date.js`)

Formatage et manipulation de dates.

```javascript
// Formatage
DateUtils.format(new Date(), 'short'); // "08/01/2026"
DateUtils.format(new Date(), 'long');  // "8 janvier 2026"
DateUtils.relative(Date.now() - 3600000); // "il y a 1 heure"

// Vérifications
DateUtils.isToday(date); // true/false
DateUtils.isYesterday(date); // true/false

// Calculs
DateUtils.addDays(date, 7);
DateUtils.diffInDays(date1, date2); // 5
DateUtils.startOfDay(date);
```

### 9. ColorUtils (`02-utils/color.js`)

Manipulation de couleurs.

```javascript
// Conversions
ColorUtils.hexToRgb('#3498db'); // {r: 52, g: 152, b: 219}
ColorUtils.rgbToHex(52, 152, 219); // "#3498db"

// Ajustements
ColorUtils.lighten('#3498db', 20); // "#6ab7ef"
ColorUtils.darken('#3498db', 20);  // "#217dbb"
ColorUtils.saturate('#3498db', 10);

// Analyse
ColorUtils.luminance('#3498db'); // 0.35
ColorUtils.contrast('#3498db', '#ffffff'); // 5.2
ColorUtils.getTextColor('#3498db'); // "#ffffff"

// Génération
ColorUtils.random(); // "#a3c5e8"
ColorUtils.generatePalette('#3498db'); // [5 couleurs]
```

### 10. Validators (`02-utils/validators.js`)

Validation de données.

```javascript
// Validations simples
Validators.required(value); // true/false
Validators.minLength(text, 3); // true/false
Validators.email("test@example.com"); // true
Validators.hexColor("#3498db"); // true

// Validations métier
const result = Validators.characterName(name);
// {valid: true, error: null}
// OU {valid: false, error: "Le nom est requis"}

// Validation par schéma
const { valid, errors } = Validators.validate(data, {
    name: { required: true, minLength: 3 },
    email: { email: true },
    age: { positive: true, integer: true }
});
```

---

## Ordre de chargement

**Important** : Les fichiers doivent être chargés dans cet ordre :

```html
<!-- 1. Core (ordre strict) -->
<script src="js/00-core/00.app.js"></script>
<script src="js/00-core/01.state.js"></script>
<script src="js/00-core/02.events.js"></script>
<script src="js/00-core/03.router.js"></script>

<!-- 2. Utils (ordre flexible) -->
<script src="js/02-utils/dom.js"></script>
<script src="js/02-utils/text.js"></script>
<script src="js/02-utils/array.js"></script>
<script src="js/02-utils/date.js"></script>
<script src="js/02-utils/color.js"></script>
<script src="js/02-utils/validators.js"></script>

<!-- 3. Infrastructure, Services, Models, etc. (à venir) -->

<!-- 4. Initialisation -->
<script>
    // En mode développement, initialiser automatiquement
    if (App.isDevelopment()) {
        App.init().then(() => {
            console.log('Application ready!');
        });
    }
</script>
```

---

## Usage et exemples

### Exemple 1 : Créer une nouvelle vue

```javascript
// 06-views/myview/myview.view.js
const MyView = {
    async init(params) {
        console.log('Initializing MyView', params);
        await this.render();
        this.attachHandlers();
    },

    async render() {
        const data = this.getData();
        const html = MyViewRender.render(data);
        DOMUtils.query('#myview-container').innerHTML = html;
    },

    getData() {
        const state = StateManager.getState();
        return {
            items: state.project.items || []
        };
    },

    attachHandlers() {
        DOMUtils.delegate(
            DOMUtils.query('#myview-container'),
            '.btn',
            'click',
            this.handleClick
        );
    },

    handleClick(e) {
        const id = DOMUtils.data(e.target, 'id');
        EventBus.emit('item:clicked', { id });
    },

    destroy() {
        // Cleanup
    }
};

// Enregistrer la vue
Router.register('myview', MyView);
```

### Exemple 2 : Créer un service

```javascript
// 03-services/item.service.js
const ItemService = {
    create(itemData) {
        const item = new Item(itemData);
        item.validate();

        const state = StateManager.getState();
        state.project.items.push(item);

        EventBus.emit('item:created', item);
        return item;
    },

    findById(id) {
        const state = StateManager.getState();
        return ArrayUtils.findById(state.project.items, id);
    },

    update(id, updates) {
        const item = this.findById(id);
        if (!item) throw new Error('Item not found');

        Object.assign(item, updates);
        item.updatedAt = DateUtils.now();

        EventBus.emit('item:updated', item);
        return item;
    },

    delete(id) {
        const state = StateManager.getState();
        const index = ArrayUtils.findIndexById(state.project.items, id);

        if (index === -1) throw new Error('Item not found');

        const item = state.project.items.splice(index, 1)[0];
        EventBus.emit('item:deleted', id);

        return item;
    }
};
```

---

## Migration

### État actuel

✅ **Phase 1 : Infrastructure** (TERMINÉ)
- Structure de dossiers créée
- StateManager implémenté
- EventBus implémenté
- Router implémenté
- Tous les utilitaires créés

### Prochaines étapes

🔄 **Phase 2 : Services** (En cours)
- Créer les modèles de données
- Créer les services métier
- Migrer la logique de storage

📋 **Phase 3 : Vues** (À venir)
- Refactoriser les vues une par une
- Commencer par les plus simples (notes, todos)
- Progresser vers les plus complexes (arc-board, storygrid)

---

## Convention de nommage des événements

Format : `entity:action`

**Actions courantes :**
- `created` - Entité créée
- `updated` - Entité mise à jour
- `deleted` - Entité supprimée
- `selected` - Entité sélectionnée
- `loaded` - Données chargées

**Exemples :**
```javascript
EventBus.emit('character:created', character);
EventBus.emit('scene:updated', scene);
EventBus.emit('project:loaded', project);
EventBus.emit('view:changed', { from, to });
```

---

## Debug et développement

### Mode debug

```javascript
// Activer le debug
App.enableDebug();

// Helpers disponibles
DEBUG.state();    // Affiche l'état actuel
DEBUG.events();   // Liste les événements enregistrés
DEBUG.router();   // Stats du routeur
DEBUG.eventBus(); // Stats de l'EventBus
DEBUG.history();  // Historique des événements
```

### Console

En mode développement, vous verrez :
- Logs d'initialisation
- Changements d'état
- Émission d'événements
- Navigation entre vues

---

## Ressources

- [ARCHITECTURE_PROPOSAL.md](../ARCHITECTURE_PROPOSAL.md) - Proposition complète d'architecture
- [Code actuel](.) - Anciens fichiers JavaScript (01.app.js, 02.storage.js, etc.)

---

**Version** : 2.0.0
**Dernière mise à jour** : 2026-01-08

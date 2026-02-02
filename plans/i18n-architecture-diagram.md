# Architecture i18n - Diagrammes

## Vue d'ensemble du système

```mermaid
graph TB
    subgraph "Application Plume"
        A[index.html] --> B[js/00.i18n.js]
        B --> C[Système I18n Core]
        C --> D[Détection Langue]
        C --> E[Chargement Traductions]
        C --> F[Application Traductions]
        
        D --> G{Langue sauvegardée?}
        G -->|Oui| H[localStorage]
        G -->|Non| I[Langue navigateur]
        
        E --> J[locales/fr.json]
        E --> K[locales/en.json]
        E --> L[locales/es.json]
        E --> M[locales/de.json]
        E --> N[locales/it.json]
        
        F --> O[DOM Elements]
        F --> P[Dynamic Content]
        
        Q[Language Selector] --> R[changeLanguage]
        R --> E
        R --> H
        R --> F
    end
```

## Structure des fichiers

```mermaid
graph LR
    A[Plume Root] --> B[locales/]
    A --> C[js/]
    A --> D[html/]
    A --> E[css/]
    
    B --> B1[fr.json]
    B --> B2[en.json]
    B --> B3[es.json]
    B --> B4[de.json]
    B --> B5[it.json]
    
    C --> C1[00.i18n.js]
    C --> C2[01.app.js]
    C --> C3[autres fichiers...]
    
    D --> D1[head.html]
    D --> D2[body.html]
    
    E --> E1[03.header.css]
```

## Flux de traduction

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface
    participant I18n as Système I18n
    participant LS as localStorage
    participant API as Fichiers JSON
    
    U->>UI: Charge l'application
    UI->>I18n: init()
    I18n->>LS: Récupérer langue sauvegardée
    alt Langue sauvegardée existe
        LS-->>I18n: Langue (ex: 'en')
    else Pas de langue sauvegardée
        I18n->>I18n: Détecter langue navigateur
    end
    
    I18n->>API: Charger locales/[lang].json
    API-->>I18n: Traductions JSON
    I18n->>UI: Appliquer traductions
    UI-->>U: Application traduite
    
    U->>UI: Clique sur sélecteur langue
    UI->>U: Affiche dropdown
    U->>UI: Sélectionne nouvelle langue
    UI->>I18n: changeLanguage('fr')
    I18n->>API: Charger locales/fr.json
    API-->>I18n: Traductions FR
    I18n->>LS: Sauvegarder 'fr'
    I18n->>UI: Appliquer nouvelles traductions
    UI->>UI: Rafraîchir vue
    UI-->>U: Application en français
```

## Hiérarchie des traductions

```mermaid
graph TD
    A[Traductions JSON] --> B[app]
    A --> C[header]
    A --> D[sidebar]
    A --> E[editor]
    A --> F[toolbar]
    A --> G[actions]
    A --> H[characters]
    A --> I[world]
    A --> J[notes]
    A --> K[codex]
    A --> L[messages]
    
    C --> C1[nav]
    C --> C2[actions]
    C --> C3[stats]
    
    D --> D1[search]
    D --> D2[progress]
    D --> D3[status]
    D --> D4[tools]
    D --> D5[tree]
    
    H --> H1[title]
    H --> H2[none]
    H --> H3[add]
    H --> H4[fields]
    
    H4 --> H4A[name]
    H4 --> H4B[age]
    H4 --> H4C[pronouns]
```

## Composant Language Selector

```mermaid
graph TD
    A[Language Selector Component] --> B[Button]
    A --> C[Dropdown]
    
    B --> B1[Icon: languages]
    B --> B2[Current Lang Code]
    B --> B3[onClick: toggle]
    
    C --> C1[Option: FR]
    C --> C2[Option: EN]
    C --> C3[Option: ES]
    C --> C4[Option: DE]
    C --> C5[Option: IT]
    
    C1 --> D[onClick: changeLanguage]
    C2 --> D
    C3 --> D
    C4 --> D
    C5 --> D
    
    D --> E[Load Translations]
    D --> F[Save to localStorage]
    D --> G[Update UI]
    D --> H[Refresh View]
```

## Intégration dans le Header

```mermaid
graph LR
    A[Header Actions] --> B[Storage Badge]
    A --> C[Language Selector]
    A --> D[Undo Button]
    A --> E[Redo Button]
    A --> F[Pomodoro Button]
    A --> G[Theme Button]
    A --> H[Projects Button]
    
    C --> C1[Selector Button]
    C --> C2[Dropdown Menu]
    
    C2 --> C2A[FR Option]
    C2 --> C2B[EN Option]
    C2 --> C2C[ES Option]
    C2 --> C2D[DE Option]
    C2 --> C2E[IT Option]
    
    style C fill:#ffd700
    style C1 fill:#fff4cc
    style C2 fill:#fff4cc
```

## Processus de migration

```mermaid
graph TD
    A[Code Actuel] --> B{Type de texte?}
    
    B -->|HTML statique| C[Ajouter data-i18n]
    B -->|Placeholder| D[Ajouter data-i18n-placeholder]
    B -->|Tooltip| E[Ajouter data-i18n-title]
    B -->|JS dynamique| F[Remplacer par t]
    
    C --> G[Créer clé traduction]
    D --> G
    E --> G
    F --> G
    
    G --> H[Ajouter dans fr.json]
    H --> I[Traduire en.json]
    I --> J[Traduire autres langues]
    
    J --> K[Tester]
    K --> L{Fonctionne?}
    L -->|Oui| M[Valider]
    L -->|Non| N[Corriger]
    N --> K
```

## Exemple de transformation

### Avant
```html
<button onclick="undo()" title="Annuler (Ctrl+Z)">
    <i data-lucide="undo-2"></i>
</button>
```

### Après
```html
<button onclick="undo()" data-i18n-title="header.actions.undoTooltip">
    <i data-lucide="undo-2"></i>
</button>
```

### Traduction
```json
{
  "header": {
    "actions": {
      "undoTooltip": "Annuler (Ctrl+Z)"
    }
  }
}
```

## Gestion des paramètres dynamiques

```mermaid
graph LR
    A[Code JS] --> B[t key, params]
    B --> C[Système I18n]
    C --> D[Récupérer traduction]
    D --> E[Remplacer paramètres]
    E --> F[Retourner texte final]
    
    G[Traduction: count mots] --> D
    H[Paramètre: count=1234] --> E
    F --> I[1234 mots]
```

### Exemple
```javascript
// Code
const text = t('header.stats.words', { count: 1234 });

// Traduction FR
"words": "{count} mots"

// Traduction EN
"words": "{count} words"

// Résultat FR: "1234 mots"
// Résultat EN: "1234 words"
```

## États du Language Selector

```mermaid
stateDiagram-v2
    [*] --> Fermé
    Fermé --> Ouvert: Click sur bouton
    Ouvert --> Fermé: Click ailleurs
    Ouvert --> Fermé: Sélection langue
    Ouvert --> Chargement: Sélection langue
    Chargement --> Fermé: Traductions chargées
    Fermé --> [*]
```

## Performance et Cache

```mermaid
graph TD
    A[Premier chargement] --> B[Fetch JSON]
    B --> C[Parse JSON]
    C --> D[Stocker en mémoire]
    D --> E[Appliquer traductions]
    
    F[Changement langue] --> G{Déjà en cache?}
    G -->|Oui| H[Utiliser cache]
    G -->|Non| B
    H --> E
    
    E --> I[Mise à jour DOM]
    I --> J[Application traduite]
```

## Compatibilité navigateurs

```mermaid
graph TD
    A[Navigateur] --> B{Support fetch?}
    B -->|Oui| C[Utiliser fetch]
    B -->|Non| D[Fallback XMLHttpRequest]
    
    C --> E[Charger traductions]
    D --> E
    
    E --> F{Support localStorage?}
    F -->|Oui| G[Sauvegarder langue]
    F -->|Non| H[Utiliser cookie]
    
    G --> I[Application fonctionnelle]
    H --> I
```

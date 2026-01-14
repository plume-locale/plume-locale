# MVVM Architecture Diagram & Flow

## System Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         APPLICATION                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    USER INTERFACE                          │  │
│  │  (HTML/CSS rendered by *.render.js)                        │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ Characters View  │ Structure View  │ Locations View  │  │  │
│  │  │ Timeline View    │ Stats View      │ Arc Board View  │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │ user input (click, type, submit)             │
│  ┌────────────────▼─────────────────────────────────────────┐  │
│  │              EVENT HANDLERS                              │  │
│  │  (*.handlers.js - processes user actions)                │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ Get form data → Validate → Call Service             │  │  │
│  │  │ Emit events → Update UI                             │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────┬─────────────────────────────────────────┘  │
│                   │ await service methods                        │
│  ┌────────────────▼─────────────────────────────────────────┐  │
│  │          BUSINESS LOGIC SERVICES                         │  │
│  │  (*.service.js - implements rules)                       │  │
│  │  ┌──────────────────────────────────────────────────────┐  │  │
│  │  │ CharacterService  │ SceneService   │ LocationService │  │  │
│  │  │ ArcService        │ ProjectService │ etc...          │  │  │
│  │  └──────────────────────────────────────────────────────┘  │  │
│  └────────────────┬──────────────────┬───────────────────────┘  │
│                   │ create/read       │ emit events               │
│                   ├─────────────────> EventBus ──────────────┐   │
│                   │ update/delete     │ subscribe updates    │   │
│  ┌────────────────▼─────────────────────────────────────────┐   │
│  │          DATA MODELS                                     │   │
│  │  (*.js classes - data structure & validation)           │   │
│  │  ┌──────────────────────────────────────────────────────┐  │ │
│  │  │ Character │ Scene │ Location │ Arc │ Project │ Note  │  │ │
│  │  └──────────────────────────────────────────────────────┘  │ │
│  └────────────────┬─────────────────────────────────────────┘   │
│                   │ persist data                                  │
│  ┌────────────────▼─────────────────────────────────────────┐   │
│  │          STORAGE SERVICE                                 │   │
│  │  (IndexedDB, localStorage, files)                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │          UTILITIES (Available to All Layers)             │   │
│  │  DOM Utils  │  Text Utils  │  Validators  │  Date Utils  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## Component Interaction Flow

### Create Operation Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                                   │
│    └─ Clicks "Create Character" button in form                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 2. HANDLER EXECUTION                                             │
│    └─ CharactersHandlers.handleAddCharacter()                   │
│       ├─ Get form values (name, role, description)             │
│       ├─ Basic format validation                               │
│       └─ Call CharacterService.create()                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 3. SERVICE EXECUTION                                             │
│    └─ CharacterService.create(data)                             │
│       ├─ Create Character instance                             │
│       ├─ character.validate() (model validation)               │
│       ├─ StateManager.set('project', updatedState)             │
│       ├─ await StorageService.saveProject(state)               │
│       ├─ EventBus.emit('character:created', character)         │
│       └─ return character                                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 4. EVENT DISTRIBUTION                                            │
│    └─ EventBus publishes 'character:created' event             │
│       ├─ All listeners are notified                            │
│       └─ CharactersView listener triggers render()             │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│ 5. VIEW RE-RENDER                                                │
│    └─ CharactersView.render()                                   │
│       ├─ const characters = CharacterService.findAll()         │
│       ├─ const html = CharactersRender.renderList(characters)  │
│       ├─ container.innerHTML = html (update DOM)               │
│       ├─ CharactersHandlers.attachListHandlers()               │
│       └─ UI now shows new character                            │
└─────────────────────────────────────────────────────────────────┘
```

**Key Points:**
- Each layer is independent
- Each can be tested without others
- Data flows downward clearly
- Events flow upward for updates
- No circular dependencies

---

## Service Pattern Details

### CharacterService Structure

```javascript
CharacterService = {
    // QUERY METHODS (Read)
    findById(id)              // Get one character
    findAll()                 // Get all characters
    findByName(term)          // Search by name
    
    // MUTATION METHODS (Write)
    create(data)              // Add new
    update(id, changes)       // Modify existing
    remove(id)                // Delete existing
    
    // RELATIONSHIP METHODS
    getCharacterScenes(id)    // Get scenes with character
    getCharacterStats(id)     // Get statistics
    getRelationships(id)      // Get character relations
    addRelationship(...)      // Link to other character
    
    // INTERNAL METHODS
    removeReferences(id)      // Clean up when deleting
    exportAsJSON()            // Export data
}
```

### Service Call Pattern

```javascript
// In Handler
async function handleAddCharacter() {
    try {
        // Call service (returns promise)
        const newChar = await CharacterService.create(data);
        
        // Refresh UI
        await CharactersView.render();
        
        // Show success
        showToast('Character created!');
    } catch (error) {
        // Handle errors
        showToast('Error: ' + error.message);
    }
}
```

---

## View Pattern Details

### View Component Structure

```
CharactersView (Orchestrator)
├─ init()           → Setup and render
├─ render()         → Display list
├─ openDetail()     → Show details
├─ openAddModal()   → Show form
├─ bindEvents()     → Subscribe to updates
└─ destroy()        → Cleanup

  Uses ↓
  
CharactersRender (Pure HTML)
├─ renderList()     → List HTML
├─ renderDetail()   → Detail HTML
├─ renderAddModal() → Form HTML
└─ renderEmpty()    → Empty state

  Uses ↓
  
CharactersHandlers (Event Listener)
├─ attachListHandlers()     → Click handlers
├─ attachDetailHandlers()   → Edit handlers
├─ attachAddModalHandlers() → Form submit
└─ handleAddCharacter()     → Process input
```

### View Initialization Flow

```javascript
// In HTML/main code
CharactersView.init();

// Inside CharactersView.init()
async function init() {
    // 1. Get data from service
    const characters = CharacterService.findAll();
    
    // 2. Generate HTML
    const html = CharactersRender.renderList(characters);
    
    // 3. Update DOM
    container.innerHTML = html;
    
    // 4. Attach handlers
    CharactersHandlers.attachListHandlers();
    
    // 5. Subscribe to updates
    EventBus.on('character:created', () => render());
    EventBus.on('character:updated', () => render());
    EventBus.on('character:deleted', () => render());
}
```

---

## State Management Flow

### State Structure

```javascript
StateManager = {
    // Single source of truth
    _state = {
        project: {
            id: ...,
            title: ...,
            characters: [ ... ],
            scenes: [ ... ],
            locations: [ ... ],
            arcs: [ ... ],
            ...
        }
    },
    
    // Public API
    get(key)              // Read state
    set(key, value)       // Write state
    on(key, callback)     // Subscribe to changes
    off(key, callback)    // Unsubscribe
}
```

### State Update Flow

```
Service Updates State
    ↓
const state = StateManager.get('project');
state.characters.push(newCharacter);
StateManager.set('project', state);
    ↓
StateManager triggers listeners
    ↓
View listener calls render()
    ↓
UI updates with new state
```

---

## Error Handling Flow

```
┌──────────────────────────────────────┐
│ User Action                          │
└────────────────┬─────────────────────┘
                 │
┌────────────────▼─────────────────────┐
│ Handler: try-catch                   │
│                                      │
│ try {                                │
│   await Service.operation()          │
│   View.render()                      │
│ } catch (error) {                    │
│   showToast(error.message)           │
│ }                                    │
└────────────────┬─────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
   ✅ SUCCESS        ❌ ERROR
        │                 │
        ├─────────┬───────┤
        │         │       │
    Render   Handle   Log
    Update   Error    Error
```

### Validation Flow

```
Model Validation
    ↓
character.validate()
    ├─ Check required fields
    ├─ Check valid ranges
    ├─ Throw Error if invalid
    └─ Return true if valid
    
Service Validation
    ↓
try {
    character.validate()
} catch (error) {
    throw new Error("Invalid: " + error.message)
}

Handler Validation
    ↓
catch (error) {
    showToast(error.message)
}
```

---

## Dependency Diagram

```
                    All Layers
                        ↓
                  ┌─────────────┐
                  │ UTILITIES   │
                  │ (02-utils)  │
                  └─────────────┘
                        ↑
         ┌──────────────┼──────────────┐
         │              │              │
      ┌──▼───┐      ┌──▼───┐      ┌──▼────┐
      │VIEWS │      │MODELS│      │STORAGE│
      │(06)  │      │(04)  │      │(01)   │
      └───┬──┘      └──▲───┘      └───▲───┘
          │            │              │
         ┌▼────────────┴──┐           │
         │   SERVICES     │           │
         │     (03)       │───────────┘
         └────────────────┘
```

**No Circular Dependencies!** 
- Views depend on Services
- Services depend on Models
- Models depend on nothing
- Everything uses Utilities

---

## Event Flow Diagram

```
┌─────────────────────────────────────────────┐
│          EventBus (Central Hub)             │
│                                             │
│  Emitted Events:                            │
│  - character:created                        │
│  - character:updated                        │
│  - character:deleted                        │
│  - scene:created                            │
│  - scene:updated                            │
│  - etc...                                   │
└──────────────┬─────────────────────────────┘
               │
      ┌────────┼────────┐
      │        │        │
   ┌──▼──┐  ┌──▼──┐  ┌──▼──┐
   │View1│  │View2│  │View3│
   └─────┘  └─────┘  └─────┘
   
   Services emit
   Views listen
   UI reacts
```

---

## Testing Strategy

### Unit Test Services (No DOM)
```javascript
// Pure function testing
const char = await CharacterService.create({
    name: 'Test'
});
assert(char.name === 'Test');

const found = CharacterService.findById(char.id);
assert(found !== undefined);

const updated = await CharacterService.update(char.id, {
    role: 'Hero'
});
assert(updated.role === 'Hero');
```

### Unit Test Render (Pure HTML)
```javascript
const html = CharactersRender.renderList([
    { name: 'Char1' },
    { name: 'Char2' }
]);
assert(html.includes('Char1'));
assert(html.includes('Char2'));
```

### Integration Test Views (With DOM)
```javascript
// Requires DOM and services
await CharactersView.render();
const container = document.getElementById('characters-list');
assert(container.innerHTML.includes('character'));

// Simulate user action
document.getElementById('add-btn').click();
assert(document.getElementById('add-modal').visible);
```

---

## Performance Considerations

### Render Performance
```javascript
// ✅ GOOD - Pure function, fast
function renderList(items) {
    return items.map(item => `<div>${item.name}</div>`).join('');
}

// ❌ BAD - DOM manipulation, slow
function renderList(items) {
    items.forEach(item => {
        const el = document.createElement('div');
        el.innerHTML = item.name;
        container.appendChild(el);
    });
}
```

### State Update Performance
```javascript
// ✅ GOOD - Efficient state updates
const state = StateManager.get('project');
state.characters[index] = updatedChar;
StateManager.set('project', state); // One update

// ❌ BAD - Multiple updates
StateManager.set('character', updatedChar); // Multiple updates
StateManager.set('project', project);
```

---

## Debugging Guide

### Data Flow Troubleshooting

```
Is data not showing?
│
├─ Check Service returns data
│  └─ console.log(CharacterService.findAll())
│
├─ Check Render uses data
│  └─ console.log(CharactersRender.renderList(data))
│
├─ Check View sets innerHTML
│  └─ Check container.innerHTML
│
└─ Check Handler attaches listeners
   └─ Check addEventListener works
```

### Event Troubleshooting

```
Is UI not updating on change?
│
├─ Check Service emits event
│  └─ EventBus.emit('character:created', char)
│
├─ Check View listens
│  └─ EventBus.on('character:created', ...)
│
├─ Check listener calls render
│  └─ View.render() in listener
│
└─ Check render updates DOM
   └─ container.innerHTML = html
```

---

## Architecture Checklist

When implementing a new view, verify:

- ✅ Model class created with validate()
- ✅ Service created with full CRUD
- ✅ Service emits events on changes
- ✅ Service integrates with StateManager
- ✅ Render file has pure HTML functions
- ✅ Handlers file has event listeners
- ✅ View file orchestrates both
- ✅ No DOM manipulation in service
- ✅ No DOM manipulation in render
- ✅ All public APIs documented
- ✅ Error handling present
- ✅ Reference cleanup on delete

---

**Use this guide alongside the code examples for clear understanding! 🎯**

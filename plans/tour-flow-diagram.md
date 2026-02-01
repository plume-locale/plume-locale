# Product Tour Flow Diagrams

## Overview

This document provides visual representations of the product tour flow, user journeys, and system architecture.

## 1. Main Tour Flow

```mermaid
graph TD
    A[App Launch] --> B{First Time User?}
    B -->|Yes| C[Show Welcome Modal]
    B -->|No| D[Normal App Start]
    
    C --> E{User Action}
    E -->|Start Tour| F[Initialize Driver.js]
    E -->|Skip| G[Save Skip State]
    E -->|Don't Show Again| H[Save Preference]
    
    F --> I[Step 1: Welcome]
    I --> J[Step 2: Project Title]
    J --> K[Step 3: Navigation]
    K --> L[Step 4: Sidebar]
    L --> M[Steps 5-28...]
    M --> N[Step 29: Completion]
    
    N --> O[Save Completion State]
    G --> D
    H --> D
    O --> D
    
    D --> P[Show Tour Button]
    P -->|Click| F
```

## 2. User Journey Map

```mermaid
journey
    title New User Onboarding Journey
    section First Visit
      Opens Plume: 5: User
      Sees Welcome Modal: 4: User
      Reads Description: 3: User
      Decides to Take Tour: 5: User
    section Tour Experience
      Learns About Structure: 5: User
      Discovers Editor: 5: User
      Explores Characters: 4: User
      Views Visualizations: 4: User
      Completes Tour: 5: User
    section Post-Tour
      Creates First Act: 5: User
      Writes First Scene: 5: User
      Adds Characters: 4: User
      Feels Confident: 5: User
```

## 3. Tour State Machine

```mermaid
stateDiagram-v2
    [*] --> NotStarted
    NotStarted --> WelcomeModal: First Visit
    NotStarted --> Ready: Returning User
    
    WelcomeModal --> InProgress: Start Tour
    WelcomeModal --> Skipped: Skip
    WelcomeModal --> Dismissed: Don't Show Again
    
    InProgress --> InProgress: Next Step
    InProgress --> InProgress: Previous Step
    InProgress --> Paused: Close
    InProgress --> Completed: Finish
    InProgress --> Skipped: ESC Key
    
    Paused --> InProgress: Resume
    Paused --> Skipped: Skip
    
    Completed --> [*]
    Skipped --> [*]
    Dismissed --> [*]
    Ready --> InProgress: Manual Start
```

## 4. Component Architecture

```mermaid
graph LR
    A[App Init] --> B[Tour Manager]
    B --> C[State Manager]
    B --> D[Driver.js Instance]
    B --> E[Welcome Modal]
    
    C --> F[IndexedDB]
    
    D --> G[Step Renderer]
    D --> H[Navigation Controller]
    D --> I[Highlight Manager]
    
    E --> J[Start Button]
    E --> K[Skip Button]
    E --> L[Preferences]
    
    G --> M[Popover UI]
    H --> N[Next/Prev Buttons]
    I --> O[Element Highlighter]
```

## 5. Tour Steps Hierarchy

```mermaid
graph TD
    A[Product Tour] --> B[Stage 1: Welcome]
    A --> C[Stage 2: Core Features]
    A --> D[Stage 3: Database]
    A --> E[Stage 4: Visualizations]
    A --> F[Stage 5: Advanced]
    A --> G[Stage 6: Completion]
    
    B --> B1[Step 1: Welcome]
    B --> B2[Step 2: Project Title]
    B --> B3[Step 3: Navigation]
    B --> B4[Step 4: Header Actions]
    
    C --> C1[Step 5: Sidebar]
    C --> C2[Step 6: Search]
    C --> C3[Step 7: Progress]
    C --> C4[Step 8-14: Editor Features]
    
    D --> D1[Step 15: Characters Tab]
    D --> D2[Step 16: Character List]
    D --> D3[Step 17: World Tab]
    D --> D4[Step 18: Notes & Codex]
    
    E --> E1[Step 19: Viz Overview]
    E --> E2[Step 20: Corkboard]
    E --> E3[Step 21: Plot]
    E --> E4[Step 22-23: Arcs & Thriller]
    
    F --> F1[Step 24: Statistics]
    F --> F2[Step 25: Analysis]
    F --> F3[Step 26: Snapshots]
    F --> F4[Step 27-28: Storage & Projects]
    
    G --> G1[Step 29: Completion]
```

## 6. Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant A as App
    participant T as Tour Manager
    participant D as Driver.js
    participant S as Storage
    
    U->>A: Opens App
    A->>T: Initialize Tour
    T->>S: Load Tour State
    S-->>T: Return State
    
    alt First Time User
        T->>U: Show Welcome Modal
        U->>T: Click Start Tour
        T->>D: Initialize with Steps
        D->>U: Show Step 1
        
        loop For Each Step
            U->>D: Click Next
            D->>T: Step Changed
            T->>S: Save Progress
            D->>U: Show Next Step
        end
        
        U->>D: Complete Tour
        D->>T: Tour Completed
        T->>S: Save Completion
        T->>U: Show Success Message
    else Returning User
        T->>A: Continue Normal Flow
        U->>A: Click Tour Button
        A->>T: Start Tour Manually
        T->>D: Initialize with Steps
    end
```

## 7. Responsive Behavior

```mermaid
graph TD
    A[Screen Size Detection] --> B{Width Check}
    
    B -->|> 1024px| C[Desktop Tour]
    B -->|768-1024px| D[Tablet Tour]
    B -->|< 768px| E[Mobile Tour]
    
    C --> C1[29 Full Steps]
    C --> C2[Side Popovers]
    C --> C3[Detailed Descriptions]
    
    D --> D1[29 Condensed Steps]
    D --> D2[Bottom Popovers]
    D --> D3[Shorter Text]
    
    E --> E1[10 Key Steps]
    E --> E2[Full-Screen Modals]
    E --> E3[Minimal Text]
```

## 8. Integration Points

```mermaid
graph LR
    A[Product Tour] --> B[04.init.js]
    A --> C[html/head.html]
    A --> D[html/body.html]
    A --> E[02.storage.js]
    
    B --> B1[initProductTour]
    C --> C1[Driver.js CDN]
    C --> C2[Tour CSS]
    D --> D1[Tour Button]
    D --> D2[Tour Scripts]
    E --> E1[saveSetting]
    E --> E2[loadSetting]
    
    style A fill:#4CAF50
    style B fill:#2196F3
    style C fill:#2196F3
    style D fill:#2196F3
    style E fill:#2196F3
```

## 9. Event Flow

```mermaid
sequenceDiagram
    participant W as Welcome Modal
    participant T as Tour Manager
    participant D as Driver.js
    participant E as DOM Elements
    participant S as Storage
    
    Note over W,S: Tour Initialization
    W->>T: startTourFromWelcome()
    T->>D: driver(config)
    D->>E: Query Elements
    E-->>D: Element References
    
    Note over W,S: Tour Execution
    D->>E: Highlight Element
    D->>D: Show Popover
    
    loop Each Step
        D->>T: onNextClick()
        T->>D: moveNext()
        D->>E: Update Highlight
        D->>S: Save Progress
    end
    
    Note over W,S: Tour Completion
    D->>T: onDestroyStarted()
    T->>S: Save Completion State
    T->>E: Show Notification
```

## 10. Error Handling Flow

```mermaid
graph TD
    A[Tour Start] --> B{Driver.js Loaded?}
    B -->|No| C[Show Error]
    B -->|Yes| D{Element Exists?}
    
    D -->|No| E[Skip Step]
    D -->|Yes| F[Show Step]
    
    F --> G{User Action}
    G -->|Next| H{More Steps?}
    G -->|Close| I[Save State]
    G -->|Error| J[Log Error]
    
    H -->|Yes| D
    H -->|No| K[Complete Tour]
    
    C --> L[Fallback Mode]
    E --> H
    I --> M[Exit Tour]
    J --> N[Continue Tour]
    K --> M
    
    style C fill:#f44336
    style E fill:#ff9800
    style J fill:#ff9800
```

## 11. Mobile Tour Simplified Flow

```mermaid
graph TD
    A[Mobile Detected] --> B[Load Mobile Steps]
    B --> C[Step 1: Welcome]
    C --> D[Step 2: Menu Button]
    D --> E[Step 3: Sidebar]
    E --> F[Step 4: Editor]
    F --> G[Step 5: Characters]
    G --> H[Step 6: Features Overview]
    H --> I[Step 7: Completion]
    I --> J[Save & Exit]
    
    style A fill:#9C27B0
    style B fill:#9C27B0
    style J fill:#4CAF50
```

## 12. Accessibility Flow

```mermaid
graph LR
    A[User Input] --> B{Input Type}
    
    B -->|Mouse| C[Click Handler]
    B -->|Keyboard| D[Key Handler]
    B -->|Screen Reader| E[ARIA Handler]
    
    C --> F[Execute Action]
    D --> G{Key Pressed}
    E --> H[Announce Change]
    
    G -->|Enter| F
    G -->|ESC| I[Close Tour]
    G -->|Tab| J[Focus Next]
    G -->|Shift+Tab| K[Focus Previous]
    
    F --> L[Update UI]
    H --> L
    I --> M[Save State]
    J --> L
    K --> L
```

## 13. Performance Optimization

```mermaid
graph TD
    A[App Load] --> B[Defer Tour Init]
    B --> C{User Idle?}
    C -->|Yes| D[Load Driver.js]
    C -->|No| E[Wait]
    
    D --> F[Initialize Tour Manager]
    F --> G{First Time?}
    
    G -->|Yes| H[Preload Steps]
    G -->|No| I[Lazy Load]
    
    H --> J[Cache Elements]
    I --> J
    
    J --> K[Ready State]
    E --> C
    
    style D fill:#4CAF50
    style H fill:#4CAF50
    style K fill:#4CAF50
```

## 14. Testing Flow

```mermaid
graph TD
    A[Start Testing] --> B[Unit Tests]
    A --> C[Integration Tests]
    A --> D[E2E Tests]
    
    B --> B1[State Management]
    B --> B2[Step Navigation]
    B --> B3[Storage Functions]
    
    C --> C1[Tour Initialization]
    C --> C2[Step Rendering]
    C --> C3[User Interactions]
    
    D --> D1[Complete Tour Flow]
    D --> D2[Skip Scenarios]
    D --> D3[Resume Scenarios]
    
    B1 --> E[Test Results]
    B2 --> E
    B3 --> E
    C1 --> E
    C2 --> E
    C3 --> E
    D1 --> E
    D2 --> E
    D3 --> E
    
    E --> F{All Pass?}
    F -->|Yes| G[Deploy]
    F -->|No| H[Fix Issues]
    H --> A
```

## 15. Deployment Pipeline

```mermaid
graph LR
    A[Development] --> B[Code Review]
    B --> C[Testing]
    C --> D{Tests Pass?}
    
    D -->|Yes| E[Staging]
    D -->|No| A
    
    E --> F[QA Testing]
    F --> G{QA Approved?}
    
    G -->|Yes| H[Production]
    G -->|No| A
    
    H --> I[Monitor Metrics]
    I --> J{Issues?}
    
    J -->|Yes| K[Rollback]
    J -->|No| L[Success]
    
    K --> A
    
    style H fill:#4CAF50
    style L fill:#4CAF50
    style K fill:#f44336
```

## Legend

### Node Colors
- 🟢 Green: Success/Completion states
- 🔵 Blue: Process/Action nodes
- 🟣 Purple: Mobile-specific
- 🟠 Orange: Warning/Skip states
- 🔴 Red: Error states

### Arrow Types
- Solid: Primary flow
- Dashed: Alternative flow
- Dotted: Error/Exception flow

---

**Document Version**: 1.0  
**Last Updated**: 2026-02-01  
**Status**: Complete

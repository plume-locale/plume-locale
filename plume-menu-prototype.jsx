import { useState } from "react";

const ICONS = {
  // Sidebar icons
  write: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    </svg>
  ),
  structure: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  characters: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  notes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z"/><path d="M15 3v4a2 2 0 0 0 2 2h4"/>
    </svg>
  ),
  stats: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
    </svg>
  ),
  // Atelier icons
  mindmap: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><circle cx="4" cy="6" r="2"/><circle cx="20" cy="6" r="2"/><circle cx="4" cy="18" r="2"/><circle cx="20" cy="18" r="2"/><path d="M9.5 10.2 5.7 7.5"/><path d="M14.5 10.2 18.3 7.5"/><path d="M9.5 13.8 5.7 16.5"/><path d="M14.5 13.8 18.3 16.5"/>
    </svg>
  ),
  timeline: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v20"/><circle cx="12" cy="6" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="18" r="2"/><path d="M14 6h6"/><path d="M4 12h6"/><path d="M14 18h6"/>
    </svg>
  ),
  relations: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 12h8"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="12" r="3"/>
    </svg>
  ),
  map: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z"/><path d="M9 3v15"/><path d="M15 6v15"/>
    </svg>
  ),
  codex: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
    </svg>
  ),
  universe: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/>
    </svg>
  ),
  intrigue: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  arcs: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 20c2-4 6-12 10-12s8 8 10 12"/>
    </svg>
  ),
  // Header icons
  undo: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
    </svg>
  ),
  redo: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>
    </svg>
  ),
  save: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"/><path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/><path d="M7 3v4a1 1 0 0 0 1 1h7"/>
    </svg>
  ),
  search: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  focus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>
    </svg>
  ),
  timer: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/>
    </svg>
  ),
  more: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
    </svg>
  ),
  expand: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  ),
  collapse: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  ),
  chevDown: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6"/>
    </svg>
  ),
  plus: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14"/><path d="M5 12h14"/>
    </svg>
  ),
  scene: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/>
    </svg>
  ),
};

const STATUS_COLORS = {
  draft: "#94a3b8",
  progress: "#f59e0b",
  done: "#22c55e",
  revise: "#ef4444",
};

export default function PlumeMenuPrototype() {
  const [activeTab, setActiveTab] = useState("write");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [atelierOpen, setAtelierOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState({ ch1: true, ch2: false, ch3: false });
  const [activeScene, setActiveScene] = useState("s1-2");
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState(null);

  const mainTabs = [
    { id: "write", icon: ICONS.write, label: "Écrire" },
    { id: "structure", icon: ICONS.structure, label: "Tableau" },
    { id: "characters", icon: ICONS.characters, label: "Personnages" },
    { id: "notes", icon: ICONS.notes, label: "Notes" },
    { id: "stats", icon: ICONS.stats, label: "Stats" },
  ];

  const atelierTabs = [
    { id: "intrigue", icon: ICONS.intrigue, label: "Intrigue" },
    { id: "arcs", icon: ICONS.arcs, label: "Arcs" },
    { id: "mindmap", icon: ICONS.mindmap, label: "Mindmap" },
    { id: "relations", icon: ICONS.relations, label: "Relations" },
    { id: "timeline", icon: ICONS.timeline, label: "Timeline" },
    { id: "map", icon: ICONS.map, label: "Carte" },
    { id: "universe", icon: ICONS.universe, label: "Univers" },
    { id: "codex", icon: ICONS.codex, label: "Codex" },
  ];

  const chapters = [
    {
      id: "ch1", title: "Acte I — L'Appel", scenes: [
        { id: "s1-1", title: "Le sanctuaire oublié", status: "done", words: 2340 },
        { id: "s1-2", title: "La voix dans le brouillard", status: "progress", words: 1876 },
        { id: "s1-3", title: "Le choix de Yuki", status: "draft", words: 450 },
      ]
    },
    {
      id: "ch2", title: "Acte I — Le Seuil", scenes: [
        { id: "s2-1", title: "Traversée du torii", status: "draft", words: 0 },
        { id: "s2-2", title: "Rencontre avec Kael", status: "draft", words: 0 },
      ]
    },
    {
      id: "ch3", title: "Acte II — L'Épreuve", scenes: [
        { id: "s3-1", title: "Le marché des esprits", status: "draft", words: 0 },
      ]
    },
  ];

  const toggleChapter = (id) => {
    setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const statusLabel = { done: "Terminé", progress: "En cours", draft: "Brouillon", revise: "À réviser" };

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#faf9f7",
      fontFamily: "'Source Serif 4', 'Georgia', serif",
      color: "#2c2825",
      overflow: "hidden",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,300;8..60,400;8..60,500;8..60,600&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* ========== HEADER ========== */}
      <header style={{
        height: 48,
        minHeight: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        borderBottom: "1px solid #e8e4df",
        background: "#ffffff",
        zIndex: 100,
      }}>
        {/* Left: Logo + Project */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{
            fontFamily: "'Source Serif 4', serif",
            fontWeight: 600,
            fontSize: 18,
            color: "#8b7355",
            letterSpacing: "-0.02em",
          }}>
            plume
          </span>
          <div style={{
            width: 1,
            height: 20,
            background: "#e0dbd5",
          }} />
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            fontWeight: 500,
            color: "#6b6560",
          }}>
            Chroniques du Sanctuaire
          </span>
          <span style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 10,
            fontWeight: 500,
            color: "#22c55e",
            background: "#f0fdf4",
            padding: "2px 6px",
            borderRadius: 4,
          }}>
            Sauvé
          </span>
        </div>

        {/* Center: Quick actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {[
            { icon: ICONS.undo, tip: "Annuler", key: "undo" },
            { icon: ICONS.redo, tip: "Rétablir", key: "redo" },
          ].map(btn => (
            <button
              key={btn.key}
              onMouseEnter={() => setShowTooltip(btn.key)}
              onMouseLeave={() => setShowTooltip(null)}
              style={{
                position: "relative",
                width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", background: "transparent",
                color: "#8b8580", borderRadius: 6, cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseOver={e => { e.currentTarget.style.background = "#f5f0eb"; e.currentTarget.style.color = "#5c5550"; }}
              onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8b8580"; }}
            >
              {btn.icon}
              {showTooltip === btn.key && (
                <span style={{
                  position: "absolute", bottom: -28,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11, color: "#fff", background: "#3c3835",
                  padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}>
                  {btn.tip}
                </span>
              )}
            </button>
          ))}

          <div style={{ width: 1, height: 18, background: "#e8e4df", margin: "0 6px" }} />

          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            height: 30, padding: "0 10px",
            border: "1px solid #e0dbd5", background: "#faf9f7",
            borderRadius: 6, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12, color: "#8b8580",
            transition: "all 0.15s",
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor = "#c5bfb8"; e.currentTarget.style.color = "#5c5550"; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = "#e0dbd5"; e.currentTarget.style.color = "#8b8580"; }}
          >
            {ICONS.search}
            <span>Rechercher…</span>
            <span style={{ fontSize: 10, color: "#b5b0aa", marginLeft: 8 }}>⌘F</span>
          </button>

          <div style={{ width: 1, height: 18, background: "#e8e4df", margin: "0 6px" }} />

          {[
            { icon: ICONS.save, tip: "Sauvegarder", key: "save" },
            { icon: ICONS.timer, tip: "Pomodoro", key: "timer" },
            { icon: ICONS.focus, tip: "Mode Focus", key: "focus" },
          ].map(btn => (
            <button
              key={btn.key}
              onMouseEnter={() => setShowTooltip(btn.key)}
              onMouseLeave={() => setShowTooltip(null)}
              style={{
                position: "relative",
                width: 32, height: 32,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", background: "transparent",
                color: "#8b8580", borderRadius: 6, cursor: "pointer",
                transition: "all 0.15s",
              }}
              onMouseOver={e => { e.currentTarget.style.background = "#f5f0eb"; e.currentTarget.style.color = "#5c5550"; }}
              onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8b8580"; }}
            >
              {btn.icon}
              {showTooltip === btn.key && (
                <span style={{
                  position: "absolute", bottom: -28,
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 11, color: "#fff", background: "#3c3835",
                  padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap",
                  pointerEvents: "none",
                }}>
                  {btn.tip}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Right: overflow menu */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, position: "relative" }}>
          <div style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 11,
            color: "#a09a94",
          }}>
            <span style={{ color: "#6b6560", fontWeight: 500 }}>4 666</span> mots
          </div>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            style={{
              width: 32, height: 32,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "none", background: showMoreMenu ? "#f5f0eb" : "transparent",
              color: "#8b8580", borderRadius: 6, cursor: "pointer",
            }}
          >
            {ICONS.more}
          </button>

          {showMoreMenu && (
            <div style={{
              position: "absolute", top: 40, right: 0,
              background: "#fff", border: "1px solid #e0dbd5",
              borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              padding: "6px", minWidth: 200, zIndex: 200,
              fontFamily: "'DM Sans', sans-serif",
            }}>
              {["Importer un texte", "Exporter le roman", "Sauvegarde JSON", "Snapshots", "Raccourcis clavier", "Thèmes", "Personnaliser", "Langues"].map((item, i) => (
                <div key={i}>
                  {(i === 3 || i === 5) && <div style={{ height: 1, background: "#f0ece7", margin: "4px 8px" }} />}
                  <div style={{
                    padding: "7px 12px",
                    fontSize: 13,
                    color: "#5c5550",
                    borderRadius: 5,
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                    onMouseOver={e => e.currentTarget.style.background = "#f8f5f1"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    {item}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* ========== MAIN CONTENT ========== */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ========== SIDEBAR ========== */}
        <aside style={{
          width: sidebarCollapsed ? 52 : 260,
          minWidth: sidebarCollapsed ? 52 : 260,
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid #e8e4df",
          background: "#ffffff",
          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          overflow: "hidden",
        }}>
          {/* Tab rail */}
          <div style={{
            display: "flex",
            flexDirection: sidebarCollapsed ? "column" : "row",
            gap: sidebarCollapsed ? 2 : 0,
            padding: sidebarCollapsed ? "8px 6px" : "0",
            borderBottom: sidebarCollapsed ? "none" : "1px solid #e8e4df",
          }}>
            {mainTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); if (sidebarCollapsed) setSidebarCollapsed(false); }}
                onMouseEnter={() => sidebarCollapsed && setShowTooltip("tab-" + tab.id)}
                onMouseLeave={() => setShowTooltip(null)}
                style={{
                  position: "relative",
                  flex: sidebarCollapsed ? "none" : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  height: sidebarCollapsed ? 38 : 40,
                  width: sidebarCollapsed ? 40 : "auto",
                  border: "none",
                  background: "transparent",
                  color: activeTab === tab.id ? "#8b7355" : "#a09a94",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 12,
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  cursor: "pointer",
                  borderBottom: !sidebarCollapsed && activeTab === tab.id ? "2px solid #8b7355" : "2px solid transparent",
                  borderRadius: sidebarCollapsed ? 6 : 0,
                  transition: "all 0.15s",
                }}
                onMouseOver={e => {
                  if (activeTab !== tab.id) e.currentTarget.style.color = "#6b6560";
                  if (sidebarCollapsed) e.currentTarget.style.background = "#f8f5f1";
                }}
                onMouseOut={e => {
                  if (activeTab !== tab.id) e.currentTarget.style.color = "#a09a94";
                  if (sidebarCollapsed) e.currentTarget.style.background = "transparent";
                }}
              >
                {tab.icon}
                {!sidebarCollapsed && <span>{tab.label}</span>}
                {sidebarCollapsed && showTooltip === "tab-" + tab.id && (
                  <span style={{
                    position: "absolute", left: 46, top: "50%", transform: "translateY(-50%)",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 11, color: "#fff", background: "#3c3835",
                    padding: "3px 8px", borderRadius: 4, whiteSpace: "nowrap",
                    pointerEvents: "none", zIndex: 50,
                  }}>
                    {tab.label}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Atelier toggle */}
          {!sidebarCollapsed && (
            <button
              onClick={() => setAtelierOpen(!atelierOpen)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                border: "none",
                borderBottom: "1px solid #e8e4df",
                background: atelierOpen ? "#faf5ef" : "transparent",
                color: atelierOpen ? "#8b7355" : "#b5b0aa",
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              <span style={{
                transform: atelierOpen ? "rotate(90deg)" : "rotate(0deg)",
                transition: "transform 0.2s",
                display: "flex",
              }}>
                {ICONS.expand}
              </span>
              Atelier
              <span style={{
                marginLeft: "auto",
                fontSize: 10,
                fontWeight: 400,
                color: "#c5bfb8",
                textTransform: "none",
                letterSpacing: 0,
              }}>
                Mindmap, Timeline, Carte…
              </span>
            </button>
          )}

          {/* Atelier sub-nav */}
          {!sidebarCollapsed && atelierOpen && (
            <div style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 4,
              padding: "8px 10px",
              borderBottom: "1px solid #e8e4df",
              background: "#fdfcfa",
            }}>
              {atelierTabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "5px 10px",
                    border: activeTab === tab.id ? "1px solid #d4c9b8" : "1px solid transparent",
                    background: activeTab === tab.id ? "#fff" : "transparent",
                    color: activeTab === tab.id ? "#8b7355" : "#8b8580",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    borderRadius: 6,
                    cursor: "pointer",
                    transition: "all 0.12s",
                    boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.04)" : "none",
                  }}
                  onMouseOver={e => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = "#f5f0eb";
                      e.currentTarget.style.color = "#6b6560";
                    }
                  }}
                  onMouseOut={e => {
                    if (activeTab !== tab.id) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#8b8580";
                    }
                  }}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Main sidebar content: structure tree */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: sidebarCollapsed ? 0 : "8px 0",
          }}>
            {!sidebarCollapsed && activeTab === "write" && (
              <>
                {/* Add button */}
                <div style={{ padding: "0 10px 8px", display: "flex", gap: 4 }}>
                  <button style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    height: 30,
                    border: "1px dashed #d4c9b8",
                    background: "transparent",
                    color: "#8b7355",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 12,
                    fontWeight: 500,
                    borderRadius: 6,
                    cursor: "pointer",
                    transition: "all 0.12s",
                  }}
                    onMouseOver={e => { e.currentTarget.style.background = "#faf5ef"; e.currentTarget.style.borderStyle = "solid"; }}
                    onMouseOut={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderStyle = "dashed"; }}
                  >
                    {ICONS.plus} Nouveau chapitre
                  </button>
                </div>

                {/* Chapter tree */}
                {chapters.map(chapter => (
                  <div key={chapter.id} style={{ marginBottom: 2 }}>
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        padding: "7px 10px 7px 10px",
                        border: "none",
                        background: "transparent",
                        color: "#4a4540",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12.5,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background 0.1s",
                        textAlign: "left",
                      }}
                      onMouseOver={e => e.currentTarget.style.background = "#f8f5f1"}
                      onMouseOut={e => e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{
                        transform: expandedChapters[chapter.id] ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.15s",
                        display: "flex",
                        color: "#a09a94",
                      }}>
                        {ICONS.expand}
                      </span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {chapter.title}
                      </span>
                      <span style={{
                        fontSize: 10,
                        color: "#c5bfb8",
                        fontWeight: 400,
                      }}>
                        {chapter.scenes.length}
                      </span>
                    </button>

                    {expandedChapters[chapter.id] && (
                      <div style={{ paddingBottom: 4 }}>
                        {chapter.scenes.map(scene => (
                          <button
                            key={scene.id}
                            onClick={() => setActiveScene(scene.id)}
                            style={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "6px 10px 6px 32px",
                              border: "none",
                              background: activeScene === scene.id ? "#f5f0eb" : "transparent",
                              color: activeScene === scene.id ? "#4a4540" : "#6b6560",
                              fontFamily: "'DM Sans', sans-serif",
                              fontSize: 12,
                              fontWeight: activeScene === scene.id ? 500 : 400,
                              cursor: "pointer",
                              transition: "all 0.1s",
                              textAlign: "left",
                              borderLeft: activeScene === scene.id ? "2px solid #8b7355" : "2px solid transparent",
                            }}
                            onMouseOver={e => {
                              if (activeScene !== scene.id) e.currentTarget.style.background = "#faf8f5";
                            }}
                            onMouseOut={e => {
                              if (activeScene !== scene.id) e.currentTarget.style.background = "transparent";
                            }}
                          >
                            <span style={{
                              width: 7, height: 7, minWidth: 7,
                              borderRadius: "50%",
                              background: STATUS_COLORS[scene.status],
                              opacity: 0.8,
                            }} />
                            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {scene.title}
                            </span>
                            <span style={{
                              fontSize: 10,
                              color: "#c5bfb8",
                              fontWeight: 400,
                              fontVariantNumeric: "tabular-nums",
                            }}>
                              {scene.words > 0 ? scene.words : "—"}
                            </span>
                          </button>
                        ))}
                        <button style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          padding: "5px 10px 5px 32px",
                          border: "none",
                          background: "transparent",
                          color: "#c5bfb8",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 11,
                          cursor: "pointer",
                          transition: "color 0.1s",
                        }}
                          onMouseOver={e => e.currentTarget.style.color = "#8b7355"}
                          onMouseOut={e => e.currentTarget.style.color = "#c5bfb8"}
                        >
                          {ICONS.plus} Scène
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            {!sidebarCollapsed && activeTab === "characters" && (
              <div style={{ padding: "12px 14px", fontFamily: "'DM Sans', sans-serif" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#a09a94", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                  Personnages principaux
                </div>
                {[
                  { name: "Yuki Tanaka", role: "Protagoniste", color: "#8b5cf6" },
                  { name: "Kael", role: "Mentor / Guide", color: "#06b6d4" },
                  { name: "Haruki", role: "Antagoniste", color: "#ef4444" },
                ].map((char, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 10px", marginBottom: 2,
                    borderRadius: 6, cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                    onMouseOver={e => e.currentTarget.style.background = "#f8f5f1"}
                    onMouseOut={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%",
                      background: char.color + "18",
                      border: `1.5px solid ${char.color}40`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 600, color: char.color,
                    }}>
                      {char.name[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#4a4540" }}>{char.name}</div>
                      <div style={{ fontSize: 11, color: "#a09a94" }}>{char.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!sidebarCollapsed && !["write", "characters"].includes(activeTab) && (
              <div style={{
                padding: "40px 20px",
                textAlign: "center",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                <div style={{ fontSize: 13, color: "#a09a94", marginBottom: 4 }}>
                  Vue : <strong style={{ color: "#6b6560" }}>
                    {[...mainTabs, ...atelierTabs].find(t => t.id === activeTab)?.label}
                  </strong>
                </div>
                <div style={{ fontSize: 12, color: "#c5bfb8" }}>
                  Contenu affiché ici
                </div>
              </div>
            )}
          </div>

          {/* Sidebar footer: collapse toggle + progress */}
          <div style={{
            borderTop: "1px solid #e8e4df",
            padding: sidebarCollapsed ? "8px 6px" : "8px 12px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={{
                width: 28, height: 28,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "none", background: "transparent",
                color: "#a09a94", borderRadius: 4, cursor: "pointer",
              }}
            >
              {sidebarCollapsed ? ICONS.expand : ICONS.collapse}
            </button>
            {!sidebarCollapsed && (
              <div style={{ flex: 1, fontFamily: "'DM Sans', sans-serif" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#a09a94", marginBottom: 3 }}>
                  <span>Progression</span>
                  <span>33%</span>
                </div>
                <div style={{
                  height: 3, background: "#ede8e3", borderRadius: 2, overflow: "hidden",
                }}>
                  <div style={{
                    width: "33%", height: "100%",
                    background: "linear-gradient(90deg, #8b7355, #a68b5b)",
                    borderRadius: 2,
                    transition: "width 0.3s",
                  }} />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ========== EDITOR AREA ========== */}
        <main style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Scene breadcrumb bar */}
          <div style={{
            height: 36, minHeight: 36,
            display: "flex",
            alignItems: "center",
            padding: "0 24px",
            borderBottom: "1px solid #f0ece7",
            background: "#fdfcfa",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 12,
            color: "#a09a94",
            gap: 6,
          }}>
            <span>Acte I</span>
            <span style={{ color: "#d4c9b8" }}>/</span>
            <span>L'Appel</span>
            <span style={{ color: "#d4c9b8" }}>/</span>
            <span style={{ color: "#4a4540", fontWeight: 500 }}>La voix dans le brouillard</span>
            <span style={{
              marginLeft: 8,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              background: STATUS_COLORS.progress + "18",
              color: STATUS_COLORS.progress,
              borderRadius: 4,
              fontSize: 10,
              fontWeight: 600,
            }}>
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_COLORS.progress }} />
              En cours
            </span>
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: "#c5bfb8" }}>1 876 mots</span>
          </div>

          {/* Editor body */}
          <div style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            overflow: "auto",
            padding: "40px 24px",
          }}>
            <div style={{
              width: "100%",
              maxWidth: 680,
            }}>
              <h2 style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: 26,
                fontWeight: 500,
                color: "#2c2825",
                marginBottom: 24,
                letterSpacing: "-0.01em",
              }}>
                La voix dans le brouillard
              </h2>

              <div style={{
                fontFamily: "'Source Serif 4', serif",
                fontSize: 17,
                lineHeight: 1.85,
                color: "#3c3835",
                letterSpacing: "0.005em",
              }}>
                <p style={{ marginBottom: 20, textIndent: 24 }}>
                  Le brouillard s'épaississait entre les cèdres centenaires, avalant le sentier
                  comme une créature vivante. Yuki serra les pans de son haori contre sa poitrine.
                  Quelque part dans cette brume, une voix l'appelait — pas avec des mots, mais avec
                  quelque chose de plus ancien que le langage.
                </p>
                <p style={{ marginBottom: 20, textIndent: 24 }}>
                  Elle aurait dû rebrousser chemin. C'était ce que la raison lui commandait,
                  ce que sa grand-mère lui avait toujours répété : <em>« Quand la montagne te
                  parle, ne réponds pas. »</em> Mais la voix ne venait pas de la montagne.
                  Elle venait de l'intérieur.
                </p>
                <p style={{ marginBottom: 20, textIndent: 24, color: "#6b6560" }}>
                  Un torii vermillon apparut dans la brume, ses piliers inclinés comme des os
                  fatigués. La peinture s'écaillait par plaques, révélant le bois gris en dessous.
                  Personne n'avait entretenu ce sanctuaire depuis des décennies. Et pourtant…
                </p>
                <p style={{
                  marginBottom: 20, textIndent: 24,
                  color: "#b5b0aa",
                  fontStyle: "italic",
                }}>
                  Continuer à écrire ici…
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Legend overlay */}
      <div style={{
        position: "fixed",
        bottom: 16, right: 16,
        background: "#fff",
        border: "1px solid #e8e4df",
        borderRadius: 10,
        padding: "14px 18px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 11,
        color: "#6b6560",
        maxWidth: 280,
        lineHeight: 1.5,
        zIndex: 50,
      }}>
        <div style={{ fontWeight: 600, marginBottom: 6, color: "#4a4540", fontSize: 12 }}>
          Prototype — Configuration proposée
        </div>
        <div style={{ marginBottom: 4 }}>
          <strong>Header :</strong> Logo + Projet + Undo/Redo + Recherche + Save/Pomodoro/Focus + Menu overflow (⋯)
        </div>
        <div style={{ marginBottom: 4 }}>
          <strong>Sidebar 5 onglets :</strong> Écrire · Tableau · Personnages · Notes · Stats
        </div>
        <div>
          <strong>Tiroir "Atelier" :</strong> 8 outils avancés cachés par défaut (Intrigue, Arcs, Mindmap, Relations, Timeline, Carte, Univers, Codex)
        </div>
      </div>
    </div>
  );
}

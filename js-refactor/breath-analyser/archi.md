breath/
├── model/
│   ├── BreathConfig.js
│   ├── BreathAnalyzer.js
│   └── BreathTypes.js
│
├── service/
│   └── BreathAnalysisService.js
│
├── viewmodel/
│   └── BreathViewModel.js
│
├── view/
│   ├── BreathRenderer.js
│   └── BreathStyles.js
│
└── BreathController.js

🎯 Objectif UX (à ne jamais perdre)

L’utilisateur ne doit pas avoir l’impression que l’outil “analyse” son texte
👉 il doit sentir que l’outil lui révèle le souffle du texte

Donc :

- pas de couleurs agressives
- pas de surlignage façon correcteur
- tout doit rester suggestif, optionnel, lisible

🧠 Ce que tu analyses (résumé)

Tu as :

 - une tension continue
 - des zones hautes (action)
 - des zones basses (respiration)
 - des points de coupure idéaux

👉 Visuellement, ça doit être :

 - une cartographie, pas une correction

🧩 1️⃣La meilleure ancre visuelle : la marge gauche du texte

❌ Ne touche PAS au texte directement (au moins par défaut)
✅ Utilise la marge comme couche d’analyse

Pourquoi ?

 - les écrivains lisent au centre

 - la marge = méta-information

 - Scrivener / Ulysses / iA Writer font pareil

👉 Proposition clé : la “colonne de souffle”

Dans la marge gauche, au niveau de chaque paragraphe :

▌Barre verticale fine (4–6px)

 - hauteur = paragraphe
 - couleur = tension locale

 - gris clair → repos
 - ocre → montée
 - or → tension forte
 - rouge sombre → pic

💡 EXACTEMENT la même palette que ton graphique d’intrigue
(cohérence mentale immédiate)

Exemple mental :
▌  Kumi commença à remonter la rue...
▌▌ Elle leva les yeux vers le Sanctuaire...
▌▌▌ Et c'est là que le fil noir...
▌▌▌▌ Kumi se mit à courir.
▌▌▌▌ Elle traversa la place...
▌▌ Elle plongea dans les ruelles...
▌  Tout était trop lumineux.


👉 Le lecteur voit le rythme sans lire

🧩 2️⃣Les points de coupure : subtils mais explicites
❌ Pas de ligne horizontale brutale
✅ Un marqueur flottant discret

Format idéal :

 - petit symbole ✂︎ ou ◦◦◦
 - placé entre deux paragraphes
 - opacity ~40 %

Exemple :

▌▌▌▌ Elle se mit à courir.

    ◦◦◦  Découpage suggéré

▌▌ Elle plongea dans les ruelles...


👉 Ça dit : “ici, tu peux”
Pas : “tu dois”

Interaction (très important)

hover → tooltip :

« Respiration narrative détectée
Tension en baisse (−32 %) »

clic → menu :

Découper ici

Ignorer cette suggestion

Désactiver pour cette scène

🧩 3️⃣ Mode “Analyse” ON / OFF (fondamental)

Par défaut : OFF

Quand ON :

 - marge visible
 - marqueurs visibles
 - texte inchangé

Quand OFF :

 - texte 100 % clean
 - aucune trace

👉 L’auteur garde le sentiment que le texte lui appartient

🧩 Mini-timeline verticale (option premium 🔥)

À droite du texte (ou repliable) :

Une timeline verticale ultra fine, alignée avec le scroll.

courbe de tension compressée

points = paragraphes

clic → scroll au paragraphe

C’est le pendant local de ton graphe global.

🧩 5️⃣ Interaction magique (mais simple)

Quand l’utilisateur :

clique sur un point du graphe d’intrigue
👉 tu highlightes la zone correspondante dans le texte

Pas en couleur.
Juste :

léger fond chaud

animation douce (200 ms)

👉 Effet waouh garanti.

🧩 6️⃣ Terminologie (TRÈS important)

Ne parle jamais de :
❌ “score”
❌ “analyse”
❌ “algorithme”

Mais de :
✅ Souffle
✅ Rythme
✅ Intensité
✅ Respiration
✅ Flux narratif

Exemple UI :

✨ Respiration détectée
Cette zone offre une pause naturelle au lecteur
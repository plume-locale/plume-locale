#!/usr/bin/env node
// =============================================================
// convert_to_js.js
// =============================================================
// Convertit synonyms_raw.json (produit par extract_wiktionary.py)
// en un fichier synonyms.dictionary.js compatible avec Plume.
//
// Deux modes de fonctionnement :
//   - MERGE  : fusionne avec le dictionnaire existant (garde les
//              entrées manuelles et enrichit avec les nouvelles)
//   - REPLACE: remplace complètement le dictionnaire
//
// Usage:
//   node convert_to_js.js [--mode merge|replace] [--max-syns 10]
//
// Options:
//   --mode       : 'merge' (défaut) ou 'replace'
//   --max-syns   : nombre max de synonymes par mot (défaut: 10)
//   --max-ants   : nombre max d'antonymes par mot (défaut: 6)
//   --min-word   : longueur minimale d'un mot (défaut: 2)
//   --max-words  : nombre max de mots dans le dico final (défaut: illimité)
//   --output     : fichier de sortie (défaut: ../../js/features/analysis/synonyms/synonyms.dictionary.js)
// =============================================================

const fs = require('fs');
const path = require('path');

// --- Parsing des arguments ---
const args = process.argv.slice(2);
const getArg = (name, def) => {
    const i = args.indexOf(name);
    return i !== -1 ? args[i + 1] : def;
};

const MODE = getArg('--mode', 'merge');       // 'merge' ou 'replace'
const MAX_SYNS = parseInt(getArg('--max-syns', '10'));
const MAX_ANTS = parseInt(getArg('--max-ants', '6'));
const MIN_WORD = parseInt(getArg('--min-word', '2'));
const MAX_WORDS = parseInt(getArg('--max-words', '999999'));

const SCRIPT_DIR = __dirname;
const RAW_JSON = path.join(SCRIPT_DIR, 'synonyms_raw.json');
const EXISTING_JS = path.join(SCRIPT_DIR, '../../js/features/analysis/synonyms/synonyms.dictionary.js');
const OUTPUT_JS = getArg('--output', EXISTING_JS);

// =============================================================
// Utilitaires
// =============================================================

function log(msg) {
    console.log(msg);
}

/**
 * Nettoyage d'un mot : supprime la ponctuation superflue,
 * normalise les apostrophes, etc.
 */
function cleanWord(w) {
    if (!w || typeof w !== 'string') return '';
    return w
        .trim()
        .toLowerCase()
        .replace(/["""«»]/g, '')
        .replace(/'/g, "'")    // Apostrophe courbe → droite
        .normalize('NFC');     // Normalisation Unicode
}

/**
 * Filtre un mot selon les critères de qualité
 */
function isValidWord(w) {
    if (!w || w.length < MIN_WORD) return false;
    // Exclure les mots avec trop de chiffres ou caractères spéciaux
    if (/\d/.test(w)) return false;
    // Autoriser lettres accentuées, tirets, apostrophes
    if (/[^a-záàâäéèêëîïôöùûüçœæ''\-\s]/i.test(w)) return false;
    return true;
}

/**
 * Extrait le dictionnaire existant depuis le fichier JS Plume.
 * Évalue la variable FrenchSynonymsDictionary en isolant le bloc.
 */
function extractExistingDictionary(jsPath) {
    if (!fs.existsSync(jsPath)) {
        log(`  [INFO] Pas de dictionnaire existant trouvé : ${jsPath}`);
        return {};
    }

    const content = fs.readFileSync(jsPath, 'utf8');

    // Extraire le contenu entre { et } de FrenchSynonymsDictionary
    const match = content.match(/const FrenchSynonymsDictionary\s*=\s*(\{[\s\S]*?\});\s*\n/);
    if (!match) {
        log('  [WARN] Impossible de parser le dictionnaire existant');
        return {};
    }

    try {
        // Évaluation sécurisée via Function
        const dict = new Function(`return (${match[1]})`)();
        log(`  [OK] Dictionnaire existant chargé : ${Object.keys(dict).length} mots`);
        return dict;
    } catch (e) {
        log(`  [WARN] Erreur de parsing : ${e.message}`);
        return {};
    }
}

// =============================================================
// Logique principale
// =============================================================

function main() {
    log('='.repeat(60));
    log('  CONVERSION → synonyms.dictionary.js');
    log('='.repeat(60));
    log(`  Mode          : ${MODE}`);
    log(`  Max synonymes : ${MAX_SYNS}`);
    log(`  Max antonymes : ${MAX_ANTS}`);
    log(`  Entrée JSON   : ${RAW_JSON}`);
    log(`  Sortie JS     : ${OUTPUT_JS}`);
    log('');

    // --- Lecture du JSON extrait ---
    if (!fs.existsSync(RAW_JSON)) {
        console.error(`[ERREUR] Fichier introuvable : ${RAW_JSON}`);
        console.error('         Lancez d\'abord : python extract_wiktionary.py');
        process.exit(1);
    }

    log('[...] Lecture du fichier JSON...');
    const rawData = JSON.parse(fs.readFileSync(RAW_JSON, 'utf8'));
    log(`[OK]  ${Object.keys(rawData).length.toLocaleString()} mots dans le JSON brut`);

    // --- Chargement du dictionnaire existant (mode MERGE) ---
    let existingDict = {};
    if (MODE === 'merge') {
        log('\n[...] Chargement du dictionnaire existant...');
        existingDict = extractExistingDictionary(EXISTING_JS);
    }

    // --- Construction du dictionnaire final ---
    log('\n[...] Construction du dictionnaire final...');

    const finalDict = { ...existingDict };
    let added = 0;
    let enriched = 0;
    let skipped = 0;

    // Tri alphabétique des mots du JSON brut
    const sortedWords = Object.keys(rawData).sort();

    for (const word of sortedWords) {
        if (Object.keys(finalDict).length >= MAX_WORDS) break;

        const entry = rawData[word];
        const cleanedWord = cleanWord(word);

        if (!isValidWord(cleanedWord)) {
            skipped++;
            continue;
        }

        // Filtrage et nettoyage des synonymes
        const rawSyns = (entry.synonymes || [])
            .map(cleanWord)
            .filter(isValidWord)
            .filter(s => s !== cleanedWord)
            .filter((s, i, arr) => arr.indexOf(s) === i) // dédupliquer
            .slice(0, MAX_SYNS);

        const rawAnts = (entry.antonymes || [])
            .map(cleanWord)
            .filter(isValidWord)
            .filter(a => a !== cleanedWord)
            .filter((a, i, arr) => arr.indexOf(a) === i)
            .slice(0, MAX_ANTS);

        if (rawSyns.length === 0) {
            skipped++;
            continue;
        }

        if (finalDict[cleanedWord]) {
            // MERGE : enrichir l'entrée existante
            const existingSyns = new Set(finalDict[cleanedWord].synonymes || []);
            const existingAnts = new Set(finalDict[cleanedWord].antonymes || []);

            rawSyns.forEach(s => existingSyns.add(s));
            rawAnts.forEach(a => existingAnts.add(a));

            finalDict[cleanedWord] = {
                synonymes: [...existingSyns].slice(0, MAX_SYNS),
                antonymes: [...existingAnts].slice(0, MAX_ANTS)
            };
            enriched++;
        } else {
            // Nouveau mot
            finalDict[cleanedWord] = {
                synonymes: rawSyns,
                antonymes: rawAnts
            };
            added++;
        }
    }

    log(`[OK]  Traitement terminé :`);
    log(`      - Nouveaux mots ajoutés  : ${added.toLocaleString()}`);
    log(`      - Mots enrichis (merge)  : ${enriched.toLocaleString()}`);
    log(`      - Mots ignorés           : ${skipped.toLocaleString()}`);
    log(`      - TOTAL dans le dico     : ${Object.keys(finalDict).toLocaleString()}`);

    // --- Tri final par ordre alphabétique ---
    const sortedDict = Object.fromEntries(
        Object.entries(finalDict).sort(([a], [b]) => a.localeCompare(b, 'fr'))
    );

    // --- Génération du fichier JS ---
    log('\n[...] Génération du fichier JS...');

    const totalWords = Object.keys(sortedDict).length;
    const totalSyns = Object.values(sortedDict)
        .reduce((acc, e) => acc + (e.synonymes?.length || 0), 0);
    const totalAnts = Object.values(sortedDict)
        .reduce((acc, e) => acc + (e.antonymes?.length || 0), 0);

    // En-tête du fichier
    const header = `// ============================================================
// synonyms.dictionary.js - Dictionnaire local de synonymes français
// ============================================================
// [MVVM : Data] - Base de données locale de synonymes français
//
// Généré automatiquement par scripts/build-dictionary/convert_to_js.js
// Source : Wiktionnaire français (kaikki.org) — Licence CC BY-SA
// Date   : ${new Date().toLocaleDateString('fr-FR')}
//
// Statistiques :
//   - Mots indexés    : ${totalWords.toLocaleString('fr-FR')}
//   - Synonymes total : ${totalSyns.toLocaleString('fr-FR')}
//   - Antonymes total : ${totalAnts.toLocaleString('fr-FR')}
// ============================================================

/**
 * Dictionnaire de synonymes français
 * Structure : mot -> { synonymes: [], antonymes: [] }
 * [MVVM : Data]
 */
const FrenchSynonymsDictionary = {`;

    // Corps : une entrée par mot
    const entries = [];
    for (const [word, data] of Object.entries(sortedDict)) {
        const synsStr = JSON.stringify(data.synonymes || []);
        const antsStr = JSON.stringify(data.antonymes || []);
        entries.push(`    ${JSON.stringify(word)}: {\n        synonymes: ${synsStr},\n        antonymes: ${antsStr}\n    }`);
    }

    // Fonctions de recherche (recopiées du fichier original)
    const footer = `
};

/**
 * Recherche des synonymes dans le dictionnaire local
 * @param {string} word - Mot à rechercher
 * @returns {Array} Liste de synonymes formatés
 * [MVVM : Data]
 */
function searchLocalSynonyms(word) {
    const cleanWord = word.toLowerCase().trim();
    const entry = FrenchSynonymsDictionary[cleanWord];

    if (!entry) {
        // Recherche partielle (mots qui commencent par...)
        const partialMatches = [];
        for (const [key, value] of Object.entries(FrenchSynonymsDictionary)) {
            if (key.startsWith(cleanWord) && value.synonymes) {
                partialMatches.push(...value.synonymes.slice(0, 3));
            }
        }
        if (partialMatches.length > 0) {
            return [...new Set(partialMatches)].slice(0, 10).map((syn, index) => ({
                word: syn,
                score: 100 - index * 5,
                tags: [],
                category: 'autre'
            }));
        }
        return [];
    }

    return (entry.synonymes || []).map((syn, index) => ({
        word: syn,
        score: 100 - index * 5,
        tags: [],
        category: 'autre'
    }));
}

/**
 * Recherche des antonymes dans le dictionnaire local
 * @param {string} word - Mot à rechercher
 * @returns {Array} Liste d'antonymes formatés
 * [MVVM : Data]
 */
function searchLocalAntonyms(word) {
    const cleanWord = word.toLowerCase().trim();
    const entry = FrenchSynonymsDictionary[cleanWord];

    if (!entry || !entry.antonymes) {
        return [];
    }

    return entry.antonymes.map((ant, index) => ({
        word: ant,
        score: 100 - index * 5,
        tags: [],
        category: 'autre'
    }));
}

/**
 * Recherche des mots similaires (qui contiennent le mot recherché)
 * @param {string} word - Mot à rechercher
 * @returns {Array} Liste de mots similaires
 * [MVVM : Data]
 */
function searchLocalSimilar(word) {
    const cleanWord = word.toLowerCase().trim();
    const similar = [];

    for (const key of Object.keys(FrenchSynonymsDictionary)) {
        if (key.includes(cleanWord) && key !== cleanWord) {
            similar.push({
                word: key,
                score: 80,
                tags: [],
                category: 'autre'
            });
        }
    }

    return similar.slice(0, 10);
}

// Export pour utilisation dans d'autres modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FrenchSynonymsDictionary,
        searchLocalSynonyms,
        searchLocalAntonyms,
        searchLocalSimilar
    };
}
`;

    const jsContent = header + '\n' + entries.join(',\n') + '\n' + footer;

    // Vérification du dossier de sortie
    const outputDir = path.dirname(OUTPUT_JS);
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Backup du fichier existant
    if (fs.existsSync(OUTPUT_JS)) {
        const backupPath = OUTPUT_JS.replace('.js', `.backup-${Date.now()}.js`);
        fs.copyFileSync(OUTPUT_JS, backupPath);
        log(`[OK]  Backup créé : ${path.basename(backupPath)}`);
    }

    fs.writeFileSync(OUTPUT_JS, jsContent, 'utf8');

    const sizeMB = (fs.statSync(OUTPUT_JS).size / 1_000_000).toFixed(1);
    log(`[OK]  Fichier écrit : ${OUTPUT_JS} (${sizeMB} MB)`);

    log('\n' + '='.repeat(60));
    log('  ✅  Conversion terminée !');
    log(`  📚  ${totalWords.toLocaleString('fr-FR')} mots | ${totalSyns.toLocaleString('fr-FR')} synonymes | ${totalAnts.toLocaleString('fr-FR')} antonymes`);
    log('='.repeat(60));
}

main();

import json

fr_lexicon = {
    'magnifique': 5, 'merveilleux': 5, 'extraordinaire': 5, 'exceptionnel': 5,
    'sublime': 5, 'splendide': 5, 'fantastique': 5, 'parfait': 5,
    'brillant': 4, 'admirable': 4, 'remarquable': 4, 'superbe': 4,
    'bien': 2, 'bon': 2, 'bonne': 2, 'beau': 2, 'belle': 2,
    'heureux': 3, 'heureuse': 3, 'joyeux': 3, 'joyeuse': 3,
    'mauvais': -2, 'mal': -2, 'triste': -3, 'tristesse': -3,
    'mélancolie': -3, 'chagrin': -3, 'douleur': -3, 'souffrance': -3,
    'peur': -3, 'crainte': -3, 'terreur': -4, 'horreur': -4,
    'colère': -3, 'rage': -4, 'fureur': -4, 'courroux': -3,
    'haine': -4, 'mépris': -3, 'dégoût': -3, 'répugnance': -3,
    'atroce': -5, 'abominable': -5, 'monstrueux': -5, 'ignoble': -5,
    'horrible': -4, 'effroyable': -5, 'épouvantable': -5, 'cauchemardesque': -4
}

fr_negations = ['ne', "n'", 'pas', 'plus', 'jamais', 'rien', 'aucun', 'aucune', 'sans', 'ni', 'non', 'guère', 'nullement', 'point', 'nul', 'nulle']
fr_amplifiers = ['très', 'trop', 'vraiment', 'tellement', 'extrêmement', 'absolument', 'totalement', 'complètement', 'parfaitement', 'profondément', 'incroyablement', 'réellement', 'véritablement', 'particulièrement', 'terriblement', 'immensément', 'infiniment', 'intensément', 'fort']

fr_connectors = {
    'addition': { 'label': 'Addition', 'icon': 'plus', 'color': '#4ade80', 'ideal': { 'min': 5, 'max': 25 }, 'items': ['de plus', 'en outre', 'par ailleurs', 'en addition', 'également', 'aussi', 'de même', 'voire', 'encore', 'qui plus est', 'ajoutons que', 'sans compter', 'notamment', 'surtout', 'entre autres', 'à cela s\'ajoute', 'et', 'puis', 'ainsi que', 'avec'] },
    'opposition': { 'label': 'Opposition', 'icon': 'arrow-left-right', 'color': '#f87171', 'ideal': { 'min': 10, 'max': 30 }, 'items': ['cependant', 'néanmoins', 'toutefois', 'pourtant', 'mais', 'or', 'en revanche', 'par contre', 'au contraire', 'malgré cela', 'quand même', 'tout de même', 'malgré tout', 'il reste que', 'nonobstant', 'sauf que', 'si ce n\'est que', 'alors que', 'tandis que', 'même si', 'bien que', 'quoique', 'certes', 'si', 'contrairement', 'à l\'inverse', 'à l\'opposé'] },
    'cause': { 'label': 'Cause', 'icon': 'git-branch', 'color': '#fb923c', 'ideal': { 'min': 5, 'max': 20 }, 'items': ['car', 'parce que', 'puisque', 'comme', 'vu que', 'étant donné que', 'du fait que', 'en raison de', 'attendu que', 'sous prétexte que', 'à cause de', 'grâce à', 'par suite de', 'faute de', 'en vertu de', 'sous l\'effet de', 'c\'est pourquoi', 'voilà pourquoi'] },
    'consequence': { 'label': 'Conséquence', 'icon': 'corner-down-right', 'color': '#a78bfa', 'ideal': { 'min': 5, 'max': 25 }, 'items': ['donc', 'ainsi', 'par conséquent', 'en conséquence', 'c\'est pourquoi', 'dès lors', 'aussi', 'de ce fait', 'c\'est ainsi que', 'voilà pourquoi', 'si bien que', 'de sorte que', 'à tel point que', 'tellement que', 'il en résulte que', 'il s\'ensuit que', 'd\'où', 'résultat', 'bilan', 'finalement'] },
    'illustration': { 'label': 'Illustration', 'icon': 'lightbulb', 'color': '#fbbf24', 'ideal': { 'min': 5, 'max': 20 }, 'items': ['par exemple', 'notamment', 'c\'est-à-dire', 'tel que', 'comme', 'ainsi', 'soit', 'à savoir', 'en particulier', 'en l\'occurrence', 'entre autres', 'illustrons', 'prenons l\'exemple', 'tel est le cas'] },
    'time': { 'label': 'Temps', 'icon': 'clock', 'color': '#38bdf8', 'ideal': { 'min': 10, 'max': 35 }, 'items': ['ensuite', 'puis', 'enfin', 'finalement', 'auparavant', 'soudain', 'alors', 'après', 'avant', 'désormais', 'dorénavant', 'jadis', 'naguère', 'autrefois', 'hier', 'aujourd\'hui', 'demain', 'bientôt', 'tout à coup', 'soudainement', 'progressivement', 'peu à peu', 'lentement', 'rapidement', 'aussitôt', 'sitôt que', 'dès que', 'quand', 'lorsque', 'tandis que', 'pendant que', 'simultanément', 'en même temps', 'par la suite', 'dans un premier temps', 'dans un second temps', 'en premier lieu', 'en dernier lieu', 'entre-temps', 'maintenant', 'à ce moment', 'à présent'] },
    'concession': { 'label': 'Concession', 'icon': 'shuffle', 'color': '#e879f9', 'ideal': { 'min': 5, 'max': 20 }, 'items': ['certes', 'bien sûr', 'évidemment', 'sans doute', 'il est vrai que', 'je l\'accorde', 'je le concède', 'c\'est exact', 'en effet', 'assurément', 'à juste titre', 'bien que', 'quoique', 'même si', 'quand bien même', 'en dépit de', 'malgré', 'nonobstant', 'si tant est que'] },
    'conclusion': { 'label': 'Conclusion', 'icon': 'flag', 'color': '#34d399', 'ideal': { 'min': 2, 'max': 10 }, 'items': ['en conclusion', 'en résumé', 'en somme', 'bref', 'en définitive', 'en fin de compte', 'finalement', 'pour conclure', 'pour finir', 'au fond', 'en tout état de cause', 'au total', 'en dernier ressort', 'somme toute', 'en dernière analyse', 'en guise de conclusion', 'ainsi', 'voilà pourquoi'] }
}

en_lexicon = {
    'magnificent': 5, 'wonderful': 5, 'extraordinary': 5, 'exceptional': 5,
    'sublime': 5, 'splendid': 5, 'fantastic': 5, 'perfect': 5,
    'brilliant': 4, 'admirable': 4, 'remarkable': 4, 'superb': 4,
    'good': 2, 'beautiful': 2, 'handsome': 2, 'nice': 2,
    'happy': 3, 'joyful': 3, 'glad': 2, 'content': 2,
    'bad': -2, 'sad': -3, 'sorrow': -3, 'pain': -3, 'suffering': -3,
    'fear': -3, 'terror': -4, 'horror': -4, 'scared': -3,
    'anger': -3, 'rage': -4, 'fury': -4, 'mad': -3,
    'hate': -4, 'contempt': -3, 'disgust': -3, 'repugnance': -3,
    'atrocious': -5, 'abominable': -5, 'monstrous': -5, 'ignoble': -5,
    'horrible': -4, 'frightful': -5, 'appalling': -5, 'nightmarish': -4
}
en_negations = ['not', 'never', 'no', 'none', 'neither', 'nor', 'barely', 'hardly', 'scarcely', 'nothing', "don't", "doesn't", "didn't", "can't", "couldn't", "won't", "wouldn't", "isn't", "aren't", "ain't", "hasn't", "haven't", "hadn't"]
en_amplifiers = ['very', 'too', 'really', 'so', 'extremely', 'absolutely', 'totally', 'completely', 'perfectly', 'deeply', 'incredibly', 'truly', 'particularly', 'terribly', 'immensely', 'infinitely', 'intensely', 'highly']
en_connectors = {
    'addition': { 'label': 'Addition', 'icon': 'plus', 'color': '#4ade80', 'ideal': { 'min': 5, 'max': 25 }, 'items': ['and', 'moreover', 'furthermore', 'also', 'in addition', 'additionally', 'as well as', 'besides', 'too'] },
    'opposition': { 'label': 'Opposition', 'icon': 'arrow-left-right', 'color': '#f87171', 'ideal': { 'min': 10, 'max': 30 }, 'items': ['however', 'nevertheless', 'yet', 'but', 'although', 'even though', 'on the other hand', 'conversely', 'in contrast', 'while', 'whereas'] },
    'cause': { 'label': 'Cause', 'icon': 'git-branch', 'color': '#fb923c', 'ideal': { 'min': 5, 'max': 20 }, 'items': ['because', 'since', 'as', 'due to', 'given that', 'for', 'owing to'] },
    'consequence': { 'label': 'Consequence', 'icon': 'corner-down-right', 'color': '#a78bfa', 'ideal': { 'min': 5, 'max': 25 }, 'items': ['therefore', 'thus', 'consequently', 'as a result', 'so', 'hence', 'accordingly', 'thereby'] },
    'illustration': { 'label': 'Illustration', 'icon': 'lightbulb', 'color': '#fbbf24', 'ideal': { 'min': 5, 'max': 20 }, 'items': ['for example', 'for instance', 'such as', 'namely', 'specifically', 'to illustrate'] },
    'time': { 'label': 'Time', 'icon': 'clock', 'color': '#38bdf8', 'ideal': { 'min': 10, 'max': 35 }, 'items': ['then', 'next', 'finally', 'suddenly', 'after', 'before', 'now', 'meanwhile', 'subsequently', 'previously', 'soon', 'later', 'currently'] },
    'concession': { 'label': 'Concession', 'icon': 'shuffle', 'color': '#e879f9', 'ideal': { 'min': 5, 'max': 20 }, 'items': ['admittedly', 'granted', 'of course', 'even if', 'despite', 'in spite of', 'even so', 'be that as it may'] },
    'conclusion': { 'label': 'Conclusion', 'icon': 'flag', 'color': '#34d399', 'ideal': { 'min': 2, 'max': 10 }, 'items': ['in conclusion', 'to summarize', 'in short', 'briefly', 'ultimately', 'to conclude', 'all in all'] }
}

es_lexicon = {
    'magnífico': 5, 'maravilloso': 5, 'extraordinario': 5, 'excepcional': 5,
    'sublime': 5, 'espléndido': 5, 'fantástico': 5, 'perfecto': 5,
    'brillante': 4, 'admirable': 4, 'notable': 4, 'soberbio': 4,
    'bueno': 2, 'hermoso': 2, 'bello': 2, 'lindo': 2,
    'feliz': 3, 'alegre': 3, 'contento': 2, 'satisfecho': 2,
    'malo': -2, 'triste': -3, 'tristeza': -3, 'dolor': -3, 'sufrimiento': -3,
    'miedo': -3, 'terror': -4, 'horror': -4, 'asustado': -3,
    'ira': -3, 'rabia': -4, 'furia': -4, 'enojado': -3,
    'odio': -4, 'desprecio': -3, 'asco': -3, 'repugnancia': -3,
    'atroz': -5, 'abominable': -5, 'monstruoso': -5, 'ignoble': -5,
    'horrible': -4, 'espantoso': -5, 'aterrador': -5, 'pesadilla': -4
}
es_negations = ['no', 'nunca', 'jamás', 'nada', 'nadie', 'ningún', 'ninguna', 'ni', 'tampoco', 'sin']
es_amplifiers = ['muy', 'demasiado', 'realmente', 'tan', 'extremadamente', 'absolutamente', 'totalmente', 'completamente', 'perfectamente', 'profundamente', 'increíblemente', 'verdaderamente', 'particularmente', 'terriblemente', 'inmensamente', 'altamente']
es_connectors = {
    'addition': { 'label': 'Adición', 'icon': 'plus', 'color': '#4ade80', 'ideal': { 'min': 5, 'max': 25 }, 'items': ['y', 'además', 'también', 'asimismo', 'igualmente', 'por añadidura', 'incluso'] },
    'opposition': { 'label': 'Oposición', 'icon': 'arrow-left-right', 'color': '#f87171', 'ideal': { 'min': 10, 'max': 30 }, 'items': ['sin embargo', 'no obstante', 'pero', 'aunque', 'por el contrario', 'en cambio', 'mientras que'] },
    'cause': { 'label': 'Causa', 'icon': 'git-branch', 'color': '#fb923c', 'ideal': { 'min': 5, 'max': 20 }, 'items': ['porque', 'ya que', 'puesto que', 'dado que', 'debido a', 'pues', 'a causa de'] },
    'consequence': { 'label': 'Consecuencia', 'icon': 'corner-down-right', 'color': '#a78bfa', 'ideal': { 'min': 5, 'max': 25 }, 'items': ['por lo tanto', 'por consiguiente', 'así que', 'en consecuencia', 'entonces', 'de ahí que', 'por ende'] },
    'illustration': { 'label': 'Ilustración', 'icon': 'lightbulb', 'color': '#fbbf24', 'ideal': { 'min': 5, 'max': 20 }, 'items': ['por ejemplo', 'en particular', 'es decir', 'como', 'a saber', 'específicamente'] },
    'time': { 'label': 'Tiempo', 'icon': 'clock', 'color': '#38bdf8', 'ideal': { 'min': 10, 'max': 35 }, 'items': ['luego', 'después', 'antes', 'finalmente', 'mientras', 'ahora', 'pronto', 'entonces', 'luego', 'de repente', 'previamente'] },
    'concession': { 'label': 'Concesión', 'icon': 'shuffle', 'color': '#e879f9', 'ideal': { 'min': 5, 'max': 20 }, 'items': ['ciertamente', 'aunque', 'a pesar de', 'aun si', 'aun cuando', 'si bien'] },
    'conclusion': { 'label': 'Conclusión', 'icon': 'flag', 'color': '#34d399', 'ideal': { 'min': 2, 'max': 10 }, 'items': ['en conclusión', 'en resumen', 'en fin', 'en suma', 'para terminar', 'en definitiva'] }
}

de_lexicon = {
    'großartig': 5, 'wunderbar': 5, 'außergewöhnlich': 5, 'hervorragend': 5,
    'erhaben': 5, 'prächtig': 5, 'fantastisch': 5, 'perfekt': 5,
    'brillant': 4, 'bewundernswert': 4, 'bemerkenswert': 4, 'superb': 4,
    'gut': 2, 'schön': 2, 'hübsch': 2, 'nett': 2,
    'glücklich': 3, 'fröhlich': 3, 'froh': 2, 'zufrieden': 2,
    'schlecht': -2, 'traurig': -3, 'leid': -3, 'schmerz': -3, 'leiden': -3,
    'angst': -3, 'terror': -4, 'horror': -4, 'verängstigt': -3,
    'wut': -3, 'zorn': -4, 'wütend': -3, 'böse': -3,
    'hass': -4, 'verachtung': -3, 'ekel': -3, 'abneigung': -3,
    'grauenhaft': -5, 'abscheulich': -5, 'monströs': -5, 'unwürdig': -5,
    'schrecklich': -4, 'furchtbar': -5, 'entsetzlich': -5, 'albtraumhaft': -4
}
de_negations = ['nicht', 'nie', 'niemals', 'nichts', 'niemand', 'kein', 'keine', 'weder', 'noch', 'ohne', 'kaum']
de_amplifiers = ['sehr', 'zu', 'wirklich', 'so', 'extrem', 'absolut', 'völlig', 'komplett', 'perfekt', 'tief', 'unglaublich', 'wahrhaft', 'besonders', 'schrecklich', 'unermesslich', 'unendlich', 'intensiv', 'höchst']
de_connectors = {
    'addition': { 'label': 'Zusatz', 'icon': 'plus', 'color': '#4ade80', 'ideal': { 'min': 5, 'max': 25 }, 'items': ['und', 'außerdem', 'zudem', 'darüber hinaus', 'ebenfalls', 'auch', 'dazu', 'zusätzlich'] },
    'opposition': { 'label': 'Gegensatz', 'icon': 'arrow-left-right', 'color': '#f87171', 'ideal': { 'min': 10, 'max': 30 }, 'items': ['jedoch', 'aber', 'obwohl', 'dagegen', 'trotzdem', 'dennoch', 'hingegen', 'während'] },
    'cause': { 'label': 'Ursache', 'icon': 'git-branch', 'color': '#fb923c', 'ideal': { 'min': 5, 'max': 20 }, 'items': ['weil', 'da', 'aufgrund', 'wegen', 'denn', 'nämlich'] },
    'consequence': { 'label': 'Folge', 'icon': 'corner-down-right', 'color': '#a78bfa', 'ideal': { 'min': 5, 'max': 25 }, 'items': ['daher', 'deshalb', 'folglich', 'somit', 'also', 'infolgedessen', 'demzufolge'] },
    'illustration': { 'label': 'Beispiel', 'icon': 'lightbulb', 'color': '#fbbf24', 'ideal': { 'min': 5, 'max': 20 }, 'items': ['zum beispiel', 'beispielsweise', 'nämlich', 'wie', 'das heißt', 'insbesondere'] },
    'time': { 'label': 'Zeit', 'icon': 'clock', 'color': '#38bdf8', 'ideal': { 'min': 10, 'max': 35 }, 'items': ['dann', 'danach', 'vorher', 'schließlich', 'während', 'jetzt', 'bald', 'plötzlich', 'zuvor', 'später'] },
    'concession': { 'label': 'Konzession', 'icon': 'shuffle', 'color': '#e879f9', 'ideal': { 'min': 5, 'max': 20 }, 'items': ['zugegeben', 'zwar', 'obwohl', 'selbst wenn', 'trotz', 'wenn auch'] },
    'conclusion': { 'label': 'Fazit', 'icon': 'flag', 'color': '#34d399', 'ideal': { 'min': 2, 'max': 10 }, 'items': ['zusammenfassend', 'abschließend', 'kurz gesagt', 'schließlich', 'im grunde'] }
}


output = f"""// ============================================================
// stylistic-analysis.data.js — Données lexicales pour l'analyse stylistique
// ============================================================

const StylisticAnalysisData = {{
    fr: {{
        SentimentLexicon: {json.dumps(fr_lexicon)},
        SentimentNegations: new Set({json.dumps(fr_negations)}),
        SentimentAmplifiers: new Set({json.dumps(fr_amplifiers)}),
        ConnectorsData: {json.dumps(fr_connectors)}
    }},
    en: {{
        SentimentLexicon: {json.dumps(en_lexicon)},
        SentimentNegations: new Set({json.dumps(en_negations)}),
        SentimentAmplifiers: new Set({json.dumps(en_amplifiers)}),
        ConnectorsData: {json.dumps(en_connectors)}
    }},
    es: {{
        SentimentLexicon: {json.dumps(es_lexicon)},
        SentimentNegations: new Set({json.dumps(es_negations)}),
        SentimentAmplifiers: new Set({json.dumps(es_amplifiers)}),
        ConnectorsData: {json.dumps(es_connectors)}
    }},
    de: {{
        SentimentLexicon: {json.dumps(de_lexicon)},
        SentimentNegations: new Set({json.dumps(de_negations)}),
        SentimentAmplifiers: new Set({json.dumps(de_amplifiers)}),
        ConnectorsData: {json.dumps(de_connectors)}
    }}
}};
"""

with open("g:/Mon Drive/plume-locale/js/features/analysis/stylistic-analysis/stylistic-analysis.data.js", "w", encoding="utf-8") as f:
    f.write(output)

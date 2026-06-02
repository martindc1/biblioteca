const STOPWORDS = new Set([
  "a", "al", "algo", "ante", "antes", "aquel", "aquella", "aquello", "asi", "así",
  "aunque", "cada", "como", "con", "contra", "cuando", "de", "del", "desde", "donde",
  "dos", "el", "ella", "ellos", "en", "entre", "era", "eran", "es", "esa", "ese", "eso",
  "esta", "está", "estaba", "estado", "estas", "este", "esto", "estos", "fue", "ha",
  "hay", "la", "las", "le", "lo", "los", "mas", "más", "me", "mi", "mis", "no", "nos",
  "o", "para", "pero", "por", "porque", "que", "qué", "se", "ser", "si", "sí", "sin",
  "sobre", "son", "su", "sus", "tambien", "también", "te", "tiene", "todo", "un", "una",
  "uno", "y", "ya"
]);

function cleanText(text: string) {
  return text
    .replace(/[#>*_`\-[\]()/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitSentences(text: string) {
  return cleanText(text)
    .split(/(?<=[.!?¿¡])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 25);
}

function words(text: string) {
  return cleanText(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-záéíóúñü]+/i)
    .map((word) => word.trim())
    .filter((word) => word.length > 3 && !STOPWORDS.has(word));
}

export function summarizeText(text: string) {
  const sentences = splitSentences(text);
  if (sentences.length <= 3) return sentences.join(" ");

  const wordList = words(text);
  const counts = new Map<string, number>();

  for (const word of wordList) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  const scored = sentences.map((sentence, index) => {
    const sentenceWords = words(sentence);
    const score = sentenceWords.reduce((total, word) => total + (counts.get(word) ?? 0), 0) / Math.max(1, sentenceWords.length);
    const positionBoost = index < 4 ? 1.15 : 1;
    return { sentence, index, score: score * positionBoost };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .sort((a, b) => a.index - b.index)
    .map((item) => item.sentence)
    .join(" ");
}

export function extractConcepts(text: string) {
  const counts = new Map<string, number>();

  for (const word of words(text)) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([word, count]) => ({ word, count }));
}

export function extractFragments(text: string) {
  const sentences = splitSentences(text);
  const importantTerms = ["silencio", "atencion", "sentido", "biblioteca", "fragil", "memoria", "ruido", "conexion", "resonancia", "tiempo"];

  const selected = sentences
    .map((sentence, index) => {
      const normalized = sentence
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      const score = importantTerms.reduce((total, term) => total + (normalized.includes(term) ? 1 : 0), 0);
      return { sentence, index, score };
    })
    .filter((item) => item.score > 0)
    .slice(0, 5);

  if (selected.length) return selected.map((item) => item.sentence);

  return sentences.slice(0, 4);
}

export function makeQuestions(text: string) {
  const concepts = extractConcepts(text).slice(0, 5).map((item) => item.word);
  const [first, second, third] = concepts;

  return [
    first ? `¿Qué lugar ocupa "${first}" en el movimiento general del texto?` : "¿Cuál parece ser el centro de gravedad del texto?",
    second ? `¿Cómo se relaciona "${second}" con la idea principal?` : "¿Qué tensión sostiene el texto sin resolverla del todo?",
    third ? `¿Qué cambia si leo el texto desde "${third}" como eje provisional?` : "¿Qué parte del texto pide ser reducida y cuál pide ser ampliada?",
    "¿Qué fragmento debería quedar en silencio alrededor para que pueda importar más?",
  ];
}

export function reduceToEssence(text: string) {
  const concepts = extractConcepts(text).slice(0, 6).map((item) => item.word);
  const summary = summarizeText(text);
  const firstSentence = splitSentences(summary)[0] ?? summary;

  return {
    sentence: firstSentence || "El texto necesita más contenido para poder reducirse.",
    concepts,
  };
}

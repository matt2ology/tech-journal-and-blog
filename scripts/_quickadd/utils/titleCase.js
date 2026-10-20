/**
 * Normalizes text and formats it into Title Case.
 *
 * @param {string} inputText - The raw string to normalize and transform.
 * @returns {string} The formatted title-case string.
 */
function formatTitleCase(inputText) {
  if (!inputText || typeof inputText !== "string") return "";

  const MINOR_WORDS = new Set([
    "a",
    "an",
    "and",
    "as",
    "at",
    "but",
    "by",
    "for",
    "from",
    "in",
    "into",
    "near",
    "nor",
    "of",
    "on",
    "onto",
    "or",
    "the",
    "to",
    "via",
    "with",
  ]);

  // Nouns / Data
  const normalizedText = inputText.normalize("NFC").replace(/\s+/g, " ").trim();
  const words = normalizedText.toLowerCase().split(" ");

  return words
    .map((word, index) => {
      if (!word) return "";

      const isFirstOrLastWord = index === 0 || index === words.length - 1;
      const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, "");

      if (!isFirstOrLastWord && MINOR_WORDS.has(cleanWord)) {
        return word;
      }

      // Verb / Action
      return capitalizeFirstLetter(word);
    })
    .join(" ");
}

/**
 * Helper: Capitalizes the first alphabetical character in a word.
 */
function capitalizeFirstLetter(word) {
  return word.replace(/\b[a-z]/i, (char) => char.toUpperCase());
}

module.exports = formatTitleCase;

/**
 * Converts a string into a URL-friendly slug.
 */
function slugify(text = "") {
  return text
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Formats a comma-separated string into a YAML-formatted list array.
 * @param {string} input - Comma-separated items.
 * @param {boolean} [shouldSlugify=false] - Whether to apply slugify to each item.
 */
function formatYAMLArray(input = "", shouldSlugify = false) {
  if (_isEmptyInput(input)) return " []";

  const items = _parseUniqueCommaSeparated(input, shouldSlugify);
  if (_hasNoItems(items)) return " []";

  return "\n  - " + items.join("\n  - ");
}

/**
 * Normalizes text and formats it into Title Case.
 */
function titleCase(inputText = "") {
  if (_isInvalidStringInput(inputText)) return "";

  const words = _tokenizeNormalizedText(inputText);

  return words
    .map((word, index) => {
      if (!word) return "";
      if (_shouldKeepMinorWordLower(word, index, words.length)) {
        return word;
      }
      return _capitalizeFirstLetter(word);
    })
    .join(" ");
}

// --- Private Module Helpers ---

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

function _isEmptyInput(input) {
  return !input;
}

function _hasNoItems(array) {
  return array.length === 0;
}

function _isInvalidStringInput(input) {
  return !input || typeof input !== "string";
}

/**
 * Parses a comma-separated string into an array of unique, non-empty items.
 *
 * Trims whitespace from each item, optionally slugifies the items, removes
 * empty values, and eliminates duplicates while preserving the original order.
 *
 * @param {string} input - The comma-separated string to parse.
 * @param {boolean} [shouldSlugify=false] - Whether to slugify each item before
 *   removing duplicates.
 * @returns {string[]} An array of unique, non-empty items.
 */
function _parseUniqueCommaSeparated(input, shouldSlugify = false) {
  const items = input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (shouldSlugify ? slugify(item) : item))
    .filter(Boolean);

  return [...new Set(items)];
}

/**
 * Normalizes text and splits it into lowercase words.
 *
 * Applies Unicode NFC normalization, collapses consecutive whitespace into a
 * single space, trims leading and trailing whitespace, and converts the text
 * to lowercase before splitting it into words.
 *
 * @param {string} text - The text to normalize and tokenize.
 * @returns {string[]} An array of lowercase words.
 */
function _tokenizeNormalizedText(text) {
  const normalized = text.normalize("NFC").replace(/\s+/g, " ").trim();
  return normalized.toLowerCase().split(" ");
}

/**
 * Checks whether a word is the first or last word in a sequence.
 *
 * @param {number} index - The zero-based index of the word.
 * @param {number} totalWords - The total number of words in the sequence.
 * @returns {boolean} True if the word is the first or last; otherwise, false.
 */
function _isFirstOrLastWord(index, totalWords) {
  return index === 0 || index === totalWords - 1;
}

/**
 * Determines whether a minor word should remain lowercase.
 *
 * Words at the beginning or end of the sequence are never treated as minor
 * words for capitalization purposes. For other words, leading and trailing
 * non-word characters are removed before checking membership in MINOR_WORDS.
 *
 * @param {string} word - The word to evaluate.
 * @param {number} index - The zero-based index of the word.
 * @param {number} totalWords - The total number of words in the sequence.
 * @returns {boolean} True if the word is an interior minor word; otherwise, false.
 */
function _shouldKeepMinorWordLower(word, index, totalWords) {
  if (_isFirstOrLastWord(index, totalWords)) return false;
  const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, "");
  return MINOR_WORDS.has(cleanWord);
}

/**
 * Capitalizes the first letter matched at a word boundary.
 *
 * Finds the first ASCII letter that follows a word boundary and converts it
 * to uppercase, leaving the rest of the word unchanged.
 *
 * @param {string} word - The word to capitalize.
 * @returns {string} The word with its first matched letter capitalized.
 */
function _capitalizeFirstLetter(word) {
  return word.replace(/\b[a-z]/i, (char) => char.toUpperCase());
}

module.exports = { slugify, formatYAMLArray, titleCase };

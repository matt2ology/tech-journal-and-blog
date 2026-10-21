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
 */
function formatYAMLArray(input = "") {
  if (_isEmptyInput(input)) return " []";

  const items = _parseUniqueCommaSeparated(input);
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

function _parseUniqueCommaSeparated(input) {
  const items = input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return [...new Set(items)];
}

function _tokenizeNormalizedText(text) {
  const normalized = text.normalize("NFC").replace(/\s+/g, " ").trim();
  return normalized.toLowerCase().split(" ");
}

function _isFirstOrLastWord(index, totalWords) {
  return index === 0 || index === totalWords - 1;
}

function _shouldKeepMinorWordLower(word, index, totalWords) {
  if (_isFirstOrLastWord(index, totalWords)) return false;
  const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, "");
  return MINOR_WORDS.has(cleanWord);
}

function _capitalizeFirstLetter(word) {
  return word.replace(/\b[a-z]/i, (char) => char.toUpperCase());
}

module.exports = { slugify, formatYAMLArray, titleCase };

/**
 * Pure text-formatting utilities (slug, title case, YAML arrays).
 * Keep these functions independent of Obsidian and QuickAdd.
 */

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

function formatYAMLArray(input = "", shouldSlugify = true) {
  if (!input) return " []";

  const items = parseUniqueCommaSeparated(input, shouldSlugify);
  if (items.length === 0) return " []";

  return "\n  - " + items.join("\n  - ");
}

function titleCase(inputText = "") {
  if (!inputText || typeof inputText !== "string") return "";

  const words = tokenizeNormalizedText(inputText);

  return words
    .map((word, index) => {
      if (!word) return "";
      if (shouldKeepMinorWordLower(word, index, words.length)) return word;
      return capitalizeFirstLetter(word);
    })
    .join(" ");
}

function parseUniqueCommaSeparated(input, shouldSlugify = false) {
  if (typeof input !== "string") return [];

  const items = input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (shouldSlugify ? slugify(item) : item))
    .filter(Boolean);

  return [...new Set(items)];
}

function tokenizeNormalizedText(text) {
  return text
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .split(" ");
}

function shouldKeepMinorWordLower(word, index, totalWords) {
  if (index === 0 || index === totalWords - 1) return false;
  const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, "");
  return MINOR_WORDS.has(cleanWord);
}

function capitalizeFirstLetter(word) {
  return word.replace(/\b[a-z]/i, (char) => char.toUpperCase());
}

/**
 * Formats a full name into an Obsidian wikilink: [[slug|DisplayName]]
 */
function formatNameAsWikilink(input = "") {
  if (!input || typeof input !== "string") return "";

  const words = input.trim().replace(/\s+/g, " ").split(" ");
  if (words.length === 0 || !words[0]) return "";

  const processedWords = words.map((word, index) => {
    const cleaned = word.replace(/[.,]/g, "");
    const capitalized = capitalizeFirstLetter(word.toLowerCase());

    if (index > 0 && index < words.length - 1 && cleaned.length === 1) {
      return capitalized.endsWith(".") ? capitalized : capitalized + ".";
    }
    return capitalized;
  });

  const displayName = processedWords.join(" ");
  const slug = slugify(displayName);

  return `[[${slug}|${displayName}]]`;
}

/**
 * Formats an array or comma-separated string of names into a YAML bulleted list of quoted wikilinks.
 */
function formatYAMLNameList(input, fallback = '"NoName"') {
  const items = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input
          .split(",")
          .map((i) => i.trim())
          .filter(Boolean)
      : [];

  if (items.length === 0) return ` ${fallback}`;

  return (
    '\n  - "' +
    items.map((item) => formatNameAsWikilink(item)).join('"\n  - "') +
    '"'
  );
}

/**
 * Cleans a wiki-link string and extracts its alias or target text.
 * e.g. "[[slug|Name]]" -> "Name"
 *      "[[Name]]" -> "Name"
 */
function cleanWikiLink(opt) {
  if (typeof opt !== "string") return opt;
  const cleaned = opt.replace(/^"?"?\[\[|\]\]"?"?$/g, "");
  const parts = cleaned.split("|");
  return parts.length > 1 ? parts[1] : parts[0];
}

module.exports = {
  slugify,
  formatYAMLArray,
  titleCase,
  formatNameAsWikilink,
  formatYAMLNameList,
  cleanWikiLink, // Exported for shared use
};

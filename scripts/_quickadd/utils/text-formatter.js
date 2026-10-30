/**
 * Pure text-formatting utilities wrapped in a static utility class.
 */
class TextFormatter {
  static MINOR_WORDS = new Set([
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

  static slugify(text = "") {
    return text
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  static parseCommaSeparatedList(input = "") {
    const rawItems = TextFormatter.#extractRawItems({ input });
    return [...new Set(rawItems)];
  }

  static parseAndSlugifyCommaSeparatedList(input = "") {
    const items = TextFormatter.parseCommaSeparatedList(input);
    return [...new Set(items.map((item) => TextFormatter.slugify(item)))];
  }

  static #extractRawItems({ input }) {
    if (Array.isArray(input)) return input;
    if (typeof input === "string") {
      return input
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  /**
   * Extracts last names from a comma-separated list of full names.
   * Example: "Michael Teske, Matt Lloyd Davies" -> "Teske, Davies"
   */
  static extractLastNames(input = "") {
    const names = TextFormatter.parseCommaSeparatedList(input);
    if (names.length === 0) return "Unknown";

    const lastNames = names.map((name) => {
      if (name.includes(",")) {
        return name.split(",")[0].trim();
      }
      const parts = name.trim().split(/\s+/);
      return parts[parts.length - 1];
    });

    return lastNames.join(", ");
  }

  static formatYAMLArray({ input = "", shouldSlugify = true }) {
    const items = shouldSlugify
      ? TextFormatter.parseAndSlugifyCommaSeparatedList(input)
      : TextFormatter.parseCommaSeparatedList(input);
    if (items.length === 0) return " []";
    return "\n  - " + items.join("\n  - ");
  }

  static titleCase(inputText = "") {
    if (!inputText || typeof inputText !== "string") return "";

    const rawWords = inputText
      .normalize("NFC")
      .replace(/[_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ");

    return rawWords
      .map((word, index) => {
        if (!word) return "";
        if (TextFormatter.#isAllUpperCase(word)) return word;

        const lowerWord = word.toLowerCase();
        if (
          index > 0 &&
          index < rawWords.length - 1 &&
          TextFormatter.MINOR_WORDS.has(lowerWord)
        ) {
          return lowerWord;
        }

        return lowerWord.replace(/^\b[a-z]/i, (char) => char.toUpperCase());
      })
      .join(" ");
  }

  static formatNameAsWikilink(input = "") {
    if (!input || typeof input !== "string") return "";

    let trimmedInput = input.trim().replace(/\s+/g, " ");
    if (!trimmedInput) return "";

    if (trimmedInput.includes(",")) {
      const parts = trimmedInput.split(",").map((p) => p.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        trimmedInput = `${parts.slice(1).join(" ")} ${parts[0]}`;
      }
    }

    const words = trimmedInput.split(" ");
    const processedWords = words.map((word, index) => {
      const cleaned = word.replace(/[.,]/g, "");
      let targetWord = word;

      if (
        TextFormatter.#isAllUpperCase(trimmedInput) ||
        word === word.toLowerCase()
      ) {
        targetWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }

      if (index > 0 && index < words.length - 1 && cleaned.length === 1) {
        const capitalized = targetWord.replace(/^\b[a-z]/i, (c) =>
          c.toUpperCase(),
        );
        return capitalized.endsWith(".") ? capitalized : capitalized + ".";
      }

      return targetWord;
    });

    const displayName = processedWords.join(" ");
    const slug = TextFormatter.slugify(displayName);

    return `[[${slug}|${displayName}]]`;
  }

  static formatYAMLNameList({ input, fallback = '"NoName"' }) {
    const items = TextFormatter.parseCommaSeparatedList(input);
    if (items.length === 0) return ` ${fallback}`;

    return (
      '\n  - "' +
      items
        .map((item) => TextFormatter.formatNameAsWikilink(item))
        .join('"\n  - "') +
      '"'
    );
  }

  static formatNaturalNameList(input) {
    const items = TextFormatter.parseCommaSeparatedList(input);
    const processedItems = items.map((item) =>
      TextFormatter.formatNameAsWikilink(item),
    );
    return TextFormatter.#joinNaturalList(processedItems);
  }

  static formatPlainNaturalNameList(input) {
    const items = TextFormatter.parseCommaSeparatedList(input);
    return TextFormatter.#joinNaturalList(items);
  }

  static #joinNaturalList(items) {
    if (items.length === 0) return "NoNameProvided";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
  }

  static cleanWikiLink(opt) {
    if (typeof opt !== "string") return opt;
    const cleaned = opt.replace(/^"?"?\[\[|\]\]"?"?$/g, "");
    const parts = cleaned.split("|");
    return parts.length > 1 ? parts[1] : parts[0];
  }

  static #isAllUpperCase(text) {
    const letters = text.replace(/[^a-zA-Z]/g, "");
    return letters.length > 0 && letters === letters.toUpperCase();
  }
}

module.exports = TextFormatter;

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
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  static parseCommaSeparatedList(input = "") {
    return TextFormatter.#extractRawItems(input);
  }

  static parseAndSlugifyCommaSeparatedList(input = "") {
    const rawItems = TextFormatter.#extractRawItems(input);
    return [...new Set(rawItems.map((item) => TextFormatter.slugify(item)))];
  }

  static #extractRawItems(input) {
    if (Array.isArray(input)) return input;
    if (typeof input === "string") {
      return input
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  static formatYAMLArray(input = "", shouldSlugify = true) {
    const items = shouldSlugify
      ? TextFormatter.parseAndSlugifyCommaSeparatedList(input)
      : TextFormatter.parseCommaSeparatedList(input);
    if (items.length === 0) return " []";
    return "\n  - " + items.join("\n  - ");
  }

  static titleCase(inputText = "") {
    if (TextFormatter.#isInvalidText(inputText)) return "";

    const words = inputText
      .normalize("NFC")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase()
      .split(" ");

    return words
      .map((word, index) => {
        if (!word) return "";
        if (
          TextFormatter.#shouldPreserveLowercaseWord(word, index, words.length)
        ) {
          return word;
        }
        return TextFormatter.#capitalizeWord(word);
      })
      .join(" ");
  }

  static #isInvalidText(text) {
    return !text || typeof text !== "string";
  }

  static #shouldPreserveLowercaseWord(word, index, length) {
    return (
      index > 0 && index < length - 1 && TextFormatter.MINOR_WORDS.has(word)
    );
  }

  static #capitalizeWord(word) {
    return word.replace(/^\b[a-z]/i, (char) => char.toUpperCase());
  }

  static formatNameAsWikilink(input = "") {
    if (TextFormatter.#isInvalidText(input)) return "";

    let trimmedInput = TextFormatter.#normalizeWhitespace(input);
    if (!trimmedInput) return "";

    trimmedInput = TextFormatter.#reorderCommaSeparatedName(trimmedInput);

    const isAllUpper = TextFormatter.#isAllUpperCase(trimmedInput);
    const isAllLower = TextFormatter.#isAllLowerCase(trimmedInput);

    const words = trimmedInput.split(" ");
    const processedWords = words.map((word, index) => {
      const cleaned = word.replace(/[.,]/g, "");
      let targetWord = word;
      if (isAllUpper || isAllLower) {
        targetWord = TextFormatter.#toTitleCaseSingle(word);
      }

      if (
        TextFormatter.#isSingleLetterAbbreviation(index, words.length, cleaned)
      ) {
        return TextFormatter.#formatAbbreviation(targetWord);
      }

      return targetWord;
    });

    const displayName = processedWords.join(" ");
    const slug = TextFormatter.slugify(displayName);

    return `[[${slug}|${displayName}]]`;
  }

  static #normalizeWhitespace(input) {
    return input.trim().replace(/\s+/g, " ");
  }

  static #reorderCommaSeparatedName(trimmedInput) {
    if (trimmedInput.includes(",")) {
      const parts = trimmedInput.split(",").map((p) => p.trim());
      if (parts.length >= 2 && parts[0] && parts[1]) {
        const lastName = parts[0];
        const rest = parts.slice(1).join(" ");
        return `${rest} ${lastName}`;
      }
    }
    return trimmedInput;
  }

  static #isAllUpperCase(text) {
    return text === text.toUpperCase() && text !== text.toLowerCase();
  }

  static #isAllLowerCase(text) {
    return text === text.toLowerCase() && text !== text.toUpperCase();
  }

  static #toTitleCaseSingle(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  static #isSingleLetterAbbreviation(index, length, cleaned) {
    return index > 0 && index < length - 1 && cleaned.length === 1;
  }

  static #formatAbbreviation(targetWord) {
    const capitalized = targetWord.replace(/^\b[a-z]/i, (c) => c.toUpperCase());
    return capitalized.endsWith(".") ? capitalized : capitalized + ".";
  }

  static formatYAMLNameList(input, fallback = '"NoName"') {
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

  static #joinNaturalList(processedItems) {
    if (processedItems.length === 0) return "No Author";
    if (processedItems.length === 1) return processedItems[0];
    if (processedItems.length === 2)
      return `${processedItems[0]} and ${processedItems[1]}`;
    return `${processedItems.slice(0, -1).join(", ")}, and ${processedItems[processedItems.length - 1]}`;
  }

  static cleanWikiLink(opt) {
    if (typeof opt !== "string") return opt;
    const cleaned = opt.replace(/^"?"?\[\[|\]\]"?"?$/g, "");
    const parts = cleaned.split("|");
    return parts.length > 1 ? parts[1] : parts[0];
  }
}

module.exports = TextFormatter;

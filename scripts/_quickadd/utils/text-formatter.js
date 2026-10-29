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
    return (
      text
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim()
        .replace(/['’]/g, "") // Removes apostrophes entirely
        .replace(/[^a-z0-9_]+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
  }

  static parseCommaSeparatedList(input = "") {
    return TextFormatter.#extractRawItems({ input });
  }

  static parseAndSlugifyCommaSeparatedList(input = "") {
    const rawItems = TextFormatter.#extractRawItems({ input });
    return [...new Set(rawItems.map((item) => TextFormatter.slugify(item)))];
  }

  static #extractRawItems({ input }) {
    if (TextFormatter.#isArrayInput({ input })) return input;
    if (TextFormatter.#isStringInput({ input })) {
      return input
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
    return [];
  }

  static #isArrayInput({ input }) {
    return Array.isArray(input);
  }

  static #isStringInput({ input }) {
    return typeof input === "string";
  }

  /**
   * Extracts last names from a comma-separated list of full names.
   * Example: "Michael Teske, Matt Lloyd Davies" -> "Teske, Davies"
   */
  static extractLastNames(input = "") {
    const names = TextFormatter.parseCommaSeparatedList(input);
    if (TextFormatter.#isEmptyItemsArray({ items: names })) return "Unknown";

    const lastNames = names.map((name) => {
      // Handle names formatted as "LastName, FirstName"
      if (name.includes(",")) {
        return name.split(",")[0].trim();
      }
      // Handle standard "FirstName MiddleName LastName"
      const parts = name.trim().split(/\s+/);
      return parts[parts.length - 1];
    });

    return lastNames.join(", ");
  }

  static formatYAMLArray({ input = "", shouldSlugify = true }) {
    const items = shouldSlugify
      ? TextFormatter.parseAndSlugifyCommaSeparatedList(input)
      : TextFormatter.parseCommaSeparatedList(input);
    if (TextFormatter.#isEmptyItemsArray({ items })) return " []";
    return "\n  - " + items.join("\n  - ");
  }

  static #isEmptyItemsArray({ items }) {
    return items.length === 0;
  }

  static titleCase(inputText = "") {
    if (TextFormatter.#isInvalidText({ text: inputText })) return "";

    const rawWords = inputText
      .normalize("NFC")
      .replace(/[_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ");

    return rawWords
      .map((word, index) => {
        if (TextFormatter.#isWordEmpty({ word })) return "";

        if (TextFormatter.#isAllUpperCase(word)) {
          return word;
        }

        const lowerWord = word.toLowerCase();
        if (
          TextFormatter.#shouldPreserveLowercaseWord({
            word: lowerWord,
            index,
            length: rawWords.length,
          })
        ) {
          return lowerWord;
        }

        return TextFormatter.#capitalizeWord(lowerWord);
      })
      .join(" ");
  }

  static #isWordEmpty({ word }) {
    return !word;
  }

  static #isInvalidText({ text }) {
    return !text || typeof text !== "string";
  }

  static #shouldPreserveLowercaseWord({ word, index, length }) {
    return (
      index > 0 && index < length - 1 && TextFormatter.MINOR_WORDS.has(word)
    );
  }

  static #capitalizeWord(word) {
    return word.replace(/^\b[a-z]/i, (char) => char.toUpperCase());
  }

  static formatNameAsWikilink(input = "") {
    if (TextFormatter.#isInvalidText({ text: input })) return "";

    let trimmedInput = TextFormatter.#normalizeWhitespace(input);
    if (TextFormatter.#isTrimmedInputEmpty({ trimmedInput })) return "";

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
        TextFormatter.#isSingleLetterAbbreviation({
          index,
          length: words.length,
          cleaned,
        })
      ) {
        return TextFormatter.#formatAbbreviation(targetWord);
      }

      return targetWord;
    });

    const displayName = processedWords.join(" ");
    const slug = TextFormatter.slugify(displayName);

    return `[[${slug}|${displayName}]]`;
  }

  static #isTrimmedInputEmpty({ trimmedInput }) {
    return !trimmedInput;
  }

  static #normalizeWhitespace(input) {
    return input.trim().replace(/\s+/g, " ");
  }

  static #reorderCommaSeparatedName(trimmedInput) {
    if (TextFormatter.#hasCommaSeparator({ trimmedInput })) {
      const parts = trimmedInput.split(",").map((p) => p.trim());
      if (TextFormatter.#hasValidCommaParts({ parts })) {
        const lastName = parts[0];
        const rest = parts.slice(1).join(" ");
        return `${rest} ${lastName}`;
      }
    }
    return trimmedInput;
  }

  static #hasCommaSeparator({ trimmedInput }) {
    return trimmedInput.includes(",");
  }

  static #hasValidCommaParts({ parts }) {
    return parts.length >= 2 && parts[0] && parts[1];
  }

  static #isAllUpperCase(text) {
    const letters = text.replace(/[^a-zA-Z]/g, "");
    return letters.length > 0 && letters === letters.toUpperCase();
  }

  static #isAllLowerCase(text) {
    return text === text.toLowerCase() && text !== text.toUpperCase();
  }

  static #toTitleCaseSingle(word) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }

  static #isSingleLetterAbbreviation({ index, length, cleaned }) {
    return index > 0 && index < length - 1 && cleaned.length === 1;
  }

  static #formatAbbreviation(targetWord) {
    const capitalized = targetWord.replace(/^\b[a-z]/i, (c) => c.toUpperCase());
    return capitalized.endsWith(".") ? capitalized : capitalized + ".";
  }

  static formatYAMLNameList({ input, fallback = '"NoName"' }) {
    const items = TextFormatter.parseCommaSeparatedList(input);

    if (TextFormatter.#isEmptyItemsArray({ items })) return ` ${fallback}`;

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
    if (TextFormatter.#isEmptyItemsArray({ items: processedItems }))
      return "NoNameProvided";
    if (TextFormatter.#hasSingleItem({ items: processedItems }))
      return processedItems[0];
    if (TextFormatter.#hasTwoItems({ items: processedItems }))
      return `${processedItems[0]} and ${processedItems[1]}`;
    return `${processedItems.slice(0, -1).join(", ")}, and ${processedItems[processedItems.length - 1]}`;
  }

  static #hasSingleItem({ items }) {
    return items.length === 1;
  }

  static #hasTwoItems({ items }) {
    return items.length === 2;
  }

  static cleanWikiLink(opt) {
    if (TextFormatter.#isNotString({ opt })) return opt;
    const cleaned = opt.replace(/^"?"?\[\[|\]\]"?"?$/g, "");
    const parts = cleaned.split("|");
    return TextFormatter.#hasMultipleWikiParts({ parts }) ? parts[1] : parts[0];
  }

  static #isNotString({ opt }) {
    return typeof opt !== "string";
  }

  static #hasMultipleWikiParts({ parts }) {
    return parts.length > 1;
  }
}

module.exports = TextFormatter;

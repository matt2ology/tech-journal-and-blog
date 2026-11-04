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

  /**
   * Set of standard acronyms that should always be fully capitalized.
   */
  static ACRONYMS = new Set(["ai", "nasa", "faq"]);

  // ==========================================
  // PUBLIC API METHODS
  // ==========================================

  /**
   * Converts a text string into a URL-friendly slug.
   * @param {string} [text=""] The input text.
   * @returns {string} The resulting slug.
   */
  static slugify(text = "") {
    const validText = typeof text === "string" ? text : "";
    const result = validText
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/['’]/g, "")
      .replace(/[^a-z0-9_]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
    return result;
  }

  /**
   * Converts a slugified or standard input text, restoring known acronyms to uppercase.
   * @param {string} [text=""] The input text.
   * @returns {string} The formatted text with acronyms capitalized.
   */
  static formatAcronyms(text = "") {
    const validText = typeof text === "string" ? text : "";
    const words = validText.split(/[-_\s]+/);
    const processedWords = words.map((word) =>
      TextFormatter.ACRONYMS.has(word.toLowerCase())
        ? word.toUpperCase()
        : word,
    );

    // Refactored from nested ternary to clean if/else
    let separator = " ";
    if (validText.includes("-")) {
      separator = "-";
    } else if (validText.includes("_")) {
      separator = "_";
    }

    const result = processedWords.join(separator);
    return result;
  }

  /**
   * Converts text into a slug and collapses adjacent repeating duplicate words.
   * @param {string} [text=""] The input text to slugify.
   * @returns {string} The resulting slug.
   */
  static slugifyAdjacent(text = "") {
    const result = TextFormatter.#processSlugWords(text, (words) =>
      words.filter((word, index) => word !== words[index - 1]),
    );
    return result;
  }

  /**
   * Converts text into a slug and removes all duplicate words, keeping only the first occurrence.
   * @param {string} [text=""] The input text to slugify.
   * @returns {string} The resulting slug.
   */
  static slugifyUnique(text = "") {
    const result = TextFormatter.#processSlugWords(text, (words) => [
      ...new Set(words),
    ]);
    return result;
  }

  /**
   * Parses a comma-separated list or array into a unique list of trimmed items.
   * @param {string|string[]} [input=""] - The input string or array to parse.
   * @returns {string[]} An array of unique, cleaned items.
   */
  static parseCommaSeparatedList(input = "") {
    const result = [...new Set(TextFormatter.#extractRawItems(input))];
    return result;
  }

  /**
   * Parses a comma-separated list and converts each item into a slug.
   * @param {string|string[]} [input=""] - The input string or array to parse and slugify.
   * @returns {string[]} An array of unique slugs.
   */
  static parseAndSlugifyCommaSeparatedList(input = "") {
    const result = TextFormatter.parseCommaSeparatedList(input).map(
      TextFormatter.slugify,
    );
    return result;
  }

  /**
   * Removes everything after the first colon in a string and trims the result.
   * @param {string} [text=""] - The input text.
   * @returns {string} The text before the colon, or empty string.
   */
  static extractBeforeColon(text = "") {
    const result =
      typeof text === "string" && text ? text.split(":")[0].trim() : "";
    return result;
  }

  /**
   * Extracts last names from a comma-separated list of full names.
   * @param {string} [input=""] - A comma-separated list of names.
   * @returns {string} A comma-separated string of last names, or "Unknown".
   */
  static extractLastNames(input = "") {
    const names = TextFormatter.parseCommaSeparatedList(input);
    const validNames = names.length > 0 ? names : ["Unknown"];
    const result = validNames
      .map((name) => {
        const parts = name.includes(",")
          ? [name.split(",")[0].trim()]
          : name.trim().split(/\s+/);
        return parts[parts.length - 1];
      })
      .join(", ");
    return result;
  }

  /**
   * Formats input items into a YAML array string.
   * @param {Object} options - Formatting options.
   * @param {string|string[]} [options.input=""] - The input items.
   * @param {boolean} [options.shouldSlugify=true] - Whether to slugify items.
   * @returns {string} Formatted YAML array string.
   */
  static formatYAMLArray({ input = "", shouldSlugify = true }) {
    const items = shouldSlugify
      ? TextFormatter.parseAndSlugifyCommaSeparatedList(input)
      : TextFormatter.parseCommaSeparatedList(input);

    const result = items.length === 0 ? " []" : `\n  - ${items.join("\n  - ")}`;
    return result;
  }

  /**
   * Formats a text string into title case.
   * @param {string} [inputText=""] - The input text.
   * @returns {string} The title-cased string.
   */
  static titleCase(inputText = "") {
    const trimmed = typeof inputText === "string" ? inputText.trim() : "";
    const result = trimmed ? TextFormatter.#computeTitleCase(trimmed) : "";
    return result;
  }

  /**
   * Formats a name string into an Obsidian-style wikilink.
   * @param {string} [input=""] - The name to format.
   * @returns {string} Formatted wikilink string.
   */
  static formatNameAsWikilink(input = "") {
    const normalizedInput = TextFormatter.#normalizeNameInput(input);
    const result = normalizedInput
      ? TextFormatter.#computeWikilink(normalizedInput)
      : "";
    return result;
  }

  /**
   * Formats names as a YAML list of wikilinks with a fallback option.
   * @param {Object} options - Formatting options.
   * @param {string|string[]} options.input - The input names.
   * @param {string} [options.fallback='"NoName"'] - Fallback string if empty.
   * @returns {string} Formatted YAML list of wikilinks or fallback.
   */
  static formatYAMLNameList({ input, fallback = '"NoName"' }) {
    const items = TextFormatter.parseCommaSeparatedList(input);
    const formattedItems = items.map(TextFormatter.formatNameAsWikilink);
    const result =
      items.length === 0
        ? ` ${fallback}`
        : `\n  - "${formattedItems.join('"\n  - "')}"`;
    return result;
  }

  /**
   * Formats a list of names into a natural language sentence using wikilinks.
   * @param {string|string[]} input - The input names.
   * @returns {string} Natural language list.
   */
  static formatNaturalNameList(input) {
    const items = TextFormatter.parseCommaSeparatedList(input);
    const result = TextFormatter.#joinNaturalList(
      items.map(TextFormatter.formatNameAsWikilink),
    );
    return result;
  }

  /**
   * Formats a list of names into a plain text natural language sentence.
   * @param {string|string[]} input - The input names.
   * @returns {string} Plain text natural language list.
   */
  static formatPlainNaturalNameList(input) {
    const items = TextFormatter.parseCommaSeparatedList(input);
    const result = TextFormatter.#joinNaturalList(items);
    return result;
  }

  /**
   * Cleans an Obsidian-style wikilink wrapper.
   * @param {string} input - The wikilink string to clean.
   * @returns {string} The extracted plain text label or target.
   */
  static cleanWikiLink(input = "") {
    const isValidString = typeof input === "string";
    const cleanInput = isValidString ? input : "";
    const parts = cleanInput.replace(/^"?"?\[\[|\]\]"?"?$/g, "").split("|");
    const result = isValidString ? (parts[1] ?? parts[0]) : input;
    return result;
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  /**
   * Processes slug words using a transformation function (DRY helper for adjacent/unique slugs).
   * @private
   */
  static #processSlugWords(text, transformFn) {
    const slug = this.slugify(text);
    const result = slug ? transformFn(slug.split("-")).join("-") : "";
    return result;
  }

  /**
   * Normalizes and cleans raw name inputs, handling comma-reversals (e.g., "Doe, John" -> "John Doe").
   * @private
   */
  static #normalizeNameInput(input) {
    const isValidString = typeof input === "string";
    const rawTrimmed = isValidString ? input.trim().replace(/\s+/g, " ") : "";
    const parts = rawTrimmed.includes(",")
      ? rawTrimmed.split(",").map((p) => p.trim())
      : [];
    const hasCommaParts =
      parts.length >= 2 && Boolean(parts[0]) && Boolean(parts[1]);
    const normalizedComma = hasCommaParts
      ? `${parts.slice(1).join(" ")} ${parts[0]}`
      : rawTrimmed;
    const result = rawTrimmed ? normalizedComma : "";
    return result;
  }

  /**
   * Extracts raw items from a string or an array of strings.
   * @private
   */
  static #extractRawItems(input) {
    const isArr = Array.isArray(input);
    const isStr = typeof input === "string";
    const trimmedStr = isStr ? input.trim() : "";

    const arrayResult = isArr
      ? input.flatMap((item) => TextFormatter.#extractRawItems(item))
      : [];
    const stringResult =
      isStr && trimmedStr
        ? input
            .replace(/\s+and\s+/gi, ", ")
            .replace(/,\s*and\s+/gi, ", ")
            .split(",")
            .map((item) => item.trim().replace(/^and\s+/i, ""))
            .filter((item) => Boolean(item) && item.toLowerCase() !== "and")
        : [];

    const result = isArr ? arrayResult : stringResult;
    return result;
  }

  /**
   * Formats an individual word for title casing or acronym preservation based on position and rules.
   * @private
   */
  static #formatWord(word, index, lastIndex) {
    const lowerWord = word.toLowerCase();
    const isAcronym = TextFormatter.ACRONYMS.has(lowerWord);
    const isInternalMinorWord =
      index >= 1 &&
      index < lastIndex &&
      TextFormatter.MINOR_WORDS.has(lowerWord);

    // Refactored from nested ternary to clean if/else statement
    let formattedWord;
    if (isAcronym) {
      formattedWord = word.toUpperCase();
    } else if (TextFormatter.#isAllUpperCase(word)) {
      formattedWord = word;
    } else if (isInternalMinorWord) {
      formattedWord = lowerWord;
    } else {
      formattedWord = lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
    }

    return formattedWord;
  }

  /**
   * Computes title case based on presence of whitespace.
   * @private
   */
  static #computeTitleCase(trimmed) {
    const hasSpaces = /\s/.test(trimmed);
    const result = hasSpaces
      ? TextFormatter.#formatPhraseCase(trimmed)
      : TextFormatter.#formatSlugCase(trimmed);
    return result;
  }

  /**
   * Formats slug-style strings without spaces.
   * @private
   */
  static #formatSlugCase(trimmed) {
    const words = trimmed.split("-");
    const lastIndex = words.length - 1;
    const formatted = words
      .map((word, index) => TextFormatter.#formatWord(word, index, lastIndex))
      .join(" ");
    return formatted;
  }

  /**
   * Formats phrase-style strings containing spaces.
   * @private
   */
  static #formatPhraseCase(trimmed) {
    const parts = trimmed.split(/\s+/);
    const lastIndex = parts.length - 1;
    const formatted = parts
      .map((part, index) =>
        TextFormatter.#formatPhrasePart(part, index, lastIndex),
      )
      .join(" ");
    return formatted;
  }

  /**
   * Formats an individual phrase part (handling hyphens and special tokens).
   * @private
   */
  static #formatPhrasePart(part, index, lastIndex) {
    const isSpecial =
      part === "-" || part === "—" || TextFormatter.#isAllUpperCase(part);

    // Refactored from nested ternary to clean if/else statement
    let formattedPart;
    if (isSpecial) {
      formattedPart = part;
    } else if (part.includes("-")) {
      formattedPart = TextFormatter.#formatHyphenatedPart(part);
    } else {
      formattedPart = TextFormatter.#formatWord(part, index, lastIndex);
    }

    return formattedPart;
  }

  /**
   * Formats sub-words within a hyphenated phrase part.
   * @private
   */
  static #formatHyphenatedPart(part) {
    const subWords = part.split("-");
    const formattedSub = subWords
      .map((sub, subIdx) => {
        const lowerSub = sub ? sub.toLowerCase() : "";
        const isSubSpecial = !sub || TextFormatter.#isAllUpperCase(sub);
        const isAcronym = TextFormatter.ACRONYMS.has(lowerSub);
        const isMinor = subIdx > 0 && TextFormatter.MINOR_WORDS.has(lowerSub);

        // Refactored from nested ternary to clean if/else statement
        let subResult;
        if (isAcronym) {
          subResult = sub.toUpperCase();
        } else if (isSubSpecial) {
          subResult = sub;
        } else if (isMinor) {
          subResult = lowerSub;
        } else {
          subResult = lowerSub.charAt(0).toUpperCase() + lowerSub.slice(1);
        }

        return subResult;
      })
      .join("-");
    return formattedSub;
  }

  /**
   * Computes Obsidian wikilink representation for a normalized name.
   * @private
   */
  static #computeWikilink(normalizedInput) {
    const words = normalizedInput.split(" ");
    const isAllUpper = TextFormatter.#isAllUpperCase(normalizedInput);
    const processedWords = words.map((word, index) =>
      TextFormatter.#processWikilinkWord(word, index, words.length, isAllUpper),
    );
    const displayName = processedWords.join(" ");
    return `[[${TextFormatter.slugify(displayName)}|${displayName}]]`;
  }

  /**
   * Processes individual words for wikilinks (handling capitalization and initials).
   * @private
   */
  static #processWikilinkWord(word, index, totalWords, isAllUpper) {
    const lowerWord = word.toLowerCase();
    const isAcronym = TextFormatter.ACRONYMS.has(lowerWord);
    const shouldCapitalize = isAllUpper || word === word.toLowerCase();

    // Refactored from nested ternary to clean if/else statement
    let targetWord;
    if (isAcronym) {
      targetWord = word.toUpperCase();
    } else if (shouldCapitalize) {
      targetWord = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    } else {
      targetWord = word;
    }

    const isMiddleInitial =
      !isAcronym &&
      index > 0 &&
      index < totalWords - 1 &&
      word.replace(/[.,]/g, "").length === 1;

    const finalWord = isMiddleInitial
      ? TextFormatter.#formatMiddleInitial(targetWord)
      : targetWord;

    return finalWord;
  }

  /**
   * Formats middle initials properly with trailing periods.
   * @private
   */
  static #formatMiddleInitial(targetWord) {
    const capitalized = targetWord.replace(/^\b[a-z]/i, (c) => c.toUpperCase());
    const formattedInitial = capitalized.endsWith(".")
      ? capitalized
      : `${capitalized}.`;
    return formattedInitial;
  }

  /**
   * Joins an array of strings into a natural language list with commas and "and".
   * @private
   */
  static #joinNaturalList(items) {
    const len = items.length;

    // Refactored from chained ternary to clean if/else statement
    let result;
    if (len === 0) {
      result = "NoNameProvided";
    } else if (len === 1) {
      result = items[0];
    } else if (len === 2) {
      result = `${items[0]} and ${items[1]}`;
    } else {
      result = `${items.slice(0, -1).join(", ")}, and ${items[len - 1]}`;
    }

    return result;
  }

  /**
   * Checks if a text string consists entirely of uppercase letters.
   * @private
   */
  static #isAllUpperCase(text) {
    const isValid = typeof text === "string";
    const letters = isValid ? text.replace(/[^a-zA-Z]/g, "") : "";
    const result =
      isValid && letters.length > 0 && letters === letters.toUpperCase();
    return result;
  }
}

module.exports = TextFormatter;

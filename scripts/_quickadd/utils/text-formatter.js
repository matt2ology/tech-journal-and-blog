/**
 * Pure text-formatting utilities wrapped in a static utility class.
 */
class TextFormatter {
  /**
   * Set of minor words kept in lowercase during title casing unless positioned first or last.
   */
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

  // ==========================================
  // PUBLIC API METHODS
  // ==========================================

  /**
   * Converts a text string into a URL-friendly slug.
   * @param {string} [text=""] - The input text to slugify.
   * @returns {string} The resulting slug.
   * @example
   * TextFormatter.slugify("Hello World! 2026.");
   * // Returns: "hello-world-2026"
   */
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

  /**
   * Parses a comma-separated list or array into a unique list of trimmed items.
   * @param {string|string[]} [input=""] - The input string or array to parse.
   * @returns {string[]} An array of unique, cleaned items.
   * @example
   * TextFormatter.parseCommaSeparatedList("apple, banana, apple, orange");
   * // Returns: ["apple", "banana", "orange"]
   */
  static parseCommaSeparatedList(input = "") {
    const rawItems = TextFormatter.#extractRawItems(input);
    return [...new Set(rawItems)];
  }

  /**
   * Parses a comma-separated list and converts each item into a slug.
   * @param {string|string[]} [input=""] - The input string or array to parse and slugify.
   * @returns {string[]} An array of unique slugs.
   * @example
   * TextFormatter.parseAndSlugifyCommaSeparatedList("Hello World, Foo Bar!");
   * // Returns: ["hello-world", "foo-bar"]
   */
  static parseAndSlugifyCommaSeparatedList(input = "") {
    const items = TextFormatter.parseCommaSeparatedList(input);
    return items.map((item) => TextFormatter.slugify(item));
  }

  /**
   * Extracts last names from a comma-separated list of full names.
   * @param {string} [input=""] - A comma-separated list of names.
   * @returns {string} A comma-separated string of last names, or "Unknown".
   * @example
   * TextFormatter.extractLastNames("Michael Teske, Matt Lloyd Davies");
   * // Returns: "Teske, Davies"
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

  /**
   * Formats input items into a YAML array string.
   * @param {Object} options - Formatting options.
   * @param {string|string[]} [options.input=""] - The input items.
   * @param {boolean} [options.shouldSlugify=true] - Whether to slugify items.
   * @returns {string} Formatted YAML array string.
   * @example
   * TextFormatter.formatYAMLArray({ input: "apple, banana", shouldSlugify: true });
   * // Returns: "\n  - apple\n  - banana"
   */
  static formatYAMLArray({ input = "", shouldSlugify = true }) {
    const items = shouldSlugify
      ? TextFormatter.parseAndSlugifyCommaSeparatedList(input)
      : TextFormatter.parseCommaSeparatedList(input);

    if (items.length === 0) return " []";
    return "\n  - " + items.join("\n  - ");
  }

  /**
   * Converts input text into title case, handling minor words and uppercase rules.
   * @param {string} [inputText=""] - The text to convert.
   * @returns {string} The title-cased text.
   * @example
   * TextFormatter.titleCase("lord of the rings");
   * // Returns: "Lord of the Rings"
   */
  static titleCase(inputText = "") {
    const words = TextFormatter.#normalizeAndSplit(inputText);
    if (words.length === 0) return "";

    const lastIndex = words.length - 1;
    return words
      .map((word, index) => TextFormatter.#formatWord(word, index, lastIndex))
      .join(" ");
  }

  /**
   * Formats a name string into an Obsidian-style wikilink.
   * @param {string} [input=""] - The name to format.
   * @returns {string} Formatted wikilink string (e.g., `[[slug|Display Name]]`).
   * @example
   * TextFormatter.formatNameAsWikilink("John Doe");
   * // Returns: "[[john-doe|John Doe]]"
   */
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

  /**
   * Formats names as a YAML list of wikilinks with a fallback option.
   * @param {Object} options - Formatting options.
   * @param {string|string[]} options.input - The input names.
   * @param {string} [options.fallback='"NoName"'] - Fallback string if empty.
   * @returns {string} Formatted YAML list of wikilinks or fallback.
   * @example
   * TextFormatter.formatYAMLNameList({ input: "Alice Smith" });
   * // Returns: '\n  - "[[alice-smith|Alice Smith]]"'
   */
  static formatYAMLNameList({ input, fallback = '"NoName"' }) {
    const items = TextFormatter.parseCommaSeparatedList(input);
    if (items.length === 0) return ` ${fallback}`;

    const formattedItems = items.map((item) =>
      TextFormatter.formatNameAsWikilink(item),
    );
    return '\n  - "' + formattedItems.join('"\n  - "') + '"';
  }

  /**
   * Formats a list of names into a natural language sentence using wikilinks.
   * @param {string|string[]} input - The input names.
   * @returns {string} Natural language list (e.g., "A, B, and C").
   * @example
   * TextFormatter.formatNaturalNameList("Alice, Bob, Charlie");
   * // Returns: "[[alice|Alice]], [[bob|Bob]], and [[charlie|Charlie]]"
   */
  static formatNaturalNameList(input) {
    const items = TextFormatter.parseCommaSeparatedList(input);
    const processedItems = items.map((item) =>
      TextFormatter.formatNameAsWikilink(item),
    );
    return TextFormatter.#joinNaturalList(processedItems);
  }

  /**
   * Formats a list of names into a plain text natural language sentence.
   * @param {string|string[]} input - The input names.
   * @returns {string} Plain text natural language list.
   * @example
   * TextFormatter.formatPlainNaturalNameList("Alice, Bob, Charlie");
   * // Returns: "Alice, Bob, and Charlie"
   */
  static formatPlainNaturalNameList(input) {
    const items = TextFormatter.parseCommaSeparatedList(input);
    return TextFormatter.#joinNaturalList(items);
  }

  /**
   * Cleans a wikilink wrapper and returns the display name or target.
   * @param {string} opt - The wikilink string.
   * @returns {string} The extracted plain text label or target.
   * @example
   * TextFormatter.cleanWikiLink("[[john-doe|John Doe]]");
   * // Returns: "John Doe"
   */
  static cleanWikiLink(opt) {
    if (typeof opt !== "string") return opt;
    const cleaned = opt.replace(/^"?"?\[\[|\]\]"?"?$/g, "");
    const parts = cleaned.split("|");
    return parts.length > 1 ? parts[1] : parts[0];
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  /**
   * Extracts and cleans raw items from input.
   * @private
   * @param {string|string[]} input - The input source.
   * @returns {string[]} Array of cleaned items.
   * @example
   * TextFormatter.#extractRawItems("a, and b, c");
   * // Returns: ["a", "b", "c"]
   */
  static #extractRawItems(input) {
    const rawItems = TextFormatter.#toRawArray(input);
    return TextFormatter.#cleanAndFilterItems(rawItems);
  }

  /**
   * Converts string or array input into a raw array.
   * @private
   * @param {string|string[]} input - The input data.
   * @returns {any[]} Array representation.
   * @example
   * TextFormatter.#toRawArray("a,b,c");
   * // Returns: ["a", "b", "c"]
   */
  static #toRawArray(input) {
    if (Array.isArray(input)) return input;
    if (typeof input === "string") return input.split(",");
    return [];
  }

  /**
   * Cleans and filters items, removing extraneous "and" elements.
   * @private
   * @param {any[]} items - Array of items to filter.
   * @returns {any[]} Filtered items.
   * @example
   * TextFormatter.#cleanAndFilterItems(["apple", " and banana", "and"]);
   * // Returns: ["apple", "banana"]
   */
  static #cleanAndFilterItems(items) {
    return items
      .map((item) =>
        typeof item === "string" ? item.trim().replace(/^and\s+/i, "") : item,
      )
      .filter((item) => item && String(item).toLowerCase() !== "and");
  }

  /**
   * Normalizes unicode and splits input text into words.
   * @private
   * @param {string} inputText - The text to normalize and split.
   * @returns {string[]} Array of words.
   * @example
   * TextFormatter.#normalizeAndSplit("hello_world  test");
   * // Returns: ["hello", "world", "test"]
   */
  static #normalizeAndSplit(inputText) {
    if (typeof inputText !== "string" || !inputText) return [];

    return inputText
      .normalize("NFC")
      .replace(/[_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ");
  }

  /**
   * Formats an individual word for title casing based on position and minor words.
   * @private
   * @param {string} word - The word to format.
   * @param {number} index - The index of the word in the sequence.
   * @param {number} lastIndex - The index of the last word.
   * @returns {string} The formatted word.
   * @example
   * TextFormatter.#formatWord("the", 1, 2);
   * // Returns: "the"
   */
  static #formatWord(word, index, lastIndex) {
    if (TextFormatter.#isAllUpperCase(word)) return word;

    const lowerWord = word.toLowerCase();
    const isBetweenBounds = index > 0 && index < lastIndex;
    const isInternalMinorWord =
      isBetweenBounds && TextFormatter.MINOR_WORDS.has(lowerWord);

    return isInternalMinorWord
      ? lowerWord
      : lowerWord.charAt(0).toUpperCase() + lowerWord.slice(1);
  }

  /**
   * Joins an array of strings into a natural language list with commas and "and".
   * @private
   * @param {string[]} items - The items to join.
   * @returns {string} The joined natural language list string.
   * @example
   * TextFormatter.#joinNaturalList(["Alice", "Bob", "Charlie"]);
   * // Returns: "Alice, Bob, and Charlie"
   */
  static #joinNaturalList(items) {
    if (items.length === 0) return "NoNameProvided";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;
    return `${items.slice(0, -1).join(", ")}, and ${items[items.length - 1]}`;
  }

  /**
   * Checks if a text string consists entirely of uppercase letters.
   * @private
   * @param {string} text - The text to check.
   * @returns {boolean} True if all letters are uppercase.
   * @example
   * TextFormatter.#isAllUpperCase("NASA");
   * // Returns: true
   */
  static #isAllUpperCase(text) {
    if (typeof text !== "string") return false;
    const letters = text.replace(/[^a-zA-Z]/g, "");
    return letters.length > 0 && letters === letters.toUpperCase();
  }
}

module.exports = TextFormatter;

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

  static parseCommaSeparatedList(input = "", shouldSlugify = false) {
    const rawItems = Array.isArray(input)
      ? input
      : typeof input === "string"
        ? input
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : [];

    const processed = rawItems.map((item) =>
      shouldSlugify ? this.slugify(item) : item,
    );
    return [...new Set(processed)];
  }

  static formatYAMLArray(input = "", shouldSlugify = true) {
    const items = this.parseCommaSeparatedList(input, shouldSlugify);
    if (items.length === 0) return " []";
    return "\n  - " + items.join("\n  - ");
  }

  static titleCase(inputText = "") {
    if (!inputText || typeof inputText !== "string") return "";

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
          index > 0 &&
          index < words.length - 1 &&
          this.MINOR_WORDS.has(word)
        ) {
          return word;
        }
        return word.replace(/^\b[a-z]/i, (char) => char.toUpperCase());
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
        const lastName = parts[0];
        const rest = parts.slice(1).join(" ");
        trimmedInput = `${rest} ${lastName}`;
      }
    }

    const isAllUpper =
      trimmedInput === trimmedInput.toUpperCase() &&
      trimmedInput !== trimmedInput.toLowerCase();
    const isAllLower =
      trimmedInput === trimmedInput.toLowerCase() &&
      trimmedInput !== trimmedInput.toUpperCase();

    const words = trimmedInput.split(" ");
    const processedWords = words.map((word, index) => {
      const cleaned = word.replace(/[.,]/g, "");
      let targetWord = word;
      if (isAllUpper || isAllLower) {
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
    const slug = this.slugify(displayName);

    return `[[${slug}|${displayName}]]`;
  }

  static formatYAMLNameList(input, fallback = '"NoName"') {
    const items = this.parseCommaSeparatedList(input, false);

    if (items.length === 0) return ` ${fallback}`;

    return (
      '\n  - "' +
      items.map((item) => this.formatNameAsWikilink(item)).join('"\n  - "') +
      '"'
    );
  }

  static formatNaturalNameList(input, formatAsWikilink = true) {
    const items = this.parseCommaSeparatedList(input, false);

    if (items.length === 0) return "No Author";

    const processedItems = items.map((item) =>
      formatAsWikilink ? this.formatNameAsWikilink(item) : item,
    );

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

const NoteBuilder = require("../base/note-builder");

/**
 * Handles frontmatter generation for book analysis notes.
 */
class NoteBuilderBook extends NoteBuilder {
  constructor(quickAddApi) {
    super(quickAddApi);
  }

  getDomainType() {
    return "books";
  }

  getSourceFieldId() {
    return "source";
  }

  getSourceFieldLabel() {
    return "Link to source";
  }

  getCreatorFieldId() {
    return "author";
  }

  getCreatorFieldLabel() {
    return "Author(s) (comma separated)";
  }

  getContentFieldId() {
    return "book";
  }

  getContentFieldLabel() {
    return "Book title";
  }

  getUnitFieldId() {
    return "chapter";
  }

  getUnitFieldLabel() {
    return "Chapter title";
  }

  getSectionFieldId() {
    return "section";
  }

  getSectionFieldLabel() {
    return "Section title";
  }

  /**
   * Converts a Roman numeral string into its integer equivalent.
   *
   * @private
   * @param {string} roman - The Roman numeral string to convert.
   * @returns {number} The integer value.
   */
  romanToInt(roman) {
    const map = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
    let result = 0;
    const upper = roman.toUpperCase();

    for (let i = 0; i < upper.length; i++) {
      const curr = map[upper[i]];
      const next = map[upper[i + 1]];
      if (next && curr < next) {
        result -= curr;
      } else {
        result += curr;
      }
    }
    return result;
  }

  /**
   * Formats raw unit identifier strings into standardized prefixes.
   *
   * Supports two main formats:
   * 1. Part headers with Roman numerals (e.g., "PART I", "part iv") -> "pt1:", "pt4:"
   * 2. Chapter or numeric sections (e.g., "Chapter 1.2", "3") -> "ch01-02:", "ch03:"
   *
   * @param {string} text - The raw unit identifier string to format.
   * @returns {string} The formatted unit identifier string.
   * @example
   * // Returns "pt1: Introduction"
   * formatUnitIdentifier("PART I: Introduction");
   *
   * @example
   * // Returns "ch01-02: Overview"
   * formatUnitIdentifier("Chapter 1.2: Overview");
   */
  formatUnitIdentifier(text) {
    // 1. Handle "PART I", "part iv", etc. -> pt1, pt4 (Using `this.romanToInt`)
    text = text.replace(
      /^(?:Part|PART)\s+([IVXLCDMivxlcdm]+)\s*:?\s*/i,
      (_, roman) => `pt${this.romanToInt(roman)}: `,
    );

    // 2. Handle Chapter/Number formats (e.g., "Chapter 1.2" -> "ch01-02: ")
    return text.replace(
      /^(?:Chapter\s+)?(\d+)(?:\.(\d+))?\s*:?\s*/,
      (_, major, minor) =>
        `ch${major.padStart(2, "0")}${minor ? "-" + minor.padStart(2, "0") : ""}: `,
    );
  }
}

module.exports = NoteBuilderBook;

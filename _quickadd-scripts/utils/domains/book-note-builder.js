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

  formatUnitIdentifier(text) {
    return text.replace(
      /^(?:Chapter\s+)?(\d+)(?:\.(\d+))?\s*:?\s*/,
      (_, major, minor) =>
        `ch${major.padStart(2, "0")}${minor ? "-" + minor.padStart(2, "0") : ""}: `,
    );
  }
}

module.exports = NoteBuilderBook;

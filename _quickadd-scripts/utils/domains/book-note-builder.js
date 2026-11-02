const NoteBuilderBase = require("../base/note-builder-base");

/**
 * Handles frontmatter generation for book analysis notes.
 */
class NoteBuilderBook extends NoteBuilderBase {
  constructor(quickAddApi) {
    super(quickAddApi);
  }

  getCategoryType() {
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
}

module.exports = NoteBuilderBook;

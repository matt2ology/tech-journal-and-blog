const SynthesisBuilderBase = require("./synthesis-builder-base");

/**
 * Handles frontmatter generation for book synthesis notes.
 */
class SynthesisBuilderBook extends SynthesisBuilderBase {
  constructor(quickAddApi) {
    super(quickAddApi);
  }

  getCategoryType() {
    return "books";
  }

  getPersonNameFieldId() {
    return "author";
  }

  getPersonNameFieldLabel() {
    return "Author(s) (comma separated)";
  }

  getContentFieldId() {
    return "book";
  }

  getContentFieldLabel() {
    return "Book Title";
  }
}

module.exports = SynthesisBuilderBook;

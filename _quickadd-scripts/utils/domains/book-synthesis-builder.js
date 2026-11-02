const SynthesisBuilder = require("../base/synthesis-builder");

/**
 * Handles frontmatter generation for book synthesis notes.
 */
class SynthesisBuilderBook extends SynthesisBuilder {
  constructor(quickAddApi) {
    super(quickAddApi);
  }

  getCategoryType() {
    return "books";
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
    return "Book Title";
  }
}

module.exports = SynthesisBuilderBook;

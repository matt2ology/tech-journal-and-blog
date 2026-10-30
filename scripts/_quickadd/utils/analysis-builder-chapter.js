const AnalysisBuilderBase = require("./analysis-builder-base");

/**
 * Handles frontmatter generation for book analysis notes.
 */
class AnalysisBuilderBook extends AnalysisBuilderBase {
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
    return "Book title";
  }

  getUnitFieldId() {
    return "chapter"
  }

  getUnitFieldLabel() {
    return "Chapter title"
  }
}

module.exports = AnalysisBuilderBook;

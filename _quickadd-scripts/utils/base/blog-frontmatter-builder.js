const FrontmatterBuilderBase = require("./frontmatter-builder-base");

/**
 * A simple derived class for building article or blog post frontmatter.
 */
class BlogFrontmatterBuilder extends FrontmatterBuilderBase {
  constructor(quickAddApi) {
    super(quickAddApi);
  }

  /**
   * Extends the base fields by appending custom article inputs.
   */
  getFields() {
    const baseFields = super.getFields();
    return [...baseFields];
  }

  /**
   * Optional: Process or transform values before standard computation.
   */
  processValues(values) {
    const processed = super.processValues(values);
    // Add any custom preprocessing here if needed
    const updatedCategories = this.appendToList({
      list: values.categories,
      items: ["blog"],
    });
    processed.categories = updatedCategories;
    return processed;
  }

  /**
   * Appends custom extra properties specific to articles.
   */
  buildExtraProperties({ values, computed }) {
    return [
      `note_type: ${this.getRootFolderType()}`,
      `domain: ${this.getCategoryType()}`,
    ];
  }
}

module.exports = BlogFrontmatterBuilder;

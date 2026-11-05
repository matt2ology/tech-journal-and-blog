const FrontmatterBuilderBase = require("./frontmatter-builder-base");

class BlogFrontmatterBuilder extends FrontmatterBuilderBase {
  processValues(values) {
    const processed = super.processValues(values);
    processed.categories = this.appendToList({
      list: values.categories,
      items: ["blog"],
    });
    return processed;
  }

  buildExtraProperties() {
    return [
      `type: ${this.getRootFolderType()}`,
      `domain: ${this.getCategoryType()}`,
    ];
  }
}

module.exports = BlogFrontmatterBuilder;

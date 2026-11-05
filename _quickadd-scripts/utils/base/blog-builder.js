const FrontmatterBuilderBase = require("./frontmatter-builder-base");

class BlogFrontmatterBuilder extends FrontmatterBuilderBase {
  getContentType() {
    return "blog";
  }

  processValues(values) {
    const processed = super.processValues(values);
    processed.type = this.getContentType();
    processed.categories = this.appendToList({
      list: values.categories,
      items: [this.getContentType()],
    });
    return processed;
  }

  buildExtraProperties() {
    return [
      `type: ${this.getContentType()}`,
      `domain: ${this.getCategoryType()}`,
    ];
  }
}

module.exports = BlogFrontmatterBuilder;

const FrontmatterBuilderBase = require("./frontmatter-builder-base");

class BlogFrontmatterBuilder extends FrontmatterBuilderBase {
  getKnowledgeResourceType() {
    return "blog";
  }

  processValues(values) {
    const processed = super.processValues(values);
    processed.type = this.getKnowledgeResourceType();
    processed.categories = this.appendToList({
      list: values.categories,
      items: [this.getKnowledgeResourceType()],
    });
    return processed;
  }

  buildExtraProperties() {
    return [
      `type: ${this.getKnowledgeResourceType()}`,
      `domain: ${this.getDomainType()}`,
    ];
  }
}

module.exports = BlogFrontmatterBuilder;

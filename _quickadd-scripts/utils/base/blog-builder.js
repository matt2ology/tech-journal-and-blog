const FrontmatterBuilderBase = require("./frontmatter-builder-base");
const TextFormatter = require("../helpers/text-formatter");

class BlogFrontmatterBuilder extends FrontmatterBuilderBase {
  getKnowledgeResourceType() {
    return "blog";
  }

  getFields() {
    const baseFields = super.getFields();

    // Add the structure selection field directly into QuickAdd's input dialog
    return [
      ...baseFields,
      {
        id: "postStructure",
        label: "Post Structure",
        type: "suggester",
        options: [
          "Flat Post (Single Markdown file)",
          "Leaf Bundle (Folder with index.md)",
        ],
        placeholder: "Select post structure",
        defaultValue: "Flat Post (Single Markdown file)",
        suggesterConfig: {
          displayValues: [
            "Flat Post (Single Markdown file)",
            "Leaf Bundle (Folder with index.md)",
          ],
          allowCustomInput: false,
          caseSensitive: false,
          multiSelect: false,
        },
      },
    ];
  }

  processValues(values) {
    const processed = super.processValues(values);
    processed.type = this.getKnowledgeResourceType();
    processed.categories = this.appendToList({
      list: values.categories,
      items: [this.getKnowledgeResourceType()],
    });

    const slug = values.slug ?? TextFormatter.slugify(values.title);
    processed.slug = slug;

    const selectedOption = values.postStructure || "";
    const isLeafBundle = selectedOption.startsWith("Leaf Bundle");
    const baseFolder = "blog";

    // Dynamically assign filename and folderPath variables for QuickAdd template settings
    if (isLeafBundle) {
      processed.filename = "index";
      processed.folderPath = `${baseFolder}/${slug}`;
    } else {
      processed.filename = slug;
      processed.folderPath = baseFolder;
    }

    return processed;
  }

  buildExtraProperties() {
    return [`type: ${this.getKnowledgeResourceType()}`];
  }
}

module.exports = BlogFrontmatterBuilder;

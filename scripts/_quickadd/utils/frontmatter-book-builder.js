const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const BaseFrontmatterBuilder = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "frontmatter-base-builder",
  ),
);

/**
 * Adds book-specific inputs and metadata to the shared frontmatter workflow.
 */
class BookFrontmatterBuilder extends BaseFrontmatterBuilder {
  getFields() {
    return [
      ...super.getFields(),
      {
        id: "author",
        label: "Author",
        type: "text",
        placeholder: "Book Author",
        defaultValue: "matt2ology",
      },
      {
        id: "rating",
        label: "Rating (1-5)",
        type: "text",
        placeholder: "5",
        defaultValue: "2",
      },
    ];
  }

  processValues(values) {
    return {
      ...values,
      categories: this.appendToList(values.categories, "book"),
    };
  }

  buildExtraProperties(values) {
    return [
      `author: "${values.author || ""}"`,
      `rating: ${values.rating || "0"}`,
    ];
  }
}

module.exports = BookFrontmatterBuilder;

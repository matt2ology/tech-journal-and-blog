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

class BookFrontmatterBuilder extends BaseFrontmatterBuilder {
  getFields() {
    return [
      ...super.getFields(),
      {
        id: "author",
        label: "Author",
        type: "text",
        placeholder: "Book Author",
      },
      { id: "rating", label: "Rating (1-5)", type: "text", placeholder: "5" },
    ];
  }

  processValues(values) {
    // Append "book" to categories automatically
    let categories = values.categories
      ? values.categories
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    if (!categories.includes("book")) {
      categories.push("book");
    }

    values.categories = categories.join(", ");
    return values;
  }

  buildExtraProperties(values) {
    return [
      `author: "${values.author || ""}"`,
      `rating: ${values.rating || "0"}`,
    ];
  }
}

module.exports = BookFrontmatterBuilder;

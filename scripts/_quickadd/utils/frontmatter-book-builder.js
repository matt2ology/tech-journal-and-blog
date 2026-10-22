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
    values.categories = this.#appendCategory(values.categories, "book");
    return values;
  }

  buildExtraProperties(values, computed = {}) {
    return [
      `author: "${values.author || ""}"`,
      `rating: ${values.rating || "0"}`,
    ];
  }

  // --- Private Helpers ---

  #parseCommaSeparated(input = "") {
    if (!input) return [];
    return input
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  #appendCategory(existingCategories, newCategory) {
    const list = this.#parseCommaSeparated(existingCategories);
    const categorySet = new Set(list);
    categorySet.add(newCategory);
    return Array.from(categorySet).join(", ");
  }
}

module.exports = BookFrontmatterBuilder;

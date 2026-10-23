const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const { slugify, formatNaturalNameList } = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "formatters"),
);
const FrontmatterBuilderBase = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "frontmatter-builder-base",
  ),
);

/**
 * Adds book-specific inputs and metadata to the shared frontmatter workflow.
 */
class FrontmatterBuilderBook extends FrontmatterBuilderBase {
  getFields() {
    return [
      ...super.getFields(),
      {
        id: "author",
        label: "Author(s)",
        type: "text",
        placeholder: "Book Author(s), comma separated",
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
    const authors = this.parseCommaSeparatedList(values.author);
    const authorList = formatNaturalNameList(values.author);
    const primaryAuthor = authors[0] || "noAuthorListed";
    const detailText = values.title
      ? `${values.title} by ${authorList}`
      : authorList;

    return {
      ...values,
      categories: this.appendToList(values.categories, "literature"),
      slug: slugify(`${primaryAuthor}-${values.title}`),
      detail: detailText,
    };
  }

  buildExtraProperties(values) {
    return [
      `author:${this.formatNameList(values.author, '"NoAuthorNamed"')}`,
      `rating: ${values.rating || "0"}`,
    ];
  }
}

module.exports = FrontmatterBuilderBook;

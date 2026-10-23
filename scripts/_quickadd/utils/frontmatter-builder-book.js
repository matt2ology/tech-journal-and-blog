const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const { titleCase, slugify, formatNaturalNameList } = require(
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
      {
        id: "book",
        label: "Book Title",
        type: "text",
        placeholder: "What is the title of the book?",
        defaultValue: "How AI Works: From Sorcery to Science",
      },
      {
        id: "author",
        label: "Author(s)",
        type: "text",
        placeholder: "Book Author(s), comma separated",
        defaultValue: "RONALD T. KNEUSEL",
      },
      {
        id: "chapter",
        label: "Chapter",
        type: "text",
        placeholder: "What chapter are you reading?",
        defaultValue: "Chapter 1: And Away We Go: An AI Overview",
      },
    ];
  }

  /**
   * Removes everything after a colon and trims whitespace.
   * @param {string} text - The input string
   * @returns {string} The cleaned string
   */
  #removeAfterColon(text) {
    return text ? text.split(":")[0].trim() : "";
  }

  processValues(values) {
    const authors = this.parseCommaSeparatedList(values.author);
    const authorList = formatNaturalNameList(values.author);
    const primaryAuthor = authors[0] || "noAuthorListed";
    const detailText = `${values.chapter} - [[${slugify(values.book)}|${values.book}]] by ${authorList}`;

    return {
      ...values,
      categories: this.appendToList(values.categories, "books", "literature"),
      detail: detailText,
      filename: slugify(`lit-${this.#removeAfterColon(values.book)}-${this.#removeAfterColon(values.chapter)}`,),
      folder: slugify(`${primaryAuthor}-${this.#removeAfterColon(values.book)}`),
      slug: slugify(`${this.#removeAfterColon(values.book)}-${this.#removeAfterColon(values.chapter)}`,),
      tags: this.appendToList(values.tags, "question", slugify(values.author)),
      title: `Notes on ${this.#removeAfterColon(values.book)} - ${this.#removeAfterColon(values.chapter)}`,
    };
  }

  buildExtraProperties(values) {
    return [
      `author: ${this.formatNameList(values.author, '"NoAuthorNamed"')}`,
      `book: "${values.book || "NoBookTitleListed"}"`,
      `chapter: "${values.chapter || "NoChapterProvided"}"`,
    ];
  }
}

module.exports = FrontmatterBuilderBook;

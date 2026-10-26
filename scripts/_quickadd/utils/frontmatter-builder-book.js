const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const TextFormatter = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "text-formatter"),
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
 * Book-specific frontmatter builder.
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

  #getAuthorLastName(authorString) {
    if (!authorString) return "unknown";

    // Split comma-separated list to take the primary (first) author
    const firstAuthor = authorString.split(",")[0].trim();

    // Split by spaces to separate individual name parts (first, middle, last)
    const nameParts = firstAuthor.split(/\s+/);

    // Return the last element, cleaned of any leftover punctuation
    const lastName = nameParts[nameParts.length - 1];
    return lastName.replace(/[^a-zA-Z]/g, "") || "unknown";
  }

  #removeAfterColon(text) {
    return text ? text.split(":")[0].trim() : "";
  }

  processValues(values) {
    const authors = this.parseCommaSeparatedList(values.author);
    const authorList = TextFormatter.formatNaturalNameList(values.author);
    const primaryAuthor = authors[0] || "noAuthorListed";
    const detailText = `${values.chapter} - [[${TextFormatter.slugify(values.book)}|${values.book}]] by ${authorList}`;

    return {
      ...values,
      categories: this.appendToList(values.categories, "books", "synthesis"),
      detail: detailText,
      filename: TextFormatter.slugify(
        `lit-${this.#removeAfterColon(values.book)}-${this.#removeAfterColon(values.chapter)}`,
      ),
      folder: TextFormatter.slugify(
        `${primaryAuthor}-${this.#removeAfterColon(values.book)}`,
      ),
      slug: TextFormatter.slugify(
        `syn-${this.#getAuthorLastName(values.author)}-${this.#removeAfterColon(values.book)}-${this.#removeAfterColon(values.chapter)}`,
      ),
      tags: this.appendToList(
        values.tags,
        "question",
        ...this.parseAndSlugifyCommaSeparatedList(values.author),
      ),
      title: `Summary of ${this.#removeAfterColon(values.book)} - ${this.#removeAfterColon(values.chapter)}`,
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

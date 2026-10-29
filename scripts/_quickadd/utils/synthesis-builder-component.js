const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const SynthesisBuilderBase = require("./synthesis-builder-base");
const TextFormatter = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "text-formatter"),
);

/**
 * Handles frontmatter generation for individual book chapter synthesis notes.
 */
class SynthesisBuilderBookChapter extends SynthesisBuilderBase {
  constructor(quickAddApi) {
    super(quickAddApi);
  }

  getCategoryType() {
    return "book-chapters";
  }

  /**
   * Overrides input fields to prompt for book, chapter, and author(s).
   */
  getFields() {
    return [
      {
        id: "book",
        label: "Book Title",
        type: "text",
        placeholder: "Enter book title",
        defaultValue: "",
      },
      {
        id: "chapter",
        label: "Chapter (Title or Number)",
        type: "text",
        placeholder: "Enter chapter (e.g., Chapter 1 or Introduction)",
        defaultValue: "",
      },
      {
        id: "author",
        label: "Author(s) (comma separated)",
        type: "text",
        placeholder: "Enter author name(s)",
        defaultValue: "",
      },
    ];
  }

  processValues(values) {
    const processed = super.processValues(values);

    const rawAuthor = values.author || "";
    const rawBook = values.book || "";
    const rawChapter = values.chapter || "";

    const rawFilename = `syn - book chapter - ${rawBook} - ${rawChapter}`;
    const generatedFilename = TextFormatter.slugify(rawFilename);

    const generatedTitle = `Synthesis of ${rawBook} - ${rawChapter}`;

    const categories = this.appendToList({
      list: values.categories,
      items: ["synthesis", "books", "chapters"],
    });

    return {
      ...processed,
      title: generatedTitle,
      slug: generatedFilename,
      type: "book-chapter",
      filename: generatedFilename,
      author: this.formatNameList(rawAuthor, "Unknown Author"),
      book: rawBook,
      chapter: rawChapter,
      categories,
    };
  }

  /**
   * Defines the extra frontmatter properties specific to book chapters.
   */
  buildExtraProperties({ values }) {
    return [
      `author: ${values.author}`,
      `book: "${values.book}"`,
      `chapter: "${values.chapter}"`,
    ];
  }
}

module.exports = SynthesisBuilderBookChapter;

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
const VaultQueryService = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "vault-query-service"),
);
const IncrementedFilenameUtility = require(
  path.join(
    vaultPath,
    "scripts",
    "_quickadd",
    "utils",
    "incremented-filename-utility",
  ),
);

/**
 * Book-specific frontmatter builder with auto-detection and incremented filenames.
 */
class FrontmatterBuilderBook extends FrontmatterBuilderBase {
  getFields() {
    const rawBookOptions = VaultQueryService.getSubfolderNames({
      app,
      folderPath: "synthesis/books",
    });
    const processedBookOptions = rawBookOptions.map((book) =>
      TextFormatter.titleCase(book),
    );

    return [
      {
        id: "book",
        label: "Book Title",
        type: "suggester",
        options: processedBookOptions,
        placeholder: "Select or enter book title",
        defaultValue: "",
        suggesterConfig: {
          displayValues: processedBookOptions,
          allowCustomInput: true,
          caseSensitive: false,
          multiSelect: false,
        },
      },
      {
        id: "chapter",
        label: "Chapter",
        type: "text",
        placeholder: "What chapter are you reading?",
        defaultValue: "",
      },
      {
        id: "author",
        label: "Author(s)",
        type: "text",
        placeholder:
          "Book Author(s), comma separated (Auto-detected if left empty)",
        defaultValue: "",
      },
    ];
  }

  #getAuthorLastName(authorString) {
    if (FrontmatterBuilderBook.#isAuthorStringEmpty({ authorString }))
      return "unknown";

    const firstAuthor = authorString.split(",")[0].trim();
    const nameParts = firstAuthor.split(/\s+/);
    const lastName = nameParts[nameParts.length - 1];
    return lastName.replace(/[^a-zA-Z]/g, "") || "unknown";
  }

  static #isAuthorStringEmpty({ authorString }) {
    return !authorString;
  }

  #removeAfterColon(text) {
    return FrontmatterBuilderBook.#hasColonText({ text })
      ? text.split(":")[0].trim()
      : "";
  }

  static #hasColonText({ text }) {
    return Boolean(text);
  }

  processValues(values) {
    const formattedBook = values.book
      ? TextFormatter.titleCase(values.book)
      : "";
    let authorInput = values.author ? values.author.trim() : "";

    const resolvedContext = this.#resolveBookContext({
      formattedBook,
      authorInput,
    });

    authorInput = resolvedContext.authorInput;
    const folderName = resolvedContext.folderName;

    const authors = this.parseCommaSeparatedList(authorInput);
    const authorList = TextFormatter.formatNaturalNameList(authorInput);
    const detailText = `${values.chapter} - [[${TextFormatter.slugify(formattedBook)}|${formattedBook}]] by ${authorList}`;

    const incrementedFilename = IncrementedFilenameUtility.generate({
      app,
      folderPath: "synthesis/books",
      seriesName: values.book,
      title: values.chapter,
    });

    const bookSlug = this.#removeAfterColon(formattedBook);
    const chapterSlug = this.#removeAfterColon(values.chapter);

    return {
      ...values,
      book: formattedBook,
      author: authorInput,
      categories: this.appendToList({
        list: values.categories,
        items: ["books", "synthesis"],
      }),
      detail: detailText,
      filename: incrementedFilename,
      foldername: folderName,
      slug: TextFormatter.slugify(
        `syn-${this.#getAuthorLastName(authorInput)}-${bookSlug}-${chapterSlug}`,
      ),
      tags: this.appendToList({
        list: values.tags,
        items: [
          "question",
          ...this.parseAndSlugifyCommaSeparatedList(authorInput),
        ],
      }),
      title: `My Synthesis of ${bookSlug} - ${chapterSlug}`,
    };
  }

  #resolveBookContext({ formattedBook, authorInput }) {
    const rootFolder = "synthesis/books";
    const subfolders = VaultQueryService.getSubfolderNames({
      app,
      folderPath: rootFolder,
    });

    const matchedSubfolder = subfolders.find(
      (sub) =>
        TextFormatter.titleCase(sub) === formattedBook ||
        sub.toLowerCase() === formattedBook.toLowerCase(),
    );

    if (
      FrontmatterBuilderBook.#hasNotMatchedSubfolder({
        matchedSubfolder,
      })
    ) {
      const authors = this.parseCommaSeparatedList(authorInput);
      const primaryAuthor = authors[0] || "noAuthorListed";
      const bookSlug = this.#removeAfterColon(formattedBook);
      return {
        authorInput,
        folderName: TextFormatter.slugify(`${primaryAuthor}-${bookSlug}`),
      };
    }

    const seriesFolderPath = `${rootFolder}/${matchedSubfolder}`;
    let resolvedAuthor = authorInput;

    if (!resolvedAuthor) {
      const existingAuthors = VaultQueryService.getFieldValues({
        app,
        fieldName: "author",
        folderPath: seriesFolderPath,
      });
      const allAuthors = [...new Set(existingAuthors)].filter(Boolean);
      if (allAuthors.length > 0) {
        resolvedAuthor = allAuthors
          .map((author) => TextFormatter.cleanWikiLink(author))
          .join(", ");
      }
    }

    return {
      authorInput: resolvedAuthor,
      folderName: matchedSubfolder,
    };
  }

  static #hasNotMatchedSubfolder({ matchedSubfolder }) {
    return !matchedSubfolder;
  }

  buildExtraProperties({ values }) {
    return [
      `author: ${this.formatNameList(values.author, '"NoAuthorNamed"')}`,
      `book: "${values.book || "NoBookTitleListed"}"`,
      `chapter: "${values.chapter || "NoChapterProvided"}"`,
    ];
  }
}

module.exports = FrontmatterBuilderBook;

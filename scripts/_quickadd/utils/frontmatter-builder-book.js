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

  #getAuthorLastNames(authorString) {
    if (!authorString) return "unknown";

    const cleanString = TextFormatter.cleanWikiLink(authorString);
    const authors = cleanString.split(",");

    const lastNames = authors
      .map((author) => {
        const trimmed = author.trim();
        const nameParts = trimmed.split(/\s+/);
        const lastName = nameParts[nameParts.length - 1];
        return lastName.replace(/[^a-zA-Z]/g, "") || "unknown";
      })
      .filter(Boolean);

    return lastNames.length > 0 ? lastNames.join("-") : "unknown";
  }

  #removeAfterColon(text) {
    return text ? text.split(":")[0].trim() : "";
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
    const authorLastNames = this.#getAuthorLastNames(authorInput);

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
        `syn-${authorLastNames}-${bookSlug}-${chapterSlug}`,
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

    if (!matchedSubfolder) {
      const authorLastNames = this.#getAuthorLastNames(authorInput);
      const bookSlug = this.#removeAfterColon(formattedBook);
      return {
        authorInput,
        folderName: TextFormatter.slugify(`${authorLastNames}-${bookSlug}`),
      };
    }

    let resolvedAuthor = authorInput;
    if (!resolvedAuthor) {
      const seriesFolderPath = `${rootFolder}/${matchedSubfolder}`;
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

  buildExtraProperties({ values }) {
    return [
      `author: ${this.formatNameList(values.author, '"NoAuthorNamed"')}`,
      `book: "${values.book || "NoBookTitleListed"}"`,
      `chapter: "${values.chapter || "NoChapterProvided"}"`,
    ];
  }
}

module.exports = FrontmatterBuilderBook;

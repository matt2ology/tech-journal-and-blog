const path = require("path");
const vaultPath = app.vault.adapter.getBasePath();

const TextFormatter = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "text-formatter"),
);
const VaultQueryService = require(
  path.join(vaultPath, "scripts", "_quickadd", "utils", "vault-query-service"),
);

/**
 * Utility for generating incremented filenames in series-based notes.
 */
class IncrementedFilenameUtility {
  /**
   * Generates a formatted, incremented filename for a new note in a series.
   * @param {Object} params - The generation parameters.
   * @param {Object} params.app - The Obsidian app instance.
   * @param {string} params.folderPath - The base folder path.
   * @param {string} params.seriesName - The name of the series subfolder.
   * @param {string} params.title - The title of the note.
   * @returns {string} The formatted filename with an index number and slugified title.
   */
  static generate({ app, folderPath, seriesName, title }) {
    const fileCount = IncrementedFilenameUtility.#resolveFileCount({
      context: { app, folderPath, seriesName },
    });
    return IncrementedFilenameUtility.#formatFilename({
      fileCount,
      title,
    });
  }

  /**
   * Resolves the current count of files within the specified series subfolder.
   * @param {Object} params - The parameter object.
   * @param {Object} params.context - The context containing app, folderPath, and seriesName.
   * @returns {number} The total count of markdown files in the series subfolder, or 0 if not found.
   */
  static #resolveFileCount({ context }) {
    const { app, folderPath, seriesName } = context;
    if (!app || !folderPath || !seriesName) return 0;

    const matchedSubfolder = IncrementedFilenameUtility.#findSubfolder(context);
    if (!matchedSubfolder) return 0;

    return IncrementedFilenameUtility.#countFiles({
      app,
      folderPath,
      matchedSubfolder,
    });
  }

  /**
   * Finds a subfolder matching the given series name within the folder path (case-insensitive or title case).
   * @param {Object} params - The search parameters.
   * @param {Object} params.app - The Obsidian app instance.
   * @param {string} params.folderPath - The base folder path.
   * @param {string} params.seriesName - The series name to match.
   * @returns {string|undefined} The name of the matched subfolder, or undefined if none found.
   */
  static #findSubfolder({ app, folderPath, seriesName }) {
    const subfolders = VaultQueryService.getSubfolderNames({ app, folderPath });
    return subfolders.find(
      (sub) =>
        TextFormatter.titleCase(sub) === TextFormatter.titleCase(seriesName) ||
        sub.toLowerCase() === seriesName.toLowerCase(),
    );
  }

  /**
   * Counts the number of markdown files located inside the specific series subfolder.
   * @param {Object} params - The counting parameters.
   * @param {Object} params.app - The Obsidian app instance.
   * @param {string} params.folderPath - The base folder path.
   * @param {string} params.matchedSubfolder - The name of the matched subfolder.
   * @returns {number} The count of markdown files.
   */
  static #countFiles({ app, folderPath, matchedSubfolder }) {
    const seriesFolderPath = `${folderPath}/${matchedSubfolder}`;
    return app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(seriesFolderPath)).length;
  }

  /**
   * Formats a filename using the incremented file count and slugified title.
   * @param {Object} params - The formatting parameters.
   * @param {number} params.fileCount - The current count of files in the series.
   * @param {string} params.title - The title of the note to be slugified.
   * @returns {string} The formatted filename (e.g., "01-my-title").
   */
  static #formatFilename({ fileCount, title }) {
    const indexNumber = String(fileCount + 1).padStart(2, "0");
    const titleSlug = TextFormatter.slugify(title);
    return `${indexNumber}-${titleSlug}`;
  }
}

module.exports = IncrementedFilenameUtility;

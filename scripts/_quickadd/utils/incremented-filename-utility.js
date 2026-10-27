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
  static generate({ app, folderPath, seriesName, title }) {
    const fileCount = IncrementedFilenameUtility.#resolveFileCount({
      context: { app, folderPath, seriesName },
    });
    return IncrementedFilenameUtility.#formatFilename({
      fileCount,
      title,
    });
  }

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

  static #findSubfolder({ app, folderPath, seriesName }) {
    const subfolders = VaultQueryService.getSubfolderNames({ app, folderPath });
    return subfolders.find(
      (sub) =>
        TextFormatter.titleCase(sub) === TextFormatter.titleCase(seriesName) ||
        sub.toLowerCase() === seriesName.toLowerCase(),
    );
  }

  static #countFiles({ app, folderPath, matchedSubfolder }) {
    const seriesFolderPath = `${folderPath}/${matchedSubfolder}`;
    return app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(seriesFolderPath)).length;
  }

  static #formatFilename({ fileCount, title }) {
    const indexNumber = String(fileCount + 1).padStart(2, "0");
    const titleSlug = TextFormatter.slugify(title);
    return `${indexNumber}-${titleSlug}`;
  }
}

module.exports = IncrementedFilenameUtility;

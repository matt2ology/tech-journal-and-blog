/**
 * Service to query vault metadata and frontmatter values.
 */
class VaultQueryService {
  /**
   * Fetches unique subfolder titles 1 level deep within a specific folder.
   *
   * @param {Object} app - Obsidian App instance
   * @param {string} folderPath - The vault folder path to scan
   * @returns {string[]} Array of unique subfolder titles
   */
  static getSubfolderNames(app, folderPath) {
    if (!VaultQueryService.#isValidApp(app)) return [];

    const cleanBasePath = folderPath.replace(/\\/g, "/").replace(/\/$/, "");
    const subfolders = new Set();

    app.vault.getAllLoadedFiles().forEach((file) => {
      const cleanFilePath = file.path.replace(/\\/g, "/");
      if (cleanFilePath.startsWith(cleanBasePath + "/")) {
        const relativePath = cleanFilePath.substring(cleanBasePath.length + 1);
        const parts = relativePath.split("/");
        if (parts.length > 1) {
          subfolders.add(parts[0]);
        }
      }
    });

    return Array.from(subfolders);
  }

  /**
   * Fetches unique field values from markdown frontmatter within a specific folder.
   *
   * @param {Object} app - Obsidian App instance
   * @param {string} fieldName - The target frontmatter property key
   * @param {string} folderPath - The vault folder path to scan
   * @returns {string[]} Array of unique field values
   */
  static getFieldValues(app, fieldName, folderPath) {
    if (!VaultQueryService.#isValidApp(app)) return [];

    const files = VaultQueryService.#getMarkdownFilesInFolder(app, folderPath);
    const values = new Set();

    files.forEach((file) => {
      const cache = app.metadataCache.getFileCache(file);
      if (VaultQueryService.#hasFrontmatterField(cache, fieldName)) {
        VaultQueryService.#extractFieldValues(
          cache.frontmatter[fieldName],
          values,
        );
      }
    });

    return Array.from(values);
  }

  static #isValidApp(app) {
    return Boolean(app && app.vault && app.metadataCache);
  }

  static #getMarkdownFilesInFolder(app, folderPath) {
    return app.vault
      .getMarkdownFiles()
      .filter((file) => file.path.startsWith(folderPath));
  }

  static #hasFrontmatterField(cache, fieldName) {
    return Boolean(cache?.frontmatter && cache.frontmatter[fieldName]);
  }

  static #extractFieldValues(val, valuesSet) {
    if (Array.isArray(val)) {
      val.forEach((item) => {
        if (item) valuesSet.add(item);
      });
    } else {
      valuesSet.add(val);
    }
  }
}

module.exports = VaultQueryService;
